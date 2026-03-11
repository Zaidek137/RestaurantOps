import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { CsvImportModal } from "../components/CsvImportModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { PerformanceAreaChart } from "../components/charts/PerformanceAreaChart";
import { useAppContext } from "../context/AppContext";
import { getTodayLocalDate } from "../lib/date";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import type { LaborImportRow } from "../lib/csv";
import { getLaborSnapshot, getRecentLabor, getTargetVariance, getTrendPoints } from "../lib/metrics";

export const LaborPage = () => {
  const { data, effectiveScope, addLaborSummary, importLaborSummaries } = useAppContext();
  const laborSnapshot = getLaborSnapshot(data, effectiveScope);
  const trendPoints = getTrendPoints(data, effectiveScope);
  const recentLabor = getRecentLabor(data, effectiveScope);
  const targetVariance = getTargetVariance(data, effectiveScope);
  const today = getTodayLocalDate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [form, setForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    date: today,
    sales: "",
    laborCost: "",
    laborHours: "",
    covers: "",
  });

  const productivity = useMemo(
    () =>
      recentLabor.map((entry) => {
        const forecast = data.salesForecasts.find(
          (row) => row.locationId === entry.locationId && row.date === entry.date,
        );

        return {
          ...entry,
          laborPercent: entry.sales > 0 ? (entry.laborCost / entry.sales) * 100 : 0,
          salesPerHour: entry.laborHours > 0 ? entry.sales / entry.laborHours : 0,
          forecastRevenue: forecast?.projectedRevenue ?? null,
          forecastLaborHours: forecast?.projectedLaborHours ?? null,
        };
      }),
    [data.salesForecasts, recentLabor],
  );

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Labor analytics"
        title="Track labor efficiency without a scheduling suite"
        description="Record daily labor cost and hours, import labor summaries, compare forecast vs actual, and keep each location inside its labor and productivity targets."
      />

      <div className="kpi-grid">
        <KpiCard label="Labor %" value={formatPercent(laborSnapshot.laborPercent)} trend={-0.6} tone="amber" />
        <KpiCard label="Sales / labor hour" value={formatCurrency(laborSnapshot.salesPerLaborHour)} trend={2.1} tone="emerald" />
        <KpiCard label="Hours tracked" value={formatNumber(laborSnapshot.totalHours)} trend={1.4} tone="sky" />
        <KpiCard label="Covers" value={formatNumber(laborSnapshot.totalCovers)} trend={3.1} tone="rose" />
      </div>

      <FloatingActionMenu
        actions={[
          { label: "Log labor", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsModalOpen(true) },
          { label: "Import CSV", icon: <Icon name="upload" width={16} height={16} />, onClick: () => setIsImportModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add labor summary"
        subtitle="Daily sales, hours, and labor cost entry."
      >
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
            setForm((current) => ({
              ...current,
              date: today,
              sales: "",
              laborCost: "",
              laborHours: "",
              covers: "",
            }));
            setIsModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={form.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const locationId =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                setForm((current) => ({ ...current, businessId, locationId }));
              }}
            >
              {data.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Location</span>
            <select
              value={form.locationId}
              onChange={(event) =>
                setForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              {data.locations
                .filter((location) => location.businessId === form.businessId)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              required
            />
          </label>
          <label>
            <span>Sales</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.sales}
              onChange={(event) =>
                setForm((current) => ({ ...current, sales: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Labor cost</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.laborCost}
              onChange={(event) =>
                setForm((current) => ({ ...current, laborCost: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Labor hours</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.laborHours}
              onChange={(event) =>
                setForm((current) => ({ ...current, laborHours: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Covers</span>
            <input
              type="number"
              min="0"
              value={form.covers}
              onChange={(event) =>
                setForm((current) => ({ ...current, covers: event.target.value }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Save labor day
          </button>
        </form>
      </ActionModal>

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        kind="labor"
        onImport={(rows) => importLaborSummaries(rows as LaborImportRow[])}
      />

      <div className="content-grid">
        <Panel title="Labor target watch" subtitle="Scope target vs actual variance">
          <div className="metric-stack">
            {targetVariance.slice(0, 4).map((row) => (
              <div key={row.id}>
                <span>{row.name}</span>
                <strong>
                  Labor {formatPercent(row.laborPercentActual)} vs target{" "}
                  {formatPercent(row.laborPercentTarget)}
                </strong>
                <p>
                  Sales / hr {formatCurrency(row.salesPerLaborHourActual)} vs target{" "}
                  {formatCurrency(row.salesPerLaborHourTarget)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Staffing efficiency" subtitle="Coverage and productivity at a glance">
          <div className="metric-stack">
            <div>
              <span>Sales / labor hour</span>
              <strong>{formatCurrency(laborSnapshot.salesPerLaborHour)}</strong>
            </div>
            <div>
              <span>Covers / labor hour</span>
              <strong>
                {laborSnapshot.totalHours > 0
                  ? (laborSnapshot.totalCovers / laborSnapshot.totalHours).toFixed(1)
                  : "0.0"}
              </strong>
            </div>
            <div>
              <span>Labor percent</span>
              <strong>{formatPercent(laborSnapshot.laborPercent)}</strong>
            </div>
          </div>
        </Panel>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
        <PerformanceAreaChart
          title="Sales and prime cost"
          subtitle="Use labor in context with daily revenue"
          data={trendPoints}
        />
      </div>

      <Panel title="Location productivity ledger" subtitle="Recent labor entries with forecast comparison">
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
                <th>Forecast sales</th>
                <th>Forecast hrs</th>
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
                  <td>{entry.forecastRevenue !== null ? formatCurrency(entry.forecastRevenue) : "No forecast"}</td>
                  <td>{entry.forecastLaborHours !== null ? entry.forecastLaborHours.toFixed(0) : "No forecast"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
