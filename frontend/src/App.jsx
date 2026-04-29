// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — корневой компонент.
// Простая навигация без react-router (замени на Router при необходимости).
// ─────────────────────────────────────────────────────────────────────────────
import './App.css';
import { useState } from "react";
import CasesList    from "./pages/CaseList";
import CaseDetail   from "./pages/CaseDetail";
import ProfilePage  from "./pages/Profile";
import DashboardPage from "./pages/Dashboard";

// Нижняя навигация (Tab Bar)
const NAV_ITEMS = [
    { key: "cases",     label: "Cases",     icon: "⚖️" },
    { key: "dashboard", label: "Stats",     icon: "📊" },
    { key: "profile",   label: "Profile",   icon: "👤" },
];


export default function App() {
    const [tab, setTab]         = useState("cases");       // текущая вкладка
    const [detailCase, setCase] = useState(null);          // кейс для CaseDetail
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar

    const openCase = (c)  => { setCase(c); setTab("detail"); };
    const closeCase = ()  => { setCase(null); setTab("cases"); };

    return (
        <>
            <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <button onClick={() => setIsSidebarOpen(false)}>Close ×</button>
                <nav>
                    <button onClick={() => {
                        setTab("cases");
                        setIsSidebarOpen(false);
                    }}>Cases
                    </button>
                    <button onClick={() => {
                        setTab("dashboard");
                        setIsSidebarOpen(false);
                    }}>Stats
                    </button>
                    <button onClick={() => {
                        setTab("profile");
                        setIsSidebarOpen(false);
                    }}>Profile
                    </button>
                </nav>
            </div>

            {/* 3. Оверлей для закрытия */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}/>}

            {/* ── Страницы ── */}
            {/* Передаем onMenuClick в каждую страницу */}
            {tab === "cases" && (
                <CasesList
                    onSelect={openCase}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
            )}

            {tab === "detail" && (
                <CaseDetail
                    caseData={detailCase}
                    onBack={closeCase}
                />
            )}

            {tab === "dashboard" && (
                <DashboardPage
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
            )}

            {tab === "profile" && (
                <ProfilePage
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
            )}
        </>

)
    ;
}


{/*/!* ── Tab Bar (не показываем на детальной странице) ── *!/*/
}
{/*{tab !== "detail" && (*/
}
{/*    <div className="tab-bar">*/
}
{/*        {NAV_ITEMS.map((item) => (*/
}
{/*            <button*/
}
{/*                key={item.key}*/
}
{/*                className={`tab-item ${tab === item.key ? "active" : ""}`}*/
}
{/*                onClick={() => setTab(item.key)}*/
}
{/*            >*/
}
{/*                <span className="tab-item-icon">{item.icon}</span>*/
}
{/*                {item.label}*/
}
{/*            </button>*/
}
{/*        ))}*/
}
{/*    </div>*/
}