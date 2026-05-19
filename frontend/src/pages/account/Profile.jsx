import { useState, useEffect } from "react";
import {GlassCard,
    PencilIcon, CheckIcon, UserIcon,
} from "../../components/Mini.jsx";
import axios from "axios";

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
                        className="glass-input"
                        style={{ textAlign: 'left', marginTop: '4px' }}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") confirm();
                            if (e.key === "Escape") cancel();
                        }}
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



export default function Profile() {
    const [profile, setProfile] = useState(null); // Изначально null
    const [loading, setLoading] = useState(true);
    const updateField = (key) => (val) => setProfile((p) => ({ ...p, [key]: val }));

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/office/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const updateProfile = async (updatedData) => {
        try {
            const token = localStorage.getItem("token");
            // Используем уже созданный нами метод PutMapping("/{employeeId}")
            await axios.put(`http://localhost:8080/office/${profile.userId || profile.id}`,
                updatedData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchProfile(); // Перезагружаем данные
        } catch (error) {
            alert("Failed to update profile");
        }
    };

    if (loading) return <div style={{color: '#fff', padding: '40px', textAlign: 'center'}}>Loading profile...</div>;
    if (!profile) return <div style={{color: '#fff', padding: '40px', textAlign: 'center'}}>Profile not found</div>;
    return (
            <div className="profile-card-wrap" style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                <GlassCard className="profile-narrow-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <UserIcon size={48} />
                        </div>
                        <div className="role-badge">{profile.role}</div>
                    </div>

                    <div className="profile-fields-list">
                        <EditableField
                            label="Name"
                            value={profile.name}
                            onChange={(val) => updateProfile({ ...profile, name: val })}
                        />
                        <EditableField
                            label="Surname"
                            value={profile.surname}
                            onChange={(val) => updateProfile({ ...profile, surname: val })}
                        />
                        <EditableField label="Email" value={profile.email}
                                       onChange={(val) => updateProfile({ ...profile, email: val })} />
                        <EditableField label="Phone" value={profile.phone}
                                       onChange={(val) => updateProfile({ ...profile, phone: val })} />
                    </div>

                    <div className="profile-actions">
                        <button className="btn-danger flex-1"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/";
                                }}>Logout</button>
                    </div>
                </GlassCard>
            </div>
    );
}