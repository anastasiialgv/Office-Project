import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { GlassCard, CardTitle, Field, StatusBadge, Loader } from '../components/Mini.jsx';
const API_BASE = import.meta.env.VITE_API_URL+"/reports";

const DriverPaymentPage = () => {
    const { caseId } = useParams();

    const [caseData, setCaseData] = useState(null);
    const [isFetchingInfo, setIsFetchingInfo] = useState(true);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCaseInfo = async () => {
            try {
                const response = await fetch(API_BASE+`/public/cases/${caseId}`);

                if (!response.ok) {
                    throw new Error('Not found');
                }

                const data = await response.json();
                setCaseData(data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setIsFetchingInfo(false);
            }
        };

        fetchCaseInfo();
    }, [caseId]);

    const handlePayment = async () => {
        setIsLoadingPayment(true);
        setError(null);

        try {
            const response = await fetch(`https://office-project-production-3ce4.up.railway.app/office/payments/init/${caseId}`, { // https://office-project-production-3ce4.up.railway.app
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Ошибка при инициализации платежа');
            }

            const data = await response.json();

            if (data.redirectUri) {
                window.location.href = data.redirectUri;
            }
        } catch (err) {
            console.error("Payment error:", err);
            setError(err.message);
        } finally {
            setIsLoadingPayment(false);
        }
    };

    return (
        // Используем login-wrap для темного градиентного фона и центрирования
        <div className="login-wrap">

            {/* Заменяем белый квадрат на твою стеклянную карточку */}
            <GlassCard className="login-card">
                <CardTitle>Payment | Case № {caseId}</CardTitle>

                {isFetchingInfo ? (
                    <Loader/>
                ) : error ? (
                    <div style={{
                        color: 'var(--accent-red)',
                        padding: '16px',
                        background: 'rgba(240, 112, 112, 0.1)',
                        border: '1px solid rgba(240, 112, 112, 0.3)',
                        borderRadius: '10px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                ) : (
                    <>
                        {caseData && (
                            <div style={{ marginTop: '20px', marginBottom: '30px', textAlign: 'left' }}>
                                <Field label="Car:">
                                    <strong>{caseData.plateNumber || '-'}</strong>
                                </Field>

                                {caseData.status && (
                                    <Field label="Status:">
                                        <StatusBadge status={caseData.status} />
                                    </Field>
                                )}

                                <Field label="Fine amount:">
                                    <span style={{
                                        fontSize: '18px',
                                        color: 'var(--accent-green)',
                                        fontWeight: 'bold'
                                    }}>
                                        {caseData.fineAmount} PLN
                                    </span>
                                </Field>
                            </div>
                        )}

                        {caseData?.status === 'CLOSED' ? (
                            <div style={{
                                color: 'var(--accent-green)',
                                fontWeight: 'bold',
                                padding: '16px',
                                background: 'rgba(109, 221, 138, 0.1)',
                                border: '1px solid rgba(109, 221, 138, 0.3)',
                                borderRadius: '10px'
                            }}>
                                Case was closed
                            </div>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={isLoadingPayment}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '15px',
                                    opacity: isLoadingPayment ? 0.6 : 1,
                                    cursor: isLoadingPayment ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isLoadingPayment ? 'Connecting to PayU...' : 'Go to payment'}
                            </button>
                        )}
                    </>
                )}

                <div style={{
                    marginTop: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                }}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10v8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z"/>
                    </svg>
                    Safe payment PayU
                </div>
            </GlassCard>
        </div>
    );
};

export default DriverPaymentPage;