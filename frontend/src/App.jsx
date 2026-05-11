import './App.css';
import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import CasesList from "./pages/employee/Case/CaseList.jsx";
import CaseDetail from "./pages/employee/Case/CaseDetail.jsx";
import Profile from "./pages/Profile";
import Files from "./pages/employee/File/Files.jsx";
import FileDetail from "./pages/employee/File/FileDetail.jsx";
import Statistics from "./pages/accountant/Statistics.jsx";
import Contacts from "./pages/employee/Contact/Contacts.jsx";
import ContactDetail from "./pages/employee/Contact/ContactDetail.jsx";

// Список ссылок для меню
const NAV_ITEMS = [
    { path: "/cases",   label: "Cases",   icon: "⚖️" },
    { path: "/files",   label: "Files",   icon: "📁" },
    { path: "/contacts", label: "My Contacts", icon: "📞"},
    { path: "/profile", label: "Profile", icon: "👤" }
];

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <BrowserRouter>
            <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>×</button>
                <div className="sidebar-menu">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
            )}

            <Routes>
                <Route path="/" element={<CasesList onMenuClick={toggleSidebar} />} />

                <Route path="/cases" element={<CasesList onMenuClick={toggleSidebar} />} />

                <Route path="/cases/:id" element={<CaseDetail />} />

                <Route path="/files" element={<Files onMenuClick={toggleSidebar} />} />

                <Route path="/files/:id" element={<FileDetail />} />

                <Route path="/contacts" element={<Contacts onMenuClick={toggleSidebar} />} />

                <Route path="/contacts/:id" element={<ContactDetail />} />

                <Route path="/profile" element={<Profile onMenuClick={toggleSidebar} />} />

                <Route path="/statistics" element={<Statistics onMenuClick={toggleSidebar} />} />

            </Routes>
        </BrowserRouter>
    );
}