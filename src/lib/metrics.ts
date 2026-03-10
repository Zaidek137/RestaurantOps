import type {
  AppAlert,
  AppData,
  BreakdownDatum,
  ExpenseEntry,
  InventoryCount,
  LaborSummary,
  LocationPerformance,
  MenuPerformance,
  Recipe,
  ScopeId,
  TrendPoint,
  VendorPriceHistory,
} from "../types/domain";

export interface ActiveScope {
  businessId: ScopeId;
  locationId: ScopeId;
}

const withinScope = <T extends { businessId: string; locationId?: string }>(
  rows: T[],
  scope: ActiveScope,
) =>
  rows.filter((row) => {
    if (scope.businessId !== "all" && row.businessId !== scope.businessId) {
      return false;
    }

    if (scope.locationId !== "all" && row.locationId !== scope.locationId) {
      return false;
    }

    return true;
  });

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const latestPrice = (
  history: VendorPriceHistory[],
  ingredientId: string,
  locationId?: string,
) => {
  const matching = history
    .filter((entry) => entry.ingredientId === ingredientId)
    .filter((entry) => !locationId || !entry.locationId || entry.locationId === locationId)
    .sort((left, right) => right.recordedOn.localeCompare(left.recordedOn));

  return matching[0];
};

export const getIngredientUnitCost = (
  data: AppData,
  ingredientId: string,
  locationId?: string,
) => {
  const ingredient = data.ingredients.find((item) => item.id === ingredientId);
  if (!ingredient) {
    return 0;
  }

  const price = latestPrice(data.vendorPriceHistory, ingredientId, locationId);
  if (!price) {
    return 0;
  }

  const usableUnits = ingredient.unitsPerPack * ingredient.yieldPercent;
  return usableUnits > 0 ? price.pricePerPack / usableUnits : 0;
};

export const getRecipeCost = (data: AppData, recipe: Recipe, locationId?: string) =>
  recipe.components.reduce(
    (total, component) =>
      total + getIngredientUnitCost(data, component.ingredientId, locationId) * component.quantity,
    0,
  );

export const getMenuPerformance = (data: AppData, scope: ActiveScope): MenuPerformance[] => {
  const items = data.menuItems.filter((item) => {
    if (scope.businessId !== "all" && item.businessId !== scope.businessId) {
      return false;
    }

    return true;
  });

  return items
    .map((item) => {
      const recipe = data.recipes.find((entry) => entry.menuItemId === item.id);
      const recipeCost = recipe ? getRecipeCost(data, recipe, scope.locationId === "all" ? undefined : scope.locationId) : 0;
      const margin = item.price - recipeCost;

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        recipeCost,
        margin,
        popularity: item.popularity,
      };
    })
    .sort((left, right) => right.margin - left.margin);
};

export const getExpenseBreakdown = (data: AppData, scope: ActiveScope): BreakdownDatum[] => {
  const expenses = withinScope(data.expenses, scope);

  return data.expenseCategories
    .map((category) => ({
      label: category.name,
      value: sum(
        expenses
          .filter((expense) => expense.categoryId === category.id)
          .map((expense) => expense.amount),
      ),
      tone:
        category.type === "cogs"
          ? "var(--accent-coral)"
          : category.type === "labor"
            ? "var(--accent-gold)"
            : "var(--accent-mint)",
    }))
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value);
};

export const getVendorSpend = (data: AppData, scope: ActiveScope): BreakdownDatum[] => {
  const expenses = withinScope(data.expenses, scope);

  return data.vendors
    .map((vendor) => ({
      label: vendor.name,
      value: sum(expenses.filter((expense) => expense.vendorId === vendor.id).map((expense) => expense.amount)),
    }))
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
};

export const getInventorySnapshot = (data: AppData, scope: ActiveScope) => {
  const counts = withinScope(data.inventoryCounts, scope);
  const wasteEntries = withinScope(data.wasteEntries, scope);

  const inventoryValue = sum(
    counts.map((count) => count.countedUnits * getIngredientUnitCost(data, count.ingredientId, count.locationId)),
  );
  const wasteCost = sum(wasteEntries.map((entry) => entry.cost));
  const totalVariance = sum(counts.map((count) => Math.abs(count.varianceUnits)));

  return {
    inventoryValue,
    wasteCost,
    totalVariance,
    counts,
    wasteEntries,
  };
};

export const getLaborSnapshot = (data: AppData, scope: ActiveScope) => {
  const laborEntries = withinScope(data.laborSummaries, scope);
  const totalSales = sum(laborEntries.map((entry) => entry.sales));
  const totalLaborCost = sum(laborEntries.map((entry) => entry.laborCost));
  const totalHours = sum(laborEntries.map((entry) => entry.laborHours));
  const totalCovers = sum(laborEntries.map((entry) => entry.covers));

  return {
    totalSales,
    totalLaborCost,
    totalHours,
    totalCovers,
    laborPercent: totalSales > 0 ? (totalLaborCost / totalSales) * 100 : 0,
    salesPerLaborHour: totalHours > 0 ? totalSales / totalHours : 0,
    laborEntries,
  };
};

