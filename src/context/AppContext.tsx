import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { mockData } from "../data/mockData";
import type {
  ExpenseImportRow,
  LaborImportRow,
  MarketingImportRow,
  SalesImportRow,
} from "../lib/csv";
import { slugify } from "../lib/format";
import {
  clearOfflineSnapshot,
  getDefaultSnapshot,
  loadOfflineSnapshot,
  saveOfflineSnapshot,
} from "../lib/offlineStore";
import type {
  AppData,
  CateringLead,
  ExpenseBudget,
  Ingredient,
  InventoryCount,
  ManagerReport,
  MarketingCampaign,
  MenuItem,
  PerformanceTarget,
  PurchaseOrderDraft,
  Recipe,
  Role,
  SalesForecast,
  ScopeId,
  UserRoleAssignment,
} from "../types/domain";

interface ExpenseInput {
  businessId: string;
  locationId: string;
  categoryId: string;
  vendorId: string;
  title: string;
  amount: number;
  occurredOn: string;
  recurring: boolean;
  notes?: string;
}

interface ExpenseBudgetInput {
  businessId: ScopeId;
  locationId: ScopeId;
  categoryId: string;
  amount: number;
}

interface IngredientInput {
  businessId: string;
  name: string;
  baseUnit: string;
  packUnit: string;
  unitsPerPack: number;
  yieldPercent: number;
  parLevel: number;
  vendorId: string;
  pricePerPack: number;
}

interface InventoryCountInput {
  businessId: string;
  locationId: string;
  ingredientId: string;
  countedUnits: number;
  varianceUnits: number;
  countedOn: string;
}

interface WasteInput {
  businessId: string;
  locationId: string;
  ingredientId: string;
  quantity: number;
  reason: string;
  cost: number;
  recordedOn: string;
}

interface MenuItemInput {
  businessId: string;
  categoryId: string;
  name: string;
  price: number;
  availability: MenuItem["availability"];
  popularity: number;
  components: Array<{
    ingredientId: string;
    quantity: number;
  }>;
}

interface LaborInput {
  businessId: string;
  locationId: string;
  date: string;
  sales: number;
  laborCost: number;
  laborHours: number;
  covers: number;
}

