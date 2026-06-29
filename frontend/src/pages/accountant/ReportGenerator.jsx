import { GlassCard, Modal } from "../../components/Mini.jsx";
import { useState} from "react";
import axios from "axios";
import {generateReport} from "../../utils/reportGenerator.js";
import Loader from "../../components/Loader.jsx";
const API_BASE = "http://localhost:8080/office/reports";

const REPORTS_CONFIG = {
    row1: [
        { id: 'monthly_summary', name: 'Monthly Summary', type: 'interactive' },
        { id: 'case_status_report', name: 'Case Status Report', type: 'interactive' },
        { id: 'employee_performance_report', name: 'Employee Performance Report', type: 'auto' },
    ],
    row2: [
        { id: 'financial_report', name: 'Financial Report', type: 'interactive' },
        { id: 'court_report', name: 'Court Report', type: 'auto' },
    ]
};

export default function ReportGenerator() {
    const [activeDoc, setActiveDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [includeCharts, setIncludeCharts] = useState(true);

    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        selectedMonth: new Date().getMonth() + 1,
        selectedYear: new Date().getFullYear()
    });

    const handleStart = async (doc) => {
        if (doc.type === 'auto') {
            await fetchAndGenerate(doc.id, {});
        } else {
            setActiveDoc(doc);
        }
    };

    const fetchAndGenerate = async (reportTypeId, currentFilters) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = "";
            let params = {};

            if (reportTypeId === "financial_report") {
                url = `${API_BASE}/financial`;
                params = { startDate: currentFilters.startDate, endDate: currentFilters.endDate };
            } else if (reportTypeId === "case_status_report") {
                url = `${API_BASE}/status-summary`;
                params = { startDate: currentFilters.startDate, endDate: currentFilters.endDate };
            } else if (reportTypeId === "employee_performance_report") {
                url = `${API_BASE}/employee-performance`;
            } else if (reportTypeId === "monthly_summary") {
                url = `${API_BASE}/monthly-summary`;
                params = { year: currentFilters.selectedYear, month: currentFilters.selectedMonth };
            } else if (reportTypeId === "court_report") {
                url = `${API_BASE}/court-cases`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: params
            });

            const filterLabels = reportTypeId === "monthly_summary"
                ? { month: currentFilters.selectedMonth, year: currentFilters.selectedYear }
                : { startDate: currentFilters.startDate, endDate: currentFilters.endDate };

            generateReport(reportTypeId, response.data, filterLabels, includeCharts);

        } catch (e) {
            console.error("Error fetching report dataset:", e);
            alert("Failed to retrieve operational data for the selected report type.");
        } finally {
            setLoading(false);
            setActiveDoc(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <>
            <div className="doc-generator-container">
                <GlassCard style={{ marginTop: '24px' }}>
                    <div className="cd-docs-grid">
                        {REPORTS_CONFIG.row1.map(doc => (
                            <div key={doc.id} className="doc-template-card">
                                <div className="doc-name">{doc.name}</div>
                                <button className="btn-doc" onClick={() => handleStart(doc)}>
                                    {doc.type === 'auto' ? 'Download' : 'Configure & Download'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="doc-generator-separator" />

                    <div className="cd-docs-grid">
                        {REPORTS_CONFIG.row2.map(doc => (
                            <div key={doc.id} className="doc-template-card">
                                <div className="doc-name">{doc.name}</div>
                                <button className="btn-doc" onClick={() => handleStart(doc)}>
                                    {doc.type === 'auto' ? 'Download' : 'Configure & Download'}
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {activeDoc && (
                <Modal title={`Configure: ${activeDoc.name}`} onClose={() => setActiveDoc(null)}>
                    <div className="doc-modal-form">

                        {(activeDoc.id === 'financial_report' || activeDoc.id === 'case_status_report') && (
                            <>
                                <div className="flex items-center gap-2 my-3">
                                    <input
                                        type="checkbox"
                                        id="includeCharts"
                                        checked={includeCharts}
                                        onChange={(e) => setIncludeCharts(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="includeCharts"
                                           className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Include Charts in PDF Report
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="glass-input"
                                        value={formData.startDate}
                                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="glass-input"
                                        value={formData.endDate}
                                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                                    />
                                </div>
                            </>
                        )}

                        {activeDoc.id === 'monthly_summary' && (
                            <>
                                <div className="flex items-center gap-2 my-3">
                                    <input
                                        type="checkbox"
                                        id="includeCharts"
                                        checked={includeCharts}
                                        onChange={(e) => setIncludeCharts(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="includeCharts"
                                           className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Include Charts in PDF Report
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Reporting Month</label>
                                    <select
                                        className="glass-select"
                                        value={formData.selectedMonth}
                                        onChange={e => setFormData({
                                            ...formData,
                                            selectedMonth: Number(e.target.value)
                                        })}
                                    >
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>
                                                {new Date(2000, m - 1).toLocaleString('en', {month: 'long'})}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reporting Year</label>
                                    <input
                                        type="number"
                                        className="glass-input"
                                        value={formData.selectedYear}
                                        onChange={e => setFormData({...formData, selectedYear: Number(e.target.value)})}
                                    />
                                </div>
                            </>
                        )}

                    </div>

                    <div className="ap-footer">
                        <button className="btn-danger" onClick={() => setActiveDoc(null)}>Cancel</button>
                        <button className="btn-primary" onClick={() => fetchAndGenerate(activeDoc.id, formData)}>
                            Compile PDF
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}