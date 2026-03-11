import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { KpiCard } from "../components/KpiCard";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAppContext } from "../context/AppContext";
import { shiftDate, getTodayLocalDate } from "../lib/date";
import { formatCurrency, formatPercent } from "../lib/format";

export const CateringPage = () => {
  const { data, effectiveScope, addCateringLead } = useAppContext();
  const today = getTodayLocalDate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{
    businessId: string;
    locationId: string;
    eventDate: string;
    client: string;
    guestCount: string;
    status: "lead" | "quoted" | "confirmed" | "completed";
    quotedValue: string;
    depositStatus: "none" | "pending" | "paid";
  }>({
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    eventDate: shiftDate(today, 14),
    client: "",
    guestCount: "",
    status: "lead",
    quotedValue: "",
    depositStatus: "none",
  });

  const leads = useMemo(
    () =>
      data.cateringLeads
        .filter(
          (lead) =>
            (effectiveScope.businessId === "all" || lead.businessId === effectiveScope.businessId) &&
            (effectiveScope.locationId === "all" || lead.locationId === effectiveScope.locationId),
        )
        .sort((left, right) => left.eventDate.localeCompare(right.eventDate)),
    [data.cateringLeads, effectiveScope.businessId, effectiveScope.locationId],
  );

  const confirmedCount = leads.filter((lead) => lead.status === "confirmed" || lead.status === "completed").length;
  const pendingQuotes = leads.filter((lead) => lead.status === "quoted").length;
  const closureRate = leads.length > 0 ? (confirmedCount / leads.length) * 100 : 0;
  const totalQuotedValue = leads.reduce((sum, lead) => sum + lead.quotedValue, 0);

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Catering & events"
        title="Manage large volume orders"
        description="Track local catering leads, upcoming events, and off-premise sales without turning this section into a full CRM yet."
      />

      <div className="kpi-grid">
        <KpiCard label="Upcoming events" value={String(leads.length)} trend={4.2} tone="sky" />
        <KpiCard label="Quoted pipeline" value={formatCurrency(totalQuotedValue)} trend={12.4} tone="emerald" />
        <KpiCard label="Lead closure rate" value={formatPercent(closureRate)} trend={-2.1} tone="amber" />
        <KpiCard label="Pending quotes" value={String(pendingQuotes)} trend={0} tone="rose" />
      </div>

      <FloatingActionMenu
        actions={[
          { label: "Add lead", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add catering lead"
        subtitle="Capture the essentials: event size, quoted value, and current status."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addCateringLead({
              businessId: form.businessId,
              locationId: form.locationId,
              eventDate: form.eventDate,
              client: form.client,
              guestCount: Number(form.guestCount),
              status: form.status,
              quotedValue: Number(form.quotedValue),
              depositStatus: form.depositStatus,
            });
            setForm((current) => ({
              ...current,
              eventDate: shiftDate(today, 14),
              client: "",
              guestCount: "",
              quotedValue: "",
            }));
            setIsModalOpen(false);
          }}
        >
          <label>
            <span>Business</span>
            <select
              value={form.businessId}
              onChange={(event) => {
                const businessId = event.target.value;
                const locationId =
                  data.locations.find((location) => location.businessId === businessId)?.id ??
                  data.locations[0].id;
                setForm((current) => ({ ...current, businessId, locationId }));
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
            <span>Event date</span>
            <input
              type="date"
              value={form.eventDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, eventDate: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Client</span>
            <input
              value={form.client}
              onChange={(event) =>
                setForm((current) => ({ ...current, client: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Guest count</span>
            <input
              type="number"
              value={form.guestCount}
              onChange={(event) =>
                setForm((current) => ({ ...current, guestCount: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as "lead" | "quoted" | "confirmed" | "completed",
                }))
              }
            >
              <option value="lead">Lead</option>
              <option value="quoted">Quoted</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label>
            <span>Quoted value</span>
            <input
              type="number"
              value={form.quotedValue}
              onChange={(event) =>
                setForm((current) => ({ ...current, quotedValue: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Deposit</span>
            <select
              value={form.depositStatus}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  depositStatus: event.target.value as "none" | "pending" | "paid",
                }))
              }
            >
              <option value="none">None</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </label>
          <button className="button-primary" type="submit">
            Save lead
          </button>
        </form>
      </ActionModal>

      <Panel title="Recent catering requests" subtitle="Status of off-premise and private events">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event date</th>
                <th>Client</th>
                <th>Guest count</th>
                <th>Status</th>
                <th>Deposit</th>
                <th>Estimated value</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.eventDate}</td>
                  <td>{lead.client}</td>
                  <td>{lead.guestCount}</td>
                  <td>{lead.status}</td>
                  <td>{lead.depositStatus}</td>
                  <td>{formatCurrency(lead.quotedValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
