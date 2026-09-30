function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeCsvField(value) {
    if (value == null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function arrayToCSV(data, headers) {
    if (!data || data.length === 0) {
        return headers ? headers.join(',') : '';
    }
    const keys = headers || Object.keys(data[0]);
    const lines = [keys.map(escapeCsvField).join(',')];
    data.forEach(row => {
        const values = keys.map(key => {
            const val = row[key];
            return escapeCsvField(val);
        });
        lines.push(values.join(','));
    });
    return lines.join('\n');
}

function downloadCSV(data, filename, headers = null) {
    const csvContent = arrayToCSV(data, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function copyToClipboard(text, successElement) {
    const isSecureContext = window.isSecureContext;
    if (!isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            if (successElement) {
                showCopySuccess(successElement);
            }
            return;
        } catch (err) {
            if (!err.message?.includes('denied') && !err.message?.includes('Denied')) {
                console.error('Clipboard API failed:', err);
            }
        }
    }
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        if (navigator.userAgent.match(/ipad|iphone/i)) {
            const range = document.createRange();
            range.selectNodeContents(textarea);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textarea.setSelectionRange(0, 999999);
        }
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
            if (successElement) {
                showCopySuccess(successElement);
            }
        } else {
            throw new Error('execCommand failed');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        if (successElement) {
            const originalHTML = successElement.innerHTML;
            successElement.innerHTML = 'Failed to copy';
            setTimeout(() => {
                if (successElement) {
                    successElement.innerHTML = originalHTML;
                }
            }, 2000);
        }
    }
}

function showCopySuccess(element) {
    if (!element) return;
    const originalHTML = element.innerHTML;
    element.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
    setTimeout(() => {
        if (element) {
            element.innerHTML = originalHTML;
        }
    }, 2000);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
