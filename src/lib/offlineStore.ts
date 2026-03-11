import { mockData } from "../data/mockData";
import type { AppData, ScopeId } from "../types/domain";

const STORAGE_KEY = "restaurant-ops-offline-cache";
const STORAGE_VERSION = 3;

export interface OfflineSnapshot {
  version: number;
  savedAt: string;
  data: AppData;
  activeAssignmentId: string;
  selectedBusinessId: ScopeId;
  selectedLocationId: ScopeId;
}

export const getDefaultSnapshot = (): OfflineSnapshot => ({
  version: STORAGE_VERSION,
  savedAt: new Date().toISOString(),
  data: structuredClone(mockData),
  activeAssignmentId: mockData.roleAssignments[0].id,
  selectedBusinessId: "all",
  selectedLocationId: "all",
});

const migrateData = (data: Partial<AppData>): AppData => {
  const defaults = structuredClone(mockData);

  return {
    ...defaults,
    ...data,
    expenseBudgets: data.expenseBudgets ?? defaults.expenseBudgets,
    performanceTargets: data.performanceTargets ?? defaults.performanceTargets,
    salesForecasts: data.salesForecasts ?? defaults.salesForecasts,
    marketingCampaigns: data.marketingCampaigns ?? defaults.marketingCampaigns,
    purchaseOrderDrafts: data.purchaseOrderDrafts ?? defaults.purchaseOrderDrafts,
    cateringLeads: data.cateringLeads ?? defaults.cateringLeads,
    managerReports: data.managerReports ?? defaults.managerReports,
  };
};

export const loadOfflineSnapshot = (): OfflineSnapshot => {
  if (typeof window === "undefined") {
    return getDefaultSnapshot();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultSnapshot();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OfflineSnapshot>;
    if (!parsed.data?.portfolio || !parsed.data?.businesses?.length) {
      return getDefaultSnapshot();
    }

    return {
      version: STORAGE_VERSION,
      savedAt: parsed.savedAt ?? new Date().toISOString(),
      data: migrateData(parsed.data),
      activeAssignmentId: parsed.activeAssignmentId ?? mockData.roleAssignments[0].id,
      selectedBusinessId: parsed.selectedBusinessId ?? "all",
      selectedLocationId: parsed.selectedLocationId ?? "all",
    };
  } catch {
    return getDefaultSnapshot();
  }
};

export const saveOfflineSnapshot = (snapshot: OfflineSnapshot) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

export const clearOfflineSnapshot = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
