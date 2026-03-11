import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { CsvImportModal } from "../components/CsvImportModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ExpenseDonutChart } from "../components/charts/ExpenseDonutChart";
import { LocationBarChart } from "../components/charts/LocationBarChart";
import { PerformanceAreaChart } from "../components/charts/PerformanceAreaChart";
import { useAppContext } from "../context/AppContext";
import { shiftDate, getTodayLocalDate } from "../lib/date";
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "../lib/format";
import type { MarketingImportRow, SalesImportRow } from "../lib/csv";
import {
  getAlerts,
  getDashboardKpis,
  getExecutiveComparison,
  getExpenseBreakdown,
  getForecastSnapshot,
  getGrowthInsights,
  getLocationPerformance,
  getMenuPerformance,
  getOwnerActionItems,
  getRecurringExpenseRunRate,
  getTargetVariance,
  getTrendPoints,
  getVendorPriceChangeSummary,
  getVendorSpend,
} from "../lib/metrics";

export const DashboardPage = () => {
  const {
    data,
    effectiveScope,
    savePerformanceTarget,
    saveSalesForecast,
    addMarketingCampaign,
    importSalesSummaries,
    importMarketingCampaigns,
  } = useAppContext();

  const today = getTodayLocalDate();
  const kpis = getDashboardKpis(data, effectiveScope);
  const trendPoints = getTrendPoints(data, effectiveScope);
  const expenseBreakdown = getExpenseBreakdown(data, effectiveScope);
  const vendorSpend = getVendorSpend(data, effectiveScope);
  const locations = getLocationPerformance(data, effectiveScope);
  const menuPerformance = getMenuPerformance(data, effectiveScope).slice(0, 5);
  const alerts = getAlerts(data, effectiveScope);
  const actionItems = getOwnerActionItems(data, effectiveScope);
  const targetVariance = getTargetVariance(data, effectiveScope);
  const forecastSnapshot = getForecastSnapshot(data, effectiveScope);
  const growthInsights = getGrowthInsights(data, effectiveScope);
  const executiveRows = getExecutiveComparison(data, effectiveScope);
  const recurringRunRate = getRecurringExpenseRunRate(data, effectiveScope);
  const vendorPriceChanges = getVendorPriceChangeSummary(data, effectiveScope).slice(0, 5);

  const defaultBusinessId =
    effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId;
  const defaultLocationId =
    effectiveScope.locationId === "all"
      ? data.locations.find((location) => location.businessId === defaultBusinessId)?.id ??
        data.locations[0].id
      : effectiveScope.locationId;

  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isSalesImportOpen, setIsSalesImportOpen] = useState(false);
  const [isMarketingImportOpen, setIsMarketingImportOpen] = useState(false);

  const [targetForm, setTargetForm] = useState({
    businessId: effectiveScope.businessId,
    locationId: effectiveScope.locationId,
    label: "Owner target",
    foodCostPercentTarget: "29",
    laborPercentTarget: "29",
    primeCostPercentTarget: "58",
    wasteCostTarget: "50",
    salesPerLaborHourTarget: "72",
    revenueGrowthPercentTarget: "6",
  });

  const [forecastForm, setForecastForm] = useState({
    businessId: defaultBusinessId,
    locationId: defaultLocationId,
    date: shiftDate(today, 1),
    projectedRevenue: "",
    projectedCovers: "",
    projectedLaborHours: "",
  });

  const [campaignForm, setCampaignForm] = useState({
    businessId: defaultBusinessId,
    locationId: defaultLocationId,
    startDate: today,
    endDate: shiftDate(today, 7),
    channel: "Email",
    campaignName: "",
    spend: "",
    attributedRevenue: "",
    leads: "",
    conversions: "",
  });

  const bestTarget = targetVariance[0];
  const weakestTarget = targetVariance[targetVariance.length - 1];

  const growthSummary = useMemo(
    () => [
      growthInsights.topCampaign
        ? {
            label: "Top campaign ROI",
            value: `${growthInsights.topCampaign.campaignName} (${growthInsights.topCampaign.roiPercent.toFixed(0)}%)`,
          }
        : { label: "Top campaign ROI", value: "No campaign data" },
      growthInsights.highestGrowthLocation
        ? {
            label: "Highest growth location",
            value: `${growthInsights.highestGrowthLocation.name} (${growthInsights.highestGrowthLocation.growthPercent.toFixed(1)}%)`,
          }
        : { label: "Highest growth location", value: "No sales trend yet" },
      growthInsights.weakestChannel
        ? {
            label: "Weakest conversion channel",
            value: `${growthInsights.weakestChannel.channel} (${growthInsights.weakestChannel.conversionRate.toFixed(1)}%)`,
          }
        : { label: "Weakest conversion channel", value: "No channel data" },
      {
        label: "Recurring run rate",
        value: `${formatCurrency(recurringRunRate.monthly)} / month`,
      },
    ],
    [growthInsights, recurringRunRate.monthly],
  );

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Executive overview"
        title="Portfolio profitability command center"
        description="Track revenue, cost structure, waste, labor efficiency, menu contribution, growth programs, and the highest-impact next actions across every location."
      />

      <div className="kpi-grid">
        <KpiCard label="Revenue" value={formatCompactCurrency(kpis.revenue)} trend={12.4} tone="sky" />
        <KpiCard label="Operating profit" value={formatCompactCurrency(kpis.operatingProfit)} trend={4.8} tone="emerald" />
        <KpiCard label="Food cost" value={formatPercent(kpis.foodCostPercent)} trend={-1.6} tone="amber" />
        <KpiCard label="Prime cost" value={formatPercent(kpis.primeCostPercent)} trend={0.9} tone="rose" />
      </div>

      <FloatingActionMenu
        actions={[
          { label: "Import sales", icon: <Icon name="upload" width={16} height={16} />, onClick: () => setIsSalesImportOpen(true) },
          { label: "Import marketing", icon: <Icon name="upload" width={16} height={16} />, onClick: () => setIsMarketingImportOpen(true) },
          { label: "Set target", icon: <Icon name="trendUp" width={16} height={16} />, onClick: () => setIsTargetModalOpen(true) },
          { label: "Add forecast", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsForecastModalOpen(true) },
          { label: "Add campaign", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsCampaignModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        title="Set performance target"
        subtitle="Store a target at portfolio, business, or location scope."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            savePerformanceTarget({
              businessId: targetForm.businessId,
              locationId: targetForm.locationId,
              label: targetForm.label,
              foodCostPercentTarget: Number(targetForm.foodCostPercentTarget),
              laborPercentTarget: Number(targetForm.laborPercentTarget),
              primeCostPercentTarget: Number(targetForm.primeCostPercentTarget),
              wasteCostTarget: Number(targetForm.wasteCostTarget),
              salesPerLaborHourTarget: Number(targetForm.salesPerLaborHourTarget),
              revenueGrowthPercentTarget: Number(targetForm.revenueGrowthPercentTarget),
            });
            setIsTargetModalOpen(false);
          }}
        >
          <label>
            <span>Business scope</span>
            <select
              value={targetForm.businessId}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  businessId: event.target.value,
                  locationId: event.target.value === "all" ? "all" : "all",
                }))
              }
            >
              <option value="all">All businesses</option>
              {data.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Location scope</span>
            <select
              value={targetForm.locationId}
              onChange={(event) =>
                setTargetForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              <option value="all">All locations</option>
              {data.locations
                .filter(
                  (location) =>
                    targetForm.businessId === "all" || location.businessId === targetForm.businessId,
                )
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="form-grid__full">
            <span>Label</span>
            <input
              value={targetForm.label}
              onChange={(event) =>
                setTargetForm((current) => ({ ...current, label: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Food cost %</span>
            <input
              type="number"
              value={targetForm.foodCostPercentTarget}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  foodCostPercentTarget: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Labor %</span>
            <input
              type="number"
              value={targetForm.laborPercentTarget}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  laborPercentTarget: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Prime cost %</span>
            <input
              type="number"
              value={targetForm.primeCostPercentTarget}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  primeCostPercentTarget: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Waste target ($)</span>
            <input
              type="number"
              value={targetForm.wasteCostTarget}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  wasteCostTarget: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Sales / labor hour</span>
            <input
              type="number"
              value={targetForm.salesPerLaborHourTarget}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  salesPerLaborHourTarget: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Revenue growth %</span>
            <input
              type="number"
              value={targetForm.revenueGrowthPercentTarget}
              onChange={(event) =>
                setTargetForm((current) => ({
                  ...current,
                  revenueGrowthPercentTarget: event.target.value,
                }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Save target
          </button>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isForecastModalOpen}
        onClose={() => setIsForecastModalOpen(false)}
        title="Add sales forecast"
        subtitle="Use forecasts to pressure-test labor and reorder decisions."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            saveSalesForecast({
              businessId: forecastForm.businessId,
              locationId: forecastForm.locationId,
              date: forecastForm.date,
              projectedRevenue: Number(forecastForm.projectedRevenue),
              projectedCovers: Number(forecastForm.projectedCovers),
              projectedLaborHours: Number(forecastForm.projectedLaborHours),
            });
            setForecastForm((current) => ({
              ...current,
              projectedRevenue: "",
              projectedCovers: "",
              projectedLaborHours: "",
            }));
            setIsForecastModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={forecastForm.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const locationId =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                setForecastForm((current) => ({ ...current, businessId, locationId }));
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
              value={forecastForm.locationId}
              onChange={(event) =>
                setForecastForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              {data.locations
                .filter((location) => location.businessId === forecastForm.businessId)
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
              value={forecastForm.date}
              onChange={(event) =>
                setForecastForm((current) => ({ ...current, date: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Projected revenue</span>
            <input
              type="number"
              value={forecastForm.projectedRevenue}
              onChange={(event) =>
                setForecastForm((current) => ({
                  ...current,
                  projectedRevenue: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Projected covers</span>
            <input
              type="number"
              value={forecastForm.projectedCovers}
              onChange={(event) =>
                setForecastForm((current) => ({
                  ...current,
                  projectedCovers: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Projected labor hours</span>
            <input
              type="number"
              value={forecastForm.projectedLaborHours}
              onChange={(event) =>
                setForecastForm((current) => ({
                  ...current,
                  projectedLaborHours: event.target.value,
                }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Save forecast
          </button>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        title="Add marketing campaign"
        subtitle="Track spend, attributed revenue, and conversion for growth experiments."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addMarketingCampaign({
              businessId: campaignForm.businessId,
              locationId: campaignForm.locationId,
              startDate: campaignForm.startDate,
              endDate: campaignForm.endDate,
              channel: campaignForm.channel,
              campaignName: campaignForm.campaignName,
              spend: Number(campaignForm.spend),
              attributedRevenue: Number(campaignForm.attributedRevenue),
              leads: Number(campaignForm.leads),
              conversions: Number(campaignForm.conversions),
            });
            setCampaignForm((current) => ({
              ...current,
              campaignName: "",
              spend: "",
              attributedRevenue: "",
              leads: "",
              conversions: "",
            }));
            setIsCampaignModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={campaignForm.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const locationId =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                setCampaignForm((current) => ({ ...current, businessId, locationId }));
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
              value={campaignForm.locationId}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              {data.locations
                .filter((location) => location.businessId === campaignForm.businessId)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Start date</span>
            <input
              type="date"
              value={campaignForm.startDate}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, startDate: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={campaignForm.endDate}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, endDate: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Channel</span>
            <input
              value={campaignForm.channel}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, channel: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Campaign name</span>
            <input
              value={campaignForm.campaignName}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, campaignName: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Spend</span>
            <input
              type="number"
              value={campaignForm.spend}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, spend: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Attributed revenue</span>
            <input
              type="number"
              value={campaignForm.attributedRevenue}
              onChange={(event) =>
                setCampaignForm((current) => ({
                  ...current,
                  attributedRevenue: event.target.value,
                }))
              }
              required
            />
          </label>
          <label>
            <span>Leads</span>
            <input
              type="number"
              value={campaignForm.leads}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, leads: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Conversions</span>
            <input
              type="number"
              value={campaignForm.conversions}
              onChange={(event) =>
                setCampaignForm((current) => ({ ...current, conversions: event.target.value }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Save campaign
          </button>
        </form>
      </ActionModal>

      <CsvImportModal
        isOpen={isSalesImportOpen}
        onClose={() => setIsSalesImportOpen(false)}
        kind="sales"
        onImport={(rows) => importSalesSummaries(rows as SalesImportRow[])}
      />
      <CsvImportModal
        isOpen={isMarketingImportOpen}
        onClose={() => setIsMarketingImportOpen(false)}
        kind="marketing"
        onImport={(rows) => importMarketingCampaigns(rows as MarketingImportRow[])}
      />

      <div className="content-grid content-grid--hero">
        <PerformanceAreaChart
          title="Sales vs prime cost"
          subtitle="Daily trend across the visible operating scope"
          data={trendPoints}
        />
        <Panel title="Action center" subtitle="Highest-impact moves for the owner team">
          <div className="alert-list">
            {actionItems.map((item) => (
              <article key={item.id} className={`alert-card alert-card--${item.tone}`}>
                <div className="action-card__row">
                  <strong>{item.title}</strong>
                  <span className="impact-chip">{formatCurrency(item.impact)}</span>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>

      <div className="content-grid">
        <Panel title="Target scorecards" subtitle="Best and weakest target alignment in scope">
          <div className="metric-stack">
            <div>
              <span>Best aligned</span>
              <strong>{bestTarget ? bestTarget.name : "No targets in scope"}</strong>
              {bestTarget ? <p>Prime cost {bestTarget.primeCostPercentActual.toFixed(1)}% vs {bestTarget.primeCostPercentTarget.toFixed(1)}%</p> : null}
            </div>
            <div>
              <span>Needs intervention</span>
              <strong>{weakestTarget ? weakestTarget.name : "No targets in scope"}</strong>
              {weakestTarget ? <p>Revenue growth {weakestTarget.revenueGrowthPercentActual.toFixed(1)}% vs {weakestTarget.revenueGrowthPercentTarget.toFixed(1)}%</p> : null}
            </div>
            <div>
              <span>Forecasted revenue</span>
              <strong>{formatCurrency(forecastSnapshot.projectedRevenue)}</strong>
              <p>{forecastSnapshot.forecastRows.length} forecast rows loaded</p>
            </div>
            <div>
              <span>Forecasted labor hours</span>
              <strong>{forecastSnapshot.projectedLaborHours.toFixed(0)} hrs</strong>
              <p>Projected covers: {forecastSnapshot.projectedCovers.toFixed(0)}</p>
            </div>
          </div>
        </Panel>
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
      </div>

      <div className="content-grid">
        <Panel title="Growth insights" subtitle="Campaign ROI and channel efficiency">
          <div className="metric-stack">
            {growthSummary.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </Panel>
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
        <LocationBarChart data={locations} />
      </div>

      <div className="content-grid">
        <Panel title="Executive comparison" subtitle="Location rank across core owner metrics">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Food cost</th>
                  <th>Labor</th>
                  <th>Waste</th>
                  <th>Sales / hr</th>
                </tr>
              </thead>
              <tbody>
                {executiveRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                    <td>{formatCurrency(row.profit)}</td>
                    <td>{formatPercent(row.foodCostPercent)}</td>
                    <td>{formatPercent(row.laborPercent)}</td>
                    <td>{formatCurrency(row.wasteCost)}</td>
                    <td>{formatCurrency(row.salesPerLaborHour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Campaign performance" subtitle="Current ROI and conversion mix">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Channel</th>
                  <th>Spend</th>
                  <th>Revenue</th>
                  <th>ROI</th>
                  <th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {growthInsights.campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>{campaign.campaignName}</td>
                    <td>{campaign.channel}</td>
                    <td>{formatCurrency(campaign.spend)}</td>
                    <td>{formatCurrency(campaign.attributedRevenue)}</td>
                    <td>{formatPercent(campaign.roiPercent)}</td>
                    <td>{formatPercent(campaign.conversionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
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
        <Panel title="Vendor price watch" subtitle="Latest cost movement that may affect margins">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Vendor</th>
                  <th>Latest</th>
                  <th>Previous</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {vendorPriceChanges.map((change) => (
                  <tr key={change.ingredientId}>
                    <td>{change.ingredientName}</td>
                    <td>{change.vendorName}</td>
                    <td>{formatCurrency(change.latestPricePerPack)}</td>
                    <td>{formatCurrency(change.previousPricePerPack)}</td>
                    <td>{formatPercent(change.changePercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};
