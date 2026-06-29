import { useState } from "react";
import { STATUS_STYLES, TYPES_STYLES, CONTACT_TYPES_STYLES } from "./Mini.jsx";

const pageSize = 9;

export default function Table({
                                  data = [],
                                  filterStatuses = [],
                                  filterKey = "status",
                                  columns = [],
                                  renderRow
                              }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [activeFilters, setFilters] = useState(new Set());
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const getChipClass = (val) => String(val).toLowerCase();

    const toggleFilter = (val) => {
        setFilters((prev) => {
            const next = new Set(prev);
            if (next.has(val)) next.delete(val);
            else next.add(val);
            return next;
        });
        setPage(1);
    };

    const filtered = data.filter((item) => {
        const currentValue = item[filterKey];
        const matchF = activeFilters.size === 0 || activeFilters.has(currentValue);

        const q = search.toLowerCase().trim();
        const matchS = !q || Object.values(item).some(val =>
            String(val).toLowerCase().includes(q)
        );

        return matchF && matchS;
    });

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = page > pages ? pages : page;
    const slice = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, total);

    return (
        <div className="datatable-root">
            <div className="cl-search-panel">
                <div className="cl-search-row">
                    <input
                        className="glass-input"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    {filterStatuses.length > 0 && (
                        <button className="cl-filter-btn" onClick={() => setShowFiltersPanel(!showFiltersPanel)}>
                            ≡ Filters
                        </button>
                    )}
                </div>

                {showFiltersPanel && (
                    <div className="cl-chips">
                        {filterStatuses.map((s) => {
                            const statusColor =
                                (typeof STATUS_STYLES !== 'undefined' && STATUS_STYLES[s]?.color) ||
                                (typeof CONTACT_TYPES_STYLES !== 'undefined' && CONTACT_TYPES_STYLES[s]?.color) ||
                                (typeof TYPES_STYLES !== 'undefined' && TYPES_STYLES[s]?.color) ||
                                "#eee";

                            const isActive = activeFilters.has(s);

                            return (
                                <div
                                    key={s}
                                    className={`cl-chip chip-${getChipClass(s)} ${isActive ? "active" : ""}`}
                                    onClick={() => toggleFilter(s)}
                                    style={{"--chip-color": statusColor}}
                                >
                                    <span className="cl-chip-dot"/>

                                    {/* 🌟 Единственное место, где мы убираем подчеркивания для пользователя */}
                                    {s ? String(s).replace(/_/g, " ") : ""}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="cl-showing">Showing {from}–{to} of {total}</div>

            <div className="cl-table-wrap">
                <div className="cl-table-head">
                    {columns.map((col, idx) => <span key={idx}>{col}</span>)}
                    <span/>
                </div>

                {slice.length === 0 ? (
                    <div className="cl-empty">No results found.</div>
                ) : (
                    slice.map((item, index) => renderRow(item, index))
                )}
            </div>

            <div className="cl-pag">
                <button className="cl-pag-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Prev</button>
                {Array.from({length: pages}, (_, i) => (
                    <button
                        key={i + 1}
                        className={`cl-pag-btn ${currentPage === i + 1 ? "active" : ""}`}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button className="cl-pag-btn" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next ›</button>
            </div>
        </div>
    );
}