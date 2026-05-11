import {TopBar, ArrButton, TypeBadge} from "../../../components/Mini.jsx";
import { useNavigate } from "react-router-dom";
import Table from "../../../components/Table.jsx";
// ── Все кейсы (моковые данные) ───────────────────────────
export const ALL_FILES = [
    {
        id: "1287327123", document_type: "Payment Demand Notice", created_at: "Jan 11, 2050", numbercase: "12263"
    },
    {
        id: "1287327124", document_type: "Notice of Case Referral to Court", created_at: "Jan 16, 2049", numbercase: "12269"
    },
    {
        id: "1287327124", document_type: "Mail Labels", created_at: "Jan 19, 2050", numbercase: "12260"
    }

].concat(Array(15).fill({
    id: "5555555555", document_type: "Payment Confirmation", created_at: "Jan 18, 2050", numbercase: "12260"
}));

const ALL_FILTER_TYPES_DOCUMENTS = ["Payment Demand Notice",
    "Pre-litigation Payment Demand", "Notice of Case Referral to Court",
    "Payment Confirmation", "Official Note", "Client Contact Report",
    "Mail Labels", "Vehicle Evidence"];

export default function Files({ onMenuClick }) {
    const navigate = useNavigate();
    return (

        <div className="page-wrap">
            <TopBar title="My files" onMenuClick={onMenuClick}/>
            <Table
                data={ALL_FILES}
                filterKey="document_type"
                filterStatuses={ALL_FILTER_TYPES_DOCUMENTS}
                columns={["Number", "Created at", "File Type", "Numbercase"]}
                renderRow={(c, index) => (
                    <div
                        className="cl-table-row"
                        key={c.id + index}
                        onClick={() => navigate(`/files/${c.id}`)}
                    >
                        <span>{c.id}</span>
                        <span>{c.created_at}</span>
                        <TypeBadge type={c.document_type}/>
                        <span>{c.numbercase}</span>
                        <ArrButton onClick={() => navigate(`/files/${c.id}`)}/>
                    </div>
                )}
            />

        </div>
    );
}