import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TopBar,
    BackButton,
    GlassCard,
    CardTitle,
    StatusBadge,
    Field,
    SideButton,
    Modal,
    PencilIcon,
    CheckIcon,
    STATUS_STYLES,
} from "../../../components/Mini.jsx";
import ContactHistory from "../../../components/ContactHistory.jsx";
import AddPenaltyModal from "../../../components/AddPenalty.jsx";

// ── Константы ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["IN PROGRESS", "CLOSED", "DISPUTED", "WAITING FOR CONTACT", "REGISTERED"];

const MOCK_EVIDENCE = [
    { id: 1, url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80", label: "Front" },
    { id: 2, url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80", label: "Rear" },
    { id: 3, url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80", label: "Plate" },
];

const INITIAL_CASE = {
    id: "1287327123",
    status: "IN PROGRESS",
    violation: "2025-09-10",
    due: "2025-09-24",
    fine: 50,
    overdue: 1,
    caseAddr: "18 Nowowiejska St., Warszawa",
    payment: false,
    phone: "+48 601 234 567",
    address: "15 Lipowa St., Warsaw",
    email: "johnmille@gmail.com",
    fullname: "John Mille",
    birth: "1989-03-12",
    pesel: "89031212345",
    passport: "XR4598821",
    notes: "Prefers contact by email.",
    vehicle: { num: "WWA12345", model: "Corolla", brand: "Toyota", color: "Silver" },
    evidence: MOCK_EVIDENCE,
};

// ── Вспомогательные компоненты ──────────────────────────────────────────────

function StatusSelector({ current, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="status-select-container">
            <StatusBadge
                status={current}
                style={{ cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            />
            {open && (
                <div className="status-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    {STATUS_OPTIONS.map((s) => (
                        <div
                            key={s}
                            className="status-option"
                            style={{ color: (STATUS_STYLES[s] || {}).color }}
                            onClick={() => { onChange(s); setOpen(false); }}
                        >
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ContactCard({ data, onSave }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ phone: data.phone, address: data.address, email: data.email });

    const handleOpen = () => {
        setDraft({ phone: data.phone, address: data.address, email: data.email });
        setEditing(true);
    };

    const handleSave = () => { onSave(draft); setEditing(false); };

    return (
        <>
            <GlassCard className="cd-card-contact">
                <CardTitle>Contact info</CardTitle>
                <Field label="Phone">{data.phone}</Field>
                <Field label="Address">{data.address}</Field>
                <Field label="Email">{data.email}</Field>
                <SideButton onClick={handleOpen} />
            </GlassCard>

            {editing && (
                <Modal title="Edit Contact Info" onClose={() => setEditing(false)}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {["phone", "address", "email"].map((field) => (
                            <div key={field}>
                                <div className="ap-label" style={{ textTransform: "capitalize" }}>{field}</div>
                                <input
                                    className="glass-input"
                                    value={draft[field]}
                                    onChange={(e) => setDraft((p) => ({ ...p, [field]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="ap-footer">
                        <button className="btn-danger" onClick={() => setEditing(false)}>Cancel</button>
                        <button className="btn-primary" onClick={handleSave}>Save</button>
                    </div>
                </Modal>
            )}
        </>
    );
}

function DriverCard({ data, onSaveNotes }) {
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesDraft, setNotesDraft] = useState(data.notes || "");

    const handleSave = () => { onSaveNotes(notesDraft); setEditingNotes(false); };

    return (
        <GlassCard className="cd-card-driver">
            <CardTitle>Driver</CardTitle>
            <Field label="Full name">{data.fullname}</Field>
            <Field label="Birth Date">{data.birth}</Field>
            <Field label="PESEL">{data.pesel}</Field>
            <Field label="Passport">{data.passport}</Field>

            <div className="mc-field" style={{ alignItems: "flex-start", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <span className="mc-fl">Notes</span>
                    {!editingNotes && (
                        <button className="icon-btn" onClick={() => setEditingNotes(true)}>
                            <PencilIcon size={13} />
                        </button>
                    )}
                </div>

                {editingNotes ? (
                    <>
                        <textarea
                            className="glass-input ap-textarea"
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%", marginTop: 8 }}>
                            <button className="btn-danger" onClick={() => setEditingNotes(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}><CheckIcon size={12} /> Save</button>
                        </div>
                    </>
                ) : (
                    <span className="mc-fv" style={{ textAlign: "left", width: '100%' }}>{data.notes || "No notes"}</span>
                )}
            </div>
        </GlassCard>
    );
}

function VehicleCard({ vehicle, evidence = [] }) {
    const [lightbox, setLightbox] = useState(null);

    return (
        <>
            <GlassCard className="cd-card-vehicle">
                <CardTitle>Vehicle</CardTitle>
                <div className="cd-vehicle-grid">
                    {[["Number", vehicle.num], ["Model", vehicle.model], ["Brand", vehicle.brand], ["Color", vehicle.color]].map(([label, val]) => (
                        <div className="mc-field" key={label}>
                            <span className="mc-fl">{label}</span>
                            <span className="mc-fv">{val}</span>
                        </div>
                    ))}
                </div>

                {evidence.length > 0 && (
                    <div className="cd-evidence-section" style={{ marginTop: '16px' }}>
                        <div className="ap-label" style={{ marginBottom: '8px' }}>Vehicle Evidence</div>
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                            {evidence.map((photo) => (
                                <div key={photo.id} style={{ cursor: 'pointer' }} onClick={() => setLightbox(photo)}>
                                    <img src={photo.url} alt={photo.label} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </GlassCard>

            {lightbox && (
                <div className="modal-overlay" onClick={() => setLightbox(null)} style={{ zIndex: 2000 }}>
                    <div className="modal-box" style={{ maxWidth: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setLightbox(null)}>×</button>
                        <img src={lightbox.url} alt={lightbox.label} style={{ maxWidth: '100%', borderRadius: '12px' }} />
                    </div>
                </div>
            )}
        </>
    );
}

// ── Основной компонент страницы ──────────────────────────────────────────────

export default function CaseDetail({ caseData, onMenuClick }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(caseData || INITIAL_CASE);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);

    const handleStatusChange = (status) => setData(p => ({ ...p, status }));
    const handleContactSave = (c) => setData(p => ({ ...p, ...c }));
    const handleNotesSave = (n) => setData(p => ({ ...p, notes: n }));

    return (
        <div className="page-wrap">
            <TopBar title={`Case #${id || data.id}`} onMenuClick={onMenuClick} />
            <BackButton onClick={() => navigate(-1)} />

            <div className="cd-grid">
                {/* Карточка Case */}
                <GlassCard className="cd-card-case">
                    <CardTitle>Case</CardTitle>
                    <div className="mc-field">
                        <span className="mc-fl">Status</span>
                        <StatusSelector current={data.status} onChange={handleStatusChange} />
                    </div>

                    <Field label="Violation date">{data.violation}</Field>
                    <Field label="Due Date">{data.due}</Field>

                    <div className="mc-field">
                        <span className="mc-fl">Fine amount</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ color: "var(--accent-orange)", fontWeight: 600 }}>
                                {Number(data.fine).toFixed(2)} PLN
                            </span>
                            <button className="cd-penalty-btn" onClick={() => setShowPenaltyModal(true)}>
                                + Penalty
                            </button>
                        </div>
                    </div>

                    <Field label="Overdue count">{data.overdue}</Field>
                    <Field label="Address">{data.caseAddr}</Field>

                    <div className="mc-field">
                        <span className="mc-fl">Payment Proof</span>
                        <button
                            className="cd-add-link"
                            onClick={() => setData(p => ({ ...p, payment: !p.payment }))}
                            style={{ background: 'none', border: 'none', padding: 0 }}
                        >
                            {data.payment ? "VIEW" : "ADD"}
                        </button>
                    </div>
                </GlassCard>

                {/* Остальные карточки */}
                <ContactCard data={data} onSave={handleContactSave} />
                <DriverCard data={data} onSaveNotes={handleNotesSave} />
                <VehicleCard vehicle={data.vehicle} evidence={data.evidence} />
            </div>

            {/* История контактов */}
            <div style={{ padding: "0 20px 32px" }}>
                <ContactHistory caseId={data.id} />
            </div>

            {/* Модалка штрафа */}
            {showPenaltyModal && (
                <AddPenaltyModal
                    caseData={data}
                    onConfirm={({ amount }) => setData(p => ({ ...p, fine: parseFloat(p.fine) + parseFloat(amount) }))}
                    onClose={() => setShowPenaltyModal(false)}
                />
            )}
        </div>
    );
}