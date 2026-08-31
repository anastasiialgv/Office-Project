import React, { useState } from 'react';
import { GlassCard } from "../../components/Mini.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../api/index.jsx";
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.post("/office/login", { email, password });
            const { token, role, userId } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", userId);

            if (role === "ADMIN") {
                navigate("/admin/cases");
            } else if (role === "EMPLOYEE") {
                navigate("/cases");
            } else if (role === "ACCOUNTANT") {
                navigate("/accountant/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="login-wrap">
            <GlassCard className="login-card">
                <div className="login-logo">LegalFlow ✨</div>
                <div className="login-subtitle">Management System Access</div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-input-group">
                        <label className="mc-fl">Email Address</label>
                        <input
                            type="email"
                            className="glass-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="login-input-group">
                        <div className="login-password-label-wrapper">
                            <label className="mc-fl">Password</label>
                        </div>
                        <input
                            type="password"
                            className="glass-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: "var(--accent-red, #ff6b6b)",
                            fontSize: "13px",
                            marginTop: "-4px",
                            marginBottom: "12px",
                            textAlign: "center"
                        }}>
                            {error}
                        </div>
                    )}


                    <button type="submit" className="btn-doc login-btn" >
                        Sign In
                    </button>
                </form>

                <div className="login-footer">
                    Don't have an account? <a>Please, contact Admin</a>
                </div>
            </GlassCard>
        </div>
    );
}