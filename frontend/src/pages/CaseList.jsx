// ─────────────────────────────────────────────────────────────────────────────
// pages/CasesList.jsx — страница «My Cases» (список дел)
//
// Функции:
//   • Поиск по имени / номеру дела
//   • Фильтрация по статусу (chips с крестиком)
//   • Таблица с кликабельными строками → onSelect(caseObj)
//   • Пагинация
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { TopBar, StatusBadge } from "../components/Mini.jsx";

// ── Все кейсы (моковые данные, замени на fetch) ───────────────────────────
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
    {
        id: "1293892844", name: "David Nowak", status: "REGISTERED", date: "Jan 10, 2050",
        violation: "2025-07-01", due: "2025-07-15", fine: 80, overdue: 2,
        caseAddr: "12 Puławska St., Warszawa", payment: false,
        phone: "+48 603 333 444", address: "12 Puławska St., Warsaw", email: "dnowak@mail.com",
        fullname: "David Nowak", birth: "1985-11-03", pesel: "85110312345", passport: "CD9876543",
        notes: "Prefers phone contact.",
        vehicle: { num: "WI54321", model: "Passat", brand: "Volkswagen", color: "White" },
    },
    {
        id: "3912213927", name: "Emily Johnson", status: "DISPUTED", date: "Jan 9, 2050",
        violation: "2025-06-20", due: "2025-07-04", fine: 200, overdue: 3,
        caseAddr: "7 Prosta St., Warszawa", payment: false,
        phone: "+48 604 555 666", address: "7 Prosta St., Warsaw", email: "emily.j@gmail.com",
        fullname: "Emily Johnson", birth: "1992-04-15", pesel: "92041512345", passport: "EF5551234",
        notes: "Case under legal review.",
        vehicle: { num: "KR12345", model: "A4", brand: "Audi", color: "Gray" },
    },
    {
        id: "1209342346", name: "Mateusz Wiśniewski", status: "WAITING FOR CONTACT", date: "Jan 5, 2050",
        violation: "2025-06-01", due: "2025-06-15", fine: 60, overdue: 0,
        caseAddr: "22 Wola St., Warszawa", payment: true,
        phone: "+48 605 777 888", address: "22 Wola St., Warsaw", email: "mateusz.w@wp.pl",
        fullname: "Mateusz Wiśniewski", birth: "1988-09-10", pesel: "88091012345", passport: "GH3334444",
        notes: "",
        vehicle: { num: "WF67890", model: "3 Series", brand: "BMW", color: "Blue" },
    },
    {
        id: "7243872383", name: "Natalie Green", status: "DISPUTED", date: "Jan 5, 2050",
        violation: "2025-05-25", due: "2025-06-08", fine: 350, overdue: 5,
        caseAddr: "3 Żwirki i Wigury, Warszawa", payment: false,
        phone: "+48 606 999 000", address: "3 Żwirki i Wigury, Warsaw", email: "natalie.g@outlook.com",
        fullname: "Natalie Green", birth: "1995-02-28", pesel: "95022812345", passport: "IJ7778888",
        notes: "Disputed via attorney.",
        vehicle: { num: "GD11223", model: "C-Class", brand: "Mercedes", color: "Red" },
    },
];

const ALL_FILTER_STATUSES = ["CLOSED", "IN PROGRESS", "DISPUTED", "WAITING FOR CONTACT"];
const PAGE_SIZE = 6;


// ── Компонент ─────────────────────────────────────────────────────────────
export default function CasesList({ onSelect, onMenuClick }) {

    const [search, setSearch]           = useState("");
    const [activeFilters, setFilters]   = useState(new Set(ALL_FILTER_STATUSES));
    const [page, setPage]               = useState(1);

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

    // Пагинация
    const total  = filtered.length;
    const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safeP  = Math.min(page, pages);
    const slice  = filtered.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);
    const from   = total === 0 ? 0 : (safeP - 1) * PAGE_SIZE + 1;
    const to     = Math.min(safeP * PAGE_SIZE, total);

    const chipKey = (s) => s.replace(/ /g, "_");

    return (
        <>
            <div className="page-wrap">
                <TopBar title="My cases" onMenuClick={onMenuClick}/>

                {/* ── Search + Filters ── */}
                <div className="cl-search-panel">
                    {/* Строка с поиском и кнопкой */}
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
                        <button className="cl-filter-btn">≡ Filters</button>
                    </div>

                    {/* Блок с чипсами, который теперь будет колонкой */}
                    <div className="cl-chips">
                        {ALL_FILTER_STATUSES.filter((s) => activeFilters.has(s)).map((s) => (
                            <div key={s} className={`cl-chip chip-${chipKey(s)}`}>
                                {s}
                                <button className="cl-chip-x" onClick={() => toggleFilter(s)}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Showing counter ── */}
                <div className="cl-showing">Showing {from}–{to} of {total}</div>

                {/* ── Table ── */}
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
                        slice.map((c) => (
                            <div className="cl-table-row" key={c.id} onClick={() => onSelect(c)}>
                                <span>{c.id}</span>
                                <span>{c.name}</span>
                                <StatusBadge status={c.status}/>
                                <span>{c.date}</span>
                                <span className="cl-arrow">→</span>
                            </div>
                        ))
                    )}
                </div>

                {/* ── Pagination ── */}
                <div className="cl-pag">
                    <button className="cl-pag-btn" disabled={safeP === 1} onClick={() => setPage(safeP - 1)}>
                        ‹ Prev
                    </button>
                    {Array.from({length: pages}, (_, i) => (
                        <button
                            key={i + 1}
                            className={`cl-pag-btn${safeP === i + 1 ? " active" : ""}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button className="cl-pag-btn" disabled={safeP === pages} onClick={() => setPage(safeP + 1)}>
                        Next ›
                    </button>
                </div>
            </div>
        </>
    );
}