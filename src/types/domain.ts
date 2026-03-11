export type Role =
  | "owner"
  | "business_manager"
  | "location_manager"
  | "inventory"
  | "finance";

export type ScopeId = string | "all";

export interface Portfolio {
  id: string;
  name: string;
  headquarters: string;
}

export interface Business {
  id: string;
  portfolioId: string;
  name: string;
  concept: string;
  color: string;
}

export interface Location {
  id: string;
  businessId: string;
  name: string;
  city: string;
  state: string;
  openedOn: string;
  seats: number;
}

export interface UserRoleAssignment {
  id: string;
  role: Role;
  businessId: ScopeId;
  locationId: ScopeId;
  label: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  type: "cogs" | "operating" | "labor";
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  businessId: ScopeId;
}

export interface Invoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  issuedOn: string;
  amount: number;
  attachmentName: string;
}

export interface ExpenseEntry {
  id: string;
  businessId: string;
  locationId: string;
  categoryId: string;
  vendorId: string;
  invoiceId?: string;
  title: string;
  amount: number;
  occurredOn: string;
  recurring: boolean;
  notes?: string;
}

export interface ExpenseBudget {
  id: string;
  businessId: ScopeId;
  locationId: ScopeId;
  categoryId: string;
  period: "monthly";
  amount: number;
}

export interface PurchaseEntry {
  id: string;
  businessId: string;
  locationId: string;
  vendorId: string;
  ingredientId: string;
  quantity: number;
  totalCost: number;
  purchasedOn: string;
}

export interface WasteEntry {
  id: string;
  businessId: string;
  locationId: string;
  ingredientId: string;
  quantity: number;
  reason: string;
  cost: number;
  recordedOn: string;
}

export interface LaborSummary {
  id: string;
  businessId: string;
  locationId: string;
  date: string;
  sales: number;
  laborCost: number;
  laborHours: number;
  covers: number;
}

export interface MenuCategory {
  id: string;
  businessId: string;
  name: string;
}

export interface Ingredient {
  id: string;
  businessId: string;
  name: string;
  baseUnit: string;
  packUnit: string;
  unitsPerPack: number;
  yieldPercent: number;
  parLevel: number;
}

export interface VendorPriceHistory {
  id: string;
  vendorId: string;
  ingredientId: string;
  locationId?: string;
  pricePerPack: number;
  recordedOn: string;
}

export interface InventoryCount {
  id: string;
  businessId: string;
  locationId: string;
  ingredientId: string;
  countedUnits: number;
  varianceUnits: number;
  countedOn: string;
}

export interface StockMovement {
  id: string;
  businessId: string;
  locationId: string;
  ingredientId: string;
  movementType: "received" | "counted" | "waste";
  units: number;
  createdOn: string;
}

export interface RecipeComponent {
  id: string;
  ingredientId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  businessId: string;
  components: RecipeComponent[];
}

export interface MenuItem {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  price: number;
  availability: "active" | "seasonal" | "paused";
  popularity: number;
}

export interface SalesSummary {
  id: string;
  businessId: string;
  locationId: string;
  date: string;
  revenue: number;
  cogs: number;
  labor: number;
}

export interface PerformanceTarget {
  id: string;
  businessId: ScopeId;
  locationId: ScopeId;
  label: string;
  foodCostPercentTarget: number;
  laborPercentTarget: number;
  primeCostPercentTarget: number;
  wasteCostTarget: number;
  salesPerLaborHourTarget: number;
  revenueGrowthPercentTarget: number;
}

export interface SalesForecast {
  id: string;
  businessId: string;
  locationId: string;
  date: string;
  projectedRevenue: number;
  projectedCovers: number;
  projectedLaborHours: number;
}

export interface MarketingCampaign {
  id: string;
  businessId: string;
  locationId?: string;
  startDate: string;
  endDate: string;
  channel: string;
  campaignName: string;
  spend: number;
  attributedRevenue: number;
  leads: number;
  conversions: number;
}

