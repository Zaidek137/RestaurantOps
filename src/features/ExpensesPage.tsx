import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { CsvImportModal } from "../components/CsvImportModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ExpenseDonutChart } from "../components/charts/ExpenseDonutChart";
import { useAppContext } from "../context/AppContext";
import { getTodayLocalDate } from "../lib/date";
import { formatCurrency } from "../lib/format";
import type { ExpenseImportRow } from "../lib/csv";
import {
  getExpenseBreakdown,
  getExpenseBudgetComparison,
  getExpenseFeed,
  getRecurringExpenseRunRate,
  getVendorPriceChangeSummary,
  getVendorSpend,
} from "../lib/metrics";

export const ExpensesPage = () => {
  const { data, effectiveScope, addExpense, addExpenseBudget, importExpenses } = useAppContext();
  const today = getTodayLocalDate();
  const expenseBreakdown = getExpenseBreakdown(data, effectiveScope);
  const vendorSpend = getVendorSpend(data, effectiveScope);
  const expenseFeed = getExpenseFeed(data, effectiveScope);
  const runRate = getRecurringExpenseRunRate(data, effectiveScope);
  const budgetComparison = getExpenseBudgetComparison(data, effectiveScope);
  const vendorPriceChanges = getVendorPriceChangeSummary(data, effectiveScope).slice(0, 4);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [recurringFilter, setRecurringFilter] = useState<"all" | "recurring" | "non_recurring">("all");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<"all" | "cogs" | "operating" | "labor">("all");

  const [form, setForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    categoryId: data.expenseCategories[0].id,
    vendorId: data.vendors[0].id,
    title: "",
    amount: "",
    occurredOn: today,
    recurring: false,
    notes: "",
  });

  const [budgetForm, setBudgetForm] = useState({
    businessId: effectiveScope.businessId,
    locationId: effectiveScope.locationId,
    categoryId: data.expenseCategories[0].id,
    amount: "",
  });

  const filteredFeed = useMemo(
    () =>
      expenseFeed.filter((entry) => {
        const category = data.expenseCategories.find((item) => item.id === entry.categoryId);

        if (recurringFilter === "recurring" && !entry.recurring) {
          return false;
        }
        if (recurringFilter === "non_recurring" && entry.recurring) {
          return false;
        }
        if (categoryTypeFilter !== "all" && category?.type !== categoryTypeFilter) {
          return false;
        }

        return true;
      }),
    [categoryTypeFilter, data.expenseCategories, expenseFeed, recurringFilter],
  );

  const totals = useMemo(() => {
    const totalSpend = filteredFeed.reduce((sum, entry) => sum + entry.amount, 0);
    const recurring = filteredFeed
      .filter((entry) => entry.recurring)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const cogs = filteredFeed
      .filter(
        (entry) =>
          data.expenseCategories.find((category) => category.id === entry.categoryId)?.type ===
          "cogs",
      )
      .reduce((sum, entry) => sum + entry.amount, 0);

    return { totalSpend, recurring, cogs };
  }, [data.expenseCategories, filteredFeed]);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Expense control"
        title="Track every restaurant expense"
        description="Capture one-off and recurring costs, compare spend to budget, watch vendor exposure, and import operational expenses in bulk."
      />

      <div className="kpi-grid">
        <KpiCard label="Filtered spend" value={formatCurrency(totals.totalSpend)} trend={5.1} tone="sky" />
        <KpiCard label="COGS spend" value={formatCurrency(totals.cogs)} trend={2.4} tone="amber" />
        <KpiCard label="Recurring run rate" value={formatCurrency(runRate.monthly)} trend={1.2} tone="rose" />
        <KpiCard label="Active vendors" value={String(vendorSpend.length)} trend={0.7} tone="emerald" />
      </div>

      <FloatingActionMenu
        actions={[
          { label: "Log expense", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsExpenseModalOpen(true) },
          { label: "Set budget", icon: <Icon name="trendUp" width={16} height={16} />, onClick: () => setIsBudgetModalOpen(true) },
          { label: "Import CSV", icon: <Icon name="upload" width={16} height={16} />, onClick: () => setIsImportModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Expense entry"
        subtitle="Manual entry workflow for invoices, rent, utilities, and operating costs."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addExpense({
              businessId: form.businessId,
              locationId: form.locationId,
              categoryId: form.categoryId,
              vendorId: form.vendorId,
              title: form.title,
              amount: Number(form.amount),
              occurredOn: form.occurredOn,
              recurring: form.recurring,
              notes: form.notes,
            });
            setForm((current) => ({
              ...current,
              title: "",
              amount: "",
              notes: "",
              occurredOn: today,
            }));
            setIsExpenseModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={form.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const nextLocation =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                setForm((current) => ({ ...current, businessId, locationId: nextLocation }));
              }}
            >
              {data.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Location</span>
            <select
              value={form.locationId}
              onChange={(event) =>
                setForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              {data.locations
                .filter((location) => location.businessId === form.businessId)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: event.target.value }))
              }
            >
              {data.expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Vendor</span>
            <select
              value={form.vendorId}
              onChange={(event) =>
                setForm((current) => ({ ...current, vendorId: event.target.value }))
              }
            >
              {data.vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-grid__full">
            <span>Title</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({ ...current, amount: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={form.occurredOn}
              onChange={(event) =>
                setForm((current) => ({ ...current, occurredOn: event.target.value }))
              }
              required
            />
          </label>
          <label className="form-grid__full">
            <span>Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
              rows={3}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(event) =>
                setForm((current) => ({ ...current, recurring: event.target.checked }))
              }
            />
            <span>Recurring expense</span>
          </label>
          <button className="button-primary" type="submit">
            Save expense
          </button>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Set category budget"
        subtitle="Define a monthly budget for the selected category and scope."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addExpenseBudget({
              businessId: budgetForm.businessId,
              locationId: budgetForm.locationId,
              categoryId: budgetForm.categoryId,
              amount: Number(budgetForm.amount),
            });
            setBudgetForm((current) => ({ ...current, amount: "" }));
            setIsBudgetModalOpen(false);
          }}
        >
          <label>
            <span>Business scope</span>
            <select
              value={budgetForm.businessId}
              onChange={(event) =>
                setBudgetForm((current) => ({ ...current, businessId: event.target.value }))
              }
            >
              <option value="all">All businesses</option>
              {data.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Location scope</span>
            <select
              value={budgetForm.locationId}
              onChange={(event) =>
                setBudgetForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              <option value="all">All locations</option>
              {data.locations
                .filter(
                  (location) =>
                    budgetForm.businessId === "all" || location.businessId === budgetForm.businessId,
                )
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select
              value={budgetForm.categoryId}
              onChange={(event) =>
                setBudgetForm((current) => ({ ...current, categoryId: event.target.value }))
              }
            >
              {data.expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Monthly budget</span>
            <input
              type="number"
              value={budgetForm.amount}
              onChange={(event) =>
                setBudgetForm((current) => ({ ...current, amount: event.target.value }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Save budget
          </button>
        </form>
      </ActionModal>

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        kind="expense"
        onImport={(rows) => importExpenses(rows as ExpenseImportRow[])}
      />

      <div className="toolbar-row">
        <label>
          <span>Recurring filter</span>
          <select
            value={recurringFilter}
            onChange={(event) =>
              setRecurringFilter(event.target.value as "all" | "recurring" | "non_recurring")
            }
          >
            <option value="all">All expenses</option>
            <option value="recurring">Recurring only</option>
            <option value="non_recurring">Non-recurring only</option>
          </select>
        </label>
        <label>
          <span>Category type</span>
          <select
            value={categoryTypeFilter}
            onChange={(event) =>
              setCategoryTypeFilter(event.target.value as "all" | "cogs" | "operating" | "labor")
            }
          >
            <option value="all">All types</option>
            <option value="operating">Operating</option>
            <option value="cogs">COGS</option>
            <option value="labor">Labor</option>
          </select>
        </label>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
        <ExpenseDonutChart
          title="Category mix"
          subtitle="How your spend is distributed"
          data={expenseBreakdown}
        />
        <ExpenseDonutChart
          title="Vendor concentration"
          subtitle="Top spend exposure by vendor"
          data={vendorSpend}
        />
      </div>

      <div className="content-grid">
        <Panel title="Budget vs actual" subtitle="Monthly budget alignment by category">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Actual</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {budgetComparison.map((row) => (
                  <tr key={row.categoryId}>
                    <td>{row.categoryName}</td>
                    <td>{formatCurrency(row.budget)}</td>
                    <td>{formatCurrency(row.actual)}</td>
                    <td>{formatCurrency(row.variance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Recurring and vendor watch" subtitle="Protect fixed cost discipline">
          <div className="metric-stack">
            <div>
              <span>Monthly recurring run rate</span>
              <strong>{formatCurrency(runRate.monthly)}</strong>
            </div>
            <div>
              <span>Annualized run rate</span>
              <strong>{formatCurrency(runRate.yearly)}</strong>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Vendor</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {vendorPriceChanges.map((change) => (
                  <tr key={change.ingredientId}>
                    <td>{change.ingredientName}</td>
                    <td>{change.vendorName}</td>
                    <td>{change.changePercent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
        <Panel title="Expense ledger" subtitle="Most recent recorded expenses in scope">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Recurring</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeed.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.occurredOn}</td>
                    <td>{expense.title}</td>
                    <td>{data.vendors.find((vendor) => vendor.id === expense.vendorId)?.name ?? "Unknown"}</td>
                    <td>{data.expenseCategories.find((category) => category.id === expense.categoryId)?.name ?? "Unknown"}</td>
                    <td>{expense.recurring ? "Yes" : "No"}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
};
