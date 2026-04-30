import { useState } from "react";
import {
    TopBar, GlassCard, Modal,
    PencilIcon, CheckIcon, UserIcon,
} from "../components/Mini.jsx";

// ── Компонент редактируемого поля (оставляем без изменений) ──
function EditableField({ label, value, onChange }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const confirm = () => { onChange(draft); setEditing(false); };
    const cancel = () => { setDraft(value); setEditing(false); };

    return (
        <div className="profile-edit-row">
            <div className="profile-info-block">
                <span className="profile-label">{label}</span>
                {editing ? (
                    <input
                        className="glass-input profile-input-edit"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancel(); }}
                        autoFocus
                    />
                ) : (
                    <span className="profile-value">{value}</span>
                )}
            </div>
            <button className="icon-btn" onClick={() => editing ? confirm() : setEditing(true)}>
                {editing ? <CheckIcon size={16} /> : <PencilIcon size={16} />}
            </button>
        </div>
    );
}

// ── Модальное окно смены пароля (восстановленная логика) ──
function ChangePasswordModal({ onClose }) {
    const [form, setForm] = useState({ current: "", next: "", confirm: "" });
    const [error, setError] = useState("");

    const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

    const handleSubmit = () => {
        if (!form.current || !form.next || !form.confirm) {
            setError("Fill in all fields"); return;
        }
        if (form.next !== form.confirm) {
            setError("New passwords do not match"); return;
        }
        if (form.next.length < 6) {
            setError("Password must be at least 6 characters"); return;
        }
        // Здесь будет API запрос
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="pwd-field">
                <div className="pwd-label">Current password</div>
                <input type="password" psychological className="glass-input" value={form.current} onChange={set("current")} />
            </div>
            <div className="pwd-field">
                <div className="pwd-label">New password</div>
                <input type="password" psychological className="glass-input" value={form.next} onChange={set("next")} />
            </div>
            <div className="pwd-field">
                <div className="pwd-label">Confirm new password</div>
                <input type="password" psychological className="glass-input" value={form.confirm} onChange={set("confirm")} />
            </div>
            {error && <div style={{ fontSize: 12, color: "var(--accent-red)", marginTop: 8 }}>{error}</div>}
            <div className="profile-actions" style={{ marginTop: 20 }}>
                <button className="btn-danger flex-1" onClick={onClose}>Cancel</button>
                <button className="btn-primary flex-1" onClick={handleSubmit}>Confirm</button>
            </div>
        </Modal>
    );
}

export default function ProfilePage({ onMenuClick }) {
    const [profile, setProfile] = useState({
        fullName: "John Mille",
        email: "johnmille@gmail.com",
        phone: "+48 601 234 567",
        role: "Employee",
    });

    const [showPwdModal, setShowPwdModal] = useState(false); // Состояние для окна

    const updateField = (key) => (val) => setProfile((p) => ({ ...p, [key]: val }));

    return (
        <div className="page-wrap">
            <TopBar title="Profile" onMenuClick={onMenuClick} />

            <div className="profile-container">
                <GlassCard className="profile-narrow-card">
                    <div className="profile-header-centered">
                        <div className="profile-avatar-large">
                            <UserIcon size={48} />
                        </div>
                        <div className="profile-role-text">{profile.role}</div>
                    </div>

                    <div className="profile-fields-list">
                        <EditableField label="Full Name" value={profile.fullName} onChange={updateField("fullName")} />
                        <EditableField label="Email" value={profile.email} onChange={updateField("email")} />
                        <EditableField label="Phone" value={profile.phone} onChange={updateField("phone")} />
                    </div>

                    {/* Кнопки как на макете[cite: 19] */}
                    <div className="profile-actions">
                        <button className="btn-primary flex-1" onClick={() => setShowPwdModal(true)}>
                            Change Password
                        </button>
                        <button className="btn-danger flex-1">Logout</button>
                    </div>
                </GlassCard>
            </div>

            {/* Вызов модального окна[cite: 19] */}
            {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}
        </div>
    );
}