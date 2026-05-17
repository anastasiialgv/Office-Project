import { useState, useEffect } from "react";
import {
    GlassCard,
    Modal,
} from "../../components/Mini.jsx";
import axios from "axios";
const ROLES = ["EMPLOYEE", "ADMIN", "ACCOUNTANT"];

const ROLE_COLORS = {
    EMPLOYEE:   { color: "#6ab0ff" },
    ADMIN:      { color: "#f07070" },
    ACCOUNTANT: { color: "#6ddd8a" },
};

const STATUS_COLORS = {
    Active:   "#6ddd8a",
    Inactive: "#888",
};


/** Two-letter initials from full name */
function initials(name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar background */
const AVATAR_COLORS = ["#7c5cbf", "#5b7abf", "#5ba08c", "#8c5b8c", "#bf7c5c", "#5c8cbf", "#7cbf5c", "#bf5c7c"];
const getUserId = (user) => {
    if (!user) return "0";
    return user.userId || user.id || "0";
};

function avatarColor(user) {
    const userIdStr = String(getUserId(user));
    const numericId = userIdStr.replace(/\D/g, "");
    const idx = (numericId ? parseInt(numericId, 10) : userIdStr.length) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx] || AVATAR_COLORS[0];
}

/** Generate a random 10-character password */
function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function RoleBadge({ role }) {
    const style = ROLE_COLORS[role] || { color: "#fff" };
    return <span className="mc-status" style={style}>{role}</span>;
}

function Avatar({ user }) {
    return (
        <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: avatarColor(user), // ПЕРЕДАЕМ ВЕСЬ ОБЪЕКТ user
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
            flexShrink: 0, letterSpacing: "0.03em",
        }}>
            {initials(user.name || "Unknown")}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Reset Password Modal
