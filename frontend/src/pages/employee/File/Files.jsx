import { useEffect, useState } from "react";
import { TopBar, ArrButton, TypeBadge } from "../../../components/Mini.jsx";
import Table from "../../../components/Table.jsx";
import axios from "axios";
import Loader from "../../../components/Loader.jsx";

const API_BASE = "http://localhost:8080/office";
const ALL_FILTER_TYPES_DOCUMENTS = ["PAYMENT_DEMAND_NOTICE",
    "PRE_LITIGATION_PAYMENT_DEMAND",
    "NOTICE_OF_CASE_REFERRAL_TO_COURT",
    "OFFICIAL_NOTE",
    "CLIENT_CONTACT_REPORT",
    "PAYMENT_CONFIRMATION"];

export default function Files() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllFiles = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE}/files/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFiles(response.data);
            } catch (e) {
                console.error("Error fetching files:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAllFiles();
    }, []);

    const handleFileOpen = (fileId) => {
        if (!fileId) {
            console.error("Error! Bad file id!");
            return;
        }

        const BASE_URL = "http://localhost:8080";
        const fileUrl = `${BASE_URL}/office/files/download/${fileId}`;

        window.open(fileUrl, '_blank', 'noopener,noreferrer');
    };

    if (loading) return <Loader/>;

    return (
        <>
            <Table
                data={files}
                filterKey="fileType"
                filterStatuses={ALL_FILTER_TYPES_DOCUMENTS}
                columns={["Number", "Created at", "File Type", "Numbercase"]}
            renderRow={(c, index) => (
            <div
                className="cl-table-row"
                key={(c.fileId || index) + index}
                onClick={() => handleFileOpen(c.fileId)}
            >
                <span>{c.fileId}</span>
                <span>{c.uploadedAt}</span>
                <TypeBadge type={c.fileType}/>
                <span>{c.numberCase}</span>
                <ArrButton onClick={() => handleFileOpen(c.fileId)}/>
            </div>
        )}
            />
        </>
    );
}