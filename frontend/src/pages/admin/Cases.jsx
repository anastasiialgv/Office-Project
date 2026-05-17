// =============================================================================
// pages/admin/AdminCaseRegistry.jsx
// Administrator · Case Registry
//
// Features:
//   • Full case list with status filters (incl. Archived hidden by default)
//   • Assign employee per case (dropdown in row)
//   • Register Case modal (manual entry)
//   • Import modal (JSON / Excel file upload)
//   • Verify & Archive flow — confirmation with date + worker/admin binding
//   • archived: true cases hidden from default view; toggle to show
// =============================================================================

import { useState, useRef } from "react";
import {
    TopBar,
    GlassCard,
    StatusBadge,
    Modal,
} from "../../components/Mini.jsx";

// ── Mock employees ────────────────────────────────────────────────────────────
const MOCK_EMPLOYEES = [
    { id: "e1", name: "Anna Kowalska",        role: "Employee" },
    { id: "e2", name: "Piotr Nowak",          role: "Employee" },
    { id: "e3", name: "Magdalena Wiśniewska", role: "Employee" },
    { id: "e4", name: "Tomasz Lewandowski",   role: "Employee" },
];

const ADMIN_NAME = "Karol Zieliński";

// ── Mock cases ────────────────────────────────────────────────────────────────
const MOCK_CASES = [
    { id: "CD-001", violation: "2025-03-12", due: "2025-03-26", fine: 150.00, status: "REGISTERED",          assignedTo: null,  archived: false, closedDate: null, closedBy: null },
    { id: "CD-002", violation: "2025-04-01", due: "2025-04-15", fine: 80.00,  status: "IN PROGRESS",         assignedTo: "e1",  archived: false, closedDate: null, closedBy: null },
    { id: "CD-003", violation: "2025-04-10", due: "2025-04-24", fine: 220.00, status: "DISPUTED",            assignedTo: "e2",  archived: false, closedDate: null, closedBy: null },
    { id: "CD-004", violation: "2025-04-22", due: "2025-05-06", fine: 50.00,  status: "WAITING FOR CONTACT", assignedTo: "e1",  archived: false, closedDate: null, closedBy: null },
    { id: "CD-005", violation: "2025-05-01", due: "2025-05-15", fine: 400.00, status: "CLOSED",              assignedTo: "e3",  archived: false, closedDate: null, closedBy: null },
    { id: "CD-006", violation: "2025-01-15", due: "2025-01-29", fine: 120.00, status: "CLOSED",              assignedTo: "e4",  archived: true,  closedDate: "2025-02-10", closedBy: { worker: "Tomasz Lewandowski", admin: "Karol Zieliński" } },
    { id: "CD-007", violation: "2025-02-20", due: "2025-03-06", fine: 75.00,  status: "REGISTERED",          assignedTo: null,  archived: false, closedDate: null, closedBy: null },
    { id: "CD-008", violation: "2025-03-05", due: "2025-03-19", fine: 310.00, status: "IN PROGRESS",         assignedTo: "e2",  archived: false, closedDate: null, closedBy: null },
    { id: "CD-009", violation: "2025-04-18", due: "2025-05-02", fine: 95.00,  status: "DISPUTED",            assignedTo: "e3",  archived: false, closedDate: null, closedBy: null },
    { id: "CD-010", violation: "2025-05-05", due: "2025-05-19", fine: 60.00,  status: "CLOSED",              assignedTo: "e1",  archived: false, closedDate: null, closedBy: null },
];

