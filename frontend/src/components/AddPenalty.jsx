import { useState } from "react";
import { Modal } from "./Mini.jsx";

const REASON_PRESETS = [
    "Repeated violation",
    "Forged documents",
    "Rudeness towards the operator",
    "Other",
];


export default function AddPenaltyModal({ onConfirm, onClose }) {
    const [amount, setAmount]       = useState("");
    const [reason, setReason]       = useState(REASON_PRESETS[0]);
    const [customReason, setCustom] = useState("");
    const [error, setError]         = useState("");

    const finalReason = reason === "Other" ? customReason.trim() : reason;

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
        onConfirm({ amount: formattedAmount, reason: finalReason });
        onClose();
    };

    return (
        <>
            <Modal title="Add Penalty" onClose={onClose}>
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

                {error && <div className="ap-error">{error}</div>}

                <div className="ap-footer">
                    <button className="btn-danger" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleConfirm}>Confirm</button>
                </div>
            </Modal>
        </>
    );
}