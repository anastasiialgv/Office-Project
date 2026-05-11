import { TopBar, StatusBadge, ArrButton } from "../../../components/Mini.jsx";
import Table  from "../../../components/Table.jsx"
import { useNavigate } from "react-router-dom";
// ── Все кейсы (моковые данные) ───────────────────────────
export const ALL_CASES = [
    {
        id: "1287327123", name: "John Mille", status: "CLOSED", date: "Jan 11, 2050"
    },
    {
        id: "1226347323", name: "Anna Kowalska", status: "IN PROGRESS", date: "Jan 11, 2050"
    },

].concat(Array(15).fill({
    id: "7243872383", name: "Natalie Green", status: "DISPUTED", date: "Jan 5, 2050",
   }));

const ALL_FILTER_STATUSES = ["CLOSED", "IN PROGRESS", "DISPUTED", "WAITING FOR CONTACT"];

export default function CasesList({ onMenuClick }) {
    const navigate = useNavigate();

    return (

        <div className="page-wrap">
            <TopBar title="My cases" onMenuClick={onMenuClick}/>
                <Table
                    data={ALL_CASES}
                    filterKey="status"
                    filterStatuses={ALL_FILTER_STATUSES}
                    columns={["Number", "Full Name", "Status", "Date"]}
                    renderRow={(c, index) => (
                        <div
                            className="cl-table-row"
                            key={c.id + index}
                            onClick={() => navigate(`/cases/${c.id}`)}
                        >
                            <span>{c.id}</span>
                            <span>{c.name}</span>
                            <StatusBadge status={c.status}/>
                            <span>{c.date}</span>
                            <ArrButton onClick={() => navigate(`/cases/${c.id}`)}/>
                        </div>
                    )}
                />

        </div>
    );
}

