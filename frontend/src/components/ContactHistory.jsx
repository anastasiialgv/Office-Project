import { useState, useEffect } from "react";
import { GlassCard, CardTitle, PhoneIcon, MailIcon, PlusIcon } from "./Mini.jsx";
import axios from "axios";
import Loader from "./Loader.jsx";
const API_BASE = "http://localhost:8080/office";
function TimelineEntry({ entry }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="timeline-entry-row">
            <div>
                <div className="timeline-entry-type">
                    {entry.contactType === "PHONE" ?
                        <PhoneIcon size={14}/> : <MailIcon size={14}/>}
                    <strong style={{ textTransform: "uppercase" }}>
                        {((entry.contactType) || "CONTACT").replace(/_/g, " ")}
                    </strong>
                </div>
                <p className="timeline-entry-result">
                    {entry.result || "No description provided"}
                </p>
            </div>
            <div className="timeline-entry-meta">
                <div>{formatDate(entry.contactDate)}</div>
            </div>
        </div>
    );
}

function AddContactForm({onAdd, onCancel, caseId}) {
    const [ContactType, setContactType] = useState("PHONE");
    const [Result, setResult] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!Result.trim()) {
            alert("Please enter a comment");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE}/cases/${caseId}/contact-history`, {
                contactType: ContactType,
                result: Result
            }, {
                headers: {Authorization: `Bearer ${token}`}
            });
            alert("Contact logged successfully!");
            onAdd();
        } catch (err) {
            console.error("Error saving contact log:", err);
            alert("Failed to save contact log");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ch-form">
            <div>
                <div className="ap-label">Type</div>
                <select
                    className="glass-input"
                    value={ContactType}
                    onChange={(e) => setContactType(e.target.value)}
                    style={{ background: "rgba(0,0,0,0.2)", color: "#fff" }}
                >
                    <option value="PHONE">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="LETTER">Official Letter</option>
                </select>
            </div>
            <div>
                <div className="ap-label">Result</div>
                <textarea
                    className="glass-input"
                    value={Result}
                    onChange={(e) => setResult(e.target.value)}
                    placeholder="Enter description..."
                />
            </div>
            <div className="ch-form-bottom">
                <button type="button" className="btn-danger" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary">Save Log</button>
            </div>
        </form>
    );
}

export default function ContactHistory({ caseId, onContactAdded }) {
    const [history, setHistory] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        if (!caseId) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE}/cases/${caseId}/contact-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (e) {
            console.error("Error loading contact history:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [caseId]);

    const handleAddSuccess = () => {
        setTimeout(() => {
            fetchHistory();
        }, 300);
        onContactAdded();
        setShowForm(false);
    };

    if (loading) return <Loader/>;

    return (
        <div className="ch-wrap">
            <GlassCard>
                <CardTitle>Contact History</CardTitle>

                <div className="ch-timeline">
                    {history.length === 0 ? (
                        <div className="ch-empty-state">
                            No contact attempts registered for this case yet.
                        </div>
                    ) : (
                        history.map((entry) => (
                            <TimelineEntry key={entry.id} entry={entry} />
                        ))
                    )}
                </div>

                {showForm ? (
                    <AddContactForm caseId={caseId} onAdd={handleAddSuccess} onCancel={() => setShowForm(false)} />
                ) : (
                    <button
                        className="ch-add-btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <PlusIcon /> Add New Contact
                    </button>
                )}
            </GlassCard>
        </div>
    );
}