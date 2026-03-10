import { useMemo, useState } from "react";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ExpenseDonutChart } from "../components/charts/ExpenseDonutChart";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../lib/format";
import { getExpenseBreakdown, getExpenseFeed, getVendorSpend } from "../lib/metrics";

export const ExpensesPage = () => {
  const { data, effectiveScope, addExpense } = useAppContext();
  const expenseBreakdown = getExpenseBreakdown(data, effectiveScope);
  const vendorSpend = getVendorSpend(data, effectiveScope);
  const expenseFeed = getExpenseFeed(data, effectiveScope);

  const [form, setForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    categoryId: data.expenseCategories[0].id,
    vendorId: data.vendors[0].id,
    title: "",
    amount: "",
    occurredOn: "2026-03-09",
    recurring: false,
    notes: "",
  });

  const totals = useMemo(() => {
    const totalSpend = expenseFeed.reduce((sum, entry) => sum + entry.amount, 0);
    const recurring = expenseFeed.filter((entry) => entry.recurring).reduce((sum, entry) => sum + entry.amount, 0);
    const cogs = expenseFeed
      .filter((entry) => data.expenseCategories.find((category) => category.id === entry.categoryId)?.type === "cogs")
      .reduce((sum, entry) => sum + entry.amount, 0);

    return { totalSpend, recurring, cogs };
  }, [data.expenseCategories, expenseFeed]);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Expense control"
        title="Track every restaurant expense"
        description="Capture one-off and recurring costs, monitor vendor concentration, and compare expense mix across businesses and locations."
      />

      <div className="kpi-grid">
        <KpiCard label="Total spend" value={formatCurrency(totals.totalSpend)} trend={5.1} tone="sky" />
        <KpiCard label="COGS spend" value={formatCurrency(totals.cogs)} trend={2.4} tone="amber" />
        <KpiCard label="Recurring run rate" value={formatCurrency(totals.recurring)} trend={1.2} tone="rose" />
        <KpiCard label="Active vendors" value={String(vendorSpend.length)} trend={0.7} tone="emerald" />
      </div>

      <div className="content-grid content-grid--hero">
        <Panel title="Log a new expense" subtitle="Manual entry workflow for invoices, rent, utilities, and operating costs">
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
              setForm((current) => ({ ...current, title: "", amount: "", notes: "" }));
            }}
          >
            <label>
              <span>Business</span>
              <select
                value={form.businessId}
                onChange={(event) => {
                  const businessId = event.target.value;
                  const nextLocation = data.locations.find((location) => location.businessId === businessId)?.id ?? data.locations[0].id;
                  setForm({ ...form, businessId, locationId: nextLocation });
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
              <select value={form.locationId} onChange={(event) => setForm({ ...form, locationId: event.target.value })}>
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
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                {data.expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Vendor</span>
              <select value={form.vendorId} onChange={(event) => setForm({ ...form, vendorId: event.target.value })}>
                {data.vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-grid__full">
              <span>Title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            </label>
            <label>
              <span>Amount</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={form.occurredOn} onChange={(event) => setForm({ ...form, occurredOn: event.target.value })} required />
            </label>
            <label className="form-grid__full">
              <span>Notes</span>
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} />
              <span>Recurring expense</span>
            </label>
            <button className="button-primary" type="submit">Save expense</button>
          </form>
        </Panel>
        <ExpenseDonutChart title="Category mix" subtitle="How your spend is distributed" data={expenseBreakdown} />
      </div>

      <div className="content-grid">
        <ExpenseDonutChart title="Vendor concentration" subtitle="Top spend exposure by vendor" data={vendorSpend} />
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
                {expenseFeed.map((expense) => (
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
