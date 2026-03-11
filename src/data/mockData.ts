import type { AppData } from "../types/domain";

export const mockData: AppData = {
  portfolio: {
    id: "portfolio-ginger-coco",
    name: "Ginger Coco Hospitality",
    headquarters: "Dallas, TX",
  },
  businesses: [
    {
      id: "biz-ginger",
      portfolioId: "portfolio-ginger-coco",
      name: "Ginger Cafe",
      concept: "All-day cafe",
      color: "#f6a76f",
    },
    {
      id: "biz-coco",
      portfolioId: "portfolio-ginger-coco",
      name: "Coco Cabana",
      concept: "Tropical grill",
      color: "#70e1c2",
    },
  ],
  locations: [
    {
      id: "loc-ginger-uptown",
      businessId: "biz-ginger",
      name: "Uptown Cafe",
      city: "Dallas",
      state: "TX",
      openedOn: "2023-04-15",
      seats: 68,
    },
    {
      id: "loc-ginger-riverside",
      businessId: "biz-ginger",
      name: "Riverside Cafe",
      city: "Austin",
      state: "TX",
      openedOn: "2024-08-09",
      seats: 54,
    },
    {
      id: "loc-coco-bayside",
      businessId: "biz-coco",
      name: "Bayside Cabana",
      city: "Miami",
      state: "FL",
      openedOn: "2022-11-03",
      seats: 122,
    },
    {
      id: "loc-coco-midtown",
      businessId: "biz-coco",
      name: "Midtown Cabana",
      city: "Houston",
      state: "TX",
      openedOn: "2025-01-18",
      seats: 96,
    },
  ],
  roleAssignments: [
    {
      id: "role-owner",
      role: "owner",
      businessId: "all",
      locationId: "all",
      label: "Portfolio owner",
    },
    {
      id: "role-finance",
      role: "finance",
      businessId: "all",
      locationId: "all",
      label: "Finance controller",
    },
    {
      id: "role-biz",
      role: "business_manager",
      businessId: "biz-ginger",
      locationId: "all",
      label: "Ginger Cafe ops lead",
    },
    {
      id: "role-location",
      role: "location_manager",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      label: "Bayside Cabana GM",
    },
    {
      id: "role-inventory",
      role: "inventory",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      label: "Uptown inventory lead",
    },
  ],
  expenseCategories: [
    { id: "exp-coffee", name: "Coffee + Tea", type: "cogs" },
    { id: "exp-produce", name: "Produce", type: "cogs" },
    { id: "exp-protein", name: "Proteins", type: "cogs" },
    { id: "exp-beverage", name: "Beverage", type: "cogs" },
    { id: "exp-utilities", name: "Utilities", type: "operating" },
    { id: "exp-rent", name: "Rent", type: "operating" },
    { id: "exp-marketing", name: "Marketing", type: "operating" },
    { id: "exp-cleaning", name: "Cleaning", type: "operating" },
  ],
  vendors: [
    { id: "vendor-roast", name: "Golden Roast Roasters", category: "Coffee", businessId: "all" },
    { id: "vendor-garden", name: "Garden Fresh Produce", category: "Produce", businessId: "all" },
    { id: "vendor-tide", name: "Tide & Tropic Seafood", category: "Protein", businessId: "all" },
    { id: "vendor-dairy", name: "Blue Cart Dairy", category: "Dairy", businessId: "all" },
    { id: "vendor-grid", name: "Sunline Utilities", category: "Utilities", businessId: "all" },
    { id: "vendor-palm", name: "Palm House Creative", category: "Marketing", businessId: "all" },
  ],
  invoices: [
    {
      id: "inv-001",
      vendorId: "vendor-roast",
      invoiceNumber: "GR-21081",
      issuedOn: "2026-03-02",
      amount: 1640,
      attachmentName: "golden-roast-mar02.pdf",
    },
    {
      id: "inv-002",
      vendorId: "vendor-tide",
      invoiceNumber: "TT-55204",
      issuedOn: "2026-03-03",
      amount: 4260,
      attachmentName: "tide-and-tropic-mar03.pdf",
    },
    {
      id: "inv-003",
      vendorId: "vendor-grid",
      invoiceNumber: "SU-10441",
      issuedOn: "2026-03-01",
      amount: 2380,
      attachmentName: "sunline-utilities-march.pdf",
    },
  ],
  expenses: [
    {
      id: "expense-001",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      categoryId: "exp-coffee",
      vendorId: "vendor-roast",
      invoiceId: "inv-001",
      title: "Espresso and matcha restock",
      amount: 1640,
      occurredOn: "2026-03-02",
      recurring: false,
    },
    {
      id: "expense-002",
      businessId: "biz-ginger",
      locationId: "loc-ginger-riverside",
      categoryId: "exp-produce",
      vendorId: "vendor-garden",
      title: "Avocado, citrus, herb delivery",
      amount: 1180,
      occurredOn: "2026-03-03",
      recurring: false,
    },
    {
      id: "expense-003",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      categoryId: "exp-utilities",
      vendorId: "vendor-grid",
      invoiceId: "inv-003",
      title: "March utilities",
      amount: 2380,
      occurredOn: "2026-03-01",
      recurring: true,
    },
    {
      id: "expense-004",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      categoryId: "exp-protein",
      vendorId: "vendor-tide",
      invoiceId: "inv-002",
      title: "Shrimp and snapper delivery",
      amount: 4260,
      occurredOn: "2026-03-03",
      recurring: false,
    },
    {
      id: "expense-005",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      categoryId: "exp-rent",
      vendorId: "vendor-grid",
      title: "Monthly occupancy rent",
      amount: 6850,
      occurredOn: "2026-03-01",
      recurring: true,
    },
    {
      id: "expense-006",
      businessId: "biz-coco",
      locationId: "loc-coco-midtown",
      categoryId: "exp-marketing",
      vendorId: "vendor-palm",
      title: "Spring patio campaign",
      amount: 1940,
      occurredOn: "2026-03-05",
      recurring: false,
    },
    {
      id: "expense-007",
      businessId: "biz-coco",
      locationId: "loc-coco-midtown",
      categoryId: "exp-cleaning",
      vendorId: "vendor-grid",
      title: "Night cleaning crew",
      amount: 880,
      occurredOn: "2026-03-06",
      recurring: true,
    },
    {
      id: "expense-008",
      businessId: "biz-ginger",
      locationId: "loc-ginger-riverside",
      categoryId: "exp-beverage",
      vendorId: "vendor-dairy",
      title: "Alt milk and juice refresh",
      amount: 760,
      occurredOn: "2026-03-05",
      recurring: false,
    },
  ],
  expenseBudgets: [
    { id: "budget-coffee", businessId: "biz-ginger", locationId: "all", categoryId: "exp-coffee", period: "monthly", amount: 4200 },
    { id: "budget-produce", businessId: "biz-ginger", locationId: "all", categoryId: "exp-produce", period: "monthly", amount: 3800 },
    { id: "budget-protein", businessId: "biz-coco", locationId: "all", categoryId: "exp-protein", period: "monthly", amount: 9800 },
    { id: "budget-rent", businessId: "all", locationId: "all", categoryId: "exp-rent", period: "monthly", amount: 7200 },
    { id: "budget-marketing", businessId: "all", locationId: "all", categoryId: "exp-marketing", period: "monthly", amount: 2600 },
    { id: "budget-cleaning", businessId: "all", locationId: "all", categoryId: "exp-cleaning", period: "monthly", amount: 1200 }
  ],
  purchases: [
    {
      id: "purchase-001",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      vendorId: "vendor-roast",
      ingredientId: "ing-espresso",
      quantity: 6,
      totalCost: 930,
      purchasedOn: "2026-03-02",
    },
    {
      id: "purchase-002",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      vendorId: "vendor-tide",
      ingredientId: "ing-shrimp",
      quantity: 7,
      totalCost: 1540,
      purchasedOn: "2026-03-03",
    },
    {
      id: "purchase-003",
      businessId: "biz-coco",
      locationId: "loc-coco-midtown",
      vendorId: "vendor-garden",
      ingredientId: "ing-mango-salsa",
      quantity: 4,
      totalCost: 168,
      purchasedOn: "2026-03-05",
    },
  ],
  wasteEntries: [
    {
      id: "waste-001",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      ingredientId: "ing-avocado",
      quantity: 6,
      reason: "Ripeness loss",
      cost: 24.6,
      recordedOn: "2026-03-05",
    },
    {
      id: "waste-002",
      businessId: "biz-coco",
      locationId: "loc-coco-midtown",
      ingredientId: "ing-rice",
      quantity: 14,
      reason: "Over-prepped lunch batch",
      cost: 13.4,
      recordedOn: "2026-03-06",
    },
    {
      id: "waste-003",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      ingredientId: "ing-shrimp",
      quantity: 1.2,
      reason: "Spoilage above target",
      cost: 19.2,
      recordedOn: "2026-03-07",
    },
  ],
  laborSummaries: [
    { id: "labor-001", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-03", sales: 9420, laborCost: 2580, laborHours: 132, covers: 214 },
    { id: "labor-002", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-04", sales: 9780, laborCost: 2670, laborHours: 136, covers: 226 },
    { id: "labor-003", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-03", sales: 8240, laborCost: 2240, laborHours: 118, covers: 191 },
    { id: "labor-004", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-04", sales: 8460, laborCost: 2310, laborHours: 121, covers: 198 },
    { id: "labor-005", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-03", sales: 18140, laborCost: 5160, laborHours: 238, covers: 398 },
    { id: "labor-006", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-04", sales: 18720, laborCost: 5280, laborHours: 244, covers: 412 },
    { id: "labor-007", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-03", sales: 15210, laborCost: 4280, laborHours: 206, covers: 337 },
    { id: "labor-008", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-04", sales: 15980, laborCost: 4430, laborHours: 212, covers: 351 }
  ],
  menuCategories: [
    { id: "cat-ginger-brunch", businessId: "biz-ginger", name: "Cafe Signatures" },
    { id: "cat-ginger-drinks", businessId: "biz-ginger", name: "Coffee + Matcha" },
    { id: "cat-coco-grill", businessId: "biz-coco", name: "Cabana Grill" },
    { id: "cat-coco-coolers", businessId: "biz-coco", name: "Coolers" },
  ],
  ingredients: [
    { id: "ing-espresso", businessId: "biz-ginger", name: "Espresso beans", baseUnit: "oz", packUnit: "bag", unitsPerPack: 80, yieldPercent: 1, parLevel: 52 },
    { id: "ing-oatmilk", businessId: "biz-ginger", name: "Oat milk", baseUnit: "oz", packUnit: "case", unitsPerPack: 384, yieldPercent: 1, parLevel: 320 },
    { id: "ing-avocado", businessId: "biz-ginger", name: "Avocado", baseUnit: "each", packUnit: "case", unitsPerPack: 36, yieldPercent: 0.92, parLevel: 48 },
    { id: "ing-sourdough", businessId: "biz-ginger", name: "Sourdough slices", baseUnit: "each", packUnit: "bag", unitsPerPack: 30, yieldPercent: 1, parLevel: 120 },
    { id: "ing-ginger-syrup", businessId: "biz-ginger", name: "Ginger syrup", baseUnit: "oz", packUnit: "bottle", unitsPerPack: 25, yieldPercent: 1, parLevel: 18 },
    { id: "ing-shrimp", businessId: "biz-coco", name: "Coconut shrimp", baseUnit: "oz", packUnit: "case", unitsPerPack: 96, yieldPercent: 0.9, parLevel: 170 },
    { id: "ing-jerk-chicken", businessId: "biz-coco", name: "Jerk chicken", baseUnit: "oz", packUnit: "case", unitsPerPack: 120, yieldPercent: 0.93, parLevel: 220 },
    { id: "ing-mango-salsa", businessId: "biz-coco", name: "Mango salsa", baseUnit: "oz", packUnit: "tub", unitsPerPack: 48, yieldPercent: 0.98, parLevel: 32 },
    { id: "ing-rice", businessId: "biz-coco", name: "Jasmine rice", baseUnit: "oz", packUnit: "case", unitsPerPack: 320, yieldPercent: 0.97, parLevel: 540 },
    { id: "ing-passionfruit", businessId: "biz-coco", name: "Passionfruit puree", baseUnit: "oz", packUnit: "bottle", unitsPerPack: 33, yieldPercent: 1, parLevel: 20 }
  ],
  vendorPriceHistory: [
    { id: "price-000", vendorId: "vendor-roast", ingredientId: "ing-espresso", locationId: "loc-ginger-uptown", pricePerPack: 149, recordedOn: "2026-02-24" },
    { id: "price-001", vendorId: "vendor-roast", ingredientId: "ing-espresso", locationId: "loc-ginger-uptown", pricePerPack: 155, recordedOn: "2026-03-02" },
    { id: "price-001a", vendorId: "vendor-dairy", ingredientId: "ing-oatmilk", locationId: "loc-ginger-riverside", pricePerPack: 106, recordedOn: "2026-02-25" },
    { id: "price-002", vendorId: "vendor-dairy", ingredientId: "ing-oatmilk", locationId: "loc-ginger-riverside", pricePerPack: 112, recordedOn: "2026-03-02" },
    { id: "price-002a", vendorId: "vendor-garden", ingredientId: "ing-avocado", pricePerPack: 49, recordedOn: "2026-02-26" },
    { id: "price-003", vendorId: "vendor-garden", ingredientId: "ing-avocado", pricePerPack: 54, recordedOn: "2026-03-03" },
    { id: "price-004", vendorId: "vendor-garden", ingredientId: "ing-sourdough", pricePerPack: 26, recordedOn: "2026-03-03" },
    { id: "price-005", vendorId: "vendor-dairy", ingredientId: "ing-ginger-syrup", pricePerPack: 18, recordedOn: "2026-03-03" },
    { id: "price-005a", vendorId: "vendor-tide", ingredientId: "ing-shrimp", locationId: "loc-coco-bayside", pricePerPack: 129, recordedOn: "2026-02-26" },
    { id: "price-006", vendorId: "vendor-tide", ingredientId: "ing-shrimp", locationId: "loc-coco-bayside", pricePerPack: 138, recordedOn: "2026-03-03" },
    { id: "price-006a", vendorId: "vendor-tide", ingredientId: "ing-jerk-chicken", locationId: "loc-coco-midtown", pricePerPack: 141, recordedOn: "2026-02-26" },
    { id: "price-007", vendorId: "vendor-tide", ingredientId: "ing-jerk-chicken", locationId: "loc-coco-midtown", pricePerPack: 146, recordedOn: "2026-03-03" },
    { id: "price-007a", vendorId: "vendor-garden", ingredientId: "ing-mango-salsa", pricePerPack: 38, recordedOn: "2026-02-27" },
    { id: "price-008", vendorId: "vendor-garden", ingredientId: "ing-mango-salsa", pricePerPack: 42, recordedOn: "2026-03-03" },
    { id: "price-008a", vendorId: "vendor-garden", ingredientId: "ing-rice", pricePerPack: 36, recordedOn: "2026-02-27" },
    { id: "price-009", vendorId: "vendor-garden", ingredientId: "ing-rice", pricePerPack: 38, recordedOn: "2026-03-03" },
    { id: "price-009a", vendorId: "vendor-dairy", ingredientId: "ing-passionfruit", pricePerPack: 26, recordedOn: "2026-02-28" },
    { id: "price-010", vendorId: "vendor-dairy", ingredientId: "ing-passionfruit", pricePerPack: 29, recordedOn: "2026-03-03" }
  ],
  inventoryCounts: [
    { id: "count-001", businessId: "biz-ginger", locationId: "loc-ginger-uptown", ingredientId: "ing-espresso", countedUnits: 44, varianceUnits: -3, countedOn: "2026-03-07" },
    { id: "count-002", businessId: "biz-ginger", locationId: "loc-ginger-riverside", ingredientId: "ing-avocado", countedUnits: 36, varianceUnits: -4, countedOn: "2026-03-07" },
    { id: "count-003", businessId: "biz-coco", locationId: "loc-coco-bayside", ingredientId: "ing-shrimp", countedUnits: 148, varianceUnits: -7, countedOn: "2026-03-07" },
    { id: "count-004", businessId: "biz-coco", locationId: "loc-coco-midtown", ingredientId: "ing-rice", countedUnits: 484, varianceUnits: -18, countedOn: "2026-03-07" },
    { id: "count-005", businessId: "biz-coco", locationId: "loc-coco-midtown", ingredientId: "ing-jerk-chicken", countedUnits: 198, varianceUnits: -5, countedOn: "2026-03-07" }
  ],
  stockMovements: [
    { id: "move-001", businessId: "biz-ginger", locationId: "loc-ginger-uptown", ingredientId: "ing-espresso", movementType: "received", units: 80, createdOn: "2026-03-02" },
    { id: "move-002", businessId: "biz-ginger", locationId: "loc-ginger-riverside", ingredientId: "ing-avocado", movementType: "waste", units: 6, createdOn: "2026-03-05" },
    { id: "move-003", businessId: "biz-coco", locationId: "loc-coco-bayside", ingredientId: "ing-shrimp", movementType: "received", units: 96, createdOn: "2026-03-03" },
    { id: "move-004", businessId: "biz-coco", locationId: "loc-coco-midtown", ingredientId: "ing-rice", movementType: "waste", units: 14, createdOn: "2026-03-06" }
  ],
  menuItems: [
    { id: "item-latte", businessId: "biz-ginger", categoryId: "cat-ginger-drinks", name: "Ginger Latte", price: 8, availability: "active", popularity: 95 },
    { id: "item-toast", businessId: "biz-ginger", categoryId: "cat-ginger-brunch", name: "Citrus Avocado Toast", price: 16, availability: "active", popularity: 88 },
    { id: "item-matcha", businessId: "biz-ginger", categoryId: "cat-ginger-drinks", name: "Matcha Cloud", price: 9, availability: "seasonal", popularity: 76 },
    { id: "item-shrimp-bowl", businessId: "biz-coco", categoryId: "cat-coco-grill", name: "Coconut Shrimp Bowl", price: 28, availability: "active", popularity: 93 },
    { id: "item-jerk", businessId: "biz-coco", categoryId: "cat-coco-grill", name: "Mango Jerk Chicken", price: 31, availability: "active", popularity: 87 },
    { id: "item-cooler", businessId: "biz-coco", categoryId: "cat-coco-coolers", name: "Passionfruit Cooler", price: 10, availability: "active", popularity: 81 }
  ],
  recipes: [
    {
      id: "recipe-latte",
      menuItemId: "item-latte",
      businessId: "biz-ginger",
      components: [
        { id: "rcp-001", ingredientId: "ing-espresso", quantity: 1.2 },
        { id: "rcp-002", ingredientId: "ing-oatmilk", quantity: 10 },
        { id: "rcp-003", ingredientId: "ing-ginger-syrup", quantity: 0.8 }
      ]
    },
    {
      id: "recipe-toast",
      menuItemId: "item-toast",
      businessId: "biz-ginger",
      components: [
        { id: "rcp-004", ingredientId: "ing-avocado", quantity: 1 },
        { id: "rcp-005", ingredientId: "ing-sourdough", quantity: 2 },
        { id: "rcp-006", ingredientId: "ing-ginger-syrup", quantity: 0.2 }
      ]
    },
    {
      id: "recipe-matcha",
      menuItemId: "item-matcha",
      businessId: "biz-ginger",
      components: [
        { id: "rcp-007", ingredientId: "ing-oatmilk", quantity: 12 },
        { id: "rcp-008", ingredientId: "ing-ginger-syrup", quantity: 0.6 }
      ]
    },
    {
      id: "recipe-shrimp-bowl",
      menuItemId: "item-shrimp-bowl",
      businessId: "biz-coco",
      components: [
        { id: "rcp-009", ingredientId: "ing-shrimp", quantity: 7 },
        { id: "rcp-010", ingredientId: "ing-rice", quantity: 8 },
        { id: "rcp-011", ingredientId: "ing-mango-salsa", quantity: 1.5 }
      ]
    },
    {
      id: "recipe-jerk",
      menuItemId: "item-jerk",
      businessId: "biz-coco",
      components: [
        { id: "rcp-012", ingredientId: "ing-jerk-chicken", quantity: 8 },
        { id: "rcp-013", ingredientId: "ing-rice", quantity: 7 },
        { id: "rcp-014", ingredientId: "ing-mango-salsa", quantity: 1.2 }
      ]
    },
    {
      id: "recipe-cooler",
      menuItemId: "item-cooler",
      businessId: "biz-coco",
      components: [
        { id: "rcp-015", ingredientId: "ing-passionfruit", quantity: 2.4 }
      ]
    }
  ],
  salesSummaries: [
    { id: "sales-001", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-01", revenue: 8740, cogs: 2410, labor: 2480 },
    { id: "sales-002", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-02", revenue: 9180, cogs: 2490, labor: 2540 },
    { id: "sales-003", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-03", revenue: 9420, cogs: 2580, labor: 2580 },
    { id: "sales-004", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-04", revenue: 9780, cogs: 2660, labor: 2670 },
    { id: "sales-005", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-05", revenue: 10090, cogs: 2740, labor: 2710 },
    { id: "sales-006", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-01", revenue: 7720, cogs: 2090, labor: 2170 },
    { id: "sales-007", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-02", revenue: 8010, cogs: 2170, labor: 2200 },
    { id: "sales-008", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-03", revenue: 8240, cogs: 2230, labor: 2240 },
    { id: "sales-009", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-04", revenue: 8460, cogs: 2300, labor: 2310 },
    { id: "sales-010", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-05", revenue: 8690, cogs: 2340, labor: 2350 },
    { id: "sales-011", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-01", revenue: 16890, cogs: 4680, labor: 4960 },
    { id: "sales-012", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-02", revenue: 17540, cogs: 4810, labor: 5050 },
    { id: "sales-013", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-03", revenue: 18140, cogs: 4940, labor: 5160 },
    { id: "sales-014", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-04", revenue: 18720, cogs: 5080, labor: 5280 },
    { id: "sales-015", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-05", revenue: 19330, cogs: 5190, labor: 5340 },
    { id: "sales-016", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-01", revenue: 14420, cogs: 3990, labor: 4180 },
    { id: "sales-017", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-02", revenue: 14980, cogs: 4100, labor: 4250 },
    { id: "sales-018", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-03", revenue: 15210, cogs: 4170, labor: 4280 },
    { id: "sales-019", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-04", revenue: 15980, cogs: 4290, labor: 4430 },
    { id: "sales-020", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-05", revenue: 16380, cogs: 4380, labor: 4510 }
  ],
  performanceTargets: [
    {
      id: "target-portfolio",
      businessId: "all",
      locationId: "all",
      label: "Portfolio owner baseline",
      foodCostPercentTarget: 29,
      laborPercentTarget: 29,
      primeCostPercentTarget: 58,
      wasteCostTarget: 45,
      salesPerLaborHourTarget: 72,
      revenueGrowthPercentTarget: 6
    },
    {
      id: "target-ginger",
      businessId: "biz-ginger",
      locationId: "all",
      label: "Ginger concept target",
      foodCostPercentTarget: 28,
      laborPercentTarget: 28,
      primeCostPercentTarget: 56,
      wasteCostTarget: 35,
      salesPerLaborHourTarget: 74,
      revenueGrowthPercentTarget: 7
    },
    {
      id: "target-bayside",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      label: "Bayside stretch target",
      foodCostPercentTarget: 27,
      laborPercentTarget: 28,
      primeCostPercentTarget: 55,
      wasteCostTarget: 40,
      salesPerLaborHourTarget: 76,
      revenueGrowthPercentTarget: 8
    }
  ],
  salesForecasts: [
    { id: "forecast-001", businessId: "biz-ginger", locationId: "loc-ginger-uptown", date: "2026-03-06", projectedRevenue: 10380, projectedCovers: 232, projectedLaborHours: 137 },
    { id: "forecast-002", businessId: "biz-ginger", locationId: "loc-ginger-riverside", date: "2026-03-06", projectedRevenue: 8840, projectedCovers: 204, projectedLaborHours: 123 },
    { id: "forecast-003", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-06", projectedRevenue: 19850, projectedCovers: 426, projectedLaborHours: 248 },
    { id: "forecast-004", businessId: "biz-coco", locationId: "loc-coco-midtown", date: "2026-03-06", projectedRevenue: 16840, projectedCovers: 360, projectedLaborHours: 216 },
    { id: "forecast-005", businessId: "biz-coco", locationId: "loc-coco-bayside", date: "2026-03-07", projectedRevenue: 20520, projectedCovers: 438, projectedLaborHours: 252 }
  ],
  marketingCampaigns: [
    {
      id: "campaign-001",
      businessId: "biz-coco",
      locationId: "loc-coco-midtown",
      startDate: "2026-02-28",
      endDate: "2026-03-06",
      channel: "Instagram",
      campaignName: "Patio launch reels",
      spend: 1200,
      attributedRevenue: 4180,
      leads: 92,
      conversions: 26
    },
    {
      id: "campaign-002",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      startDate: "2026-02-26",
      endDate: "2026-03-05",
      channel: "Email",
      campaignName: "Brunch loyalty push",
      spend: 480,
      attributedRevenue: 2520,
      leads: 68,
      conversions: 31
    },
    {
      id: "campaign-003",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      startDate: "2026-03-01",
      endDate: "2026-03-05",
      channel: "Local ads",
      campaignName: "Weekend seafood special",
      spend: 900,
      attributedRevenue: 1710,
      leads: 74,
      conversions: 11
    }
  ],
  purchaseOrderDrafts: [
    {
      id: "po-001",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      vendorId: "vendor-tide",
      status: "draft",
      createdOn: "2026-03-05",
      items: [
        { ingredientId: "ing-shrimp", suggestedUnits: 28, unitCost: 1.6, totalCost: 44.8 }
      ],
      estimatedCost: 44.8
    }
  ],
  cateringLeads: [
    {
      id: "catering-001",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      eventDate: "2026-03-20",
      client: "TechCorp Annual Retreat",
      guestCount: 150,
      status: "confirmed",
      quotedValue: 4500,
      depositStatus: "paid"
    },
    {
      id: "catering-002",
      businessId: "biz-coco",
      locationId: "loc-coco-midtown",
      eventDate: "2026-03-24",
      client: "Smith Wedding",
      guestCount: 200,
      status: "quoted",
      quotedValue: 8200,
      depositStatus: "pending"
    },
    {
      id: "catering-003",
      businessId: "biz-ginger",
      locationId: "loc-ginger-riverside",
      eventDate: "2026-03-27",
      client: "Chamber Breakfast",
      guestCount: 80,
      status: "lead",
      quotedValue: 1550,
      depositStatus: "none"
    }
  ],
  managerReports: [
    {
      id: "report-001",
      interval: "daily",
      businessId: "biz-coco",
      locationId: "loc-coco-bayside",
      startDate: "2026-03-05",
      endDate: "2026-03-05",
      authorLabel: "Bayside GM",
      summary: "Busy dinner service with strong seafood mix and patio utilization above plan.",
      wins: "Average ticket grew on cocktail pairings and patio seat turns improved.",
      issues: "Shrimp inventory tightened late evening and prep handoff lagged by 15 minutes.",
      followUps: "Revisit shrimp par and tighten opening prep checklist.",
      flags: ["inventory", "labor"]
    },
    {
      id: "report-002",
      interval: "weekly",
      businessId: "biz-ginger",
      locationId: "loc-ginger-uptown",
      startDate: "2026-03-01",
      endDate: "2026-03-07",
      authorLabel: "Ginger ops lead",
      summary: "Labor landed close to plan and brunch attach rate improved on pastry bundles.",
      wins: "Email campaign drove repeat brunch traffic and espresso waste dropped week over week.",
      issues: "Avocado variance stayed high and one utility charge posted above expected run rate.",
      followUps: "Test revised prep pars and review produce receiving checks with AM shift.",
      flags: ["waste", "expense"]
    }
  ]
};
