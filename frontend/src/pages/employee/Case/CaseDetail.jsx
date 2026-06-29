import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
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
import axios from "axios";
import Loader from "../../../components/Loader.jsx";

const API_BASE = "http://localhost:8080/office";
const STATUS_OPTIONS = ["WAITING_FOR_CONTACT", "IN_PROGRESS", "DISPUTED", "IN_COURT", "CLOSED"];

// ── Вспомогательные компоненты ──────────────────────────────────────────────


function ContactCard({ driver = {}, onSave }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ phone: "", address: "", email: "" });

    const handleOpen = () => {
        setDraft({ phone: driver.phone || "", address: driver.address || "", email: driver.email || "" });
        setEditing(true);
    };

    const handleSave = () => {
        onSave(draft);
        setEditing(false);
    };

    return (
        <>
            <GlassCard className="cd-card-contact">
                <CardTitle>Contact info</CardTitle>
                <Field label="Phone">{driver.phone || "—"}</Field>
                <Field label="Address">{driver.address || "—"}</Field>
                <Field label="Email">{driver.email || "—"}</Field>
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

function DriverCard({ driver = {}, onSaveNotes }) {
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesDraft, setNotesDraft] = useState(driver.notes || "");

    const handleSave = () => { onSaveNotes(notesDraft); setEditingNotes(false); };

    return (
        <GlassCard className="cd-card-driver">
            <CardTitle>Driver</CardTitle>
            <Field label="Full name">{`${driver.name || ""} ${driver.surname || ""}`.trim() || "—"}</Field>
            <Field label="Birth Date">{driver.birthDate || "—"}</Field>
            <Field label="PESEL">{driver.pesel || "—"}</Field>
            <Field label="Passport">{driver.passportNumber || "—"}</Field>

            <div className="mc-field" style={{ alignItems: "flex-start", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <span className="mc-fl">Notes</span>
                    {!editingNotes && (
                        <button className="icon-btn" onClick={() => { setNotesDraft(driver.notes || ""); setEditingNotes(true); }}>
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
                    <span className="mc-fv" style={{ textAlign: "left", width: '100%' }}>{driver.notes || "No notes"}</span>
                )}
            </div>
        </GlassCard>
    );
}

function VehicleCard({ vehicle, photoUrl }) {
    const [lightbox, setLightbox] = useState(null);

    return (
        <>
            <GlassCard className="cd-card-vehicle">
                <CardTitle>Vehicle</CardTitle>
                <div className="cd-vehicle-grid">
                    {[["Number", vehicle.plateNumber], ["Model", vehicle.model], ["Brand", vehicle.brand], ["Color", vehicle.color]].map(([label, val]) => (
                        <div className="mc-field" key={label}>
                            <span className="mc-fl">{label}</span>
                            <span className="mc-fv">{val || "—"}</span>
                        </div>
                    ))}
                </div>


                {photoUrl ? (
                    <div className="photo-container" style={{ marginTop: '15px' }}>
                        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Evidence Photo:</div>
                        <img
                            src={`http://localhost:8080${photoUrl}`}
                            alt="Violation Evidence"
                            style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                        />
                    </div>
                ) : (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}>No photo attached to this case.</div>
                )}
            </GlassCard>

            {lightbox && (
                <div className="modal-overlay" onClick={() => setLightbox(null)} style={{zIndex: 2000}}>
                    <div className="modal-box" style={{maxWidth: '80%', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setLightbox(null)}>×</button>
                        <img src={lightbox.url} alt={lightbox.label} style={{ maxWidth: '100%', borderRadius: '12px' }} />
                    </div>
                </div>
            )}
        </>
    );
}

// ── Основной компонент страницы ──────────────────────────────────────────────

export default function CaseDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [localUploaded, setLocalUploaded] = useState(false);

    const fetchCaseDetails = async () => {
        try {
            setLoading(true)
//                    CASE DETAILS
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE}/cases/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (e) {
            console.error("Error loading case details:", e);
            alert("Failed to load case details from server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCaseDetails();
    }, [id]);


    const handleContactSave = async (updatedFields) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${API_BASE}/drivers/${data.driver.idDriver}/contacts`, updatedFields, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setData(p => ({
                ...p,
                driver: {
                    ...p.driver,
                    phone: updatedFields.phone,
                    address: updatedFields.address,
                    email: updatedFields.email
                }
            }));
        } catch (e) {
            console.error("Error updating contacts:", e);
            alert("Error updating driver contact info");
        }
    };

    const handleNotesSave = async (newNotes) => {
        const driverId = data.driver.idDriver || data.driver.id || data.driver.iddriver;
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${API_BASE}/drivers/${driverId}/notes`, { notes: newNotes }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(p => ({ ...p, driver: { ...p.driver, notes: newNotes } }));
        } catch (e) {
            console.error("Error saving notes:", e);
            alert("Error saving notes on server");
        }
    };

    const handlePenaltySave = async ({ amount, reason }) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `${API_BASE}/cases/${id}/addPenalty`,
                null,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        amount: amount,
                        reason: reason
                    }
                }
            );

            alert("Penalty updated successfully on server!");
            setData(p => ({
                ...p,
                fineAmount: parseFloat(p.fineAmount) + parseFloat(amount)
            }));

            setShowPenaltyModal(false);
        } catch (e) {
            console.error("Error saving penalty:", e);
            alert("Failed to save penalty on server.");
        }
    };

    if (loading) return <Loader/>;
    if (!data) return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>Case not found.</div>;

    return (
        <>
            <BackButton onClick={() => navigate(-1)} />

            <div className="cd-grid">
                <GlassCard className="cd-card-case">
                    <CardTitle>Case</CardTitle>
                    <div className="mc-field">
                        <span className="mc-fl">Status</span>
                        <StatusBadge status={data.status} />
                    </div>

                    <Field label="Violation date">{data.violationDate || "—"}</Field>
                    <Field label="Due Date">{data.violationDate ? (new Date(new Date(data.violationDate).getTime() + 14 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : "—"}</Field>

                    <div className="mc-field">
                        <span className="mc-fl">Fine amount</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ color: "var(--accent-orange)", fontWeight: 600 }}>
                                {data.fineAmount ? Number(data.fineAmount).toFixed(2) : "0.00"} PLN
                            </span>
                            <button className="cd-penalty-btn" onClick={() => setShowPenaltyModal(true)}>
                                + Penalty
                            </button>
                        </div>
                    </div>

                    <Field label="Overdue count">{data.overdueCount || 0}</Field>
                    <Field label="Address">{data.address || "—"}</Field>

                    <div className="mc-field">
                        <span className="mc-fl">Payment Proof</span>
                        <div style={{display: "flex", gap: "10px", alignItems: "center"}}>
                            {data.status === "CLOSED" || localUploaded ? (
                                <button
                                    onClick={async() => {
                                        try{
                                        const token = localStorage.getItem("token");
                                        window.open(`${API_BASE}/files/download/${data.paymentProofFileId}?token=${token}`, "_blank", "noopener,noreferrer");                                    } catch (err) {

                                        console.error("Error opening file:", err);
                                        alert("Failed to download file from server.");
                                    }}}
                                    className="cd-add-link"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        color: "var(--accent-green)",
                                        cursor: "pointer"
                                    }}
                                >
                                    DOWNLOAD
                                </button>
                            ) : (
                                <label className="cd-add-link" style={{cursor: "pointer"}}>
                                    ADD
                                    <input
                                        type="file"
                                        style={{display: "none"}}
                                        onChange={async (e) => {
                                            if (!e.target.files[0]) return;
                                            const formData = new FormData();
                                            formData.append("file", e.target.files[0]);
                                            try {
                                                const token = localStorage.getItem("token");
                                                await axios.post(`${API_BASE}/cases/${id}/payment-proof`, formData, {
                                                    headers: {
                                                        Authorization: `Bearer ${token}`,
                                                        "Content-Type": "multipart/form-data"
                                                    }
                                                })
                                                setLocalUploaded(true);
                                                alert("Payment proof uploaded successfully!");

                                                fetchCaseDetails();
                                            } catch (err) {
                                                alert("Error uploading file");
                                            }
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Остальные карточки */}
                <ContactCard driver={data.driver} onSave={handleContactSave}/>

                <VehicleCard vehicle={data.vehicle} photoUrl={data.photoUrl}/>

                <DriverCard driver={data.driver} onSaveNotes={handleNotesSave}/>
            </div>

            <div style={{padding: "0 20px 32px"}}>
                <ContactHistory caseId={data.numberCase} onContactAdded={fetchCaseDetails}/>
            </div>

            {showPenaltyModal && (
                <AddPenaltyModal
                    caseData={data}
                    onConfirm={handlePenaltySave}
                    onClose={() => setShowPenaltyModal(false)}
                />
            )}
        </>
    );
}