// ─────────────────────────────────────────────────────────────────────────────
// pages/DashboardPage.jsx — страница «Statistics / Dashboard»
//
// Функции:
//   • Bento Grid: 4 маленьких stat-карточки + большой SVG-график
//   • Вертикальный bar-chart активности за неделю (чистый SVG, без библиотек)
//   • Shimmer-анимация на всех карточках
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { TopBar, GlassCard } from "../components/Mini.jsx";



// ── Данные статистики ─────────────────────────────────────────────────────
const STATS = [
    {
        key: "total",
        label: "Total Cases",
        value: 500,
        delta: "+12 this month",
        dir: "up",
        color: "rgba(167,139,250,0.22)",
        textColor: "var(--accent-purple)",
        icon: "⚖️",
    },
    {
        key: "tasks",
        label: "My Tasks",
        value: 18,
        delta: "3 due today",
        dir: "down",
        color: "rgba(106,176,255,0.2)",
        textColor: "var(--accent-blue)",
        icon: "📋",
    },
    {
        key: "fines",
        label: "Fines Collected",
        value: "42 400",
        delta: "+8% vs last month",
        dir: "up",
        color: "rgba(109,221,138,0.18)",
        textColor: "var(--accent-green)",
        icon: "💰",
    },
    {
        key: "pending",
        label: "Pending Payments",
        value: 37,
        delta: "−5 since last week",
        dir: "up",
        color: "rgba(255,160,60,0.18)",
        textColor: "var(--accent-orange)",
        icon: "⏳",
    },
];

// ── Данные для графика (7 дней) ───────────────────────────────────────────
const WEEK_DATA = [
    { day: "Mon", cases: 12, fines: 8 },
    { day: "Tue", cases: 19, fines: 14 },
    { day: "Wed", cases: 8,  fines: 5  },
    { day: "Thu", cases: 22, fines: 18 },
    { day: "Fri", cases: 15, fines: 11 },
    { day: "Sat", cases: 6,  fines: 4  },
    { day: "Sun", cases: 3,  fines: 2  },
];

// ── SVG Bar Chart ─────────────────────────────────────────────────────────
function WeeklyChart() {
    const [hoveredBar, setHoveredBar] = useState(null);

    const W = 600, H = 180;
    const PADDING = { left: 32, right: 16, top: 16, bottom: 28 };
    const chartW = W - PADDING.left - PADDING.right;
    const chartH = H - PADDING.top - PADDING.bottom;

    const maxVal = Math.max(...WEEK_DATA.flatMap((d) => [d.cases, d.fines]));
    const barGroupW = chartW / WEEK_DATA.length;
    const barW = barGroupW * 0.32;
    const gap  = barGroupW * 0.06;

    const yScale = (v) => chartH - (v / maxVal) * chartH;

    return (
        <div style={{ position: "relative" }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="db-chart-svg"
                style={{ display: "block" }}
            >
                {/* Горизонтальные направляющие */}
                {[0.25, 0.5, 0.75, 1].map((t) => {
                    const y = PADDING.top + yScale(maxVal * t);
                    return (
                        <g key={t}>
                            <line
                                x1={PADDING.left} y1={y}
                                x2={W - PADDING.right} y2={y}
                                stroke="rgba(255,255,255,0.07)" strokeWidth="1"
                            />
                            <text
                                x={PADDING.left - 6} y={y + 3}
                                textAnchor="end"
                                className="db-axis-label"
                            >
                                {Math.round(maxVal * t)}
                            </text>
                        </g>
                    );
                })}

                {/* Бары */}
                {WEEK_DATA.map((d, i) => {
                    const groupX = PADDING.left + i * barGroupW + barGroupW / 2;
                    const x1 = groupX - barW - gap / 2;
                    const x2 = groupX + gap / 2;

                    const h1 = (d.cases / maxVal) * chartH;
                    const h2 = (d.fines / maxVal) * chartH;
                    const y1 = PADDING.top + chartH - h1;
                    const y2 = PADDING.top + chartH - h2;

                    const isHov = hoveredBar === i;

                    return (
                        <g key={d.day}
                           onMouseEnter={() => setHoveredBar(i)}
                           onMouseLeave={() => setHoveredBar(null)}
                        >
                            {/* Cases bar */}
                            <rect
                                className="db-bar"
                                x={x1} y={y1} width={barW} height={h1}
                                rx="4"
                                fill={isHov ? "#a78bfa" : "rgba(167,139,250,0.6)"}
                            />
                            {/* Fines bar */}
                            <rect
                                className="db-bar"
                                x={x2} y={y2} width={barW} height={h2}
                                rx="4"
                                fill={isHov ? "#6ddd8a" : "rgba(109,221,138,0.55)"}
                            />

                            {/* Значения при hover */}
                            {isHov && (
                                <>
                                    <text className="db-bar-val" x={x1 + barW / 2} y={y1 - 4}>{d.cases}</text>
                                    <text className="db-bar-val" x={x2 + barW / 2} y={y2 - 4}>{d.fines}</text>
                                </>
                            )}

                            {/* Подпись дня */}
                            <text
                                className="db-axis-label"
                                x={groupX} y={H - 6}
                                textAnchor="middle"
                            >
                                {d.day}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Легенда */}
            <div className="db-chart-legend">
                <div className="db-legend-item">
                    <div className="db-legend-dot" style={{ background: "rgba(167,139,250,0.8)" }} />
                    Cases
                </div>
                <div className="db-legend-item">
                    <div className="db-legend-dot" style={{ background: "rgba(109,221,138,0.8)" }} />
                    Fines Collected
                </div>
            </div>
        </div>
    );
}

// ── Stat-карточка ─────────────────────────────────────────────────────────
function StatCard({ stat }) {
    return (
        <GlassCard>
            <div className="db-stat">
                <div className="db-stat-icon" style={{ background: stat.color }}>
                    <span style={{ fontSize: 17 }}>{stat.icon}</span>
                </div>
                <div className="db-stat-value" style={{ color: stat.textColor }}>
                    {stat.value}
                </div>
                <div className="db-stat-label">{stat.label}</div>
                <div className={`db-stat-delta ${stat.dir}`}>{stat.delta}</div>
            </div>
            <button className="card-arr-btn" aria-label="Open">→</button>
        </GlassCard>
    );
}

// ── Главный компонент ─────────────────────────────────────────────────────
export default function DashboardPage(onMenuClick) {
    return (
        <>
            <div className="page-wrap">
                <TopBar title="Statistics" />

                <div className="db-grid">
                    {/* 4 маленьких stat-карточки */}
                    {STATS.map((s) => (
                        <StatCard key={s.key} stat={s} />
                    ))}

                    {/* Большой график — на всю ширину */}
                    <GlassCard className="db-chart-card" style={{ padding: "20px 22px 24px" }}>
                        <div className="db-chart-head">
                            <span className="db-chart-title">Weekly Activity</span>
                            <span className="db-chart-period">This week</span>
                        </div>
                        <WeeklyChart />
                    </GlassCard>
                </div>
            </div>
        </>
    );
}