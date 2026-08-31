import {useEffect, useRef, useState} from "react";

export function SearchableSelect({ options, value, onChange, placeholder, displayKey }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => String(o.id || o.value || o.plateNumber || o.idDriver) === String(value));

    const getDisplayText = (item) => {
        if (typeof displayKey === "function") return displayKey(item);
        return item[displayKey];
    };

    const filteredOptions = options.filter(o => {
        const text = getDisplayText(o).toLowerCase();
        return text.includes(searchQuery.toLowerCase());
    });

    return (
        <div ref={containerRef} className="searchable-select-wrapper">
            {!isOpen && (
                <div
                className="glass-input searchable-select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span style={{ color: selectedOption ? "inherit" : "var(--text-hint)" }}>
                    {selectedOption ? getDisplayText(selectedOption) : placeholder}
                </span>
                <span>▼</span>
            </div>
            )}
            {isOpen && (
                <div className="searchable-dropdown">
                    <div className="searchable-input-wrap">
                        <input
                            autoFocus
                            className="glass-input"
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    <div className="searchable-options-list">
                        {filteredOptions.length === 0 ? (
                            <div className="searchable-option-empty">Not found</div>
                        ) : (
                            filteredOptions.map(o => {
                                const idVal = o.plateNumber ?? o.idDriver ?? o.id;
                                return (
                                    <div
                                        key={idVal}
                                        className="searchable-option-item"
                                        onClick={() => {
                                            onChange(idVal);
                                            setIsOpen(false);
                                            setSearchQuery("");
                                        }}
                                    >
                                        {getDisplayText(o)}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}