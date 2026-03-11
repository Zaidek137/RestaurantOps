import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAppContext } from "../context/AppContext";
import { formatCurrency, formatPercent } from "../lib/format";
import { getMenuEngineeringMatrix } from "../lib/metrics";

export const MenuPage = () => {
  const { data, effectiveScope, addMenuItem } = useAppContext();
  const engineeringMatrix = getMenuEngineeringMatrix(data, effectiveScope);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "active" | "seasonal" | "paused">("all");
  const [businessFilter, setBusinessFilter] = useState(
    effectiveScope.businessId === "all" ? "all" : effectiveScope.businessId,
  );
  const [componentRows, setComponentRows] = useState([
    { ingredientId: data.ingredients[0].id, quantity: "" },
  ]);
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

  const filteredMatrix = useMemo(
    () =>
      engineeringMatrix.filter((item) => {
        const menuItem = data.menuItems.find((entry) => entry.id === item.id);
        if (!menuItem) {
          return false;
        }

        if (availabilityFilter !== "all" && menuItem.availability !== availabilityFilter) {
          return false;
        }

        if (businessFilter !== "all" && menuItem.businessId !== businessFilter) {
          return false;
        }

        return true;
      }),
    [availabilityFilter, businessFilter, data.menuItems, engineeringMatrix],
  );

  const menuSummary = useMemo(() => {
    const totalMargin = filteredMatrix.reduce((sum, item) => sum + item.margin, 0);
    const averageMargin = filteredMatrix.length > 0 ? totalMargin / filteredMatrix.length : 0;
    const topItem = filteredMatrix[0];
    const mostVolatile = filteredMatrix.find((item) => item.volatilityRisk === "high");

    return {
      averageMargin,
      topItem,
      activeCount: filteredMatrix.length,
      mostVolatile,
    };
  }, [filteredMatrix]);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Menu engineering"
        title="Build and cost menu items"
        description="Create menu items, connect recipe components to live ingredient costs, classify items by margin and popularity, and surface price adjustments before growth stalls."
      />

      <div className="kpi-grid">
        <KpiCard label="Average margin" value={formatCurrency(menuSummary.averageMargin)} trend={3.4} tone="emerald" />
        <KpiCard label="Top contributor" value={menuSummary.topItem ? menuSummary.topItem.name : "N/A"} trend={1.9} tone="sky" />
        <KpiCard label="Best margin" value={menuSummary.topItem ? formatCurrency(menuSummary.topItem.margin) : "$0"} trend={4.1} tone="amber" />
        <KpiCard label="Volatility watch" value={menuSummary.mostVolatile ? menuSummary.mostVolatile.name : "Stable"} trend={2.3} tone="rose" />
      </div>

      <FloatingActionMenu
        actions={[
          { label: "Create item", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create menu item"
        subtitle="Manual entry workflow with recipe components and pricing."
      >
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
            setIsModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={form.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const categoryId =
                  data.menuCategories.find((category) => category.businessId === businessId)?.id ??
                  data.menuCategories[0].id;
                const ingredientId =
                  data.ingredients.find((ingredient) => ingredient.businessId === businessId)?.id ??
                  data.ingredients[0].id;
                setForm((current) => ({ ...current, businessId, categoryId }));
                setComponentRows([{ ingredientId, quantity: "" }]);
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
            <span>Category</span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((current) => ({ ...current, categoryId: event.target.value }))
              }
            >
              {data.menuCategories
                .filter((category) => category.businessId === form.businessId)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Item name</span>
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Availability</span>
            <select
              value={form.availability}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availability: event.target.value as "active" | "seasonal" | "paused",
                }))
              }
            >
              <option value="active">Active</option>
              <option value="seasonal">Seasonal</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <label>
            <span>Popularity score</span>
            <input
              type="number"
              min="1"
              max="100"
              value={form.popularity}
              onChange={(event) =>
                setForm((current) => ({ ...current, popularity: event.target.value }))
              }
              required
            />
          </label>

          <div className="form-grid__full form-grid__stacked">
            <div className="inline-head">
              <span>Recipe components</span>
              <button
                className="button-secondary"
                type="button"
                onClick={() =>
                  setComponentRows((current) => [
                    ...current,
                    { ingredientId: current[0].ingredientId, quantity: "" },
                  ])
                }
              >
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
                  {data.ingredients
                    .filter((ingredient) => ingredient.businessId === form.businessId)
                    .map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
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
          <button className="button-primary" type="submit">
            Save menu item
          </button>
        </form>
      </ActionModal>

      <div className="toolbar-row">
        <label>
          <span>Business</span>
          <select value={businessFilter} onChange={(event) => setBusinessFilter(event.target.value)}>
            <option value="all">All businesses</option>
            {data.businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Availability</span>
          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(
                event.target.value as "all" | "active" | "seasonal" | "paused",
              )
            }
          >
            <option value="all">All items</option>
            <option value="active">Active</option>
            <option value="seasonal">Seasonal</option>
            <option value="paused">Paused</option>
          </select>
        </label>
      </div>

      <div className="content-grid">
        <Panel title="Menu quadrant mix" subtitle="Popularity and margin classification">
          <div className="quadrant-grid">
            {["star", "plowhorse", "puzzle", "dog"].map((quadrant) => (
              <article key={quadrant} className="quadrant-card">
                <strong>{quadrant}</strong>
                <p>
                  {
                    filteredMatrix.filter((item) => item.quadrant === quadrant).length
                  }{" "}
                  items
                </p>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Price guidance" subtitle="Target vs actual food cost">
          <div className="metric-stack">
            {filteredMatrix.slice(0, 4).map((item) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <strong>
                  {formatPercent(item.actualFoodCostPercent)} vs target{" "}
                  {formatPercent(item.targetFoodCostPercent)}
                </strong>
                <p>Suggested price: {formatCurrency(item.suggestedPrice)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
        <Panel title="Menu engineering matrix" subtitle="Contribution margin, cost discipline, and volatility in one view">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quadrant</th>
                  <th>Price</th>
                  <th>Recipe cost</th>
                  <th>Margin</th>
                  <th>Actual food cost</th>
                  <th>Target food cost</th>
                  <th>Suggested price</th>
                  <th>Volatility</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatrix.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quadrant}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.recipeCost)}</td>
                    <td>{formatCurrency(item.margin)}</td>
                    <td>{formatPercent(item.actualFoodCostPercent)}</td>
                    <td>{formatPercent(item.targetFoodCostPercent)}</td>
                    <td>{formatCurrency(item.suggestedPrice)}</td>
                    <td>{item.volatilityRisk}</td>
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
