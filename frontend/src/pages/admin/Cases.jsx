import {useState, useEffect, useRef} from "react";
import {
    GlassCard,
    StatusBadge,
    Modal,
} from "../../components/Mini.jsx";
import axios from "axios";
import Loader from "../../components/Loader.jsx";

const API_BASE = "http://localhost:8080/office/admin";

const FILTERS = [
    { key: "REGISTERED",          label: "Registered",          color: "#c8a0ff" },
    { key: "WAITING_FOR_CONTACT", label: "Waiting for Contact", color: "#56ccf2" },
    { key: "IN_PROGRESS",         label: "In Progress",         color: "#ffa03c" },
    { key: "IN_COURT",            label: "In Court",            color: "#ff65b2" },
    { key: "CLOSED",              label: "Closed",              color: "#6ddd8a" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Модалка: Добавление Нового Водителя (DriverDTO)
// ─────────────────────────────────────────────────────────────────────────────
function CreateDriverModal({ onClose, onSave }) {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        phone: "",
        email: "",
        passportNumber: "",
        pesel: "",
        birthDate: "",
        notes: "Registered via admin panel"
    });
    const [err, setErr] = useState("");

    const handleSave = async () => {
        if (!form.name.trim() || !form.surname.trim() || !form.passportNumber.trim() || !form.birthDate) {
            return setErr("Name, Surname, Birth Date and Document Number are required.");
        }
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE}/drivers`, form, { headers: { Authorization: `Bearer ${token}` } });
            onSave();
            onClose();
        } catch (e) {
            setErr("Validation failed or database rejected the request.");
        }
    };

    return (
        <Modal title="Add New Driver" onClose={onClose}>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
                <div className="ap-field">
                    <div className="ap-label">Name</div>
                    <input className="glass-input" placeholder="Jan" value={form.name}
                           onChange={e => setForm({...form, name: e.target.value})}/>
                </div>
                <div className="ap-field">
                    <div className="ap-label">Surname</div>
                    <input className="glass-input" placeholder="Kowalski" value={form.surname}
                           onChange={e => setForm({...form, surname: e.target.value})}/>
                </div>
            </div>
            <div className="ap-field">
                <div className="ap-label">Birth Date</div>
                <input className="glass-input" type="date" value={form.birthDate}
                       onChange={e => setForm({...form, birthDate: e.target.value})}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Passport Number</div>
                <input className="glass-input" placeholder="e.g. XYZ12345" value={form.passportNumber}
                       onChange={e => setForm({...form, passportNumber: e.target.value})}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Pesel</div>
                <input className="glass-input" placeholder="1241212345" value={form.pesel}
                       onChange={e => setForm({...form, pesel: e.target.value})}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Phone</div>
                <input className="glass-input" placeholder="000 000 000" value={form.phone}
                       onChange={e => setForm({...form, phone: e.target.value})}/>
            </div>
            <div className="ap-field">
                <div className="ap-label">Email</div>
                <input className="glass-input" type="email" placeholder="driver@gmail.com" value={form.email}
                       onChange={e => setForm({...form, email: e.target.value})}/>
            </div>
            {err && <div className="ap-error">{err}</div>}
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Add Driver</button>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Модалка: Добавление Новой Машины (VehicleDTO)
// ─────────────────────────────────────────────────────────────────────────────
function CreateCarModal({drivers, onClose, onSave}) {
    const [form, setForm] = useState({ plateNumber: "", brand: "", model: "", color: "", idDriver: "" });
    const [err, setErr] = useState("");

    const handleSave = async () => {
        if (!form.plateNumber.trim() || !form.brand.trim() || !form.model.trim() || !form.idDriver) {
            return setErr("Plate, Brand, Model and Driver assignment are required.");
        }
        try {
            const token = localStorage.getItem("token");
            const payload = { ...form, idDriver: parseInt(form.idDriver, 10) };
            await axios.post(`${API_BASE}/vehicles`, payload, { headers: { Authorization: `Bearer ${token}` } });
            onSave();
            onClose();
        } catch (e) {
            setErr("Error saving vehicle to database.");
        }
    };

    return (
        <Modal title="Add New Vehicle" onClose={onClose}>
            <div className="ap-field">
                <div className="ap-label">Plate Number</div>
                <input className="glass-input" placeholder="e.g. WI12345" value={form.plateNumber} onChange={e => setForm({...form, plateNumber: e.target.value})} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="ap-field">
                    <div className="ap-label">Brand</div>
                    <input className="glass-input" placeholder="e.g. Skoda" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
                </div>
                <div className="ap-field">
                    <div className="ap-label">Model</div>
                    <input className="glass-input" placeholder="e.g. Octavia" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
                </div>
            </div>
            <div className="ap-field">
                <div className="ap-label">Color</div>
                <input className="glass-input" placeholder="Black" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
            </div>
            <div className="ap-field">
                <div className="ap-label">Assign Driver</div>
                <select className="glass-select" value={form.idDriver} onChange={e => setForm({...form, idDriver: e.target.value})}>
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => <option key={d.idDriver} value={d.idDriver}>{d.name} {d.surname}</option>)}
                </select>
            </div>
            {err && <div className="ap-error">{err}</div>}
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Add Vehicle</button>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Модалка: Регистрация Нового Дела (AdminCaseDTO)
// ─────────────────────────────────────────────────────────────────────────────
function RegisterCaseModal({ drivers, cars, onClose, onSave }) {
    const [form, setForm] = useState({
        violationDate: "",
        fineAmount: "",
        idDriver: "",
        plateNumber: "",
        address: ""
    });
    const [err, setErr]   = useState("");
    const [photoFile, setPhotoFile] = useState(null);

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErr(""); };

    const handleSave = async () => {
        if (!form.violationDate.trim() || !form.idDriver || !form.plateNumber || !form.address.trim()) {
            return setErr("Driver, Vehicle, Date and Address are required.");
        }
        const fine = parseFloat(form.fineAmount);
        if (isNaN(fine) || fine < 0) return setErr("Enter a valid fine amount.");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("violationDate", form.violationDate);
            formData.append("fineAmount", fine);
            formData.append("idDriver", parseInt(form.idDriver, 10));
            formData.append("plateNumber", form.plateNumber);
            formData.append("address", form.address);

            if (photoFile) {
                formData.append("photo", photoFile);
            }

            await axios.post(`${API_BASE}/case`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            onSave();
            onClose();
        } catch (e) {
            setErr("Error creating case. Check your database connection.");
        }
    };

    return (
        <Modal title="Register New Case" onClose={onClose}>
            {/* 1. Выбор Водителя */}
            <div className="ap-field">
                <div className="ap-label">Select Driver</div>
                <select className="glass-select" value={form.idDriver} onChange={e => set("idDriver", e.target.value)}>
                    <option value="">-- Choose Driver --</option>
                    {drivers.map(d => <option key={d.idDriver}
                                              value={d.idDriver}>{d.name} {d.surname} {d.email}</option>)}
                </select>
            </div>

            {/* 2. Выбор Машины */}
            <div className="ap-field">
                <div className="ap-label">Select Car (Plate)</div>
                <select className="glass-select" value={form.plateNumber}
                        onChange={e => set("plateNumber", e.target.value)}>
                    <option value="">-- Choose Vehicle --</option>
                    {cars.map(c => <option key={c.plateNumber}
                                           value={c.plateNumber}>{c.brand} {c.model} {c.plateNumber}</option>)}
                </select>
            </div>

            {/* 3. Адрес Нарушения */}
            <div className="ap-field">
                <div className="ap-label">Violation / Incident Address</div>
                <input className="glass-input" placeholder="e.g. A2 Highway, 104 km, Poznań" value={form.address}
                       onChange={e => set("address", e.target.value)}/>
            </div>

            {/* 4. Дата Нарушения */}
            <div className="ap-field">
                <div className="ap-label">Violation Date</div>
                <input className="glass-input" type="date" value={form.violationDate}
                       onChange={e => set("violationDate", e.target.value)}/>
            </div>

            {/* 5. Сумма Штрафа */}
            <div className="ap-field">
                <div className="ap-label">Fine Amount (PLN)</div>
                <div className="ap-amount-wrap">
                    <span className="ap-currency">PLN</span>
                    <input className="ap-amount-input" type="number" min="0" step="0.01" placeholder="0.00"
                           value={form.fineAmount} onChange={e => set("fineAmount", e.target.value)}/>
                </div>
            </div>

            {/* ПОЛЕ ЗАГРУЗКИ ФАЙЛА */}
            <div className="ap-field">
                <div className="ap-label">Upload Violation Photo</div>
                <input
                    className="glass-input"
                    type="file"
                    accept="image/*"
                    onChange={e => setPhotoFile(e.target.files[0])} // Сохраняем файл в стейт
                />
            </div>

            {err && <div className="ap-error">{err}</div>}

            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSave}>Register</button>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Модалка: Архивация Дела
// ─────────────────────────────────────────────────────────────────────────────
function ArchiveModal({caseItem, onClose, onConfirm}) {
    const today = new Date().toISOString().split("T")[0];
    const [closedDate, setClosedDate] = useState(today);

    const handleConfirm = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${API_BASE}/cases/${caseItem.numberCase}/archive`, { closedDate }, { headers: { Authorization: `Bearer ${token}` } });
            onConfirm();
            onClose();
        } catch (e) {
            alert("Error archiving case");
        }
    };

    return (
        <Modal title="Verify & Archive Case" onClose={onClose}>
            <div style={{ background: "rgba(109,221,138,0.07)", border: "1px solid rgba(109,221,138,0.25)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Archiving case</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>CD-{caseItem.numberCase}</div>
                <div style={{ fontSize: 12 }}>Fine: {Number(caseItem.fineAmount).toFixed(2)} PLN</div>
            </div>
            <div className="ap-field">
                <div className="ap-label">Closure Date</div>
                <input className="glass-input" type="date" value={closedDate} max={today} onChange={e => setClosedDate(e.target.value)} />
            </div>
            <div className="ap-footer">
                <button className="btn-danger" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleConfirm}>✓ Confirm Archive</button>
            </div>
        </Modal>
    );
}
// ─────────────────────────────────────────────────────────────────────────────
// Главная Страница Реестра Дел
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminCases() {
    const [cases, setCases]           = useState([]);
    const [drivers, setDrivers]       = useState([]);
    const [cars, setCars]             = useState([]);
    const [employees, setEmployees]   = useState([]);

    const [activeFilter, setFilter]   = useState(null);
    const [showArchived, setShowArch] = useState(false);
    const [search, setSearch]         = useState("");
    const [loading, setLoading]       = useState(true);

    const [showRegister, setRegister]   = useState(false);
    const [showAddDriver, setAddDriver] = useState(false);
    const [showAddCar, setAddCar]       = useState(false);
    const [archiveTarget, setTarget]    = useState(null);

    const fileInputRef = useRef(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [casesRes, driversRes, carsRes, empRes] = await Promise.all([
                axios.get(`${API_BASE}/cases`, config),
                axios.get(`http://localhost:8080/office/drivers/short`, config),
                axios.get(`${API_BASE}/vehicles`, config),
                axios.get(`${API_BASE}/users`, config)
            ]);

            setCases(casesRes.data);
            setDrivers(driversRes.data);
            setCars(carsRes.data);
            setEmployees(empRes.data);
        } catch (e) {
            console.error("Error fetching system registry data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssign = async (numberCase, empId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`${API_BASE}/cases/${numberCase}/assign`,
                { employeeId: empId ? parseInt(empId, 10) : null },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (e) {
            alert("Error assigning case to employee");
        }
    };

    const handleJsonImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);

                const token = localStorage.getItem("token");
                await axios.post(`${API_BASE}/cases/import`, jsonData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                alert("JSON cases imported successfully!");
                fetchData();
            } catch (err) {
                alert("Import failed. Ensure the file contains a valid JSON list of cases.");
                console.error(err);
            }
        };
        reader.readAsText(file);
        event.target.value = "";
    };

    const visible = cases.filter(c => {
        if (!c) return false;
        if (!showArchived && c.status === "ARCHIVED")  return false;
        if ( showArchived && c.status !== "ARCHIVED") return false;
        if (activeFilter && c.status !== activeFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return String(c.numberCase).includes(q) || c.status?.toLowerCase().includes(q);
        }
        return true;
    });

    const totalActive   = cases.filter(c => c.status !== "ARCHIVED").length;
    const totalArchived = cases.filter(c => c.status === "ARCHIVED").length;
    const unassigned    = cases.filter(c => c.status !== "ARCHIVED" && !c.employeeId).length;
    const readyClose    = cases.filter(c => c.status === "CLOSED").length;

    if (loading) return <Loader/>;

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                style={{display: "none"}}
                accept=".json"
                onChange={handleJsonImport}
            />

            <div className="adm-stat-row">
                {[
                    {label: "Active Cases", value: totalActive, color: "var(--accent-purple)"},
                    {label: "Unassigned", value: unassigned, color: "var(--accent-orange)"},
                    {label: "Ready to Archive", value: readyClose, color: "var(--accent-green)"},
                    {label: "Archived Total", value: totalArchived, color: "var(--text-muted)"},
                ].map(s => (
                    <div key={s.label} className="adm-stat-chip">
                        <span className="adm-stat-value" style={{color: s.color}}>{s.value}</span>
                        <span className="adm-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="adm-toolbar">
                <input className="glass-input adm-search" placeholder="Search by ID" value={search}
                       onChange={e => setSearch(e.target.value)}/>
                <div className="adm-toolbar-actions" style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                    <button
                        className="adm-btn-ghost"
                        style={{borderColor: "#c8a0ff", color: "#c8a0ff"}}
                        onClick={() => fileInputRef.current.click()}
                    >
                        Import
                    </button>
                    <button
                        className="adm-btn-ghost"
                        style={{borderColor: "#FF69B4", color: "#FF69B4"}}
                        onClick={() => setRegister(true)}
                    >
                        Register Case
                    </button>
                    <button className="adm-btn-ghost" style={{borderColor: "#6ab0ff", color: "#6ab0ff"}}
                            onClick={() => setAddDriver(true)}>Driver
                    </button>
                    <button className="adm-btn-ghost" style={{borderColor: "#6ddd8a", color: "#6ddd8a"}}
                            onClick={() => setAddCar(true)}>Car
                    </button>
                    <button
                        className="adm-btn-ghost"
                        style={showArchived ? {borderColor: "var(--accent-purple)", color: "var(--accent-purple)"} : {}}
                        onClick={() => {
                            setShowArch(p => !p);
                            setFilter(null);
                        }}
                    >
                        {showArchived ? "←Active Cases" : "Archived"}
                    </button>
                </div>
            </div>

            {!showArchived && (
                <div className="adm-filter-row">
                    <div className={`adm-filter-chip ${activeFilter === null ? "active" : ""}`}
                         onClick={() => setFilter(null)}>
                        All Active
                    </div>
                    {FILTERS.map(f => (
                        <div
                            key={f.key}
                            className={`adm-filter-chip ${activeFilter === f.key ? "active" : ""}`}
                            onClick={() => setFilter(p => p === f.key ? null : f.key)}
                        >
                            <span className="adm-chip-dot" style={{background: f.color}}/>
                            {f.label}
                        </div>
                    ))}
                </div>
            )}

            <div style={{padding: "0 20px 40px"}}>
                <GlassCard>
                    <div className="adm-table-head">
                        <span>Case ID</span>
                        <span>Violation Date</span>
                        <span>Fine Amount</span>
                        <span>Status</span>
                        <span>Assigned To</span>
                        {!showArchived?<span>Archiving</span>:<span/>}
                    </div>

                    {visible.length === 0
                        ? <div className="cl-empty">No cases found.</div>
                        : visible.map((c, i) => {
                            const isArchivedCase = c.status === "ARCHIVED";
                            const canArchive = c.status === "CLOSED";
                            const currentWorkerName = c.name ? `${c.name} ${c.surname || ""}` : "";

                            return (
                                <div key={c.numberCase} className="adm-table-row"
                                     style={{animationDelay: `${i * 0.04}s`}}>
                                    <span className="adm-case-id">CD-{c.numberCase}</span>
                                    <span className="adm-cell-muted">{c.violationDate}</span>
                                    <span style={{
                                        color: "var(--accent-orange)",
                                        fontWeight: 600
                                    }}>{Number(c.fineAmount).toFixed(2)} PLN</span>
                                    <StatusBadge status={c.status} />

                                    {isArchivedCase ? (
                                        <div style={{fontSize: 11, lineHeight: 1.5}}>
                                            <div style={{color: "#fff"}}>{currentWorkerName || "—"}</div>
                                        </div>
                                    ) : (
                                        <select
                                            className="adm-assign-select glass-select"
                                            value={c.employeeId || " "}
                                            onChange={e => handleAssign(c.numberCase, e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <option value="">— Unassigned —</option>
                                            {employees
                                                .filter(emp => (emp.role === "EMPLOYEE") && emp.active === true)
                                                .map(e => {
                                                    const empId = e.userId || e.id || e.employeeId;
                                                    return (
                                                        <option key={empId} value={empId}>
                                                            {e.name} {e.surname}
                                                        </option>
                                                    );
                                                })
                                            }
                                        </select>
                                    )}

                                    <div className="adm-row-actions">
                                        {canArchive && (
                                            <button className="adm-archive-btn" onClick={() => setTarget(c)}>
                                                Archive
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </GlassCard>
            </div>

            {showRegister && <RegisterCaseModal drivers={drivers} cars={cars} onClose={() => setRegister(false)}
                                                onSave={fetchData}/>}
            {showAddDriver && <CreateDriverModal onClose={() => setAddDriver(false)} onSave={fetchData}/>}
            {showAddCar && <CreateCarModal drivers={drivers} onClose={() => setAddCar(false)} onSave={fetchData}/>}
            {archiveTarget &&
                <ArchiveModal caseItem={archiveTarget} onClose={() => setTarget(null)} onConfirm={fetchData}/>}
        </>
    );
}