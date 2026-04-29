// ─────────────────────────────────────────────────────────────────────────────
// components/ContactHistory.jsx — блок «История контактов»
//
// Встраивается в CaseDetail.
// Функции:
//   • Вертикальный Timeline (дата, тип, результат/комментарий)
//   • Иконка-тип: Call / Email
//   • Кнопка «Add New Contact» → inline-форма под списком
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { GlassCard, CardTitle, PhoneIcon, MailIcon, PlusIcon } from "./Mini.jsx";


// ── Начальные данные (заглушка, в проекте — из props / API) ───────────────
const INITIAL_HISTORY = [
    {
        id: 1,
        date: "2025-09-12",
        type: "call",
        comment: "Spoke with client. Agreed to pay the fine by September 20th.",
    },
    {
        id: 2,
        date: "2025-09-08",
        type: "email",
        comment: "Sent payment reminder. No response yet.",
    },
    {
        id: 3,
        date: "2025-08-30",
        type: "call",
        comment: "First contact. Client disputes the violation date.",
    },
];

// ── Иконка по типу контакта ───────────────────────────────────────────────
function TypeIcon({ type }) {
    return type === "call" ? <PhoneIcon size={12} /> : <MailIcon size={12} />;
}

// ── Одна запись Timeline ──────────────────────────────────────────────────
function TimelineEntry({ entry }) {
    return (
        <div className="ch-entry">
            <div className={`ch-dot ${entry.type}`}>
                <TypeIcon type={entry.type} />
            </div>
            <div className="ch-body">
                <div className="ch-meta">
                    <span className="ch-date">{entry.date}</span>
                    <span className={`ch-type-badge ${entry.type}`}>
            {entry.type === "call" ? "Call" : "Email"}
          </span>
                </div>
                <div className="ch-comment">{entry.comment}</div>
            </div>
        </div>
    );
}

// ── Форма добавления нового контакта ─────────────────────────────────────
function AddContactForm({ onAdd, onCancel }) {
    const [form, setForm] = useState({ type: "call", comment: "", date: new Date().toISOString().slice(0, 10) });
    const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    const submit = () => {
        if (!form.comment.trim()) return;
        // TODO: POST /api/contacts с данными формы
        onAdd({ id: Date.now(), ...form });
    };

    return (
        <div className="ch-form">
            <div className="ch-form-row">
                <div className="ch-form-label">Date</div>
                <input type="date" className="glass-input" value={form.date} onChange={set("date")} />
            </div>
            <div className="ch-form-row">
                <div className="ch-form-label">Type</div>
                <select className="glass-select" value={form.type} onChange={set("type")}>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                </select>
            </div>
            <div className="ch-form-row">
                <div className="ch-form-label">Result / Comment</div>
                <textarea
                    className="glass-input"
                    rows={3}
                    style={{ resize: "vertical" }}
                    placeholder="Describe the contact result…"
                    value={form.comment}
                    onChange={set("comment")}
                />
            </div>
            <div className="ch-form-footer">
                <button className="btn-danger" onClick={onCancel}>Cancel</button>
                <button className="btn-primary" onClick={submit}>Save Contact</button>
            </div>
        </div>
    );
}

// ── Главный экспортируемый компонент ─────────────────────────────────────
export default function ContactHistory({ caseId }) {
    const [history, setHistory] = useState(INITIAL_HISTORY);
    const [showForm, setShowForm] = useState(false);

    const handleAdd = (entry) => {
        setHistory((prev) => [entry, ...prev]); // новый контакт сверху
        setShowForm(false);
    };

    return (
        <>
            <div className="ch-wrap">
                <GlassCard>
                    <CardTitle>Contact History</CardTitle>

                    {/* Timeline */}
                    <div className="ch-timeline">
                        {history.map((entry) => (
                            <TimelineEntry key={entry.id} entry={entry} />
                        ))}
                    </div>

                    {/* Форма или кнопка */}
                    {showForm ? (
                        <AddContactForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
                    ) : (
                        <button className="ch-add-btn" onClick={() => setShowForm(true)}>
                            <PlusIcon /> Add New Contact
                        </button>
                    )}
                </GlassCard>
            </div>
        </>
    );
}