const FILTERS = [
    { key: "REGISTERED",          label: "Unassigned",          color: "#c8a0ff" },
    { key: "IN PROGRESS",         label: "In Progress",         color: "#ffa03c" },
    { key: "DISPUTED",            label: "Disputed",            color: "#f07070" },
    { key: "WAITING FOR CONTACT", label: "Waiting for Contact", color: "#6ab0ff" },
    { key: "CLOSED",              label: "Closed",              color: "#6ddd8a" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Register Case Modal
// ─────────────────────────────────────────────────────────────────────────────
function RegisterCaseModal({ onClose, onSave }) {
    const [form, setForm] = useState({ id: "", violation: "", due: "", fine: "" });
    const [err, setErr]   = useState("");

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErr(""); };

    const handleSave = () => {
        if (!form.id.trim())        return setErr("Case ID is required.");
        if (!form.violation.trim()) return setErr("Violation date is required.");
        if (!form.due.trim())       return setErr("Due date is required.");
        const fine = parseFloat(form.fine);
        if (!form.fine || isNaN(fine) || fine < 0) return setErr("Enter a valid fine amount.");
        onSave({ ...form, fine, status: "REGISTERED", assignedTo: null, archived: false, closedDate: null, closedBy: null });
        onClose();
    };

    return (
        <Modal title="Register New Case" onClose={onClose}>
            <div className="ap-field">
                <div className="ap-label">Case ID</div>
                <input className="glass-input" placeholder="e.g. CD-099" value={form.id} onChange={e => set("id", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="ap-field">
                    <div className="ap-label">Violation Date</div>
                    <input className="glass-input" type="date" value={form.violation} onChange={e => set("violation", e.target.value)} />
                </div>
                <div className="ap-field">
                    <div className="ap-label">Due Date</div>
                    <input className="glass-input" type="date" value={form.due} onChange={e => set("due", e.target.value)} />
                </div>
            </div>
            <div className="ap-field">
                <div className="ap-label">Fine Amount (PLN)</div>
                <div className="ap-amount-wrap">
                    <span className="ap-currency">PLN</span>
                    <input className="ap-amount-input" type="number" min="0" step="0.01" placeholder="0.00"
                           value={form.fine} onChange={e => set("fine", e.target.value)} />
                </div>
            </div>
            {err && <div className="ap-error">{err}</div>}
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Register</button>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Import Modal
// ─────────────────────────────────────────────────────────────────────────────
function ImportModal({ onClose, onImport }) {
    const fileRef             = useRef();
    const [file, setFile]     = useState(null);
    const [status, setStatus] = useState("idle");
    const [msg, setMsg]       = useState("");

    const handleFile = e => { setFile(e.target.files[0]); setStatus("idle"); setMsg(""); };

    const handleImport = () => {
        if (!file) return setMsg("Please select a file first.");
        setStatus("parsing");
        setTimeout(() => {
            const ok = file.name.endsWith(".json") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
            if (ok) {
                const imported = [
                    { id: `IMP-${Date.now()}`, violation: "2025-06-01", due: "2025-06-15", fine: 99.99,
                        status: "REGISTERED", assignedTo: null, archived: false, closedDate: null, closedBy: null },
                ];
                onImport(imported);
                setStatus("done");
                setMsg(`Imported ${imported.length} case(s) successfully.`);
            } else {
                setStatus("error");
                setMsg("Unsupported format. Please use .json or .xlsx");
            }
        }, 900);
    };

    return (
        <Modal title="Import Cases" onClose={onClose}>
            <div className="ap-field">
                <div className="ap-label">Accepted formats: .json · .xlsx · .xls</div>
                <div className="adm-drop-zone" onClick={() => fileRef.current?.click()}>
                    {file
                        ? <span style={{ color: "#fff" }}>📄 {file.name}</span>
                        : <span style={{ color: "var(--text-muted)" }}>Click to select file or drag & drop</span>
                    }
                    <input ref={fileRef} type="file" accept=".json,.xlsx,.xls" style={{ display: "none" }} onChange={handleFile} />
                </div>
            </div>
            {msg && (
                <div className="ap-error" style={{ color: status === "done" ? "var(--accent-green)" : undefined }}>
                    {msg}
                </div>
            )}
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Close</button>
                <button className="btn-primary" onClick={handleImport} disabled={status === "parsing" || status === "done"}>
                    {status === "parsing" ? "Importing…" : status === "done" ? "Done ✓" : "Import"}
                </button>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Verify & Archive Modal
// ─────────────────────────────────────────────────────────────────────────────
function ArchiveModal({ caseItem, employees, onClose, onConfirm }) {
    const today = new Date().toISOString().split("T")[0];
    const [closedDate, setClosedDate] = useState(today);
    const [notes, setNotes]           = useState("");
    const worker = employees.find(e => e.id === caseItem.assignedTo);

    const handleConfirm = () => {
        onConfirm({ id: caseItem.id, closedDate, closedBy: { worker: worker?.name || "Unassigned", admin: ADMIN_NAME } });
        onClose();
    };

    return (
        <Modal title="Verify & Archive Case" onClose={onClose}>
            <div style={{ background: "rgba(109,221,138,0.07)", border: "1px solid rgba(109,221,138,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Archiving case</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{caseItem.id}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Fine: {Number(caseItem.fine).toFixed(2)} PLN · Violation: {caseItem.violation}</div>
            </div>

            <div className="ap-field">
                <div className="ap-label">Closure Date</div>
                <input className="glass-input" type="date" value={closedDate} max={today} onChange={e => setClosedDate(e.target.value)} />
            </div>

            <div className="ap-field">
                <div className="ap-label">Responsible Employee</div>
                <div className="glass-input" style={{ opacity: 0.65, cursor: "not-allowed", color: worker ? "#fff" : "var(--accent-orange)" }}>
                    {worker ? worker.name : "⚠ Not assigned — proceed with caution"}
                </div>
            </div>

            <div className="ap-field">
                <div className="ap-label">Archiving Admin</div>
                <div className="glass-input" style={{ opacity: 0.65, cursor: "not-allowed" }}>{ADMIN_NAME}</div>
            </div>

            <div className="ap-field">
                <div className="ap-label">Closure Notes (optional)</div>
                <textarea className="glass-input ap-textarea" placeholder="Any final remarks…"
                          value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={{ fontSize: 12, color: "var(--accent-orange)", marginBottom: 8, lineHeight: 1.5 }}>
                ⚠ This will permanently archive the case. It will be hidden from the active list and cannot be re-opened.
            </div>

            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="adm-confirm-archive-btn" onClick={handleConfirm}>✓ Confirm Archive</button>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminCases() {
    const [cases, setCases]           = useState(MOCK_CASES);
    const [activeFilter, setFilter]   = useState(null);
    const [showArchived, setShowArch] = useState(false);
    const [search, setSearch]         = useState("");
    const [showRegister, setRegister] = useState(false);
    const [showImport, setImport]     = useState(false);
    const [archiveTarget, setTarget]  = useState(null);

    const visible = cases.filter(c => {
        if (!showArchived && c.archived)  return false;
        if ( showArchived && !c.archived) return false;
        if (activeFilter && c.status !== activeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return c.id.toLowerCase().includes(q) || c.status.toLowerCase().includes(q);
        }
        return true;
    });

    const handleAssign = (caseId, empId) =>
        setCases(p => p.map(c => c.id === caseId
            ? { ...c, assignedTo: empId || null, status: empId ? "IN PROGRESS" : "REGISTERED" }
            : c));

    const handleArchiveConfirm = ({ id, closedDate, closedBy }) =>
        setCases(p => p.map(c => c.id === id ? { ...c, archived: true, closedDate, closedBy } : c));

    const totalActive   = cases.filter(c => !c.archived).length;
    const totalArchived = cases.filter(c =>  c.archived).length;
    const unassigned    = cases.filter(c => !c.archived && !c.assignedTo).length;
    const readyClose    = cases.filter(c => !c.archived && c.status === "CLOSED").length;

    return (
        <>
            {/* Summary */}
            <div className="adm-stat-row">
                {[
                    { label: "Active Cases",     value: totalActive,   color: "var(--accent-purple)" },
                    { label: "Unassigned",        value: unassigned,    color: "var(--accent-orange)" },
                    { label: "Ready to Archive",  value: readyClose,    color: "var(--accent-green)" },
                    { label: "Archived Total",    value: totalArchived, color: "var(--text-muted)" },
                ].map(s => (
                    <div key={s.label} className="adm-stat-chip">
                        <span className="adm-stat-value" style={{ color: s.color }}>{s.value}</span>
                        <span className="adm-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="adm-toolbar">
                <input className="glass-input adm-search" placeholder="Search by ID or status…"
                       value={search} onChange={e => setSearch(e.target.value)} />
                <div className="adm-toolbar-actions">
                    <button className="btn-primary" onClick={() => setRegister(true)}>+ Register Case</button>
                    <button className="adm-btn-ghost" onClick={() => setImport(true)}>⬆ Import</button>
                    <button
                        className="adm-btn-ghost"
                        style={showArchived ? { borderColor: "var(--accent-purple)", color: "var(--accent-purple)" } : {}}
                        onClick={() => { setShowArch(p => !p); setFilter(null); }}
                    >
                        {showArchived ? "← Active Cases" : "📦 Archived"}
                    </button>
                </div>
            </div>

            {/* Filter strip */}
            {!showArchived && (
                <div className="adm-filter-row">
                    <div className={`adm-filter-chip ${activeFilter === null ? "active" : ""}`} onClick={() => setFilter(null)}>
                        All Active
                    </div>
                    {FILTERS.map(f => (
                        <div
                            key={f.key}
                            className={`adm-filter-chip ${activeFilter === f.key ? "active" : ""}`}
                            onClick={() => setFilter(p => p === f.key ? null : f.key)}
                        >
                            <span className="adm-chip-dot" style={{ background: f.color }} />
                            {f.label}
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            <div style={{ padding: "0 20px 40px" }}>
                <GlassCard>
                    <div className="adm-table-head">
                        <span>Case ID</span>
                        <span>Violation</span>
                        <span>Due</span>
                        <span>Fine</span>
                        <span>Status</span>
                        <span>Assigned To</span>
                        <span>Actions</span>
                    </div>

                    {visible.length === 0
                        ? <div className="cl-empty">No cases match the current filter.</div>
                        : visible.map((c, i) => {
                            const worker = MOCK_EMPLOYEES.find(e => e.id === c.assignedTo);
                            const canArchive = !c.archived && c.status === "CLOSED";
                            return (
                                <div key={c.id} className="adm-table-row" style={{ animationDelay: `${i * 0.04}s` }}>
                                    <span className="adm-case-id">{c.id}</span>
                                    <span className="adm-cell-muted">{c.violation}</span>
                                    <span className="adm-cell-muted">{c.due}</span>
                                    <span style={{ color: "var(--accent-orange)", fontWeight: 600, fontSize: 13 }}>
                                        {Number(c.fine).toFixed(2)} PLN
                                    </span>
                                    <StatusBadge status={c.archived ? "ARCHIVED" : c.status} />

                                    {/* Assign select or archive info */}
                                    {c.archived ? (
                                        <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                                            <div style={{ color: "#fff" }}>{c.closedBy?.worker || "—"}</div>
                                            <div style={{ color: "var(--text-muted)" }}>{c.closedDate}</div>
                                        </div>
                                    ) : (
                                        <select
                                            className="adm-assign-select glass-select"
                                            value={c.assignedTo || ""}
                                            onChange={e => handleAssign(c.id, e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <option value="">— Unassigned —</option>
                                            {MOCK_EMPLOYEES.map(e => (
                                                <option key={e.id} value={e.id}>{e.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    <div className="adm-row-actions">
                                        {canArchive && (
                                            <button className="adm-archive-btn"
                                                    onClick={e => { e.stopPropagation(); setTarget(c); }}>
                                                ✓ Archive
                                            </button>
                                        )}
                                        {c.archived && (
                                            <span className="adm-archived-tag">Archived</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </GlassCard>
            </div>

            {showRegister && <RegisterCaseModal onClose={() => setRegister(false)} onSave={c => setCases(p => [c, ...p])} />}
            {showImport   && <ImportModal onClose={() => setImport(false)} onImport={imported => setCases(p => [...imported, ...p])} />}
            {archiveTarget && (
                <ArchiveModal
                    caseItem={archiveTarget}
                    employees={MOCK_EMPLOYEES}
                    onClose={() => setTarget(null)}
                    onConfirm={handleArchiveConfirm}
                />
            )}
            </>
    );
}