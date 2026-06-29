import { useEffect, useState } from "react";
import { GlassCard, CardTitle } from "../../components/Mini.jsx";
import axios from "axios";
import Loader from "../../components/Loader.jsx";

const API_BASE = "http://localhost:8080/office/reports";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timePeriod, setTimePeriod] = useState("month"); // 'week' | 'month' | 'year'

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE}/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (e) {
                console.error("Error loading dashboard stats:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <Loader />;
    if (!stats) return <div style={{ color: "#fff", padding: 40, textAlign: "center" }}>No data connection.</div>;

    const activeChartData = stats.charts[timePeriod] || [];
    const maxVal = Math.max(...activeChartData.map(d => d.revenue), 1);

    return (
        <div style={{ padding: "30px 20px", display: "flex", flexDirection: "column", gap: "25px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                <GlassCard style={{ textAlign: "center", padding: "25px", borderLeft: "4px solid var(--accent-green)" }}>
                    <div style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: "600", letterSpacing: "1px" }}>PAID FINES</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>{stats.paidCount} cases</div>
                </GlassCard>

                <GlassCard style={{ textAlign: "center", padding: "25px", borderLeft: "4px solid var(--accent-red, #ff4a4a)" }}>
                    <div style={{ fontSize: "11px", color: "#ff4a4a", fontWeight: "600", letterSpacing: "1px" }}>UNPAID FINES</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>{stats.unpaidCount} cases</div>
                </GlassCard>

                <GlassCard style={{ textAlign: "center", padding: "25px", borderLeft: "4px solid var(--accent-orange)" }}>
                    <div style={{ fontSize: "11px", color: "var(--accent-orange)", fontWeight: "600", letterSpacing: "1px" }}>TOTAL REVENUE</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", marginTop: "8px", color: "#fff" }}>{Number(stats.totalRevenue).toFixed(2)} PLN</div>
                </GlassCard>
            </div>

            <GlassCard style={{padding: "25px"}}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "25px"
                }}>
                    <CardTitle style={{margin: 0}}>📊 Revenue Inflow Analytics</CardTitle>

                    <div style={{
                        display: "flex",
                        gap: "5px",
                        background: "rgba(255,255,255,0.05)",
                        padding: "4px",
                        borderRadius: "8px"
                    }}>
                        {["week", "month", "year"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setTimePeriod(p)}
                                style={{
                                    padding: "6px 14px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: timePeriod === p ? "var(--accent-orange, #ffa500)" : "transparent",
                                    color: "#fff",
                                    transition: "0.2s"
                                }}
                            >
                                {p.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    height: "150px",
                    padding: "0 20px",
                    paddingTop: "20px"
                }}>
                    {activeChartData.map((bar, i) => (
                        <div key={i} style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flex: 1,
                            gap: "10px"
                        }}>
                            <span style={{fontSize: "10px", color: "#aaa"}}>{Math.round(bar.revenue)} PLN</span>
                            <div style={{
                                width: "35px",
                                height: `${Math.max((bar.revenue / maxVal) * 100, 20)}px`, // Исходный расчет высоты
                                background: "linear-gradient(to top, rgba(74, 226, 137, 0.2), var(--accent-green))", // Тот самый зеленый градиент
                                borderRadius: "6px 6px 0 0",
                                boxShadow: "0 0 10px rgba(74, 226, 137, 0.3)" // Фирменное свечение
                            }}/>
                            <span style={{fontSize: "12px", fontWeight: "600", color: "#fff"}}>{bar.label}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}