export interface PurchaseOrderDraftItem {
  ingredientId: string;
  suggestedUnits: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrderDraft {
  id: string;
  businessId: string;
  locationId: string;
  vendorId: string;
  status: "draft" | "approved" | "ordered";
  createdOn: string;
  items: PurchaseOrderDraftItem[];
  estimatedCost: number;
}

export interface CateringLead {
  id: string;
  businessId: string;
  locationId: string;
  eventDate: string;
  client: string;
  guestCount: number;
  status: "lead" | "quoted" | "confirmed" | "completed";
  quotedValue: number;
  depositStatus: "none" | "pending" | "paid";
}

export interface ManagerReport {
  id: string;
  interval: "daily" | "weekly" | "monthly";
  businessId: string;
  locationId: string;
  startDate: string;
  endDate: string;
  authorLabel: string;
  summary: string;
  wins: string;
  issues: string;
  followUps: string;
  flags: string[];
}

export interface AppData {
  portfolio: Portfolio;
  businesses: Business[];
  locations: Location[];
  roleAssignments: UserRoleAssignment[];
  expenseCategories: ExpenseCategory[];
  vendors: Vendor[];
  invoices: Invoice[];
  expenses: ExpenseEntry[];
  expenseBudgets: ExpenseBudget[];
  purchases: PurchaseEntry[];
  wasteEntries: WasteEntry[];
  laborSummaries: LaborSummary[];
  menuCategories: MenuCategory[];
  ingredients: Ingredient[];
  vendorPriceHistory: VendorPriceHistory[];
  inventoryCounts: InventoryCount[];
  stockMovements: StockMovement[];
  menuItems: MenuItem[];
  recipes: Recipe[];
  salesSummaries: SalesSummary[];
  performanceTargets: PerformanceTarget[];
  salesForecasts: SalesForecast[];
  marketingCampaigns: MarketingCampaign[];
  purchaseOrderDrafts: PurchaseOrderDraft[];
  cateringLeads: CateringLead[];
  managerReports: ManagerReport[];
}

export interface DashboardKpi {
  label: string;
  value: string;
  trend: number;
  tone: "emerald" | "amber" | "rose" | "sky";
}

export interface TrendPoint {
  label: string;
  revenue: number;
  cogs: number;
  labor: number;
  primeCost: number;
}

export interface BreakdownDatum {
  label: string;
  value: number;
  tone?: string;
}

export interface LocationPerformance {
  id: string;
  name: string;
  revenue: number;
  profit: number;
  foodCostPercent: number;
  laborPercent: number;
}

export interface LocationExecutiveSnapshot extends LocationPerformance {
  wasteCost: number;
  salesPerLaborHour: number;
}

export interface MenuPerformance {
  id: string;
  name: string;
  price: number;
  recipeCost: number;
  margin: number;
  popularity: number;
}

export interface MenuEngineeringDatum extends MenuPerformance {
  quadrant: "star" | "plowhorse" | "puzzle" | "dog";
  targetFoodCostPercent: number;
  actualFoodCostPercent: number;
  suggestedPrice: number;
  volatilityRisk: "low" | "medium" | "high";
}

export interface AppAlert {
  id: string;
  tone: "warning" | "success" | "info";
  title: string;
  detail: string;
}

export interface OwnerActionItem {
  id: string;
  title: string;
  detail: string;
  impact: number;
  tone: "warning" | "success" | "info";
  kind:
    | "prime_cost"
    | "labor"
    | "inventory"
    | "vendor"
    | "menu"
    | "marketing";
}

export interface TargetVarianceRow {
  id: string;
  name: string;
  targetLabel: string;
  foodCostPercentActual: number;
  foodCostPercentTarget: number;
  laborPercentActual: number;
  laborPercentTarget: number;
  primeCostPercentActual: number;
  primeCostPercentTarget: number;
  wasteCostActual: number;
  wasteCostTarget: number;
  salesPerLaborHourActual: number;
  salesPerLaborHourTarget: number;
  revenueGrowthPercentActual: number;
  revenueGrowthPercentTarget: number;
  score: number;
}

export interface ForecastSnapshot {
  projectedRevenue: number;
  projectedLaborHours: number;
  projectedCovers: number;
  projectedPrimeCostPercent: number;
  forecastRows: SalesForecast[];
}

export interface CampaignPerformance {
  id: string;
  campaignName: string;
  channel: string;
  spend: number;
  attributedRevenue: number;
  leads: number;
  conversions: number;
  roiPercent: number;
  conversionRate: number;
}

export interface GrowthInsights {
  topCampaign?: CampaignPerformance;
  weakestCampaign?: CampaignPerformance;
  highestGrowthLocation?: {
    id: string;
    name: string;
    growthPercent: number;
  };
  weakestChannel?: {
    channel: string;
    conversionRate: number;
  };
  campaigns: CampaignPerformance[];
}

export interface ReorderSuggestion {
  ingredientId: string;
  ingredientName: string;
  vendorId: string;
  vendorName: string;
  locationId: string;
  locationName: string;
  currentUnits: number;
  recommendedUnits: number;
  shortageUnits: number;
  unitCost: number;
  estimatedCost: number;
  forecastPressure: number;
}

export interface VendorPriceChange {
  ingredientId: string;
  ingredientName: string;
  vendorId: string;
  vendorName: string;
  latestPricePerPack: number;
  previousPricePerPack: number;
  changeAmount: number;
  changePercent: number;
  recordedOn: string;
}

export interface RecurringExpenseRunRate {
  monthly: number;
  yearly: number;
  entries: ExpenseEntry[];
}

export interface ExpenseBudgetComparison {
  categoryId: string;
  categoryName: string;
  budget: number;
  actual: number;
  variance: number;
}
