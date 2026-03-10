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

export interface AppData {
  portfolio: Portfolio;
  businesses: Business[];
  locations: Location[];
  roleAssignments: UserRoleAssignment[];
  expenseCategories: ExpenseCategory[];
  vendors: Vendor[];
  invoices: Invoice[];
  expenses: ExpenseEntry[];
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

export interface MenuPerformance {
  id: string;
  name: string;
  price: number;
  recipeCost: number;
  margin: number;
  popularity: number;
}

export interface AppAlert {
  id: string;
  tone: "warning" | "success" | "info";
  title: string;
  detail: string;
}
