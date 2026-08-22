import React, { useEffect, useRef, useState } from "react";
import { Shield, X, Pencil, Check, Loader2 } from "lucide-react";

interface ApplicationDetailProps {
  selectedApplication: any;
  setSelectedApplication: (app: any) => void;
  t: (key: string) => string;
  theme: string;
  expectedAmount: number;
  setExpectedAmount: (amt: number) => void;
  updateApplicationAmount: (id: string, amt: number) => void;
  detailStatus: string;
  setDetailStatus: (status: string) => void;
  updateApplicationStatus: (id: string, status: string) => void;
  onUpdateFields: (id: string, data: Record<string, unknown>) => Promise<void> | void;
  formatDate: (date: string) => string;
  formatCurrency: (amt: number) => string;
  POA_OFFENCES: any;
  setShowExportModal: (show: boolean) => void;
}

const toDateInput = (val: any): string => {
  if (!val) return "";
  if (val?.toDate && typeof val.toDate === "function") {
    try {
      return val.toDate().toISOString().split("T")[0];
    } catch {}
  }
  if (typeof val === "string") return val.slice(0, 10);
  if (typeof val === "number") {
    try {
      return new Date(val).toISOString().split("T")[0];
    } catch {}
  }
  return "";
};

const inputCls =
  "w-full h-8 px-2.5 rounded-md border theme-border-glass theme-bg-input theme-text-primary text-[13px] focus:outline-none focus:border-[var(--accent-primary)] transition-colors";

const Item = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <dt className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</dt>
    <dd className="text-[13px] font-medium theme-text-primary mt-0.5 truncate">{children}</dd>
  </div>
);

