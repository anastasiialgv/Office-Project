// ─────────────────────────────────────────────────────────────────────────────
// components/ui/index.jsx — переиспользуемые «атомарные» компоненты.
// Импортируй нужное: import { GlassCard, Field, TopBar, Modal } from '../ui'
// ─────────────────────────────────────────────────────────────────────────────

import { STATUS_STYLES } from "./StatusBadge.jsx";

/* ── Гамбургер-кнопка ── */
function MenuIcon() {
    return (
        <button className="mc-menu-btn" aria-label="Menu">
            <span /><span /><span />
        </button>
    );
}

/* ── Верхняя панель страницы ── */
// Mini.jsx
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

/* ── Цветной статус-бейдж ── */
export function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || {};
    return (
        <span className="mc-status" style={style}>
      {status}
    </span>
    );
}

/* ── Стеклянная карточка с shimmer ── */
export function GlassCard({ children, style, className = "" }) {
    return (
        <div className={`glass-card ${className}`} style={style}>
            {children}
        </div>
    );
}

/* ── Заголовок внутри карточки ── */
export function CardTitle({ children }) {
    return <div className="card-title">{children}</div>;
}

/* ── Строка поле/значение ── */
export function Field({ label, children }) {
    return (
        <div className="mc-field">
            <span className="mc-fl">{label}</span>
            <span className="mc-fv">{children}</span>
        </div>
    );
}

/* ── Кнопка-стрелка в углу карточки ── */
export function ArrButton({ onClick }) {
    return (
        <button className="card-arr-btn" onClick={onClick} aria-label="Open">
            →
        </button>
    );
}

/* ── Кнопка «Назад» ── */
export function BackButton({ onClick, label = "← Back to list" }) {
    return (
        <button className="mc-back-btn" onClick={onClick}>
            {label}
        </button>
    );
}

/* ── Модальное окно ── */
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

/* ── Иконка карандаша (SVG) ── */
export function PencilIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

/* ── Иконка галочки ── */
export function CheckIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

/* ── Иконка телефона ── */
export function PhoneIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    );
}

/* ── Иконка письма ── */
export function MailIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <polyline points="22,4 12,13 2,4"/>
        </svg>
    );
}

/* ── Иконка плюса ── */
export function PlusIcon({ size = 14 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    );
}

/* ── Иконка пользователя ── */
export function UserIcon({ size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    );
}