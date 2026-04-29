// ─────────────────────────────────────────────────────────────────────────────
// components/AddPenaltyModal.jsx — модальное окно «Add Penalty»
//
// Функции:
//   • Поле Amount (BigDecimal — числовой инпут с валидацией)
//   • Поле Reason (Dropdown с готовыми вариантами + свободный ввод)
//   • «Confirm» вызывает onConfirm({ amount, reason }) → PATCH в родителе
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Modal } from "./Mini.jsx";

// ── Пресеты причин штрафа ─────────────────────────────────────────────────
const REASON_PRESETS = [
    "Late payment",
    "Repeated violation",
    "Forged documents",
    "Non-compliance with order",
    "Other",
];


export default function AddPenaltyModal({ caseData, onConfirm, onClose }) {
    const [amount, setAmount]       = useState("");
    const [reason, setReason]       = useState(REASON_PRESETS[0]);
    const [customReason, setCustom] = useState("");
    const [error, setError]         = useState("");

    // Итоговая причина: если выбрано «Other» — свободный ввод
    const finalReason = reason === "Other" ? customReason.trim() : reason;

    // Форматируем сумму как BigDecimal-строку (2 знака после запятой)
    const parsedAmount = parseFloat(amount.replace(",", "."));
    const formattedAmount = isNaN(parsedAmount) ? null : parsedAmount.toFixed(2);

    const validate = () => {
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setError("Enter a valid amount greater than 0"); return false;
        }
        if (!finalReason) {
            setError("Enter or select a reason"); return false;
        }
        return true;
    };

    const handleConfirm = () => {
        if (!validate()) return;

        // TODO: PATCH /api/cases/${caseData.id}/penalty
        // body: { amount: formattedAmount, reason: finalReason }
        onConfirm({ amount: formattedAmount, reason: finalReason });
        onClose();
    };

    return (
        <>
            <Modal title="Add Penalty" onClose={onClose}>

                {/* Поле Amount */}
                <div className="ap-field">
                    <div className="ap-label">Amount (PLN)</div>
                    <div className="ap-amount-wrap">
                        <span className="ap-currency">PLN</span>
                        <input
                            className="ap-amount-input"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setError(""); }}
                        />
                    </div>
                    {formattedAmount && (
                        <div className="ap-preview">
                            Penalty: <strong>{formattedAmount} PLN</strong>
                        </div>
                    )}
                </div>

                {/* Поле Reason */}
                <div className="ap-field">
                    <div className="ap-label">Reason</div>
                    <select
                        className="glass-select"
                        value={reason}
                        onChange={(e) => { setReason(e.target.value); setError(""); }}
                    >
                        {REASON_PRESETS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Свободный ввод при «Other» */}
                {reason === "Other" && (
                    <div className="ap-field">
                        <div className="ap-label">Describe the reason</div>
                        <textarea
                            className={`glass-input ap-textarea`}
                            placeholder="Describe the penalty reason…"
                            value={customReason}
                            onChange={(e) => { setCustom(e.target.value); setError(""); }}
                        />
                    </div>
                )}

                {/* Ошибка валидации */}
                {error && <div className="ap-error">{error}</div>}

                {/* Футер */}
                <div className="ap-footer">
                    <button className="btn-danger" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleConfirm}>Confirm</button>
                </div>
            </Modal>
        </>
    );
}