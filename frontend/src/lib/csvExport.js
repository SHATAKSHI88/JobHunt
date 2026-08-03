// Converts an array of flat objects into a CSV file and triggers a
// browser download. No backend round-trip needed — the data is already
// on the client by the time someone wants to export it.
export const downloadCSV = (filename, rows) => {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);

    const escapeCell = (value) => {
        const str = value === null || value === undefined ? "" : String(value);
        // wrap in quotes and escape any embedded quotes if it contains a
        // comma, quote, or newline — standard CSV escaping
        if (/[",\n]/.test(str)) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
