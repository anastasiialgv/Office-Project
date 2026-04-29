// ─────────────────────────────────────────────────────────────────────────────
// pages/ProfilePage.jsx — страница «Мой профиль»
//
// Функции:
//   • Glassmorphism-карточка с аватаром и ролевым бейджем
//   • Inline-редактирование каждого поля (иконка карандаша → инпут → галочка)
//   • Модальное окно «Change Password»
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
    TopBar, GlassCard, Modal,
    PencilIcon, CheckIcon, UserIcon,
} from "../components/Mini.jsx";


// ── Компонент редактируемого поля ─────────────────────────────────────────
function EditableField({ label, value, onChange }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const confirm = () => {
        onChange(draft);
        setEditing(false);
    };
    const cancel = () => {
        setDraft(value);
        setEditing(false);
    };

    return (
        <div className="edit-field">
            <span className="edit-label">{label}</span>

            {editing ? (
                /* Режим редактирования */
                <div className="edit-controls">
                    <input
                        className="glass-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") confirm(); if (e.key === "Escape") cancel(); }}
                        autoFocus
                    />
                    <button className="icon-btn confirm" onClick={confirm} title="Сохранить">
                        <CheckIcon />
                    </button>
                </div>
            ) : (
                /* Режим просмотра */
                <>
                    <span className="edit-value">{value}</span>
                    <button className="icon-btn" onClick={() => { setDraft(value); setEditing(true); }} title="Редактировать">
                        <PencilIcon />
                    </button>
                </>
            )}
        </div>
    );
}

// ── Модальное окно смены пароля ───────────────────────────────────────────
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
        // TODO: PATCH /api/auth/change-password
        onClose();
    };

    return (
        <Modal title="Change Password" onClose={onClose}>
            <div className="pwd-field">
                <div className="pwd-label">Current password</div>
                <input type="password" className="glass-input" value={form.current} onChange={set("current")} />
            </div>
            <div className="pwd-field">
                <div className="pwd-label">New password</div>
                <input type="password" className="glass-input" value={form.next} onChange={set("next")} />
            </div>
            <div className="pwd-field">
                <div className="pwd-label">Confirm new password</div>
                <input type="password" className="glass-input" value={form.confirm} onChange={set("confirm")} />
            </div>

            {error && (
                <div style={{ fontSize: 12, color: "var(--accent-red)", marginTop: 8 }}>{error}</div>
            )}

            <div className="pwd-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmit}>Confirm</button>
            </div>
        </Modal>
    );
}

// ── Главный компонент страницы ────────────────────────────────────────────
export default function ProfilePage(onMenuClick) {
    // Данные профиля (в реальном проекте — из контекста / API)
    const [profile, setProfile] = useState({
        fullName:  "John Mille",
        email:     "johnmille@gmail.com",
        phone:     "+48 601 234 567",
        role:      "Employee",
    });

    const [showPwdModal, setShowPwdModal] = useState(false);

    // Обновляем одно поле профиля
    const updateField = (key) => (val) =>
        setProfile((p) => ({ ...p, [key]: val }));

    return (
        <>
            <div className="page-wrap">
                <TopBar title="My Profile" />

                <div className="profile-card-wrap">
                    <div className="glass-card">

                        {/* Шапка — аватар, имя, роль */}
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <UserIcon size={36} />
                            </div>
                            <div className="profile-name">{profile.fullName}</div>
                            <div className="role-badge">{profile.role}</div>
                        </div>

                        {/* Редактируемые поля */}
                        <EditableField label="Full Name" value={profile.fullName} onChange={updateField("fullName")} />
                        <EditableField label="Email"     value={profile.email}    onChange={updateField("email")} />
                        <EditableField label="Phone"     value={profile.phone}    onChange={updateField("phone")} />

                        {/* Поле Role — только для чтения */}
                        <div className="edit-field">
                            <span className="edit-label">Role</span>
                            <span className="edit-value" style={{ color: "var(--accent-purple)" }}>
                {profile.role}
              </span>
                        </div>

                        {/* Кнопка смены пароля */}
                        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                            <button className="btn-primary" onClick={() => setShowPwdModal(true)}>
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Модальное окно смены пароля */}
                {showPwdModal && <ChangePasswordModal onClose={() => setShowPwdModal(false)} />}
            </div>
        </>
    );
}