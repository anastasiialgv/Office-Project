import { useParams, useNavigate } from "react-router-dom";
import {
    TopBar, GlassCard, CardTitle,
    Field, TypeBadge, BackButton
} from "../../../components/Mini.jsx";

export default function FileDetail({ onMenuClick }) {
    const { id } = useParams();
    const navigate = useNavigate();

    // Данные (заглушка)
    const data = {
        id: id || "1287327123",
        document_type: "Payment Confirmation",
        created_at: "2025-09-10",
        size: "2.4 MB",
        numbercase: "12260",
        fileUrl: "/test/test.pdf"
    };

    return (
        <div className="page-wrap">
            <TopBar title="File Details" onMenuClick={onMenuClick}/>

            <BackButton onClick={() => navigate(-1)} />

            <div className="single-card-container">
                <GlassCard className="detail-view-card">
                    <CardTitle>{data.id}</CardTitle>

                    <div className="mc-fields-group">

                        <Field label="Type">
                            <TypeBadge type={data.document_type}/>
                        </Field>

                        <Field label="Created Date">{data.created_at}</Field>

                        <Field label="Size">{data.size}</Field>

                        <Field label="Source File">
                            <a
                                href={data.fileUrl}
                                download={`File_${data.id}`} // Предложит сохранить файл с таким именем
                                className="cd-add-link"
                                style={{
                                    color: '#6ddd8a',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <span>📄Download</span>
                            </a>
                        </Field>

                    </div>

                    {/* Две кнопки друг напротив друга, как в профиле */}
                    <div className="profile-actions" style={{marginTop: '24px'}}>
                        <button
                            className="btn-primary flex-1"
                            onClick={() => navigate(-1)}
                        >
                            Back to list
                        </button>
                        <button
                            className="btn-danger flex-1"
                            onClick={() => navigate(`/cases/${data.numbercase}`)}
                        >
                            Go to Case
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}