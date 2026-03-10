import { useMemo, useState } from "react";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { PerformanceAreaChart } from "../components/charts/PerformanceAreaChart";
import { useAppContext } from "../context/AppContext";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import { getLaborSnapshot, getRecentLabor, getTrendPoints } from "../lib/metrics";

export const LaborPage = () => {
  const { data, effectiveScope, addLaborSummary } = useAppContext();
  const laborSnapshot = getLaborSnapshot(data, effectiveScope);
  const trendPoints = getTrendPoints(data, effectiveScope);
  const recentLabor = getRecentLabor(data, effectiveScope);

  const [form, setForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    date: "2026-03-09",
    sales: "",
    laborCost: "",
    laborHours: "",
    covers: "",
  });

  const productivity = useMemo(
    () =>
      recentLabor.map((entry) => ({
        ...entry,
        laborPercent: entry.sales > 0 ? (entry.laborCost / entry.sales) * 100 : 0,
        salesPerHour: entry.laborHours > 0 ? entry.sales / entry.laborHours : 0,
      })),
    [recentLabor],
  );

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Labor analytics"
        title="Track labor efficiency without a scheduling suite"
        description="Record daily labor cost and hours, compare productivity across restaurants, and monitor labor as part of prime cost."
      />

      <div className="kpi-grid">
        <KpiCard label="Labor %" value={formatPercent(laborSnapshot.laborPercent)} trend={-0.6} tone="amber" />
        <KpiCard label="Sales / labor hour" value={formatCurrency(laborSnapshot.salesPerLaborHour)} trend={2.1} tone="emerald" />
        <KpiCard label="Hours tracked" value={formatNumber(laborSnapshot.totalHours)} trend={1.4} tone="sky" />
        <KpiCard label="Covers" value={formatNumber(laborSnapshot.totalCovers)} trend={3.1} tone="rose" />
      </div>

      <div className="content-grid content-grid--hero">
        <PerformanceAreaChart title="Sales and prime cost" subtitle="Use labor in context with daily revenue" data={trendPoints} />
        <Panel title="Add labor summary" subtitle="Daily sales, hours, and labor cost entry">
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              addLaborSummary({
                businessId: form.businessId,
                locationId: form.locationId,
                date: form.date,
                sales: Number(form.sales),
                laborCost: Number(form.laborCost),
                laborHours: Number(form.laborHours),
                covers: Number(form.covers),
              });
              setForm((current) => ({ ...current, sales: "", laborCost: "", laborHours: "", covers: "" }));
            }}
          >
            <label>
              <span>Business</span>
              <select
                value={form.businessId}
                onChange={(event) => {
                  const businessId = event.target.value;
                  const locationId = data.locations.find((location) => location.businessId === businessId)?.id ?? data.locations[0].id;
                  setForm({ ...form, businessId, locationId });
                }}
              >
                {data.businesses.map((business) => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Location</span>
              <select value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>
                {data.locations.filter((location) => location.businessId === form.businessId).map((location) => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
            </label>
            <label>
              <span>Sales</span>
              <input type="number" min="0" step="0.01" value={form.sales} onChange={(event) => setForm({ ...form, sales: event.target.value })} required />
            </label>
            <label>
              <span>Labor cost</span>
              <input type="number" min="0" step="0.01" value={form.laborCost} onChange={(event) => setForm({ ...form, laborCost: event.target.value })} required />
            </label>
            <label>
              <span>Labor hours</span>
              <input type="number" min="0" step="0.01" value={form.laborHours} onChange={(event) => setForm({ ...form, laborHours: event.target.value })} required />
            </label>
            <label>
              <span>Covers</span>
              <input type="number" min="0" value={form.covers} onChange={(event) => setForm({ ...form, covers: event.target.value })} required />
            </label>
            <button className="button-primary" type="submit">Save labor day</button>
          </form>
        </Panel>
      </div>

      <Panel title="Location productivity ledger" subtitle="Recent labor entries with efficiency ratios">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Location</th>
                <th>Sales</th>
                <th>Labor cost</th>
                <th>Labor %</th>
                <th>Sales / hr</th>
              </tr>
            </thead>
            <tbody>
              {productivity.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.date}</td>
                  <td>{data.locations.find((location) => location.id === entry.locationId)?.name ?? entry.locationId}</td>
                  <td>{formatCurrency(entry.sales)}</td>
                  <td>{formatCurrency(entry.laborCost)}</td>
                  <td>{formatPercent(entry.laborPercent)}</td>
                  <td>{formatCurrency(entry.salesPerHour)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
