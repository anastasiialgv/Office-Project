import './App.css';
import { useState } from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";

import CasesList from "./pages/employee/Case/CaseList.jsx";
import CaseDetail from "./pages/employee/Case/CaseDetail.jsx";
import Profile from "./pages/account/Profile.jsx";
import Files from "./pages/employee/File/Files.jsx";
import FileDetail from "./pages/employee/File/FileDetail.jsx";
import Statistics from "./pages/accountant/Statistics.jsx";
import Contacts from "./pages/employee/Contact/Contacts.jsx";
import ContactDetail from "./pages/employee/Contact/ContactDetail.jsx";
import DocumentGenerator from "./pages/employee/Case/DocumentGenerator.jsx";

import caseData from "../test/caseData.jsx";
import Login from "./pages/account/Login.jsx";
import AdminCases from "./pages/admin/Cases.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import {AdminTopBar, Sidebar, TopBar} from "./components/Mini.jsx";
// Список ссылок для меню
const NAV_ITEMS = [
    { path: "/cases",   label: "Cases",   icon: "⚖️" },
    { path: "/files",   label: "Files",   icon: "📁" },
    { path: "/contacts", label: "My Contacts", icon: "📞"},
    { path: "/generator", label: "Generator", icon: "✨" },
    { path: "/profile", label: "Profile", icon: "👤" }
];
function EmployeeLayout({ children, title }) {

    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="page-wrap">
            {/* Сайдбар общий для всех сотрудников */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} navItems={NAV_ITEMS} />

            {/* Передаем title в TopBar, чтобы он менялся */}
            <TopBar
                title={title || "LegalDesk"}
                onMenuClick={() => setSidebarOpen(true)}
            />

            <div className="page-body">
                {children}
            </div>
        </div>
    );
}

// Оболочка для Админа (с TopBar-кнопками)
function AdminLayout({ children }) {
    return (
        <div className="admin-shell">
            <AdminTopBar />
            <main>{children}</main>
        </div>
    );
}

// Оболочка для Бухгалтера (будущая)
function AccountantLayout({ children }) {
    return (
        <div className="acc-shell">
            <div className="acc-topbar">📊 Отчеты и Статистика</div>
            <main>{children}</main>
        </div>
    );
}

export default function App() {

    return (
        <BrowserRouter>
            <Routes>
                {/* ЛОГИН (без ничего) */}
                <Route path="/" element={<Login />} />

                {/* СТРАНИЦЫ АДМИНА */}
                <Route path="/admin/*" element={
                    <AdminLayout>
                        <Routes>
                            <Route path="cases" element={<AdminCases />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="/profile" element={<Profile />} />
                        </Routes>
                    </AdminLayout>
                } />

                {/* СТРАНИЦЫ СОТРУДНИКА */}
                <Route path="/cases" element={
                    <EmployeeLayout title="Cases">
                        <CasesList />
                    </EmployeeLayout>
                } />
                <Route path="/cases/:id" element={
                    <EmployeeLayout title="Case Detail">
                        <CaseDetail caseData={caseData}/>
                    </EmployeeLayout>
                } />

                <Route path="/generator" element={
                    <EmployeeLayout title="Document Generator">
                        <DocumentGenerator caseData={caseData}/>
                    </EmployeeLayout>
                } />

                <Route path="/files" element={
                    <EmployeeLayout title="Files">
                        <Files />
                    </EmployeeLayout>
                } />
                <Route path="/files/:id" element={
                    <EmployeeLayout title="FileDetail">
                        <FileDetail />
                    </EmployeeLayout>
                } />

                <Route path="/contacts" element={
                    <EmployeeLayout title="Contacts">
                        <Contacts />
                    </EmployeeLayout>
                } />
                <Route path="/contacts/:id" element={
                    <EmployeeLayout title="Contact Detail">
                        <ContactDetail />
                    </EmployeeLayout>
                } />

                <Route path="/profile" element={
                    <EmployeeLayout title="Profile">
                        <Profile />
                    </EmployeeLayout>
                } />


                {/* СТРАНИЦЫ БУХГАЛТЕРА (когда начнешь делать) */}
                <Route path="/accountant/*" element={
                    <AccountantLayout>
                        <Routes>
                            <Route path="stats" element={<Statistics />} />
                        </Routes>
                    </AccountantLayout>
                } />
            </Routes>
        </BrowserRouter>
    );
}