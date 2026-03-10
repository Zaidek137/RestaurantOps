import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ExpenseDonutChart } from "../components/charts/ExpenseDonutChart";
import { LocationBarChart } from "../components/charts/LocationBarChart";
import { PerformanceAreaChart } from "../components/charts/PerformanceAreaChart";
import { useAppContext } from "../context/AppContext";
import { formatCompactCurrency, formatCurrency, formatPercent } from "../lib/format";
import {
  getAlerts,
  getDashboardKpis,
  getExpenseBreakdown,
  getLocationPerformance,
  getMenuPerformance,
  getTrendPoints,
  getVendorSpend,
  getInventorySnapshot,
  getLaborSnapshot,
} from "../lib/metrics";

export const DashboardPage = () => {
  const { data, effectiveScope } = useAppContext();
  const kpis = getDashboardKpis(data, effectiveScope);
  const trendPoints = getTrendPoints(data, effectiveScope);
  const expenseBreakdown = getExpenseBreakdown(data, effectiveScope);
  const vendorSpend = getVendorSpend(data, effectiveScope);
  const locations = getLocationPerformance(data, effectiveScope);
  const menuPerformance = getMenuPerformance(data, effectiveScope).slice(0, 5);
  const alerts = getAlerts(data, effectiveScope);
  const inventorySnapshot = getInventorySnapshot(data, effectiveScope);
  const laborSnapshot = getLaborSnapshot(data, effectiveScope);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Executive overview"
        title="Portfolio profitability command center"
        description="Track revenue, cost structure, waste, labor efficiency, and menu contribution across each restaurant or roll up the entire portfolio."
      />

      <div className="kpi-grid">
        <KpiCard label="Revenue" value={formatCompactCurrency(kpis.revenue)} trend={12.4} tone="sky" />
        <KpiCard label="Operating profit" value={formatCompactCurrency(kpis.operatingProfit)} trend={4.8} tone="emerald" />
        <KpiCard label="Food cost" value={formatPercent(kpis.foodCostPercent)} trend={-1.6} tone="amber" />
        <KpiCard label="Prime cost" value={formatPercent(kpis.primeCostPercent)} trend={0.9} tone="rose" />
      </div>

      <div className="content-grid content-grid--hero">
        <PerformanceAreaChart
          title="Sales vs prime cost"
          subtitle="Daily trend across the visible operating scope"
          data={trendPoints}
        />
        <Panel title="Ops alerts" subtitle="Thresholds that need attention now">
          <div className="alert-list">
            {alerts.map((alert) => (
              <article key={alert.id} className={`alert-card alert-card--${alert.tone}`}>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <div className="content-grid">
        <ExpenseDonutChart
          title="Expense mix"
          subtitle="Spend concentration by category"
          data={expenseBreakdown}
        />
        <ExpenseDonutChart
          title="Vendor exposure"
          subtitle="Highest vendor spend in the current view"
          data={vendorSpend}
        />
        <LocationBarChart data={locations} />
      </div>

      <div className="content-grid">
        <Panel title="Menu contribution leaders" subtitle="High-margin items to protect and promote">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Recipe cost</th>
                  <th>Margin</th>
                  <th>Popularity</th>
                </tr>
              </thead>
              <tbody>
                {menuPerformance.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.recipeCost)}</td>
                    <td>{formatCurrency(item.margin)}</td>
                    <td>{item.popularity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Operations pulse" subtitle="Inventory, labor, and waste summary">
          <div className="metric-stack">
            <div>
              <span>Inventory value</span>
              <strong>{formatCurrency(inventorySnapshot.inventoryValue)}</strong>
            </div>
            <div>
              <span>Waste tracked</span>
              <strong>{formatCurrency(inventorySnapshot.wasteCost)}</strong>
            </div>
            <div>
              <span>Labor efficiency</span>
              <strong>{formatCurrency(laborSnapshot.salesPerLaborHour)} / labor hr</strong>
            </div>
            <div>
              <span>Total covers</span>
              <strong>{laborSnapshot.totalCovers.toLocaleString()}</strong>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
