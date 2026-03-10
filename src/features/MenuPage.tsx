import { useMemo, useState } from "react";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAppContext } from "../context/AppContext";
import { formatCurrency } from "../lib/format";
import { getMenuPerformance } from "../lib/metrics";

export const MenuPage = () => {
  const { data, effectiveScope, addMenuItem } = useAppContext();
  const performance = getMenuPerformance(data, effectiveScope);
  const [componentRows, setComponentRows] = useState([{ ingredientId: data.ingredients[0].id, quantity: "" }]);
  const [form, setForm] = useState<{
    businessId: string;
    categoryId: string;
    name: string;
    price: string;
    availability: "active" | "seasonal" | "paused";
    popularity: string;
  }>({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    categoryId: data.menuCategories[0].id,
    name: "",
    price: "",
    availability: "active",
    popularity: "80",
  });

  const menuSummary = useMemo(() => {
    const totalMargin = performance.reduce((sum, item) => sum + item.margin, 0);
    const averageMargin = performance.length > 0 ? totalMargin / performance.length : 0;
    const topItem = performance[0];

    return {
      averageMargin,
      topItem,
      activeCount: data.menuItems.filter((item) => item.availability === "active").length,
    };
  }, [data.menuItems, performance]);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Menu engineering"
        title="Build and cost menu items"
        description="Create menu items, connect recipe components to live ingredient costs, and monitor contribution margin by concept or location."
      />

      <div className="kpi-grid">
        <KpiCard label="Average margin" value={formatCurrency(menuSummary.averageMargin)} trend={3.4} tone="emerald" />
        <KpiCard label="Top contributor" value={menuSummary.topItem ? menuSummary.topItem.name : "N/A"} trend={1.9} tone="sky" />
        <KpiCard label="Best margin" value={menuSummary.topItem ? formatCurrency(menuSummary.topItem.margin) : "$0"} trend={4.1} tone="amber" />
        <KpiCard label="Active items" value={String(menuSummary.activeCount)} trend={2.3} tone="rose" />
      </div>

      <div className="content-grid content-grid--hero">
        <Panel title="Create menu item" subtitle="Manual entry workflow with recipe components and pricing">
          <form
            className="form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              addMenuItem({
                businessId: form.businessId,
                categoryId: form.categoryId,
                name: form.name,
                price: Number(form.price),
                availability: form.availability,
                popularity: Number(form.popularity),
                components: componentRows
                  .filter((component) => component.quantity)
                  .map((component) => ({
                    ingredientId: component.ingredientId,
                    quantity: Number(component.quantity),
                  })),
              });

              setForm((current) => ({ ...current, name: "", price: "" }));
              setComponentRows([{ ingredientId: data.ingredients[0].id, quantity: "" }]);
            }}
          >
            <label>
              <span>Business</span>
              <select
                value={form.businessId}
                onChange={(event) => {
                  const businessId = event.target.value;
                  const categoryId = data.menuCategories.find((category) => category.businessId === businessId)?.id ?? data.menuCategories[0].id;
                  const ingredientId = data.ingredients.find((ingredient) => ingredient.businessId === businessId)?.id ?? data.ingredients[0].id;
                  setForm({ ...form, businessId, categoryId });
                  setComponentRows([{ ingredientId, quantity: "" }]);
                }}
              >
                {data.businesses.map((business) => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Category</span>
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
                {data.menuCategories.filter((category) => category.businessId === form.businessId).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Item name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              <span>Price</span>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            </label>
            <label>
              <span>Availability</span>
              <select value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value as "active" | "seasonal" | "paused" })}>
                <option value="active">Active</option>
                <option value="seasonal">Seasonal</option>
                <option value="paused">Paused</option>
              </select>
            </label>
            <label>
              <span>Popularity score</span>
              <input type="number" min="1" max="100" value={form.popularity} onChange={(event) => setForm({ ...form, popularity: event.target.value })} required />
            </label>

            <div className="form-grid__full form-grid__stacked">
              <div className="inline-head">
                <span>Recipe components</span>
                <button className="button-secondary" type="button" onClick={() => setComponentRows((current) => [...current, { ingredientId: componentRows[0].ingredientId, quantity: "" }])}>
                  Add ingredient
                </button>
              </div>
              {componentRows.map((component, index) => (
                <div className="inline-row" key={`${component.ingredientId}-${index}`}>
                  <select
                    value={component.ingredientId}
                    onChange={(event) =>
                      setComponentRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, ingredientId: event.target.value } : row,
                        ),
                      )
                    }
                  >
                    {data.ingredients.filter((ingredient) => ingredient.businessId === form.businessId).map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Qty"
                    value={component.quantity}
                    onChange={(event) =>
                      setComponentRows((current) =>
                        current.map((row, rowIndex) =>
                          rowIndex === index ? { ...row, quantity: event.target.value } : row,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
            <button className="button-primary" type="submit">Save menu item</button>
          </form>
        </Panel>

        <Panel title="Menu contribution matrix" subtitle="Current recipe costs and contribution margin">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Recipe cost</th>
                  <th>Margin</th>
                  <th>Popularity</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.recipeCost)}</td>
                    <td>{formatCurrency(item.margin)}</td>
                    <td>{item.popularity}</td>
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