// ─────────────────────────────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }) {
    const [step, setStep] = useState("confirm"); // confirm | success
    const [newPass, setNewPass] = useState("");
    const [copied, setCopied] = useState(false);

    const handleReset = async () => {
        const generated = generatePassword();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/office/admin/user/${user.userId || user.id}/reset-password`,
                { password: generated },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewPass(generated);
            setStep("success");
        } catch (e) {
            alert("Error resetting password");
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(newPass).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <Modal title={step === "confirm" ? "Reset Password" : "New Password Generated"} onClose={onClose}>
            {step === "confirm" ? (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: 40, marginBottom: 15 }}>🔐</div>
                    <div style={{ color: "#fff", fontWeight: 600, marginBottom: 10 }}>
                        Are you sure you want to reset password for {user.name}?
                    </div>
                    <div style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 25 }}>
                        The old password will stop working immediately.
                    </div>
                    <div className="ap-footer" style={{ justifyContent: "center" }}>
                        <button className="btn-danger" onClick={onClose}>Cancel</button>
                        <button className="btn-primary" onClick={handleReset}>Yes, Reset It</button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ color: "var(--accent-green)", fontWeight: 600, marginBottom: 15, textAlign: "center" }}>
                        ✓ Password has been reset successfully!
                    </div>
                    <div className="ap-field">
                        <div className="ap-label">Temporary Password</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                className="glass-input"
                                readOnly
                                value={newPass}
                                style={{ fontFamily: "monospace", textAlign: "center", fontSize: 16 }}
                            />
                            <button className="btn-primary" onClick={handleCopy}>
                                {copied ? "✓" : "📋"}
                            </button>
                        </div>
                    </div>
                    <div style={{ color: "var(--accent-orange)", fontSize: 12, marginTop: 15 }}>
                        ⚠ Please copy and send this password to the user. It won't be shown again.
                    </div>
                    <div className="ap-footer">
                        <button className="btn-primary" onClick={onClose} style={{ width: "100%" }}>Done</button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create User Modal
// ─────────────────────────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onCreate }) {
    const [form, setForm] = useState({ name: "", surname: "", email: "", phone: "", role: "EMPLOYEE", password: "" });
    const [copied, setCopied] = useState(false);
    const [err, setErr] = useState("");

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErr(""); };

    const handleGenerate = () => { set("password", generatePassword()); setCopied(false); };

    const handleCopy = () => {
        if (!form.password) return;
        navigator.clipboard.writeText(form.password).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };


    const handleSaveUser = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:8080/office/admin/user", { ...form, active: true }, { headers: { Authorization: `Bearer ${token}` } });
            onCreate(); onClose();
        } catch (e) {
            console.error("Бэкенд ругается тут:", e.response?.data);
            setErr("Error: " + (e.response?.data?.message || "Check fields")); }
    };

    return (
        <Modal title="Add New User" onClose={onClose}>
            <div className="ap-field">
                <div className="ap-label">Name</div>
                <input className="glass-input" placeholder="Jan" value={form.name}
                       onChange={e => set("name", e.target.value)}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Surname</div>
                <input className="glass-input" placeholder="Kowalski" value={form.surname}
                       onChange={e => set("surname", e.target.value)}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Email</div>
                <input className="glass-input" type="email" placeholder="jan@legaldesk.pl" value={form.email}
                       onChange={e => set("email", e.target.value)}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Phone</div>
                <input className="glass-input" placeholder="000 000 000" value={form.phone}
                       onChange={e => set("phone", e.target.value)}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Role</div>
                <select className="glass-select" value={form.role} onChange={e => set("role", e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div className="ap-field">
                <div className="ap-label">Password</div>
                <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                    <input className="glass-input" style={{flex: 1, fontFamily: "monospace"}} type="text"
                           value={form.password} readOnly placeholder="Generate password ->"/>
                    <button className="btn-primary" onClick={handleGenerate}>✨</button>
                    <button className="btn-primary" onClick={handleCopy}>{copied ? "✓" : "📋"}</button>
                </div>
            </div>
            {err && <div className="ap-error">{err}</div>}
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveUser}>Create User</button>
            </div>
        </Modal>
    );
}

function EditUserModal({user, onClose, onSave}) {
    const [role, setRole] = useState(user.role);
    const [isActive, setIsActive] = useState(user.active);
    const [confirm, setConfirm] = useState(false);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            // Отправляем PUT запрос на бэкенд
            await axios.put(`http://localhost:8080/office/admin/user/${user.userId || user.id}`,
                { role, active: isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onSave();
            onClose();
        } catch (e) {
            alert("Error updating user");
        }
    };

    const wantsDeactivate = !isActive && user.active;

    return (
        <Modal title={`Edit — ${user.name}`} onClose={onClose}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                <Avatar user={user} />
                <div><div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div></div>
            </div>
            <div className="ap-field">
                <div className="ap-label">Role</div>
                <select className="glass-select" value={role}
                        onChange={e => setRole(e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
            </div>
            <div className="ap-field">
                <div className="ap-label">Account Status</div>
                <select className="glass-select" value={isActive ? "Active" : "Inactive"}
                        onChange={e =>
                        { setIsActive(e.target.value === "Active"); setConfirm(false); }}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                </select>
            </div>
            {wantsDeactivate && (
                <div style={{ background: "rgba(240,112,112,0.08)", border: "1px solid rgba(240,112,112,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                    <div style={{ fontSize: 12, color: "var(--accent-red)", marginBottom: 4 }}>⚠ Confirm account deactivation?</div>
                    <input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} /> Confirm
                </div>
            )}
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave} disabled={wantsDeactivate && !confirm}>Save Changes</button>
            </div>
        </Modal>
    );
}

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleF] = useState(null);
    const [showCreate, setCreate] = useState(false);
    const [editTarget, setEditTgt] = useState(null);
    const [resetTarget, setResetTgt] = useState(null); // Состояние для сброса пароля

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/office/admin/users", { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = users.filter(u => {
        if (!u) return false;

        const userName = u.name || "";
        const userEmail = u.email || "";

        if (roleFilter && u.role !== roleFilter) return false;

        const q = search.toLowerCase();
        return userName.toLowerCase().includes(q) || userEmail.toLowerCase().includes(q);
    });

    if (loading) return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>;

    return (
        <>
            <div className="adm-stat-row">
                {[{label: "Total Users", value: users.length, color: "var(--accent-purple)"}, {
                    label: "Active",
                    value: users.filter(u => u && u.active).length,
                    color: "var(--accent-green)"
                }, {
                    label: "Admins",
                    value: users.filter(u => u && u.role === "ADMIN").length,
                    color: "var(--accent-red)"
                }].map(s => (
                    <div key={s.label} className="adm-stat-chip">
                        <span className="adm-stat-value" style={{color: s.color}}>{s.value}</span>
                        <span className="adm-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="adm-toolbar">
                <input className="glass-input adm-search" placeholder="Search..." value={search}
                       onChange={e => setSearch(e.target.value)}/>
                <button className="btn-primary" onClick={() => setCreate(true)}>+ Add User</button>
            </div>
            <div className="adm-filter-row">
                <div
                    className={`adm-filter-chip ${roleFilter === null ? "active" : ""}`}
                    onClick={() => setRoleF(null)}
                >
                    All Roles
                </div>
                {ROLES.map(r => (
                    <div
                        key={r}
                        className={`adm-filter-chip ${roleFilter === r ? "active" : ""}`}
                        onClick={() => setRoleF(r)}
                    >
                        <span className="adm-chip-dot" style={{background: ROLE_COLORS[r]?.color}}/>
                        {r}
                    </div>
                ))}
            </div>

            <div style={{padding: "0 20px 40px"}}>
                <GlassCard>
                    <div className="adm-table-head" style={{gridTemplateColumns: "2fr 1.5fr 120px 100px 180px"}}>
                        <span>User</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span>
                    </div>
                    {filtered.map((u, i) => (
                        <div key={u.userId || u.id || i} className="adm-table-row" style={{
                            gridTemplateColumns: "2fr 1.5fr 120px 100px 180px",
                            animationDelay: `${i * 0.04}s`
                        }}>
                            <div style={{display: "flex", alignItems: "center", gap: 10}}><Avatar user={u}/> <span
                                style={{fontWeight: 600, fontSize: 13}}>{u.name}</span></div>
                            <span style={{fontSize: 12, color: "var(--text-muted)"}}>{u.email}</span>
                            <RoleBadge role={u.role}/>
                            <span style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: u.active ? "#6ddd8a" : "#888"
                            }}>
                                ● {u.active ? "Active" : "Inactive"}
                            </span>
                            <div style={{display: "flex", gap: 8}}>
                                <button className="adm-btn-ghost" style={{padding: "5px 10px", fontSize: 11}}
                                        onClick={() => setEditTgt(u)}>Edit
                                </button>
                                <button className="adm-btn-ghost"
                                        style={{padding: "5px 10px", fontSize: 11, color: "var(--accent-orange)"}}
                                        onClick={() => setResetTgt(u)}>Reset Password
                                </button>
                            </div>
                        </div>
                    ))}
                </GlassCard>
            </div>

            {showCreate && <CreateUserModal onClose={() => setCreate(false)} onCreate={u => setUsers(p => [u, ...p])}/>}
            {editTarget && <EditUserModal user={editTarget} onClose={() => setEditTgt(null)}
                                          onSave={() => fetchUsers()}/>}
            {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTgt(null)}/>}
        </>
    );
}