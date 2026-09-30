function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeCsvField(field) {
    if (typeof field !== 'string') return field;
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
}

function arrayToCSV(data, delimiter = ',') {
    if (!Array.isArray(data)) return '';
    const rows = data.map(row => {
        if (!Array.isArray(row)) return '';
        return row.map(cell => escapeCsvField(String(cell ?? ''))).join(delimiter);
    });
    return rows.join('\n');
}

function downloadCSV(data, filename = 'data.csv') {
    const csv = arrayToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function copyToClipboard(text, showNotification = true) {
    try {
        await navigator.clipboard.writeText(text);
        if (showNotification) {
            showCopySuccess();
        }
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

function showCopySuccess(message = 'Copied to clipboard!') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 10000;
        font-family: sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
