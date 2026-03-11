import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ExpenseDonutChart } from "../components/charts/ExpenseDonutChart";
import { useAppContext } from "../context/AppContext";
import { getTodayLocalDate } from "../lib/date";
import { formatCurrency } from "../lib/format";
import {
  getIngredientUnitCost,
  getInventorySnapshot,
  getRecentCounts,
  getReorderSuggestions,
  getVendorPriceChangeSummary,
} from "../lib/metrics";

export const InventoryPage = () => {
  const {
    data,
    effectiveScope,
    addIngredient,
    addInventoryCount,
    addWasteEntry,
    createPurchaseOrderDraft,
  } = useAppContext();
  const today = getTodayLocalDate();
  const snapshot = getInventorySnapshot(data, effectiveScope);
  const recentCounts = getRecentCounts(data, effectiveScope);
  const reorderSuggestions = getReorderSuggestions(data, effectiveScope);
  const priceChanges = getVendorPriceChangeSummary(data, effectiveScope).slice(0, 6);

  const ingredientRows = useMemo(
    () =>
      data.ingredients
        .filter(
          (ingredient) =>
            effectiveScope.businessId === "all" || ingredient.businessId === effectiveScope.businessId,
        )
        .map((ingredient) => ({
          ...ingredient,
          unitCost: getIngredientUnitCost(
            data,
            ingredient.id,
            effectiveScope.locationId === "all" ? undefined : effectiveScope.locationId,
          ),
        })),
    [data, effectiveScope.businessId, effectiveScope.locationId],
  );

  const wasteBreakdown = useMemo(
    () =>
      snapshot.wasteEntries.map((entry) => ({
        label: data.ingredients.find((ingredient) => ingredient.id === entry.ingredientId)?.name ?? entry.ingredientId,
        value: entry.cost,
      })),
    [data.ingredients, snapshot.wasteEntries],
  );

  const [ingredientForm, setIngredientForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    name: "",
    baseUnit: "oz",
    packUnit: "case",
    unitsPerPack: "",
    yieldPercent: "0.95",
    parLevel: "",
    vendorId: data.vendors[0].id,
    pricePerPack: "",
  });

  const [countForm, setCountForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    ingredientId: data.ingredients[0].id,
    countedUnits: "",
    varianceUnits: "",
    countedOn: today,
  });

  const [wasteForm, setWasteForm] = useState({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    ingredientId: data.ingredients[0].id,
    quantity: "",
    reason: "",
    cost: "",
    recordedOn: today,
  });

  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isCountModalOpen, setIsCountModalOpen] = useState(false);
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Inventory and ingredients"
        title="Control ingredient costs and stock risk"
        description="Maintain ingredient masters, monitor count variance, record waste, review vendor price movement, and create forecast-aware reorder drafts."
      />

      <div className="kpi-grid">
        <KpiCard label="Inventory value" value={formatCurrency(snapshot.inventoryValue)} trend={3.9} tone="sky" />
        <KpiCard label="Waste cost" value={formatCurrency(snapshot.wasteCost)} trend={-2.2} tone="rose" />
        <KpiCard label="Variance units" value={snapshot.totalVariance.toFixed(0)} trend={1.1} tone="amber" />
        <KpiCard label="Reorder alerts" value={String(reorderSuggestions.length)} trend={4.3} tone="emerald" />
      </div>

      <FloatingActionMenu
        actions={[
          { label: "Create ingredient", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsIngredientModalOpen(true) },
          { label: "Record count", icon: <Icon name="check" width={16} height={16} />, onClick: () => setIsCountModalOpen(true) },
          { label: "Log waste", icon: <Icon name="warning" width={16} height={16} />, onClick: () => setIsWasteModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isIngredientModalOpen}
        onClose={() => setIsIngredientModalOpen(false)}
        title="Add ingredient"
        subtitle="Create new ingredients with immediate vendor cost context."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addIngredient({
              businessId: ingredientForm.businessId,
              name: ingredientForm.name,
              baseUnit: ingredientForm.baseUnit,
              packUnit: ingredientForm.packUnit,
              unitsPerPack: Number(ingredientForm.unitsPerPack),
              yieldPercent: Number(ingredientForm.yieldPercent),
              parLevel: Number(ingredientForm.parLevel),
              vendorId: ingredientForm.vendorId,
              pricePerPack: Number(ingredientForm.pricePerPack),
            });
            setIngredientForm((current) => ({
              ...current,
              name: "",
              unitsPerPack: "",
              parLevel: "",
              pricePerPack: "",
            }));
            setIsIngredientModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={ingredientForm.businessId}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, businessId: event.target.value }))
              }
            >
              {data.businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Name</span>
            <input
              value={ingredientForm.name}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Base unit</span>
            <input
              value={ingredientForm.baseUnit}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, baseUnit: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Pack unit</span>
            <input
              value={ingredientForm.packUnit}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, packUnit: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Units per pack</span>
            <input
              type="number"
              min="1"
              value={ingredientForm.unitsPerPack}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, unitsPerPack: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Yield %</span>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={ingredientForm.yieldPercent}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, yieldPercent: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Par level</span>
            <input
              type="number"
              min="0"
              value={ingredientForm.parLevel}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, parLevel: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Vendor</span>
            <select
              value={ingredientForm.vendorId}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, vendorId: event.target.value }))
              }
            >
              {data.vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Price per pack</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={ingredientForm.pricePerPack}
              onChange={(event) =>
                setIngredientForm((current) => ({ ...current, pricePerPack: event.target.value }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Create ingredient
          </button>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isCountModalOpen}
        onClose={() => setIsCountModalOpen(false)}
        title="Record inventory count"
        subtitle="Capture a fresh physical count and variance."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addInventoryCount({
              businessId: countForm.businessId,
              locationId: countForm.locationId,
              ingredientId: countForm.ingredientId,
              countedUnits: Number(countForm.countedUnits),
              varianceUnits: Number(countForm.varianceUnits),
              countedOn: countForm.countedOn,
            });
            setCountForm((current) => ({
              ...current,
              countedUnits: "",
              varianceUnits: "",
              countedOn: today,
            }));
            setIsCountModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={countForm.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const nextLocation =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                const nextIngredient =
                  data.ingredients.find((ingredient) => ingredient.businessId === businessId)?.id ??
                  data.ingredients[0].id;
                setCountForm((current) => ({
                  ...current,
                  businessId,
                  locationId: nextLocation,
                  ingredientId: nextIngredient,
                }));
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
              value={countForm.locationId}
              onChange={(event) =>
                setCountForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              {data.locations
                .filter((location) => location.businessId === countForm.businessId)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Ingredient</span>
            <select
              value={countForm.ingredientId}
              onChange={(event) =>
                setCountForm((current) => ({ ...current, ingredientId: event.target.value }))
              }
            >
              {data.ingredients
                .filter((ingredient) => ingredient.businessId === countForm.businessId)
                .map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Counted units</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={countForm.countedUnits}
              onChange={(event) =>
                setCountForm((current) => ({ ...current, countedUnits: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Variance</span>
            <input
              type="number"
              step="0.01"
              value={countForm.varianceUnits}
              onChange={(event) =>
                setCountForm((current) => ({ ...current, varianceUnits: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Counted on</span>
            <input
              type="date"
              value={countForm.countedOn}
              onChange={(event) =>
                setCountForm((current) => ({ ...current, countedOn: event.target.value }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Record count
          </button>
        </form>
      </ActionModal>

      <ActionModal
        isOpen={isWasteModalOpen}
        onClose={() => setIsWasteModalOpen(false)}
        title="Record waste"
        subtitle="Track margin leakage from spoilage, trim loss, and over-production."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addWasteEntry({
              businessId: wasteForm.businessId,
              locationId: wasteForm.locationId,
              ingredientId: wasteForm.ingredientId,
              quantity: Number(wasteForm.quantity),
              reason: wasteForm.reason,
              cost: Number(wasteForm.cost),
              recordedOn: wasteForm.recordedOn,
            });
            setWasteForm((current) => ({
              ...current,
              quantity: "",
              reason: "",
              cost: "",
              recordedOn: today,
            }));
            setIsWasteModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={wasteForm.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const nextLocation =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                const nextIngredient =
                  data.ingredients.find((ingredient) => ingredient.businessId === businessId)?.id ??
                  data.ingredients[0].id;
                setWasteForm((current) => ({
                  ...current,
                  businessId,
                  locationId: nextLocation,
                  ingredientId: nextIngredient,
                }));
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
              value={wasteForm.locationId}
              onChange={(event) =>
                setWasteForm((current) => ({ ...current, locationId: event.target.value }))
              }
            >
              {data.locations
                .filter((location) => location.businessId === wasteForm.businessId)
                .map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Ingredient</span>
            <select
              value={wasteForm.ingredientId}
              onChange={(event) =>
                setWasteForm((current) => ({ ...current, ingredientId: event.target.value }))
              }
            >
              {data.ingredients
                .filter((ingredient) => ingredient.businessId === wasteForm.businessId)
                .map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            <span>Quantity</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteForm.quantity}
              onChange={(event) =>
                setWasteForm((current) => ({ ...current, quantity: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Cost</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={wasteForm.cost}
              onChange={(event) =>
                setWasteForm((current) => ({ ...current, cost: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Reason</span>
            <input
              value={wasteForm.reason}
              onChange={(event) =>
                setWasteForm((current) => ({ ...current, reason: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              value={wasteForm.recordedOn}
              onChange={(event) =>
                setWasteForm((current) => ({ ...current, recordedOn: event.target.value }))
              }
              required
            />
          </label>
          <button className="button-primary" type="submit">
            Save waste
          </button>
        </form>
      </ActionModal>

      <div className="content-grid content-grid--hero">
        <ExpenseDonutChart
          title="Waste by ingredient"
          subtitle="Most expensive loss points"
          data={wasteBreakdown}
        />
        <Panel title="Reorder suggestions" subtitle="Forecast-aware reorder opportunities">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Location</th>
                  <th>Shortage</th>
                  <th>Est. cost</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {reorderSuggestions.slice(0, 8).map((suggestion) => (
                  <tr key={`${suggestion.locationId}-${suggestion.ingredientId}`}>
                    <td>{suggestion.ingredientName}</td>
                    <td>{suggestion.locationName}</td>
                    <td>{suggestion.shortageUnits.toFixed(0)}</td>
                    <td>{formatCurrency(suggestion.estimatedCost)}</td>
                    <td>
                      <button
                        type="button"
                        className="button-secondary button-small"
                        onClick={() =>
                          createPurchaseOrderDraft({
                            businessId: data.locations.find((location) => location.id === suggestion.locationId)?.businessId ?? data.businesses[0].id,
                            locationId: suggestion.locationId,
                            vendorId: suggestion.vendorId,
                            items: [
                              {
                                ingredientId: suggestion.ingredientId,
                                suggestedUnits: suggestion.shortageUnits,
                                unitCost: suggestion.unitCost,
                                totalCost: suggestion.estimatedCost,
                              },
                            ],
                          })
                        }
                      >
                        Draft PO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="content-grid">
        <Panel title="Recent counts" subtitle="Latest physical counts with variance severity">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Ingredient</th>
                  <th>Units</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {recentCounts.map((count) => {
                  const severityClass =
                    Math.abs(count.varianceUnits) > 10
                      ? "severity-high"
                      : Math.abs(count.varianceUnits) > 4
                        ? "severity-medium"
                        : "severity-low";

                  return (
                    <tr key={count.id}>
                      <td>{count.countedOn}</td>
                      <td>{data.locations.find((location) => location.id === count.locationId)?.name ?? count.locationId}</td>
                      <td>{data.ingredients.find((ingredient) => ingredient.id === count.ingredientId)?.name ?? count.ingredientId}</td>
                      <td>{count.countedUnits}</td>
                      <td>
                        <span className={`severity-pill ${severityClass}`}>
                          {count.varianceUnits}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Vendor price movement" subtitle="Recent ingredient cost changes">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Vendor</th>
                  <th>Latest pack</th>
                  <th>Previous pack</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {priceChanges.map((change) => (
                  <tr key={change.ingredientId}>
                    <td>{change.ingredientName}</td>
                    <td>{change.vendorName}</td>
                    <td>{formatCurrency(change.latestPricePerPack)}</td>
                    <td>{formatCurrency(change.previousPricePerPack)}</td>
                    <td>{change.changePercent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
        <Panel title="Ingredient cost sheet" subtitle="Latest unit costs and par guidance">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ingredient</th>
                  <th>Base unit</th>
                  <th>Unit cost</th>
                  <th>Par level</th>
                </tr>
              </thead>
              <tbody>
                {ingredientRows.map((ingredient) => (
                  <tr key={ingredient.id}>
                    <td>{ingredient.name}</td>
                    <td>{ingredient.baseUnit}</td>
                    <td>{formatCurrency(ingredient.unitCost)}</td>
                    <td>{ingredient.parLevel}</td>
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