export const getTrendPoints = (data: AppData, scope: ActiveScope): TrendPoint[] => {
  const rows = withinScope(data.salesSummaries, scope);
  const dates = [...new Set(rows.map((row) => row.date))].sort();

  return dates.map((date) => {
    const dayRows = rows.filter((row) => row.date === date);
    const revenue = sum(dayRows.map((row) => row.revenue));
    const cogs = sum(dayRows.map((row) => row.cogs));
    const labor = sum(dayRows.map((row) => row.labor));

    return {
      label: date.slice(5),
      revenue,
      cogs,
      labor,
      primeCost: cogs + labor,
    };
  });
};

const getSalesRows = (data: AppData, scope: ActiveScope) => withinScope(data.salesSummaries, scope);
const getExpenseRows = (data: AppData, scope: ActiveScope) => withinScope(data.expenses, scope);

export const getDashboardKpis = (data: AppData, scope: ActiveScope) => {
  const salesRows = getSalesRows(data, scope);
  const expenseRows = getExpenseRows(data, scope);
  const revenue = sum(salesRows.map((row) => row.revenue));
  const cogs = sum(salesRows.map((row) => row.cogs));
  const labor = sum(salesRows.map((row) => row.labor));
  const expenses = sum(expenseRows.map((row) => row.amount));
  const wasteCost = sum(withinScope(data.wasteEntries, scope).map((entry) => entry.cost));
  const operatingProfit = revenue - cogs - labor - expenses;

  return {
    revenue,
    cogs,
    labor,
    expenses,
    wasteCost,
    operatingProfit,
    foodCostPercent: revenue > 0 ? (cogs / revenue) * 100 : 0,
    laborPercent: revenue > 0 ? (labor / revenue) * 100 : 0,
    primeCostPercent: revenue > 0 ? ((cogs + labor) / revenue) * 100 : 0,
  };
};

export const getLocationPerformance = (data: AppData, scope: ActiveScope): LocationPerformance[] => {
  const visibleLocations = data.locations.filter((location) => {
    if (scope.businessId !== "all" && location.businessId !== scope.businessId) {
      return false;
    }

    if (scope.locationId !== "all" && location.id !== scope.locationId) {
      return false;
    }

    return true;
  });

  return visibleLocations.map((location) => {
    const salesRows = data.salesSummaries.filter((row) => row.locationId === location.id);
    const expenseRows = data.expenses.filter((row) => row.locationId === location.id);
    const revenue = sum(salesRows.map((row) => row.revenue));
    const cogs = sum(salesRows.map((row) => row.cogs));
    const labor = sum(salesRows.map((row) => row.labor));
    const expenses = sum(expenseRows.map((row) => row.amount));

    return {
      id: location.id,
      name: location.name,
      revenue,
      profit: revenue - cogs - labor - expenses,
      foodCostPercent: revenue > 0 ? (cogs / revenue) * 100 : 0,
      laborPercent: revenue > 0 ? (labor / revenue) * 100 : 0,
    };
  });
};

export const getExpenseFeed = (data: AppData, scope: ActiveScope): ExpenseEntry[] =>
  getExpenseRows(data, scope)
    .slice()
    .sort((left, right) => right.occurredOn.localeCompare(left.occurredOn));

export const getRecentLabor = (data: AppData, scope: ActiveScope): LaborSummary[] =>
  withinScope(data.laborSummaries, scope)
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date));

export const getRecentCounts = (data: AppData, scope: ActiveScope): InventoryCount[] =>
  withinScope(data.inventoryCounts, scope)
    .slice()
    .sort((left, right) => right.countedOn.localeCompare(left.countedOn));

export const getAlerts = (data: AppData, scope: ActiveScope): AppAlert[] => {
  const kpis = getDashboardKpis(data, scope);
  const inventory = getInventorySnapshot(data, scope);
  const locations = getLocationPerformance(data, scope);
  const lowestProfitLocation = locations.slice().sort((left, right) => left.profit - right.profit)[0];

  const alerts: AppAlert[] = [];

  if (kpis.primeCostPercent > 58) {
    alerts.push({
      id: "alert-prime",
      tone: "warning",
      title: "Prime cost is above target",
      detail: `Prime cost is ${kpis.primeCostPercent.toFixed(1)}%, above the 58% goal.`,
    });
  }

  if (inventory.wasteCost > 50) {
    alerts.push({
      id: "alert-waste",
      tone: "warning",
      title: "Waste requires intervention",
      detail: `Waste tracked this period is ${inventory.wasteCost.toFixed(0)} dollars.`,
    });
  }

  if (lowestProfitLocation) {
    alerts.push({
      id: "alert-location",
      tone: "info",
      title: `${lowestProfitLocation.name} needs margin review`,
      detail: "This location has the weakest operating profit in the visible scope.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "alert-good",
      tone: "success",
      title: "Operating metrics are stable",
      detail: "No threshold breaches detected in the current reporting window.",
    });
  }

  return alerts;
};
