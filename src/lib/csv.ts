export interface CsvPreviewRow {
  rowNumber: number;
  values: Record<string, string>;
}

export interface SalesImportRow {
  date: string;
  businessId: string;
  locationId: string;
  revenue: number;
  cogs: number;
  labor: number;
}

export interface LaborImportRow {
  date: string;
  businessId: string;
  locationId: string;
  sales: number;
  laborCost: number;
  laborHours: number;
  covers: number;
}

export interface ExpenseImportRow {
  occurredOn: string;
  businessId: string;
  locationId: string;
  categoryId: string;
  vendorId: string;
  title: string;
  amount: number;
  recurring: boolean;
}

export interface MarketingImportRow {
  startDate: string;
  endDate: string;
  businessId: string;
  locationId?: string;
  channel: string;
  campaignName: string;
  spend: number;
  attributedRevenue: number;
  leads: number;
  conversions: number;
}

export interface CsvImportResult<T> {
  headers: string[];
  preview: CsvPreviewRow[];
  rows: T[];
  errors: string[];
}

export const csvHeaderMap = {
  sales: ["date", "businessId", "locationId", "revenue", "cogs", "labor"],
  labor: ["date", "businessId", "locationId", "sales", "laborCost", "laborHours", "covers"],
  expense: ["occurredOn", "businessId", "locationId", "categoryId", "vendorId", "title", "amount", "recurring"],
  marketing: ["startDate", "endDate", "businessId", "locationId", "channel", "campaignName", "spend", "attributedRevenue", "leads", "conversions"],
} as const;

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (isQuoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
      continue;
    }

    if (char === "," && !isQuoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseCsvText = (text: string) => {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], preview: [], records: [], errors: ["CSV file is empty."] };
  }

  const headers = parseCsvLine(lines[0]);
  const records = lines.slice(1).map((line, rowIndex) => {
    const cells = parseCsvLine(line);
    const values = headers.reduce<Record<string, string>>((accumulator, header, headerIndex) => {
      accumulator[header] = cells[headerIndex] ?? "";
      return accumulator;
    }, {});

    return {
      rowNumber: rowIndex + 2,
      values,
    };
  });

  return { headers, preview: records.slice(0, 5), records, errors: [] as string[] };
};

const parseNumber = (value: string, label: string, rowNumber: number, errors: string[]) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    errors.push(`Row ${rowNumber}: "${label}" must be numeric.`);
    return null;
  }

  return parsed;
};

const parseBoolean = (value: string, rowNumber: number, errors: string[]) => {
  const normalized = value.toLowerCase();
  if (normalized === "true" || normalized === "yes" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "no" || normalized === "0") {
    return false;
  }

  errors.push(`Row ${rowNumber}: "recurring" must be true/false, yes/no, or 1/0.`);
  return null;
};

const validateHeaders = (headers: string[], requiredHeaders: readonly string[]) =>
  requiredHeaders.filter((header) => !headers.includes(header));

export const parseSalesCsv = (text: string): CsvImportResult<SalesImportRow> => {
  const base = parseCsvText(text);
  const missingHeaders = validateHeaders(base.headers, csvHeaderMap.sales);
  const errors = [...base.errors];

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  const rows: SalesImportRow[] = [];
  if (errors.length === 0) {
    base.records.forEach(({ rowNumber, values }) => {
      const revenue = parseNumber(values.revenue, "revenue", rowNumber, errors);
      const cogs = parseNumber(values.cogs, "cogs", rowNumber, errors);
      const labor = parseNumber(values.labor, "labor", rowNumber, errors);

      if (revenue === null || cogs === null || labor === null) {
        return;
      }

      rows.push({
        date: values.date,
        businessId: values.businessId,
        locationId: values.locationId,
        revenue,
        cogs,
        labor,
      });
    });
  }

  return { headers: base.headers, preview: base.preview, rows, errors };
};

export const parseLaborCsv = (text: string): CsvImportResult<LaborImportRow> => {
  const base = parseCsvText(text);
  const missingHeaders = validateHeaders(base.headers, csvHeaderMap.labor);
  const errors = [...base.errors];

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  const rows: LaborImportRow[] = [];
  if (errors.length === 0) {
    base.records.forEach(({ rowNumber, values }) => {
      const sales = parseNumber(values.sales, "sales", rowNumber, errors);
      const laborCost = parseNumber(values.laborCost, "laborCost", rowNumber, errors);
      const laborHours = parseNumber(values.laborHours, "laborHours", rowNumber, errors);
      const covers = parseNumber(values.covers, "covers", rowNumber, errors);

      if (sales === null || laborCost === null || laborHours === null || covers === null) {
        return;
      }

      rows.push({
        date: values.date,
        businessId: values.businessId,
        locationId: values.locationId,
        sales,
        laborCost,
        laborHours,
        covers,
      });
    });
  }

  return { headers: base.headers, preview: base.preview, rows, errors };
};

export const parseExpenseCsv = (text: string): CsvImportResult<ExpenseImportRow> => {
  const base = parseCsvText(text);
  const missingHeaders = validateHeaders(base.headers, csvHeaderMap.expense);
  const errors = [...base.errors];

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  const rows: ExpenseImportRow[] = [];
  if (errors.length === 0) {
    base.records.forEach(({ rowNumber, values }) => {
      const amount = parseNumber(values.amount, "amount", rowNumber, errors);
      const recurring = parseBoolean(values.recurring, rowNumber, errors);

      if (amount === null || recurring === null) {
        return;
      }

      rows.push({
        occurredOn: values.occurredOn,
        businessId: values.businessId,
        locationId: values.locationId,
        categoryId: values.categoryId,
        vendorId: values.vendorId,
        title: values.title,
        amount,
        recurring,
      });
    });
  }

  return { headers: base.headers, preview: base.preview, rows, errors };
};

export const parseMarketingCsv = (text: string): CsvImportResult<MarketingImportRow> => {
  const base = parseCsvText(text);
  const missingHeaders = validateHeaders(base.headers, csvHeaderMap.marketing);
  const errors = [...base.errors];

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
  }

  const rows: MarketingImportRow[] = [];
  if (errors.length === 0) {
    base.records.forEach(({ rowNumber, values }) => {
      const spend = parseNumber(values.spend, "spend", rowNumber, errors);
      const attributedRevenue = parseNumber(values.attributedRevenue, "attributedRevenue", rowNumber, errors);
      const leads = parseNumber(values.leads, "leads", rowNumber, errors);
      const conversions = parseNumber(values.conversions, "conversions", rowNumber, errors);

      if (spend === null || attributedRevenue === null || leads === null || conversions === null) {
        return;
      }

      rows.push({
        startDate: values.startDate,
        endDate: values.endDate,
        businessId: values.businessId,
        locationId: values.locationId || undefined,
        channel: values.channel,
        campaignName: values.campaignName,
        spend,
        attributedRevenue,
        leads,
        conversions,
      });
    });
  }

  return { headers: base.headers, preview: base.preview, rows, errors };
};
