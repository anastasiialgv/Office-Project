import { useState } from "react";

const pageSize = 9;

export default function Table({
                                  data = [],
                                  filterStatuses = [],
                                  filterKey = "status", // Указываем, по какому полю фильтровать (по умолчанию status)
                                  columns = [],
                                  renderRow
                              }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [activeFilters, setFilters] = useState(new Set());
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);

    // В твоем CSS классы называются chip-CLOSED, chip-IN_PROGRESS.
    // Функция меняет пробелы на подчеркивания для корректной работы стилей.
    const getChipClass = (val) => String(val).replace(/\s+/g, '_');

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
        // matchF: берем значение из поля, которое передано в filterKey
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
                        {filterStatuses.map((s) => (
                            <div
                                key={s}
                                className={`cl-chip chip-${getChipClass(s)}`}
                                onClick={() => toggleFilter(s)}
                                style={{
                                    cursor: 'pointer',
                                    // Подсветка выбранного фильтра белой рамкой[cite: 2]
                                    border: activeFilters.has(s) ? '1px solid #fff' : '1px solid transparent'
                                }}
                            >
                                {s}
                                {activeFilters.has(s) && <span className="cl-chip-x" style={{marginLeft: '5px'}}>✓</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="cl-showing">Showing {from}–{to} of {total}</div>

            <div className="cl-table-wrap">
                <div className="cl-table-head">
                    {columns.map((col, idx) => <span key={idx}>{col}</span>)}
                    <span />
                </div>

                {slice.length === 0 ? (
                    <div className="cl-empty">No results found.</div>
                ) : (
                    slice.map((item, index) => renderRow(item, index))
                )}
            </div>

            <div className="cl-pag">
                <button className="cl-pag-btn" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>‹ Prev</button>
                {Array.from({ length: pages }, (_, i) => (
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