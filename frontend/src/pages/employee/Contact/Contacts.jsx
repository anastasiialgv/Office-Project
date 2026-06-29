import { useEffect, useState } from "react";
import {ArrButton, ContactTypeBadge } from "../../../components/Mini.jsx";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/Table.jsx";
import axios from "axios";
import Loader from "../../../components/Loader.jsx";

const API_BASE = "http://localhost:8080/office";
const ALL_FILTER_TYPES_CONTACTS = ["PHONE", "EMAIL", "LETTER"];

export default function Contacts() {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            // Форматирует в вид: 21.06.2026 16:20
            return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateStr; // Если что-то пошло не так, вернет исходную строку, чтоб не падало
        }
    };

    useEffect(() => {
        const fetchAllContacts = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${API_BASE}/contacts/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContacts(response.data); // Сюда прилетит чистый массив DTO
            } catch (e) {
                console.error("Error fetching contacts:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAllContacts();
    }, []);

    if (loading) return <Loader/>;

    return (
        <>
            <Table
                data={contacts}
                filterKey="contactType"
                filterStatuses={ALL_FILTER_TYPES_CONTACTS}
                columns={["Number", "Result/Comment", "Type", "Sent at"]}
                renderRow={(c, index) => (
                    <div
                        className="cl-table-row"
                        key={c.idMessage || index}
                        onClick={() => navigate(`/cases/${c.numberCase || c.caseId || 32}`)}
                    >
                        <span>{c.idMessage}</span>
                        <span style={{ fontWeight: '500' }}>{c.result || "—"}</span>
                        <ContactTypeBadge type={c.contactType}/>
                        <span>{formatDate(c.contactDate)}</span>
                        <ArrButton onClick={() => navigate(`/cases/${c.numberCase || c.caseId || 32}`)}/>
                    </div>
                )}
            />
        </>
    );
}