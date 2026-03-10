import { mockData } from "../data/mockData";
import type { AppData, ScopeId } from "../types/domain";

const STORAGE_KEY = "restaurant-ops-offline-cache";
const STORAGE_VERSION = 2;

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

export const loadOfflineSnapshot = (): OfflineSnapshot => {
  if (typeof window === "undefined") {
    return getDefaultSnapshot();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultSnapshot();
  }

  try {
    const parsed = JSON.parse(raw) as OfflineSnapshot;
    if (parsed.version !== STORAGE_VERSION || !parsed.data?.portfolio || !parsed.data?.businesses?.length) {
      return getDefaultSnapshot();
    }

    return parsed;
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
