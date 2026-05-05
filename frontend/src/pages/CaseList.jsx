import { TopBar, StatusBadge, ArrButton } from "../components/Mini.jsx";
import Table  from "../components/Table.jsx"
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

/*{
        id: "1287327123", name: "John Mille", status: "CLOSED", date: "Jan 11, 2050",
        violation: "2025-09-10", due: "2025-09-24", fine: 50, overdue: 1,
        caseAddr: "18 Nowowiejska St., Warszawa", payment: false,
        phone: "+48 601 234 567", address: "15 Lipowa St., Warsaw", email: "johnmille@gmail.com",
        fullname: "John Mille", birth: "1989-03-12", pesel: "89031212345", passport: "XR4598821",
        notes: "Prefers contact by email.",
        vehicle: { num: "WWA12345", model: "Corolla", brand: "Toyota", color: "Silver" },
    },
    {
        id: "1226347323", name: "Anna Kowalska", status: "IN PROGRESS", date: "Jan 11, 2050",
        violation: "2025-08-15", due: "2025-08-30", fine: 120, overdue: 0,
        caseAddr: "5 Marszałkowska St., Warszawa", payment: true,
        phone: "+48 602 111 222", address: "5 Marszałkowska St., Warsaw", email: "anna.k@example.com",
        fullname: "Anna Kowalska", birth: "1990-07-22", pesel: "90072212345", passport: "AB1234567",
        notes: "",
        vehicle: { num: "WX98765", model: "Golf", brand: "Volkswagen", color: "Black" },
    },
    // ... (остальные ваши данные)
    // Примечание: Для корректной работы React ключи в списке должны быть уникальными.
    // Если в реальных данных ID дублируются, добавьте индекс в key={c.id + index}.
].concat(Array(15).fill({
    id: "7243872383", name: "Natalie Green", status: "DISPUTED", date: "Jan 5, 2050",
    violation: "2025-05-25", due: "2025-06-08", fine: 350, overdue: 5,
    caseAddr: "3 Żwirki i Wigury, Warszawa", vehicle: { num: "GD11223", model: "C-Class", brand: "Mercedes", color: "Red" }
}));*/