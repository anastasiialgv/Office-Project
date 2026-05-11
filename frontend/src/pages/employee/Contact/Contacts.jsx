import {TopBar, ArrButton, ContactTypeBadge} from "../../../components/Mini.jsx";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/Table.jsx";

// 1. Моковые данные (Пример)
export const ALL_CONTACTS = [
    {
        id: "1287327123",
        subject: "Debt Inquiry",
        contact_type: "EMAIL",
        sent_at: "Jan 11, 2050",
    },
    {
        id: "1287327124",
        subject: "Call regarding case",
        contact_type: "PHONE",
        sent_at: "Jan 16, 2049",
    }
].concat(Array(15).fill({
    id: "5555555555",
    subject: "Auto Notification",
    contact_type: "SMS",
    sent_at: "Jan 18, 2050",
}));

// 2. Список типов для фильтрации
const ALL_FILTER_TYPES_CONTACTS = ["EMAIL", "PHONE", "SMS"];

export default function Contacts({ onMenuClick }) {
    const navigate = useNavigate();

    return (
        <div className="page-wrap">
            <TopBar title="My contacts" onMenuClick={onMenuClick}/>
            <Table
                data={ALL_CONTACTS}
                filterKey="contact_type"
                filterStatuses={ALL_FILTER_TYPES_CONTACTS}
                columns={["Number", "Subject", "Type", "Sent at"]}
                renderRow={(c, index) => (
                    <div
                        className="cl-table-row"
                        key={c.id + index}
                        onClick={() => navigate(`/contacts/${c.id}`)}
                    >
                        <span>{c.id}</span>
                        <span style={{ fontWeight: '500' }}>{c.subject}</span>
                        <ContactTypeBadge type={c.contact_type}/>
                        <span>{c.sent_at}</span>
                        <ArrButton onClick={() => navigate(`/contacts/${c.id}`)}/>
                    </div>
                )}
            />
        </div>
    );
}