interface PerformanceTargetInput {
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

interface SalesForecastInput {
  businessId: string;
  locationId: string;
  date: string;
  projectedRevenue: number;
  projectedCovers: number;
  projectedLaborHours: number;
}

interface MarketingCampaignInput {
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

interface PurchaseOrderDraftInput {
  businessId: string;
  locationId: string;
  vendorId: string;
  items: PurchaseOrderDraft["items"];
}

interface CateringLeadInput {
  businessId: string;
  locationId: string;
  eventDate: string;
  client: string;
  guestCount: number;
  status: CateringLead["status"];
  quotedValue: number;
  depositStatus: CateringLead["depositStatus"];
}

interface ManagerReportInput {
  interval: ManagerReport["interval"];
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

interface AppContextValue {
  data: AppData;
  assignments: UserRoleAssignment[];
  activeAssignment: UserRoleAssignment;
  activeRole: Role;
  setActiveAssignmentId: (id: string) => void;
  selectedBusinessId: ScopeId;
  setSelectedBusinessId: (id: ScopeId) => void;
  selectedLocationId: ScopeId;
  setSelectedLocationId: (id: ScopeId) => void;
  availableBusinesses: AppData["businesses"];
  availableLocations: AppData["locations"];
  effectiveScope: {
    businessId: ScopeId;
    locationId: ScopeId;
  };
  addExpense: (input: ExpenseInput) => void;
  addExpenseBudget: (input: ExpenseBudgetInput) => void;
  addIngredient: (input: IngredientInput) => void;
  addInventoryCount: (input: InventoryCountInput) => void;
  addWasteEntry: (input: WasteInput) => void;
  addMenuItem: (input: MenuItemInput) => void;
  addLaborSummary: (input: LaborInput) => void;
  savePerformanceTarget: (input: PerformanceTargetInput) => void;
  saveSalesForecast: (input: SalesForecastInput) => void;
  addMarketingCampaign: (input: MarketingCampaignInput) => void;
  createPurchaseOrderDraft: (input: PurchaseOrderDraftInput) => void;
  addCateringLead: (input: CateringLeadInput) => void;
  addManagerReport: (input: ManagerReportInput) => void;
  importSalesSummaries: (rows: SalesImportRow[]) => number;
  importLaborSummaries: (rows: LaborImportRow[]) => number;
  importExpenses: (rows: ExpenseImportRow[]) => number;
  importMarketingCampaigns: (rows: MarketingImportRow[]) => number;
  lastSavedAt: string;
  resetOfflineData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const nextId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const fingerprintExpense = (row: ExpenseImportRow) =>
  [
    row.occurredOn,
    row.businessId,
    row.locationId,
    row.categoryId,
    row.vendorId,
    row.title,
    row.amount,
    row.recurring,
  ].join("|");

const fingerprintCampaign = (row: MarketingImportRow) =>
  [
    row.startDate,
    row.endDate,
    row.businessId,
    row.locationId ?? "",
    row.channel,
    row.campaignName,
    row.spend,
    row.attributedRevenue,
    row.leads,
    row.conversions,
  ].join("|");

export const AppProvider = ({ children }: PropsWithChildren) => {
  const initialSnapshot = useMemo(loadOfflineSnapshot, []);
  const [data, setData] = useState<AppData>(initialSnapshot.data ?? structuredClone(mockData));
  const [activeAssignmentId, setActiveAssignmentId] = useState(
    initialSnapshot.activeAssignmentId || mockData.roleAssignments[0].id,
  );
  const [selectedBusinessId, setSelectedBusinessId] = useState<ScopeId>(
    initialSnapshot.selectedBusinessId ?? "all",
  );
  const [selectedLocationId, setSelectedLocationId] = useState<ScopeId>(
    initialSnapshot.selectedLocationId ?? "all",
  );
  const [lastSavedAt, setLastSavedAt] = useState(initialSnapshot.savedAt);

  const assignments = data.roleAssignments;
  const activeAssignment =
    assignments.find((assignment) => assignment.id === activeAssignmentId) ?? assignments[0];

  const availableBusinesses = useMemo(() => {
    return activeAssignment.businessId === "all"
      ? data.businesses
      : data.businesses.filter((business) => business.id === activeAssignment.businessId);
  }, [activeAssignment.businessId, data.businesses]);

  const availableLocations = useMemo(() => {
    const permittedLocationIds =
      activeAssignment.locationId === "all" ? null : new Set([activeAssignment.locationId]);

    return data.locations.filter((location) => {
      if (!availableBusinesses.some((business) => business.id === location.businessId)) {
        return false;
      }

      if (selectedBusinessId !== "all" && location.businessId !== selectedBusinessId) {
        return false;
      }

      if (permittedLocationIds && !permittedLocationIds.has(location.id)) {
        return false;
      }

      return true;
    });
  }, [activeAssignment.locationId, availableBusinesses, data.locations, selectedBusinessId]);

  useEffect(() => {
    setSelectedBusinessId(
      activeAssignment.businessId === "all" ? "all" : activeAssignment.businessId,
    );
    setSelectedLocationId(
      activeAssignment.locationId === "all" ? "all" : activeAssignment.locationId,
    );
  }, [activeAssignment]);

  useEffect(() => {
    if (
      selectedBusinessId !== "all" &&
      !availableBusinesses.some((business) => business.id === selectedBusinessId)
    ) {
      setSelectedBusinessId(
        activeAssignment.businessId === "all" ? "all" : activeAssignment.businessId,
      );
    }
  }, [activeAssignment.businessId, availableBusinesses, selectedBusinessId]);

  useEffect(() => {
    if (
      selectedLocationId !== "all" &&
      !availableLocations.some((location) => location.id === selectedLocationId)
    ) {
      setSelectedLocationId(
        activeAssignment.locationId === "all" ? "all" : activeAssignment.locationId,
      );
    }
  }, [activeAssignment.locationId, availableLocations, selectedLocationId]);

  const effectiveScope = {
    businessId:
      activeAssignment.businessId === "all" ? selectedBusinessId : activeAssignment.businessId,
    locationId:
      activeAssignment.locationId === "all" ? selectedLocationId : activeAssignment.locationId,
  };

  useEffect(() => {
    const snapshot = {
      version: 3,
      savedAt: new Date().toISOString(),
      data,
      activeAssignmentId,
      selectedBusinessId,
      selectedLocationId,
    };

    saveOfflineSnapshot(snapshot);
    setLastSavedAt(snapshot.savedAt);
  }, [activeAssignmentId, data, selectedBusinessId, selectedLocationId]);

  const addExpense = (input: ExpenseInput) => {
    setData((current) => ({
      ...current,
      expenses: [...current.expenses, { id: nextId("expense"), ...input }],
    }));
  };

  const addExpenseBudget = (input: ExpenseBudgetInput) => {
    setData((current) => {
      const nextBudget: ExpenseBudget = {
        id: nextId("budget"),
        period: "monthly",
        ...input,
      };

      return {
        ...current,
        expenseBudgets: [
          ...current.expenseBudgets.filter(
            (budget) =>
              !(
                budget.businessId === input.businessId &&
                budget.locationId === input.locationId &&
                budget.categoryId === input.categoryId &&
                budget.period === "monthly"
              ),
          ),
          nextBudget,
        ],
      };
    });
  };

  const addIngredient = (input: IngredientInput) => {
    const ingredientId = `ing-${slugify(input.name)}-${Date.now()}`;
    const nextIngredient: Ingredient = {
      id: ingredientId,
      businessId: input.businessId,
      name: input.name,
      baseUnit: input.baseUnit,
      packUnit: input.packUnit,
      unitsPerPack: input.unitsPerPack,
      yieldPercent: input.yieldPercent,
      parLevel: input.parLevel,
    };

    setData((current) => ({
      ...current,
      ingredients: [...current.ingredients, nextIngredient],
      vendorPriceHistory: [
        ...current.vendorPriceHistory,
        {
          id: nextId("price"),
          vendorId: input.vendorId,
          ingredientId,
          pricePerPack: input.pricePerPack,
          recordedOn: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
  };

  const addInventoryCount = (input: InventoryCountInput) => {
    const nextCount: InventoryCount = { id: nextId("count"), ...input };
    setData((current) => ({
      ...current,
      inventoryCounts: [...current.inventoryCounts, nextCount],
    }));
  };

  const addWasteEntry = (input: WasteInput) => {
    setData((current) => ({
      ...current,
      wasteEntries: [...current.wasteEntries, { id: nextId("waste"), ...input }],
    }));
  };

  const addMenuItem = (input: MenuItemInput) => {
    const itemId = `item-${slugify(input.name)}-${Date.now()}`;
    const recipeId = nextId("recipe");
    const recipe: Recipe = {
      id: recipeId,
      menuItemId: itemId,
      businessId: input.businessId,
      components: input.components.map((component, index) => ({
        id: `${recipeId}-${index}`,
        ingredientId: component.ingredientId,
        quantity: component.quantity,
      })),
    };

    setData((current) => ({
      ...current,
      menuItems: [
        ...current.menuItems,
        {
          id: itemId,
          businessId: input.businessId,
          categoryId: input.categoryId,
          name: input.name,
          price: input.price,
          availability: input.availability,
          popularity: input.popularity,
        },
      ],
      recipes: [...current.recipes, recipe],
    }));
  };

  const addLaborSummary = (input: LaborInput) => {
    setData((current) => ({
      ...current,
      laborSummaries: [...current.laborSummaries, { id: nextId("labor"), ...input }],
    }));
  };

  const savePerformanceTarget = (input: PerformanceTargetInput) => {
    setData((current) => {
      const nextTarget: PerformanceTarget = { id: nextId("target"), ...input };
      return {
        ...current,
        performanceTargets: [
          ...current.performanceTargets.filter(
            (target) =>
              !(target.businessId === input.businessId && target.locationId === input.locationId),
          ),
          nextTarget,
        ],
      };
    });
  };

  const saveSalesForecast = (input: SalesForecastInput) => {
    setData((current) => {
      const nextForecast: SalesForecast = { id: nextId("forecast"), ...input };
      return {
        ...current,
        salesForecasts: [
          ...current.salesForecasts.filter(
            (forecast) =>
              !(forecast.date === input.date && forecast.locationId === input.locationId),
          ),
          nextForecast,
        ],
      };
    });
  };

  const addMarketingCampaign = (input: MarketingCampaignInput) => {
    setData((current) => ({
      ...current,
      marketingCampaigns: [
        ...current.marketingCampaigns,
        {
          id: nextId("campaign"),
          ...input,
        },
      ],
    }));
  };

  const createPurchaseOrderDraft = (input: PurchaseOrderDraftInput) => {
    setData((current) => ({
      ...current,
      purchaseOrderDrafts: [
        ...current.purchaseOrderDrafts,
        {
          id: nextId("po"),
          createdOn: new Date().toISOString().slice(0, 10),
          estimatedCost: input.items.reduce((sum, item) => sum + item.totalCost, 0),
          status: "draft",
          ...input,
        },
      ],
    }));
  };

  const addCateringLead = (input: CateringLeadInput) => {
    setData((current) => ({
      ...current,
      cateringLeads: [...current.cateringLeads, { id: nextId("catering"), ...input }],
    }));
  };

  const addManagerReport = (input: ManagerReportInput) => {
    setData((current) => ({
      ...current,
      managerReports: [...current.managerReports, { id: nextId("report"), ...input }],
    }));
  };

  const importSalesSummaries = (rows: SalesImportRow[]) => {
    let imported = 0;

    setData((current) => {
      const nextSales = [...current.salesSummaries];
      rows.forEach((row) => {
        const existingIndex = nextSales.findIndex(
          (entry) => entry.date === row.date && entry.locationId === row.locationId,
        );
        const nextEntry = {
          id: existingIndex >= 0 ? nextSales[existingIndex].id : nextId("sales"),
          businessId: row.businessId,
          locationId: row.locationId,
          date: row.date,
          revenue: row.revenue,
          cogs: row.cogs,
          labor: row.labor,
        };

        if (existingIndex >= 0) {
          nextSales[existingIndex] = nextEntry;
        } else {
          nextSales.push(nextEntry);
        }
        imported += 1;
      });

      return {
        ...current,
        salesSummaries: nextSales,
      };
    });

    return imported;
  };

  const importLaborSummaries = (rows: LaborImportRow[]) => {
    let imported = 0;

    setData((current) => {
      const nextLabor = [...current.laborSummaries];
      rows.forEach((row) => {
        const existingIndex = nextLabor.findIndex(
          (entry) => entry.date === row.date && entry.locationId === row.locationId,
        );
        const nextEntry = {
          id: existingIndex >= 0 ? nextLabor[existingIndex].id : nextId("labor"),
          businessId: row.businessId,
          locationId: row.locationId,
          date: row.date,
          sales: row.sales,
          laborCost: row.laborCost,
          laborHours: row.laborHours,
          covers: row.covers,
        };

        if (existingIndex >= 0) {
          nextLabor[existingIndex] = nextEntry;
        } else {
          nextLabor.push(nextEntry);
        }
        imported += 1;
      });

      return {
        ...current,
        laborSummaries: nextLabor,
      };
    });

    return imported;
  };

  const importExpenses = (rows: ExpenseImportRow[]) => {
    let imported = 0;

    setData((current) => {
      const fingerprints = new Set(
        current.expenses.map((expense) =>
          fingerprintExpense({
            occurredOn: expense.occurredOn,
            businessId: expense.businessId,
            locationId: expense.locationId,
            categoryId: expense.categoryId,
            vendorId: expense.vendorId,
            title: expense.title,
            amount: expense.amount,
            recurring: expense.recurring,
          }),
        ),
      );

      const nextExpenses = [...current.expenses];
      rows.forEach((row) => {
        const fingerprint = fingerprintExpense(row);
        if (fingerprints.has(fingerprint)) {
          return;
        }

        nextExpenses.push({
          id: nextId("expense"),
          ...row,
        });
        fingerprints.add(fingerprint);
        imported += 1;
      });

      return {
        ...current,
        expenses: nextExpenses,
      };
    });

    return imported;
  };

  const importMarketingCampaigns = (rows: MarketingImportRow[]) => {
    let imported = 0;

    setData((current) => {
      const fingerprints = new Set(current.marketingCampaigns.map(fingerprintCampaign));
      const nextCampaigns: MarketingCampaign[] = [...current.marketingCampaigns];

      rows.forEach((row) => {
        const fingerprint = fingerprintCampaign(row);
        if (fingerprints.has(fingerprint)) {
          return;
        }

        nextCampaigns.push({
          id: nextId("campaign"),
          ...row,
        });
        fingerprints.add(fingerprint);
        imported += 1;
      });

      return {
        ...current,
        marketingCampaigns: nextCampaigns,
      };
    });

    return imported;
  };

  const resetOfflineData = () => {
    const snapshot = getDefaultSnapshot();
    clearOfflineSnapshot();
    setData(snapshot.data);
    setActiveAssignmentId(snapshot.activeAssignmentId);
    setSelectedBusinessId(snapshot.selectedBusinessId);
    setSelectedLocationId(snapshot.selectedLocationId);
    setLastSavedAt(snapshot.savedAt);
  };

  const value: AppContextValue = {
    data,
    assignments,
    activeAssignment,
    activeRole: activeAssignment.role,
    setActiveAssignmentId,
    selectedBusinessId,
    setSelectedBusinessId,
    selectedLocationId,
    setSelectedLocationId,
    availableBusinesses,
    availableLocations,
    effectiveScope,
    addExpense,
    addExpenseBudget,
    addIngredient,
    addInventoryCount,
    addWasteEntry,
    addMenuItem,
    addLaborSummary,
    savePerformanceTarget,
    saveSalesForecast,
    addMarketingCampaign,
    createPurchaseOrderDraft,
    addCateringLead,
    addManagerReport,
    importSalesSummaries,
    importLaborSummaries,
    importExpenses,
    importMarketingCampaigns,
    lastSavedAt,
    resetOfflineData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
};