const Field = ({
  label,
  children,
}: {
  label: string;
  children: (cls: string) => React.ReactNode;
}) => (
  <div className="min-w-0">
    <label className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">{label}</label>
    <div className="mt-1">{children(inputCls)}</div>
  </div>
);

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({
  selectedApplication,
  setSelectedApplication,
  t,
  expectedAmount,
  setExpectedAmount,
  updateApplicationAmount,
  detailStatus,
  setDetailStatus,
  updateApplicationStatus,
  onUpdateFields,
  formatDate,
  formatCurrency,
  POA_OFFENCES,
  setShowExportModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsEditing(false);
  }, [selectedApplication?.id]);

  useEffect(() => {
    if (selectedApplication && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedApplication?.id]);

  if (!selectedApplication) return null;

  const app = selectedApplication;

  const startEdit = () => {
    setForm({
      applicantName: app.applicantName || "",
      aadhaar: app.aadhaar || "",
      phone: app.phone || "",
      district: app.district || "",
      state: app.state || "",
      actType: app.actType || "",
      incidentDate: toDateInput(app.incidentDate),
      firReport: app.firReport || "",
      medicalReport: app.medicalReport || "",
      policeStation: app.policeStation || "",
      caseNumber: app.caseNumber || "",
      amount: String(app.amount ?? ""),
      priority: app.priority || "medium",
      assignedOfficer: app.assignedOfficer || "",
      offenceCategory: app.offenceCategory || "",
      offenceType: app.offenceType || "",
    });
    setIsEditing(true);
  };

  const setField = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const saveEdit = async () => {
    setSaving(true);
    try {
      await onUpdateFields(app.id, {
        applicantName: form.applicantName,
        aadhaar: form.aadhaar,
        phone: form.phone,
        district: form.district,
        state: form.state,
        actType: form.actType,
        incidentDate: form.incidentDate,
        firReport: form.firReport,
        medicalReport: form.medicalReport,
        policeStation: form.policeStation,
        caseNumber: form.caseNumber,
        amount: parseFloat(form.amount) || 0,
        priority: form.priority,
        assignedOfficer: form.assignedOfficer,
        offenceCategory: form.actType === "PoA Act" ? form.offenceCategory : "",
        offenceType: form.actType === "PoA Act" ? form.offenceType : "",
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const guideline = (() => {
    if (!(app.offenceCategory && app.offenceType)) return null;
    const category = POA_OFFENCES[app.offenceCategory as keyof typeof POA_OFFENCES];
    const compensation =
      category && app.offenceType in category
        ? category[app.offenceType as keyof typeof category] as string | number
        : null;
    if (compensation == null) return null;
    if (typeof compensation === "string" && compensation.includes("-")) {
      return `₹${compensation.replace("-", " – ₹")}`;
    }
    return `₹${(compensation as number).toLocaleString("en-IN")}`;
  })();

  return (
    <div
      ref={containerRef}
      className="theme-bg-card theme-border-glass border rounded-xl w-full overflow-hidden scroll-mt-20"
      aria-live="polite"
    >
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between gap-3 border-b theme-border-glass">
        <div className="min-w-0 flex items-center gap-2.5">
          <h2 className="text-sm font-semibold theme-text-primary truncate">{app.applicantName}</h2>
          <span className="text-xs theme-text-muted truncate hidden sm:inline">·</span>
          <span className="text-xs theme-text-muted truncate hidden sm:inline">{app.id}</span>
          <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide theme-bg-glass theme-text-secondary">
            {app.actType}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="h-7 px-3 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowExportModal(true)}
                className="h-7 px-2.5 rounded-md border theme-border-glass theme-text-secondary text-xs font-medium hover:theme-bg-glass transition-colors"
              >
                {t("extracted.export")}
              </button>
              <button
                onClick={startEdit}
                className="h-7 px-3 accent-gradient text-white rounded-md inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Pencil className="w-3 h-3" />
                {t("applications.edit")}
              </button>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-1 rounded-md theme-text-muted hover:theme-bg-glass hover:theme-text-primary transition-colors"
                aria-label={t("extracted.close_sidebar") || "Close"}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3.5 space-y-4">
        {isEditing ? (
          /* ---------- EDIT MODE ---------- */
          <div className="space-y-3.5">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
              <Field label={t("extracted.applicant")}>
                {cls => (
                  <input type="text" required value={form.applicantName} onChange={e => setField("applicantName", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("extracted.phone_number")}>
                {cls => (
                  <input type="tel" required value={form.phone} onChange={e => setField("phone", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("extracted.aadhaar_number")}>
                {cls => (
                  <input type="text" required value={form.aadhaar} onChange={e => setField("aadhaar", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={`${t("extracted.district")} / ${t("extracted.state")}`}>
                {cls => (
                  <div className="flex gap-1.5">
                    <input type="text" required value={form.district} onChange={e => setField("district", e.target.value)} className={cls} placeholder="District" />
                    <input type="text" required value={form.state} onChange={e => setField("state", e.target.value)} className={cls} placeholder="State" />
                  </div>
                )}
              </Field>
              <Field label={t("extracted.act_type")}>
                {cls => (
                  <select value={form.actType} onChange={e => { setField("actType", e.target.value); }} className={cls}>
                    <option value="">Select</option>
                    <option value="PCR Act">{t("extracted.pcr_act")}</option>
                    <option value="PoA Act">{t("extracted.poa_act")}</option>
                  </select>
                )}
              </Field>
              <Field label={t("extracted.incident_date")}>
                {cls => (
                  <input type="date" value={form.incidentDate} onChange={e => setField("incidentDate", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("applications.caseNumber")}>
                {cls => (
                  <input type="text" value={form.caseNumber} onChange={e => setField("caseNumber", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("applications.firReport")}>
                {cls => (
                  <input type="text" value={form.firReport} onChange={e => setField("firReport", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("applications.medicalReport")}>
                {cls => (
                  <input type="text" value={form.medicalReport} onChange={e => setField("medicalReport", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("extracted.police_station")}>
                {cls => (
                  <input type="text" value={form.policeStation} onChange={e => setField("policeStation", e.target.value)} className={cls} />
                )}
              </Field>
              <Field label={t("extracted.amount_1") || "Amount"}>
                {cls => (
                  <input type="number" min={0} required value={form.amount} onChange={e => setField("amount", e.target.value)} className={`${cls} tabular-nums`} />
                )}
              </Field>
              <Field label={t("extracted.priority")}>
                {cls => (
                  <select value={form.priority} onChange={e => setField("priority", e.target.value)} className={cls}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                )}
              </Field>
              <Field label={t("extracted.assigned_officer")}>
                {cls => (
                  <input type="text" value={form.assignedOfficer} onChange={e => setField("assignedOfficer", e.target.value)} className={cls} />
                )}
              </Field>
            </dl>

            {form.actType === "PoA Act" && (
              <div className="pt-3 border-t theme-border-glass">
                <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-secondary mb-2.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-500" />
                  {t("applications.poa_act_offence_details")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
                  <Field label={t("applications.offence_category")}>
                    {cls => (
                      <select
                        value={form.offenceCategory}
                        onChange={e => { setField("offenceCategory", e.target.value); setField("offenceType", ""); }}
                        className={cls}
                      >
                        <option value="">Select Category</option>
                        {Object.keys(POA_OFFENCES).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    )}
                  </Field>
                  {form.offenceCategory && (
                    <Field label={t("applications.specific_offence")}>
                      {cls => (
                        <select value={form.offenceType} onChange={e => setField("offenceType", e.target.value)} className={cls}>
                          <option value="">Select Offence</option>
                          {Object.entries(POA_OFFENCES[form.offenceCategory as keyof typeof POA_OFFENCES] || {}).map(([offence, compensation]) => {
                            const compensationText =
                              typeof compensation === "string" && compensation.includes("-")
                                ? `₹${compensation.replace("-", " - ₹")} (range)`
                                : `₹${(compensation as number).toLocaleString("en-IN")}`;
                            return (
                              <option key={offence} value={offence}>{offence} • {compensationText}</option>
                            );
                          })}
                        </select>
                      )}
                    </Field>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ---------- READ MODE ---------- */
          <div className="space-y-3.5">
            <dl className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              <Item label={t("extracted.status")}>
                <span className="capitalize">{app.status.replace("-", " ")}</span>
              </Item>
              <Item label={t("extracted.priority")}>
                <span className="capitalize">{app.priority}</span>
              </Item>
              <Item label={t("extracted.amount_1") || "Amount"}>{formatCurrency(app.amount)}</Item>
              <Item label={t("extracted.incident_date")}>{formatDate(app.incidentDate)}</Item>
              <Item label={t("extracted.location")}>{`${app.district}, ${app.state}`}</Item>
              <Item label={t("extracted.assigned_officer")}>{app.assignedOfficer || "—"}</Item>
              <Item label={t("extracted.aadhaar_number")}>{app.aadhaar}</Item>
              <Item label={t("extracted.phone_number")}>{app.phone}</Item>
              {app.caseNumber && <Item label={t("applications.caseNumber")}>{app.caseNumber}</Item>}
              {app.firReport && <Item label={t("applications.firReport")}>{app.firReport}</Item>}
              {app.policeStation && <Item label={t("extracted.police_station")}>{app.policeStation}</Item>}
            </dl>

            {/* Officer workflow: status change + PoA relief adjust */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 pt-3 border-t theme-border-glass">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1">
                  {t("extracted.update_status")}
                </p>
                <div className="flex items-center gap-1.5">
                  <select
                    value={detailStatus}
                    onChange={e => setDetailStatus(e.target.value)}
                    className={`${inputCls} w-44`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-review">In Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="documents-required">Documents Required</option>
                  </select>
                  <button
                    onClick={() => updateApplicationStatus(app.id, detailStatus)}
                    disabled={detailStatus === app.status}
                    className="h-8 px-3 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
              </div>

              {app.actType === "PoA Act" && app.offenceType && (
                <div className="min-w-0 md:ml-auto">
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-500" />
                    {t("applications.specific_offence")}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] theme-text-primary truncate max-w-[220px]">{app.offenceType}</span>
                    {guideline && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold tabular-nums">
                        Guideline {guideline}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Amount adjustment slider */}
            {app.actType === "PoA Act" && app.offenceType && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    {t("extracted.adjust_amount") || "Adjust Relief Amount"}
                  </span>
                  <span className="text-sm font-semibold theme-text-primary tabular-nums">
                    ₹{expectedAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="range"
                    min="0"
                    max="2000000"
                    step="10000"
                    value={expectedAmount}
                    onChange={e => setExpectedAmount(Number(e.target.value))}
                    className="slider flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={expectedAmount}
                    onChange={e => setExpectedAmount(Number(e.target.value) || 0)}
                    className={`${inputCls} w-36 tabular-nums shrink-0`}
                  />
                  <button
                    onClick={() => updateApplicationAmount(app.id, expectedAmount)}
                    disabled={expectedAmount === app.amount}
                    className="h-8 px-3 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail;
