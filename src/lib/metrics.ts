import type {
  AppAlert,
  AppData,
  BreakdownDatum,
  CampaignPerformance,
  ExpenseBudgetComparison,
  ExpenseEntry,
  ForecastSnapshot,
  GrowthInsights,
  InventoryCount,
  LaborSummary,
  LocationExecutiveSnapshot,
  LocationPerformance,
  MenuEngineeringDatum,
  MenuPerformance,
  OwnerActionItem,
  PerformanceTarget,
  Recipe,
  RecurringExpenseRunRate,
  ReorderSuggestion,
  ScopeId,
  TargetVarianceRow,
  TrendPoint,
  VendorPriceChange,
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

const average = (values: number[]) => (values.length > 0 ? sum(values) / values.length : 0);

const getOperatingCategoryIds = (data: AppData) =>
  new Set(
    data.expenseCategories
      .filter((category) => category.type === "operating")
      .map((category) => category.id),
  );

const getVisibleLocations = (data: AppData, scope: ActiveScope) =>
  data.locations.filter((location) => {
    if (scope.businessId !== "all" && location.businessId !== scope.businessId) {
      return false;
    }

    if (scope.locationId !== "all" && location.id !== scope.locationId) {
      return false;
    }

    return true;
  });

const getRecentSalesByLocation = (data: AppData, locationId: string) =>
  data.salesSummaries
    .filter((row) => row.locationId === locationId)
    .sort((left, right) => left.date.localeCompare(right.date));

const latestPrice = (history: VendorPriceHistory[], ingredientId: string, locationId?: string) => {
  const matching = history
    .filter((entry) => entry.ingredientId === ingredientId)
    .filter((entry) => !locationId || !entry.locationId || entry.locationId === locationId)
    .sort((left, right) => right.recordedOn.localeCompare(left.recordedOn));

  return matching[0];
};

const getAppliedTarget = (
  data: AppData,
  businessId: string,
  locationId: string,
): PerformanceTarget => {
  const exactLocation = data.performanceTargets.find(
    (target) => target.businessId === businessId && target.locationId === locationId,
  );
  if (exactLocation) {
    return exactLocation;
  }

  const businessTarget = data.performanceTargets.find(
    (target) => target.businessId === businessId && target.locationId === "all",
  );
  if (businessTarget) {
    return businessTarget;
  }

  return (
    data.performanceTargets.find(
      (target) => target.businessId === "all" && target.locationId === "all",
    ) ?? data.performanceTargets[0]
  );
};

const getRevenueGrowthPercent = (values: number[]) => {
  if (values.length < 2 || values[0] === 0) {
    return 0;
  }

  return ((values[values.length - 1] - values[0]) / values[0]) * 100;
};

const getLocationWasteCost = (data: AppData, locationId: string) =>
  sum(data.wasteEntries.filter((entry) => entry.locationId === locationId).map((entry) => entry.cost));

const getLocationSalesPerLaborHour = (data: AppData, locationId: string) => {
  const laborRows = data.laborSummaries.filter((entry) => entry.locationId === locationId);
  const totalSales = sum(laborRows.map((entry) => entry.sales));
  const totalHours = sum(laborRows.map((entry) => entry.laborHours));
  return totalHours > 0 ? totalSales / totalHours : 0;
};

const getLocationOperatingExpenses = (data: AppData, locationId: string) => {
  const operatingCategoryIds = getOperatingCategoryIds(data);
  return sum(
    data.expenses
      .filter((expense) => expense.locationId === locationId)
      .filter((expense) => operatingCategoryIds.has(expense.categoryId))
      .map((expense) => expense.amount),
  );
};

const getLocationKpis = (data: AppData, locationId: string) => {
  const salesRows = data.salesSummaries.filter((row) => row.locationId === locationId);
  const revenue = sum(salesRows.map((row) => row.revenue));
  const cogs = sum(salesRows.map((row) => row.cogs));
  const labor = sum(salesRows.map((row) => row.labor));
  const operatingExpenses = getLocationOperatingExpenses(data, locationId);
  const wasteCost = getLocationWasteCost(data, locationId);

  return {
    revenue,
    cogs,
    labor,
    operatingExpenses,
    wasteCost,
    profit: revenue - cogs - labor - operatingExpenses,
    foodCostPercent: revenue > 0 ? (cogs / revenue) * 100 : 0,
    laborPercent: revenue > 0 ? (labor / revenue) * 100 : 0,
    primeCostPercent: revenue > 0 ? ((cogs + labor) / revenue) * 100 : 0,
    salesPerLaborHour: getLocationSalesPerLaborHour(data, locationId),
    revenueGrowthPercent: getRevenueGrowthPercent(
      getRecentSalesByLocation(data, locationId).map((row) => row.revenue),
    ),
  };
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
      const recipeCost = recipe
        ? getRecipeCost(data, recipe, scope.locationId === "all" ? undefined : scope.locationId)
        : 0;
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

export const getMenuEngineeringMatrix = (
  data: AppData,
  scope: ActiveScope,
): MenuEngineeringDatum[] => {
  const performance = getMenuPerformance(data, scope);
  const averageMargin = average(performance.map((item) => item.margin));
  const averagePopularity = average(performance.map((item) => item.popularity));

  return performance.map((item) => {
    const menuItem = data.menuItems.find((entry) => entry.id === item.id);
    const target = menuItem
      ? getAppliedTarget(data, menuItem.businessId, scope.locationId === "all" ? data.locations.find((location) => location.businessId === menuItem.businessId)?.id ?? "all" : scope.locationId)
      : data.performanceTargets[0];
    const actualFoodCostPercent = item.price > 0 ? (item.recipeCost / item.price) * 100 : 0;
    const suggestedPrice =
      item.recipeCost / Math.max(0.2, 1 - target.foodCostPercentTarget / 100);
    const recipe = data.recipes.find((entry) => entry.menuItemId === item.id);
    const volatilityRisk = (() => {
      if (!recipe) {
        return "low" as const;
      }

      const averageChange =
        average(
          recipe.components.map((component) => {
            const change = getVendorPriceChangeSummary(data, scope).find(
              (entry) => entry.ingredientId === component.ingredientId,
            );
            return Math.max(change?.changePercent ?? 0, 0);
          }),
        );

      if (averageChange > 8) {
        return "high" as const;
      }
      if (averageChange > 3) {
        return "medium" as const;
      }
      return "low" as const;
    })();

    const quadrant =
      item.popularity >= averagePopularity
        ? item.margin >= averageMargin
          ? "star"
          : "plowhorse"
        : item.margin >= averageMargin
          ? "puzzle"
          : "dog";

    return {
      ...item,
      quadrant,
      targetFoodCostPercent: target.foodCostPercentTarget,
      actualFoodCostPercent,
      suggestedPrice,
      volatilityRisk,
    };
  });
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

export const getRecurringExpenseRunRate = (
  data: AppData,
  scope: ActiveScope,
): RecurringExpenseRunRate => {
  const entries = withinScope(data.expenses, scope).filter((entry) => entry.recurring);
  const monthly = sum(entries.map((entry) => entry.amount));
  return {
    monthly,
    yearly: monthly * 12,
    entries,
  };
};

export const getExpenseBudgetComparison = (
  data: AppData,
  scope: ActiveScope,
): ExpenseBudgetComparison[] => {
  const expenses = withinScope(data.expenses, scope);

  return data.expenseCategories.map((category) => {
    const matchingBudgets = data.expenseBudgets.filter((budget) => {
      if (budget.categoryId !== category.id) {
        return false;
      }
      if (scope.businessId !== "all" && budget.businessId !== "all" && budget.businessId !== scope.businessId) {
        return false;
      }
      if (scope.locationId !== "all" && budget.locationId !== "all" && budget.locationId !== scope.locationId) {
        return false;
      }
      return true;
    });

    const sortedBudgets = matchingBudgets.sort((left, right) => {
      const leftSpecificity = (left.businessId !== "all" ? 1 : 0) + (left.locationId !== "all" ? 1 : 0);
      const rightSpecificity = (right.businessId !== "all" ? 1 : 0) + (right.locationId !== "all" ? 1 : 0);
      return rightSpecificity - leftSpecificity;
    });

    const actual = sum(
      expenses
        .filter((expense) => expense.categoryId === category.id)
        .map((expense) => expense.amount),
    );
    const budget = sortedBudgets[0]?.amount ?? 0;

    return {
      categoryId: category.id,
      categoryName: category.name,
      budget,
      actual,
      variance: actual - budget,
    };
  });
};

export const getVendorPriceChangeSummary = (
  data: AppData,
  scope: ActiveScope,
): VendorPriceChange[] => {
  const visibleIngredients = data.ingredients.filter(
    (ingredient) => scope.businessId === "all" || ingredient.businessId === scope.businessId,
  );

  return visibleIngredients
    .map((ingredient) => {
      const history = data.vendorPriceHistory
        .filter((entry) => entry.ingredientId === ingredient.id)
        .filter((entry) => scope.locationId === "all" || !entry.locationId || entry.locationId === scope.locationId)
        .sort((left, right) => right.recordedOn.localeCompare(left.recordedOn));

      if (history.length < 2) {
        return null;
      }

      const [latest, previous] = history;
      const vendor = data.vendors.find((entry) => entry.id === latest.vendorId);
      const changeAmount = latest.pricePerPack - previous.pricePerPack;
      const changePercent =
        previous.pricePerPack > 0 ? (changeAmount / previous.pricePerPack) * 100 : 0;

      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        vendorId: latest.vendorId,
        vendorName: vendor?.name ?? latest.vendorId,
        latestPricePerPack: latest.pricePerPack,
        previousPricePerPack: previous.pricePerPack,
        changeAmount,
        changePercent,
        recordedOn: latest.recordedOn,
      };
    })
    .filter((entry): entry is VendorPriceChange => Boolean(entry))
    .sort((left, right) => right.changePercent - left.changePercent);
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

export const getReorderSuggestions = (
  data: AppData,
  scope: ActiveScope,
): ReorderSuggestion[] => {
  const visibleLocations = getVisibleLocations(data, scope);

  return visibleLocations
    .flatMap((location) => {
      const forecasts = data.salesForecasts.filter((entry) => entry.locationId === location.id);
      const projectedRevenue = sum(forecasts.map((entry) => entry.projectedRevenue));
      const recentRevenue = sum(
        getRecentSalesByLocation(data, location.id)
          .slice(-Math.max(forecasts.length, 1))
          .map((entry) => entry.revenue),
      );
      const forecastPressure =
        recentRevenue > 0 && projectedRevenue > 0
          ? Math.max(projectedRevenue / recentRevenue, 1)
          : 1;

      return data.ingredients
        .filter((ingredient) => ingredient.businessId === location.businessId)
        .map((ingredient) => {
          const latestCount = data.inventoryCounts
            .filter(
              (count) => count.locationId === location.id && count.ingredientId === ingredient.id,
            )
            .sort((left, right) => right.countedOn.localeCompare(left.countedOn))[0];
          const currentUnits = latestCount?.countedUnits ?? 0;
          const recommendedUnits = Math.ceil(ingredient.parLevel * Math.min(forecastPressure, 1.35));
          const shortageUnits = Math.max(recommendedUnits - currentUnits, 0);
          if (shortageUnits <= 0) {
            return null;
          }

          const latestVendorPrice = latestPrice(data.vendorPriceHistory, ingredient.id, location.id);
          const vendor = data.vendors.find((entry) => entry.id === latestVendorPrice?.vendorId);
          const unitCost = getIngredientUnitCost(data, ingredient.id, location.id);

          return {
            ingredientId: ingredient.id,
            ingredientName: ingredient.name,
            vendorId: latestVendorPrice?.vendorId ?? data.vendors[0]?.id ?? "vendor",
            vendorName: vendor?.name ?? "Unknown vendor",
            locationId: location.id,
            locationName: location.name,
            currentUnits,
            recommendedUnits,
            shortageUnits,
            unitCost,
            estimatedCost: shortageUnits * unitCost,
            forecastPressure,
          };
        })
        .filter((entry): entry is ReorderSuggestion => Boolean(entry));
    })
    .sort((left, right) => right.estimatedCost - left.estimatedCost);
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
  const operatingCategoryIds = getOperatingCategoryIds(data);
  const salesRows = getSalesRows(data, scope);
  const expenseRows = getExpenseRows(data, scope).filter((row) =>
    operatingCategoryIds.has(row.categoryId),
  );
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

export const getLocationPerformance = (data: AppData, scope: ActiveScope): LocationPerformance[] =>
  getVisibleLocations(data, scope).map((location) => {
    const kpis = getLocationKpis(data, location.id);
    return {
      id: location.id,
      name: location.name,
      revenue: kpis.revenue,
      profit: kpis.profit,
      foodCostPercent: kpis.foodCostPercent,
      laborPercent: kpis.laborPercent,
    };
  });

export const getExecutiveComparison = (
  data: AppData,
  scope: ActiveScope,
): LocationExecutiveSnapshot[] =>
  getVisibleLocations(data, scope)
    .map((location) => {
      const kpis = getLocationKpis(data, location.id);
      return {
        id: location.id,
        name: location.name,
        revenue: kpis.revenue,
        profit: kpis.profit,
        foodCostPercent: kpis.foodCostPercent,
        laborPercent: kpis.laborPercent,
        wasteCost: kpis.wasteCost,
        salesPerLaborHour: kpis.salesPerLaborHour,
      };
    })
    .sort((left, right) => right.revenue - left.revenue);

export const getForecastSnapshot = (
  data: AppData,
  scope: ActiveScope,
): ForecastSnapshot => {
  const forecastRows = withinScope(data.salesForecasts, scope)
    .slice()
    .sort((left, right) => left.date.localeCompare(right.date));
  const projectedRevenue = sum(forecastRows.map((entry) => entry.projectedRevenue));
  const projectedLaborHours = sum(forecastRows.map((entry) => entry.projectedLaborHours));
  const projectedCovers = sum(forecastRows.map((entry) => entry.projectedCovers));
  const currentPrimeCostPercent = getDashboardKpis(data, scope).primeCostPercent;

  return {
    projectedRevenue,
    projectedLaborHours,
    projectedCovers,
    projectedPrimeCostPercent: currentPrimeCostPercent,
    forecastRows,
  };
};

export const getTargetVariance = (
  data: AppData,
  scope: ActiveScope,
): TargetVarianceRow[] =>
  getVisibleLocations(data, scope)
    .map((location) => {
      const target = getAppliedTarget(data, location.businessId, location.id);
      const kpis = getLocationKpis(data, location.id);
      const score =
        Math.abs(kpis.foodCostPercent - target.foodCostPercentTarget) +
        Math.abs(kpis.laborPercent - target.laborPercentTarget) +
        Math.abs(kpis.primeCostPercent - target.primeCostPercentTarget) +
        Math.abs(kpis.revenueGrowthPercent - target.revenueGrowthPercentTarget);

      return {
        id: location.id,
        name: location.name,
        targetLabel: target.label,
        foodCostPercentActual: kpis.foodCostPercent,
        foodCostPercentTarget: target.foodCostPercentTarget,
        laborPercentActual: kpis.laborPercent,
        laborPercentTarget: target.laborPercentTarget,
        primeCostPercentActual: kpis.primeCostPercent,
        primeCostPercentTarget: target.primeCostPercentTarget,
        wasteCostActual: kpis.wasteCost,
        wasteCostTarget: target.wasteCostTarget,
        salesPerLaborHourActual: kpis.salesPerLaborHour,
        salesPerLaborHourTarget: target.salesPerLaborHourTarget,
        revenueGrowthPercentActual: kpis.revenueGrowthPercent,
        revenueGrowthPercentTarget: target.revenueGrowthPercentTarget,
        score,
      };
    })
    .sort((left, right) => left.score - right.score);

export const getGrowthInsights = (data: AppData, scope: ActiveScope): GrowthInsights => {
  const campaigns = withinScope(
    data.marketingCampaigns.map((campaign) => ({
      ...campaign,
      locationId: campaign.locationId,
    })),
    scope,
  )
    .map<CampaignPerformance>((campaign) => ({
      id: campaign.id,
      campaignName: campaign.campaignName,
      channel: campaign.channel,
      spend: campaign.spend,
      attributedRevenue: campaign.attributedRevenue,
      leads: campaign.leads,
      conversions: campaign.conversions,
      roiPercent: campaign.spend > 0 ? ((campaign.attributedRevenue - campaign.spend) / campaign.spend) * 100 : 0,
      conversionRate: campaign.leads > 0 ? (campaign.conversions / campaign.leads) * 100 : 0,
    }))
    .sort((left, right) => right.roiPercent - left.roiPercent);

  const channelPerformance = campaigns.reduce<Record<string, { conversions: number; leads: number }>>(
    (accumulator, campaign) => {
      accumulator[campaign.channel] ??= { conversions: 0, leads: 0 };
      accumulator[campaign.channel].conversions += campaign.conversions;
      accumulator[campaign.channel].leads += campaign.leads;
      return accumulator;
    },
    {},
  );

  const weakestChannel = Object.entries(channelPerformance)
    .map(([channel, totals]) => ({
      channel,
      conversionRate: totals.leads > 0 ? (totals.conversions / totals.leads) * 100 : 0,
    }))
    .sort((left, right) => left.conversionRate - right.conversionRate)[0];

  const highestGrowthLocation = getVisibleLocations(data, scope)
    .map((location) => ({
      id: location.id,
      name: location.name,
      growthPercent: getLocationKpis(data, location.id).revenueGrowthPercent,
    }))
    .sort((left, right) => right.growthPercent - left.growthPercent)[0];

  return {
    topCampaign: campaigns[0],
    weakestCampaign: campaigns.slice().sort((left, right) => left.roiPercent - right.roiPercent)[0],
    highestGrowthLocation,
    weakestChannel,
    campaigns,
  };
};

export const getOwnerActionItems = (data: AppData, scope: ActiveScope): OwnerActionItem[] => {
  const targetVariance = getTargetVariance(data, scope);
  const reorderSuggestions = getReorderSuggestions(data, scope);
  const priceChanges = getVendorPriceChangeSummary(data, scope);
  const menuMatrix = getMenuEngineeringMatrix(data, scope);
  const growth = getGrowthInsights(data, scope);
  const actions: OwnerActionItem[] = [];

  targetVariance.forEach((row) => {
    const location = data.locations.find((entry) => entry.id === row.id);
    const revenue = getLocationKpis(data, row.id).revenue;
    const primeGap = row.primeCostPercentActual - row.primeCostPercentTarget;
    const laborGap = row.laborPercentActual - row.laborPercentTarget;

    if (primeGap > 0.5) {
      actions.push({
        id: `prime-${row.id}`,
        kind: "prime_cost",
        tone: "warning",
        title: `${row.name} is above prime cost target`,
        detail: `${row.primeCostPercentActual.toFixed(1)}% vs ${row.primeCostPercentTarget.toFixed(1)}% target.`,
        impact: revenue * (primeGap / 100),
      });
    }

    if (laborGap > 0.5) {
      actions.push({
        id: `labor-${row.id}`,
        kind: "labor",
        tone: "warning",
        title: `${row.name} labor is above target`,
        detail: `${row.laborPercentActual.toFixed(1)}% vs ${row.laborPercentTarget.toFixed(1)}% target.`,
        impact: revenue * (laborGap / 100),
      });
    }

    if (row.wasteCostActual > row.wasteCostTarget) {
      actions.push({
        id: `waste-${row.id}`,
        kind: "inventory",
        tone: "warning",
        title: `${location?.name ?? row.name} waste exceeded target`,
        detail: `${row.wasteCostActual.toFixed(0)} tracked vs ${row.wasteCostTarget.toFixed(0)} target.`,
        impact: row.wasteCostActual - row.wasteCostTarget,
      });
    }
  });

  reorderSuggestions.slice(0, 3).forEach((suggestion) => {
    actions.push({
      id: `inventory-${suggestion.locationId}-${suggestion.ingredientId}`,
      kind: "inventory",
      tone: "info",
      title: `${suggestion.ingredientName} needs reorder coverage`,
      detail: `${suggestion.locationName} is ${suggestion.shortageUnits.toFixed(0)} units below forecast-adjusted par.`,
      impact: suggestion.estimatedCost,
    });
  });

  priceChanges
    .filter((change) => change.changePercent > 3)
    .slice(0, 3)
    .forEach((change) => {
      actions.push({
        id: `vendor-${change.ingredientId}`,
        kind: "vendor",
        tone: "warning",
        title: `${change.ingredientName} cost is climbing`,
        detail: `${change.vendorName} increased pack price by ${change.changePercent.toFixed(1)}%.`,
        impact: Math.max(change.changeAmount, 0) * 4,
      });
    });

  menuMatrix
    .filter((item) => item.actualFoodCostPercent > item.targetFoodCostPercent + 2)
    .slice(0, 2)
    .forEach((item) => {
      actions.push({
        id: `menu-${item.id}`,
        kind: "menu",
        tone: "info",
        title: `${item.name} is underpriced for current cost`,
        detail: `Suggested price ${item.suggestedPrice.toFixed(2)} to hold ${item.targetFoodCostPercent.toFixed(0)}% food cost.`,
        impact: Math.max(item.suggestedPrice - item.price, 0) * (item.popularity / 8),
      });
    });

  if (growth.weakestCampaign && growth.weakestCampaign.roiPercent < 20) {
    actions.push({
      id: `marketing-${growth.weakestCampaign.id}`,
      kind: "marketing",
      tone: "warning",
      title: `${growth.weakestCampaign.campaignName} is weak on ROI`,
      detail: `${growth.weakestCampaign.channel} campaign is returning ${growth.weakestCampaign.roiPercent.toFixed(1)}% ROI.`,
      impact: Math.max(growth.weakestCampaign.spend - growth.weakestCampaign.attributedRevenue, 0),
    });
  }

  return actions.sort((left, right) => right.impact - left.impact).slice(0, 8);
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
  const actions = getOwnerActionItems(data, scope).slice(0, 3);
  const alerts: AppAlert[] = [];

  if (kpis.primeCostPercent > 58) {
    alerts.push({
      id: "alert-prime",
      tone: "warning",
      title: "Prime cost is above target",
      detail: `Prime cost is ${kpis.primeCostPercent.toFixed(1)}%, above the 58% goal.`,
    });
  }

  actions.forEach((action) => {
    alerts.push({
      id: `alert-${action.id}`,
      tone: action.tone,
      title: action.title,
      detail: action.detail,
    });
  });

  if (alerts.length === 0) {
    alerts.push({
      id: "alert-good",
      tone: "success",
      title: "Operating metrics are stable",
      detail: "No threshold breaches detected in the current reporting window.",
    });
  }

  return alerts.slice(0, 4);
};
