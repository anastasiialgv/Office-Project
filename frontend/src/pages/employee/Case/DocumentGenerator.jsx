import { GlassCard, Modal } from "../../../components/Mini.jsx";
import {useEffect, useState} from "react";
import { generateCasePDF } from "../../../utils/pdfGenerator.js";
import axios from "axios";
const API_BASE = "http://localhost:8080/office";
const DOCS_CONFIG = {
    row1: [
        { id: 'payment_demand_notice', name: 'Payment Demand Notice', type: 'interactive' },
        { id: 'pre_litigation_payment_demand', name: 'Pre-litigation Demand', type: 'interactive' },
        { id: 'mail_labels', name: 'Mail Labels', type: 'auto' },
    ],
    row2: [
        { id: 'notice_of_case_referral_to_court', name: 'Court Referral Notice', type: 'interactive' },
        { id: 'official_note', name: 'Official Note', type: 'interactive' },
        { id: 'client_contact_report', name: 'Client Contact Report', type: 'interactive' },
    ]
};

export default function DocumentGenerator() {
    const [activeDoc, setActiveDoc] = useState(null);
    const [formData, setFormData] = useState({});
    const [casesList, setCasesList] = useState([]);
    const [driversList, setDriversList] = useState([]);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE}/drivers/short`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDriversList(response.data);
            } catch (e) {
                console.error("Error fetching drivers for generator:", e);
            }
        };
        fetchDrivers();
    }, []);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE}/cases`, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setCasesList(response.data);
            } catch (e) {
                console.error("Error fetching cases for generator:", e);
            }
        };
        fetchCases();
    }, []);

    const fetchFullCaseData = async (caseId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE}/cases/${caseId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response.data;
        } catch (e) {
            console.error("Error fetching full case details:", e);
            alert("Failed to fetch full case details from database.");
            return null;
        }
    };

    const getMappedCaseData = (fullCaseDetails) => {
        if (!fullCaseDetails) return {};

        const dueDate = fullCaseDetails.violationDate
            ? new Date(new Date(fullCaseDetails.violationDate).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : "—";
        const driver = fullCaseDetails.driver || {};
        const vehicle = fullCaseDetails.vehicle || {};

        return {
            id: fullCaseDetails.numberCase || fullCaseDetails.id || "—",
            address: fullCaseDetails.address || "—",
            violation: fullCaseDetails.violationDate || "—",
            fine: fullCaseDetails.fineAmount ? Number(fullCaseDetails.fineAmount).toFixed(2) : "0.00",
            due: dueDate,
            plate: vehicle.plateNumber || "—",
            overdueCount: fullCaseDetails.overdueCount,

            fullname: `${driver.name || ""} ${driver.surname || ""}`.trim() || "—",
            birthDate: driver.birthDate || "—",
            passportNumber: driver.passportNumber || "—"
        };
    };

    const handleStart = (doc) => {
        if (doc.type === 'auto') {
            const mappedData = getMappedCaseData();
            generateCasePDF(doc.id, mappedData);
        } else {
            setActiveDoc(doc);
            setFormData(doc.id === 'client_contact_report' ? {method: 'Phone Call'} : {});
        }
    };

    const handleGenerate = async () => {
        const requiresCase = ['payment_demand_notice', 'pre_litigation_payment_demand', 'notice_of_case_referral_to_court'].includes(activeDoc.id);

        if (requiresCase && !formData.caseId) {
            alert("Please select a case first from the dropdown list.");
            return;
        }

        if (activeDoc.id === 'client_contact_report' && !formData.driverId) {
            alert("Please select a driver (client) first from the dropdown list.");
            return;
        }

        let mappedData = {};
        const token = localStorage.getItem("token");

        if (requiresCase && formData.caseId) {
            const fullData = await fetchFullCaseData(formData.caseId);
            if (!fullData) return;
            mappedData = getMappedCaseData(fullData);
        } else if (activeDoc.id === 'client_contact_report' && formData.driverId) {
            try {
                const response = await axios.get(`${API_BASE}/drivers/${formData.driverId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const driver = response.data;
                mappedData = {
                    idDriver: driver.idDriver || "—",
                    fullname: `${driver.name || ""} ${driver.surname || ""}`.trim() || "—",
                    birthDate: driver.birthDate || "—",
                    passportNumber: driver.passportNumber || "—",
                    pesel: driver.pesel || "—",
                    email: driver.email || "—",
                    phone: driver.phone || "—",
                    address: driver.address || "—"
                };
            } catch (error) {
                console.error("Failed to fetch driver legal data for PDF:", error);
                alert("Error loading driver information from server.");
                return;
            }
        }
        const docOutput = generateCasePDF(activeDoc.id, mappedData, formData);
        setActiveDoc(null);

        if (docOutput) {
            try {
                const pdfBlob = docOutput.output('blob');
                const uploadData = new FormData();

                uploadData.append("file", pdfBlob, `${activeDoc.id}.pdf`);
                uploadData.append("fileType", activeDoc.id.toUpperCase());

                if (formData.caseId !== undefined && formData.caseId !== null && formData.caseId !== "") {
                    uploadData.append("caseId", formData.caseId);
                }

                await axios.post(`${API_BASE}/files/generated-document`, uploadData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("Document successfully archived on backend");
            } catch (error) {
                console.error("Failed to archive generated document on backend:", error);
            }
        }
    }
        return (
            <>
                <div className="doc-generator-container">
                    <GlassCard style={{marginTop: '24px'}}>
                        <div className="cd-docs-grid">
                            {DOCS_CONFIG.row1.map(doc => (
                                <div key={doc.id} className="doc-template-card">
                                    <div className="doc-name">{doc.name}</div>
                                    <button className="btn-doc" onClick={() => handleStart(doc)}>
                                        {doc.type === 'auto' ? 'Download' : 'Configure & Download'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="doc-generator-separator"/>

                        <div className="cd-docs-grid">
                            {DOCS_CONFIG.row2.map(doc => (
                                <div key={doc.id} className="doc-template-card">
                                    <div className="doc-name">{doc.name}</div>
                                    <button className="btn-doc" onClick={() => handleStart(doc)}>Configure & Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {activeDoc && (
                    <Modal title={`Configure: ${activeDoc.name}`} onClose={() => setActiveDoc(null)}>
                        <div className="doc-modal-form">
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

                            {activeDoc.id === 'client_contact_report' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Select Driver (Client)</label>
                                        <select
                                            className="glass-select"
                                            value={formData.driverId || ""}
                                            onChange={e => setFormData({...formData, driverId: e.target.value})}
                                        >
                                            <option value="">-- Choose Driver --</option>
                                            {driversList.map(d => (
                                                <option key={d.idDriver} value={d.idDriver}>
                                                    {d.name} {d.surname} | {d.email || " "}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Comprehensive Contact Summary</label>
                                        <textarea
                                            className="glass-textarea"
                                            rows="6"
                                            placeholder="Describe the overall history of contact with this client, their attitude towards debt settlement, and core agreements..."
                                            onChange={e => setFormData({...formData, summary: e.target.value})}
                                        />
                                    </div>
                                </>
                            )}

                            {(activeDoc.id === 'payment_demand_notice' || activeDoc.id === 'pre_litigation_payment_demand' || activeDoc.id === 'notice_of_case_referral_to_court') && (
                                <>
                                    <div className="form-group">
                                    <label className="form-label">Select Active Case</label>
                                        <select
                                            className="glass-select"
                                            value={formData.caseId || ""}
                                            onChange={async (e) => {
                                                const selectedId = e.target.value;
                                                if (!selectedId) {
                                                    setFormData({...formData, caseId: "", customText: ""});
                                                    return;
                                                }

                                                const fullData = await fetchFullCaseData(selectedId);

                                                if (fullData) {
                                                    const fine = Number(fullData.fineAmount).toFixed(2);
                                                    setFormData({
                                                        ...formData,
                                                        caseId: selectedId,
                                                        customText: activeDoc.id === 'payment_demand_notice'
                                                            ? `Our records indicate an outstanding balance of ${fine} PLN regarding the traffic violation on ${fullData.violationDate}.\nPlease settle this debt immediately to avoid penalties.`
                                                            : `FINAL WARNING: Total debt of ${fine} PLN remains unpaid. If not settled within 7 days, legal action will be initiated immediately without further notice.`
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="">-- Choose Case --</option>
                                            {casesList.map(c => (
                                                <option key={c.numberCase} value={c.numberCase}>
                                                    #{c.numberCase} | {c.driverName} {c.driverSurname} — {c.violationDate}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {activeDoc.id === 'notice_of_case_referral_to_court' && (
                                        <div className="form-group">
                                            <label className="form-label">Select Court</label>
                                            <select className="glass-select"
                                                    onChange={e => setFormData({...formData, court: e.target.value})}>
                                                <option value="">-- Choose Court --</option>
                                                <option>District Court in Warsaw</option>
                                                <option>District Court in Krakow</option>
                                            </select>
                                        </div>
                                    )}
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
        );

}