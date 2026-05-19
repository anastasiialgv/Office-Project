import React, { useState } from 'react';
import { GlassCard } from "../../components/Mini.jsx";
import { useNavigate } from "react-router-dom"; // Для редиректа
import api from "../../api";
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // Чтобы страница не перезагружалась
        setError("");

        try {
            const response = await api.post("/office/login", { email, password });

            // 2. Достаем токен и роль из ответа (структура зависит от твоего бэка)
            const { token, role, userId } = response.data;

            // 3. Сохраняем самое важное в браузер
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            localStorage.setItem("userId", userId);

            if (role === "ADMIN") {
                navigate("/admin/cases");
            } else if (role === "EMPLOYEE") {
                navigate("/cases");
            } else if (role === "ACCOUNTANT") {
                navigate("/accountant/stats");
            }
        } catch (err) {
            // Если пароль неверный или юзер не найден
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
                        <label className="mc-fl" style={{ marginBottom: '8px', display: 'block' }}>Email Address</label>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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

                    <button type="submit" className="btn-doc login-btn" style={{ background: 'var(--accent-purple)', color: '#fff' }}>
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