import {GlassCard, Modal, TopBar} from "../../../components/Mini.jsx";
import {useState} from "react";
import {generateCasePDF} from "../../../utils/pdfGenerator.js";
const DOCS_CONFIG = {
    // Ряд 1: Автоматические
    row1: [
        { id: 'pay_demand', name: 'Payment Demand Notice', type: 'auto' },
        { id: 'pre_court', name: 'Pre-litigation Demand', type: 'auto' },
        { id: 'mail_labels', name: 'Mail Labels', type: 'auto' },
    ],
    // Ряд 2: Интерактивные
    row2: [
        { id: 'court_notice', name: 'Court Referral Notice', type: 'interactive' },
        { id: 'official_note', name: 'Official Note', type: 'interactive' },
        { id: 'contact_report', name: 'Client Contact Report', type: 'interactive' },
    ]
};


export default function DocumentGenerator({caseData }) {
    const [activeDoc, setActiveDoc] = useState(null);
    const [formData, setFormData] = useState({});

    const handleStart = (doc) => {
        if (doc.type === 'auto') {
            generateCasePDF(doc.id, caseData);
        } else {
            setActiveDoc(doc);
            setFormData({});
        }
    };

// Для интерактивных (кнопка в модалке)
    const handleGenerate = () => {
        generateCasePDF(activeDoc.id, caseData, formData);
        setActiveDoc(null);
    };
    return (
        <>
            <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <GlassCard style={{ marginTop: '24px' }}>

                    {/* Первый ряд: Автоматические */}
                    <div className="cd-docs-grid">
                        {DOCS_CONFIG.row1.map(doc => (
                            <div key={doc.id} className="doc-template-card">
                                <div className="doc-name">{doc.name}</div>
                                <button className="btn-doc" onClick={() => handleStart(doc)}>Download</button>
                            </div>
                        ))}
                    </div>

                    {/* Разделитель */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />

                    {/* Второй ряд: Интерактивные */}
                    <div className="cd-docs-grid">
                        {DOCS_CONFIG.row2.map(doc => (
                            <div key={doc.id} className="doc-template-card">
                                <div className="doc-name">{doc.name}</div>
                                <button className="btn-doc" onClick={() => handleStart(doc)}>Configure & Download</button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* Модалка для настройки документов */}
            {activeDoc && (
                <Modal title={`Configure: ${activeDoc.name}`} onClose={() => setActiveDoc(null)}>
                    <div className="doc-modal-form">
                        {activeDoc.id === 'court_notice' && (
                            <div className="form-group">
                                <label className="form-label">Select Court</label>
                                <select className="glass-select" onChange={e => setFormData({...formData, court: e.target.value})}>
                                    <option value="">-- Choose Court --</option>
                                    <option>District Court in Warsaw</option>
                                    <option>District Court in Krakow</option>
                                </select>
                            </div>
                        )}

                        {activeDoc.id === 'official_note' && (
                            <div className="form-group">
                                <label className="form-label">Note Content</label>
                                <textarea
                                    className="glass-textarea"
                                    placeholder="Enter internal notes here..."
                                    onChange={e => setFormData({...formData, note: e.target.value})}
                                />
                            </div>
                        )}

                        {activeDoc.id === 'contact_report' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Contact Method</label>
                                    <select className="glass-select" onChange={e => setFormData({...formData, method: e.target.value})}>
                                        <option>Phone Call</option>
                                        <option>Email</option>
                                        <option>Letter</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Outcome</label>
                                    <textarea
                                        className="glass-textarea"
                                        placeholder="Summary of conversation..."
                                        onChange={e => setFormData({...formData, summary: e.target.value})}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="ap-footer">
                        <button className="btn-danger" onClick={() => setActiveDoc(null)}>Cancel</button>
                        <button className="btn-primary" onClick={handleGenerate}>Generate PDF</button>
                    </div>
                </Modal>
            )}
        </>
    )}
