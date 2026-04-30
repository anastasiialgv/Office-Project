import { useState } from "react";
import { TopBar, StatusBadge, ArrButton } from "../components/Mini.jsx";
import { useNavigate } from "react-router-dom";
// ── Все кейсы (моковые данные) ───────────────────────────
export const ALL_CASES = [
    {
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
}));

const ALL_FILTER_STATUSES = ["CLOSED", "IN PROGRESS", "DISPUTED", "WAITING FOR CONTACT"];
const PAGE_SIZE = 9;

export default function CasesList({ onSelect, onMenuClick }) {
    const [search, setSearch]           = useState("");
    const [page, setPage]               = useState(1);
    const navigate = useNavigate();
    const [activeFilters, setFilters] = useState(new Set());
    // 2. Состояние для показа/скрытия панели фильтров
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);

    const toggleFilter = (s) => {
        setFilters((prev) => {
            const next = new Set(prev);
            next.has(s) ? next.delete(s) : next.add(s);
            return next;
        });
        setPage(1);
    };

    // Фильтрация
    const filtered = ALL_CASES.filter((c) => {
        const matchF = activeFilters.size === 0 || activeFilters.has(c.status);
        const q = search.toLowerCase();
        const matchS = !q || c.name.toLowerCase().includes(q) || c.id.includes(q);
        return matchF && matchS;
    });

    // Пагинация (Логика исправлена)
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    // currentPage гарантирует, что мы не уйдем за пределы страниц после фильтрации
    const currentPage = page > pages ? pages : page;

    const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const from  = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const to    = Math.min(currentPage * PAGE_SIZE, total);

    const chipKey = (s) => s.replace(/ /g, "_");

    return (

            <div className="page-wrap">
                <TopBar title="My cases" onMenuClick={onMenuClick}/>
                <div className="cl-search-panel">
                    <div className="cl-search-row">
                        <input
                            className="glass-input"
                            placeholder="🔍 Search by name or case number"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                        <button
                            className={`cl-filter-btn ${showFiltersPanel ? 'active' : ''}`}
                            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                        >
                            ≡ Filters
                        </button>
                    </div>

                        {showFiltersPanel && (
                            <div className="cl-chips-container">
                                <div className="cl-chips">
                                    {ALL_FILTER_STATUSES.map((s) => (
                                        <div
                                            key={s}
                                            className={`cl-chip chip-${chipKey(s)} ${activeFilters.has(s) ? 'selected' : ''}`}
                                            onClick={() => toggleFilter(s)}
                                        >
                                            {s}
                                            {activeFilters.has(s) && <span className="cl-chip-check">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>

                <div className="cl-showing">Showing {from}–{to} of {total}</div>

                <div className="cl-table-wrap">
                    <div className="cl-table-head">
                        <span>Number Case</span>
                        <span>Full Name</span>
                        <span>Status</span>
                        <span>Violation Date ↓</span>
                        <span/>
                    </div>

                    {slice.length === 0 ? (
                        <div className="cl-empty">No cases match your search or filters.</div>
                    ) : (
                        slice.map((c, index) => (
                            <div className="cl-table-row" key={c.id + index} onClick={() => navigate(`/cases/${c.id}`)}>
                                <span>{c.id}</span>
                                <span>{c.name}</span>
                                <StatusBadge status={c.status}/>
                                <span>{c.date}</span>
                                <ArrButton onClick={() => navigate(`/cases/${c.id}`)} />
                            </div>
                        ))
                    )}
                </div>

                {/* Исправленная пагинация (используем currentPage вместо safeP) */}
                <div className="cl-pag">
                    <button
                        className="cl-pag-btn"
                        disabled={currentPage === 1}
                        onClick={() => setPage(currentPage - 1)}
                    >
                        ‹ Prev
                    </button>

                    {Array.from({length: pages}, (_, i) => (
                        <button
                            key={i + 1}
                            className={`cl-pag-btn${currentPage === i + 1 ? " active" : ""}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="cl-pag-btn"
                        disabled={currentPage === pages}
                        onClick={() => setPage(currentPage + 1)}
                    >
                        Next ›
                    </button>
                </div>
            </div>
    );
}