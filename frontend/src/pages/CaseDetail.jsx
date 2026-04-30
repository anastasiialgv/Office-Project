// ─────────────────────────────────────────────────────────────────────────────
// pages/CaseDetail.jsx — детальная страница кейса (роль Employee)
//
// Включает:
//   • Bento-сетку карточек (Case / Contact / Vehicle / Driver) — как в макете
//   • Блок ContactHistory (вертикальный Timeline)
//   • Кнопку «Add Penalty» → AddPenaltyModal
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"
import {
    TopBar,
    BackButton,
    GlassCard,
    CardTitle,
    ArrButton,
    StatusBadge,
    Field,
    SideButton
} from "../components/Mini.jsx";
import ContactHistory from "../components/ContactHistory";
import AddPenaltyModal from "../components/AddPenalty";


// ── Начальные данные кейса (пример) ──────────────────────────────────────
const INITIAL_CASE = {
    id: "1287327123",
    status: "IN PROGRESS",
    violation: "2025-09-10",
    due: "2025-09-24",
    fine: 50,
    overdue: 1,
    caseAddr: "18 Nowowiejska St., Warszawa",
    payment: false,
    phone: "+48 601 234 567",
    address: "15 Lipowa St., Warsaw",
    email: "johnmille@gmail.com",
    fullname: "John Mille",
    birth: "1989-03-12",
    pesel: "89031212345",
    passport: "XR4598821",
    notes: "Prefers contact by email.",
    vehicle: { num: "WWA12345", model: "Corolla", brand: "Toyota", color: "Silver" },
};

// ── Компонент страницы ────────────────────────────────────────────────────
export default function CaseDetail({ caseData = INITIAL_CASE, onBack }, onMenuClick) {
    // caseData может обновляться (штраф, статус)
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(caseData);
    const [showPenaltyModal, setShowPenaltyModal] = useState(false);

    // Коллбэк из AddPenaltyModal — обновляем локальный стейт
    // В реальном проекте здесь PATCH /api/cases/:id/penalty
    const handlePenaltyConfirm = ({ amount, reason }) => {
        setData((prev) => ({
            ...prev,
            fine: parseFloat(prev.fine) + parseFloat(amount),
            // можно добавить в историю: penaltyLog: [...prev.penaltyLog, { amount, reason, date: today }]
        }));
    };

    return (

            <div className="page-wrap">
                <TopBar title={`Case #${id || data.id}`} onMenuClick={onMenuClick}/>
                <BackButton onClick={() => navigate(-1)} />

                {/* ── Bento Grid ── */}
                <div className="cd-grid">

                    {/* Case — левая колонка, высокая */}
                    <GlassCard className="cd-card-case">
                        <CardTitle>Case</CardTitle>
                        <div className="mc-field">
                            <span className="mc-fl">Status</span>
                            <StatusBadge status={data.status} />
                        </div>
                        <Field label="Violation date">{data.violation}</Field>
                        <Field label="Due Date">{data.due}</Field>
                        <Field label="Fine amount">
              <span style={{ color: "var(--accent-orange)", fontWeight: 600 }}>
                {Number(data.fine).toFixed(2)} PLN
              </span>
                        </Field>
                        <Field label="Overdue count">{data.overdue}</Field>
                        <Field label="Address">{data.caseAddr}</Field>
                        <div className="mc-field">
                            <span className="mc-fl">Payment Proof</span>
                            <span className="cd-add-link">
                {data.payment ? "VIEW" : "ADD"}
              </span>
                        </div>
                        <SideButton />
                    </GlassCard>

                    {/* Contact info — правая верхняя */}
                    <GlassCard className="cd-card-contact">
                        <CardTitle>Contact info</CardTitle>
                        <Field label="Phone">{data.phone}</Field>
                        <Field label="Address">{data.address}</Field>
                        <Field label="Email">{data.email}</Field>
                        <SideButton />
                    </GlassCard>

                    {/* Driver — правая, высокая */}
                    <GlassCard className="cd-card-driver">
                        <CardTitle>Driver</CardTitle>
                        <Field label="Full name">{data.fullname}</Field>
                        <Field label="Birth Date">{data.birth}</Field>
                        <Field label="PESEL">{data.pesel}</Field>
                        <Field label="Passport">{data.passport}</Field>
                        {data.notes && <Field label="Notes">{data.notes}</Field>}
                        <SideButton />
                    </GlassCard>

                    {/* Vehicle — левая нижняя */}
                    <GlassCard className="cd-card-vehicle">
                        <CardTitle>Vehicle</CardTitle>
                        <div className="cd-vehicle-grid">
                            <div className="mc-field">
                                <span className="mc-fl">Number</span>
                                <span className="mc-fv">{data.vehicle.num}</span>
                            </div>
                            <div className="mc-field">
                                <span className="mc-fl">Model</span>
                                <span className="mc-fv">{data.vehicle.model}</span>
                            </div>
                            <div className="mc-field">
                                <span className="mc-fl">Brand</span>
                                <span className="mc-fv">{data.vehicle.brand}</span>
                            </div>
                            <div className="mc-field">
                                <span className="mc-fl">Color</span>
                                <span className="mc-fv">{data.vehicle.color}</span>
                            </div>
                        </div>
                        <SideButton />
                    </GlassCard>
                </div>

                {/* ── Кнопка Add Penalty ── */}
                <div className="cd-penalty-row">
                    <button className="cd-penalty-btn" onClick={() => setShowPenaltyModal(true)}>
                        + Add Penalty
                    </button>
                </div>

                {/* ── История контактов ── */}
                <div style={{ padding: "0 20px 32px" }}>
                    <ContactHistory caseId={data.id} />
                </div>

                {/* ── Модальное окно штрафа ── */}
                {showPenaltyModal && (
                    <AddPenaltyModal
                        caseData={data}
                        onConfirm={handlePenaltyConfirm}
                        onClose={() => setShowPenaltyModal(false)}
                    />
                )}
            </div>

    );
}