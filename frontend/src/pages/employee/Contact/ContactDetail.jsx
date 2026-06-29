import { useParams, useNavigate } from "react-router-dom";
import {
    TopBar, GlassCard, CardTitle,
    Field, TypeBadge, BackButton
} from "../../../components/Mini.jsx";

export default function ContactDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const data = {
        id: id || "1287327123",
        subject: "Debt Inquiry",
        contact_type: "EMAIL",
        sent_at: "Jan 11, 2050",
        numberCase: "12263",
        body: "Hello! I am writing to clarify the details regarding the last notice I received. Can you please provide more information about the payment deadline?"
    };

    return (
        <>
            <BackButton onClick={() => navigate(-1)} />
            <div className="single-card-container">
                <GlassCard className="detail-view-card">
                    <CardTitle>{data.subject}</CardTitle>

                    <div className="mc-fields-group">

                        <Field label="Contact ID">{data.id}</Field>

                        <Field label="Type">
                            <TypeBadge type={data.contact_type} />
                        </Field>

                        <Field label="Sent At">{data.sent_at}</Field>

                        <Field label="Numbercase">{data.numberCase}</Field>

                        {/* Поле с текстом сообщения */}
                        <div className="contact-body-section">
                            <label className="profile-label" style={{ marginBottom: '8px', display: 'block' }}>
                                Message Body
                            </label>
                            <div className="contact-body-text">
                                {data.body}
                            </div>
                        </div>

                    </div>

                    {/* Две кнопки в стиле профиля */}
                    <div className="profile-actions" style={{ marginTop: '24px' }}>
                        <button
                            className="btn-primary flex-1"
                            onClick={() => navigate(-1)}
                        >
                            Back to list
                        </button>
                        <button
                            className="btn-danger flex-1"
                            onClick={() => navigate(`/cases/${data.numberCase}`)}
                        >
                            Go to Case
                        </button>
                    </div>
                </GlassCard>
            </div>
        </>
    );
}