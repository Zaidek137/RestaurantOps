import { useMemo, useState } from "react";
import { ActionModal } from "../components/ActionModal";
import { FloatingActionMenu } from "../components/FloatingActionMenu";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { useAppContext } from "../context/AppContext";
import { shiftDate, getTodayLocalDate } from "../lib/date";

export const ReportsPage = () => {
  const { data, effectiveScope, addManagerReport } = useAppContext();
  const today = getTodayLocalDate();
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<{
    interval: "daily" | "weekly" | "monthly";
    businessId: string;
    locationId: string;
    startDate: string;
    endDate: string;
    authorLabel: string;
    summary: string;
    wins: string;
    issues: string;
    followUps: string;
    flags: string;
  }>({
    interval: "daily",
    businessId: effectiveScope.businessId === "all" ? data.businesses[0].id : effectiveScope.businessId,
    locationId: effectiveScope.locationId === "all" ? data.locations[0].id : effectiveScope.locationId,
    startDate: today,
    endDate: today,
    authorLabel: "",
    summary: "",
    wins: "",
    issues: "",
    followUps: "",
    flags: "",
  });

  const reports = useMemo(
    () =>
      data.managerReports
        .filter((report) => report.interval === reportType)
        .filter(
          (report) =>
            (effectiveScope.businessId === "all" || report.businessId === effectiveScope.businessId) &&
            (effectiveScope.locationId === "all" || report.locationId === effectiveScope.locationId),
        )
        .sort((left, right) => right.endDate.localeCompare(left.endDate)),
    [data.managerReports, effectiveScope.businessId, effectiveScope.locationId, reportType],
  );

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Manager reports"
        title="Shift and period documentation"
        description="Review and submit daily, weekly, and monthly text reports that keep operational wins, issues, and follow-ups visible."
      />

      <FloatingActionMenu
        actions={[
          { label: "Submit report", icon: <Icon name="plus" width={16} height={16} />, onClick: () => setIsModalOpen(true) },
        ]}
      />

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit manager report"
        subtitle="Capture wins, issues, and next steps for the selected period."
      >
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            addManagerReport({
              interval: form.interval,
              businessId: form.businessId,
              locationId: form.locationId,
              startDate: form.startDate,
              endDate: form.endDate,
              authorLabel: form.authorLabel,
              summary: form.summary,
              wins: form.wins,
              issues: form.issues,
              followUps: form.followUps,
              flags: form.flags
                .split(",")
                .map((flag) => flag.trim())
                .filter(Boolean),
            });
            setForm((current) => ({
              ...current,
              authorLabel: "",
              summary: "",
              wins: "",
              issues: "",
              followUps: "",
              flags: "",
            }));
            setIsModalOpen(false);
          }}
        >
          <label>
            <span>Interval</span>
            <select
              value={form.interval}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  interval: event.target.value as "daily" | "weekly" | "monthly",
                  endDate:
                    event.target.value === "daily"
                      ? current.startDate
                      : event.target.value === "weekly"
                        ? shiftDate(current.startDate, 6)
                        : shiftDate(current.startDate, 29),
                }))
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
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
            <span>Start date</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, startDate: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>End date</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, endDate: event.target.value }))
              }
              required
            />
          </label>
          <label>
            <span>Author label</span>
            <input
              value={form.authorLabel}
              onChange={(event) =>
                setForm((current) => ({ ...current, authorLabel: event.target.value }))
              }
              required
            />
          </label>
          <label className="form-grid__full">
            <span>Summary</span>
            <textarea
              value={form.summary}
              onChange={(event) =>
                setForm((current) => ({ ...current, summary: event.target.value }))
              }
              rows={3}
              required
            />
          </label>
          <label className="form-grid__full">
            <span>Wins</span>
            <textarea
              value={form.wins}
              onChange={(event) =>
                setForm((current) => ({ ...current, wins: event.target.value }))
              }
              rows={3}
              required
            />
          </label>
          <label className="form-grid__full">
            <span>Issues</span>
            <textarea
              value={form.issues}
              onChange={(event) =>
                setForm((current) => ({ ...current, issues: event.target.value }))
              }
              rows={3}
              required
            />
          </label>
          <label className="form-grid__full">
            <span>Follow-ups</span>
            <textarea
              value={form.followUps}
              onChange={(event) =>
                setForm((current) => ({ ...current, followUps: event.target.value }))
              }
              rows={3}
              required
            />
          </label>
          <label className="form-grid__full">
            <span>Flags (comma separated)</span>
            <input
              value={form.flags}
              onChange={(event) =>
                setForm((current) => ({ ...current, flags: event.target.value }))
              }
              placeholder="inventory, labor, marketing"
            />
          </label>
          <button className="button-primary" type="submit">
            Save report
          </button>
        </form>
      </ActionModal>

      <div className="toolbar-row">
        <label>
          <span>Report interval</span>
          <select
            value={reportType}
            onChange={(event) =>
              setReportType(event.target.value as "daily" | "weekly" | "monthly")
            }
          >
            <option value="daily">Daily shift logs</option>
            <option value="weekly">Weekly summaries</option>
            <option value="monthly">Monthly period reviews</option>
          </select>
        </label>
      </div>

      <Panel title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} reports`} subtitle="Recent text submissions in the current scope">
        <div className="report-list">
          {reports.map((report) => (
            <article key={report.id} className="report-card">
              <div className="report-card__header">
                <strong>{report.authorLabel}</strong>
                <span>
                  {report.startDate} to {report.endDate}
                </span>
              </div>
              <p>{report.summary}</p>
              <div className="report-card__details">
                <div>
                  <span>Wins</span>
                  <p>{report.wins}</p>
                </div>
                <div>
                  <span>Issues</span>
                  <p>{report.issues}</p>
                </div>
                <div>
                  <span>Follow-ups</span>
                  <p>{report.followUps}</p>
                </div>
              </div>
              {report.flags.length > 0 ? (
                <div className="chip-row">
                  {report.flags.map((flag) => (
                    <span key={flag} className="impact-chip">
                      {flag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
};
