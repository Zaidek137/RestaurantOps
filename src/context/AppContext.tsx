import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { mockData } from "../data/mockData";
import { slugify } from "../lib/format";
import {
  clearOfflineSnapshot,
  getDefaultSnapshot,
  loadOfflineSnapshot,
  saveOfflineSnapshot,
} from "../lib/offlineStore";
import type {
  AppData,
  Ingredient,
  InventoryCount,
  MenuItem,
  Recipe,
  Role,
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
  addIngredient: (input: IngredientInput) => void;
  addInventoryCount: (input: InventoryCountInput) => void;
  addWasteEntry: (input: WasteInput) => void;
  addMenuItem: (input: MenuItemInput) => void;
  addLaborSummary: (input: LaborInput) => void;
  lastSavedAt: string;
  resetOfflineData: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const nextId = (prefix: string) => `${prefix}-${Date.now()}`;

export const AppProvider = ({ children }: PropsWithChildren) => {
  const initialSnapshot = useMemo(loadOfflineSnapshot, []);
  const [data, setData] = useState<AppData>(initialSnapshot.data ?? structuredClone(mockData));
  const [activeAssignmentId, setActiveAssignmentId] = useState(initialSnapshot.activeAssignmentId || mockData.roleAssignments[0].id);
  const [selectedBusinessId, setSelectedBusinessId] = useState<ScopeId>(initialSnapshot.selectedBusinessId ?? "all");
  const [selectedLocationId, setSelectedLocationId] = useState<ScopeId>(initialSnapshot.selectedLocationId ?? "all");
  const [lastSavedAt, setLastSavedAt] = useState(initialSnapshot.savedAt);

  const assignments = data.roleAssignments;
  const activeAssignment = assignments.find((assignment) => assignment.id === activeAssignmentId) ?? assignments[0];

  const availableBusinesses = useMemo(() => {
    return activeAssignment.businessId === "all"
      ? data.businesses
      : data.businesses.filter((business) => business.id === activeAssignment.businessId);
  }, [activeAssignment.businessId, data.businesses]);

  const availableLocations = useMemo(() => {
    const permittedLocationIds = activeAssignment.locationId === "all" ? null : new Set([activeAssignment.locationId]);

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
    setSelectedBusinessId(activeAssignment.businessId === "all" ? "all" : activeAssignment.businessId);
    setSelectedLocationId(activeAssignment.locationId === "all" ? "all" : activeAssignment.locationId);
  }, [activeAssignment]);

  useEffect(() => {
    if (selectedBusinessId !== "all" && !availableBusinesses.some((business) => business.id === selectedBusinessId)) {
      setSelectedBusinessId(activeAssignment.businessId === "all" ? "all" : activeAssignment.businessId);
    }
  }, [activeAssignment.businessId, availableBusinesses, selectedBusinessId]);

  useEffect(() => {
    if (selectedLocationId !== "all" && !availableLocations.some((location) => location.id === selectedLocationId)) {
      setSelectedLocationId(activeAssignment.locationId === "all" ? "all" : activeAssignment.locationId);
    }
  }, [activeAssignment.locationId, availableLocations, selectedLocationId]);

  const effectiveScope = {
    businessId: activeAssignment.businessId === "all" ? selectedBusinessId : activeAssignment.businessId,
    locationId: activeAssignment.locationId === "all" ? selectedLocationId : activeAssignment.locationId,
  };

  useEffect(() => {
    const snapshot = {
      version: 2,
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
    addIngredient,
    addInventoryCount,
    addWasteEntry,
    addMenuItem,
    addLaborSummary,
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
