export const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error("Date formatting error:", e);
        return dateStr;
    }
};