import {NavLink} from "react-router-dom";

export const STATUS_STYLES = {
    "CLOSED":              { color: "#6ddd8a" },
    "IN_PROGRESS":         { color: "#ffa03c" },
    "REGISTERED":            { color: "#c8a0ff" },
    "WAITING_FOR_CONTACT": { color: "#56ccf2" },
    "IN_COURT":            { color: "#ff65b2" },
};

export const TYPES_STYLES = {
    "PAYMENT_DEMAND_NOTICE":            { color: "#6ddd8a" },
    "PRE_LITIGATION_PAYMENT_DEMAND":    { color: "#ffa03c" },
    "NOTICE_OF_CASE_REFERRAL_TO_COURT": { color: "#f07070" },
    "OFFICIAL_NOTE":                    { color: "#6ab0ff" },
    "PAYMENT_CONFIRMATION":             { color: "#c8a0ff" },
    "CLIENT_CONTACT_REPORT":            { color: "#ff84c1" },
};

export const CONTACT_TYPES_STYLES = {
    "EMAIL":  { color: "#6ab0ff" },
    "PHONE":  { color: "#6ddd8a" },
    "LETTER": { color: "#ffa03c" },
};

export function TopBar({ title, onMenuClick }) {
    return (
        <div className="mc-topbar">
            <button className="mc-menu-btn" onClick={onMenuClick} aria-label="Menu">
                <span /><span /><span />
            </button>
            <span className="mc-page-title">{title}</span>
        </div>
    );
}

export function StatusBadge({ status, style, onClick, ...props }) {
    const normalizedStatus = status ? String(status).toUpperCase() : "";
    const baseStyle = STATUS_STYLES[normalizedStatus] || {};

    return (
        <span
            className="mc-status"
            style={{ ...baseStyle, ...style }}
            onClick={onClick}
            {...props}
        >
            {status ? String(status).replace(/_/g, " ") : ""}
        </span>
    );
}

export function TypeBadge({ type }) {
    const normalizedType = type ? String(type).toUpperCase() : "";
    const style = TYPES_STYLES[normalizedType] || {};

    return (
        <span className="mc-status" style={style}>
            {type ? String(type).replace(/_/g, " ") : ""}
        </span>
    );
}

export function ContactTypeBadge({ type }) {
    const normalizedType = type ? String(type).toUpperCase() : "";
    const style = CONTACT_TYPES_STYLES[normalizedType] || {};

    return (
        <span className="mc-status" style={style}>
            {type ? String(type).replace(/_/g, " ") : ""}
        </span>
    );
}

export function GlassCard({ children, style, className = "" }) {
    return (
        <div className={`glass-card ${className}`} style={style}>
            {children}
        </div>
    );
}

export function CardTitle({ children }) {
    return <div className="card-title">{children}</div>;
}

export function Field({ label, children }) {
    return (
        <div className="mc-field">
            <span className="mc-fl">{label}</span>
            <span className="mc-fv">{children}</span>
        </div>
    );
}

export function ArrButton({ onClick }) {
    return (
        <button
            className="cl-arrow-btn"
            aria-label="Open case"
            onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
            }}
        >
            →
        </button>
    );
}

export function SideButton ( {onClick}){
    return(
        <div className="card-side-action"
             onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick();
        }}
             aria-label="Open details">
            <span className="side-arrow">→</span>
        </div>
    );
}

export function BackButton({ onClick, label = "← Back" }) {
    return (
        <button className="mc-back-btn" onClick={onClick}>
            {label}
        </button>
    );
}

export function Modal({ title, onClose, children }) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-box">
                <div className="modal-title">{title}</div>
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}

export function PencilIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

export function CheckIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export function PhoneIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    );
}

export function MailIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <polyline points="22,4 12,13 2,4"/>
        </svg>
    );
}

export function PlusIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );
}

export function UserIcon({ size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );
}

export function AdminTopBar() {
    return (
        <div className="mc-topbar" style={{justifyContent: 'center'}}>
            <div className="adm-top-nav-centered">
                <NavLink
                    to="/admin/cases"
                    className={({isActive}) => `adm-nav-link-wide ${isActive ? "active" : ""}`}
                >
                    📁 Case Registry
                </NavLink>
                <NavLink
                    to="/admin/users"
                    className={({isActive}) => `adm-nav-link-wide ${isActive ? "active" : ""}`}
                >
                    👥 Team
                </NavLink>
                <NavLink
                    to="/admin/profile"
                    className={({isActive}) => `adm-nav-link-wide ${isActive ? "active" : ""}`}
                >
                    👤 Profile
                </NavLink>
            </div>
        </div>
    );
}

export function AccountantTopBar() {
    return (
        <div className="mc-topbar" style={{justifyContent: 'center'}}>
            <div className="adm-top-nav-centered">
                <NavLink
                    to="/accountant/dashboard"
                    className={({isActive}) => `adm-nav-link-wide ${isActive ? "active" : ""}`}
                >
                    📁 Dashboard
                </NavLink>
                <NavLink
                    to="/accountant/generator"
                    className={({isActive}) => `adm-nav-link-wide ${isActive ? "active" : ""}`}
                >
                    👥 Report Generator
                </NavLink>
                <NavLink
                    to="/accountant/profile"
                    className={({isActive}) => `adm-nav-link-wide ${isActive ? "active" : ""}`}
                >
                    👤 Profile
                </NavLink>
            </div>
        </div>
    );
}

export function Sidebar({isOpen, onClose, navItems}) {
    return (
        <>
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <button className="sidebar-close" onClick={onClose} aria-label="Close">
                    ×
                </button>
                <div className="sidebar-menu">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({isActive}) => `sidebar-item ${isActive ? "active" : ""}`}
                            onClick={onClose}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            {isOpen && (
                <div className="sidebar-overlay" onClick={onClose} />
            )}
        </>
    );
}