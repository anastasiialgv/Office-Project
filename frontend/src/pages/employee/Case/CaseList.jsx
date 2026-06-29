import { StatusBadge, ArrButton } from "../../../components/Mini.jsx";
import Table  from "../../../components/Table.jsx"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {useEffect, useState} from "react";
import Loader from "../../../components/Loader.jsx";

const ALL_FILTER_STATUSES = ["WAITING_FOR_CONTACT", "IN_PROGRESS", "IN_COURT", "CLOSED"];

export default function CasesList() {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortDir, setSortDir] = useState("desc");

    const fetchEmployeeCases = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/office/cases", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCases(response.data);
        } catch (e) {
            console.error("Error fetching employee cases:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeCases();
    }, []);

    const getSortedCases = () => {
        return [...cases].sort((a, b) => {
            if (!a.violationDate) return 1;
            if (!b.violationDate) return -1;

            const dateA = new Date(a.violationDate);
            const dateB = new Date(b.violationDate);

            return sortDir === "desc" ? dateB - dateA : dateA - dateB;
        });
    };

    const toggleSort = () => {
        setSortDir(p => p === "desc" ? "asc" : "desc");
    };

    if (loading) return <Loader/>
    return (
        <>
            <div style={{display: "flex", justifyContent: "flex-end", padding: "0 20px 10px"}}>
                <button
                    className="adm-btn-ghost cl-sort-button"
                    onClick={toggleSort}
                >
                    📅 Date: {sortDir === "desc" ? "⚡ Newest First" : "⏳ Oldest First"}
                </button>
            </div>
            <Table
                data={getSortedCases()}
                filterKey="status"
                filterStatuses={ALL_FILTER_STATUSES}
                columns={["NumberCase", "Full Name", "Status", "Date"]}
                renderRow={(c) => {
                    const caseDisplayId = `CD-${c.numberCase}`;
                    const driverFullName = c.driverName ? `${c.driverName} ${c.driverSurname || ""}` : "Unknown Driver";
                    const displayDate = c.violationDate || "—";

                    return (
                        <div
                            className="cl-table-row"
                            key={c.numberCase}
                            onClick={() => navigate(`/cases/${c.numberCase}`)}
                        >
                            <span>{caseDisplayId}</span>
                            <span>{driverFullName}</span>
                            <StatusBadge status={c.status}/>
                            <span>{displayDate}</span>
                            <ArrButton onClick={() => navigate(`/cases/${c.numberCase}`)}/>
                        </div>
                    );
                }}
            />

        </>
    );
}

