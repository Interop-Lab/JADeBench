function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function escapeCsvField(value) {
  const text = value == null ? '' : String(value);
  return /[",\r\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

function arrayToCSV(rows, headers) {
  if (!Array.isArray(rows)) return '';

  if (headers == null && rows.length > 0 && rows.every(row => row && typeof row === 'object' && !Array.isArray(row))) {
    headers = Object.keys(rows[0]);
  }

  if (Array.isArray(headers)) {
    const output = [headers.map(escapeCsvField).join(',')];
    for (const row of rows) {
      output.push(
        (Array.isArray(row)
          ? row
          : headers.map(header => row == null ? undefined : row[header])
        ).map(escapeCsvField).join(',')
      );
    }
    return output.join('\n');
  }

  return rows.map(row => {
    const values = Array.isArray(row) ? row : Object.values(row);
    return values.map(escapeCsvField).join(',');
  }).join('\n');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCSV(data, filename = 'data.csv') {
  downloadFile(arrayToCSV(data), filename, 'text/csv;charset=utf-8;');
}

function downloadJSON(data, filename = 'data.json') {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json;charset=utf-8;');
}

function showCopySuccess(element) {
  if (!element) return;

  const originalText = element.textContent;
  element.textContent = 'Copied!';
  setTimeout(() => {
    element.textContent = originalText;
  }, 2000);
}

function copyToClipboard(text, element) {
  return navigator.clipboard.writeText(text).then(() => {
    showCopySuccess(element);
  });
}

globalThis.showCopySuccess = showCopySuccess;
globalThis.copyToClipboard = copyToClipboard;
globalThis.downloadJSON = downloadJSON;
globalThis.downloadCSV = downloadCSV;
globalThis.arrayToCSV = arrayToCSV;
globalThis.escapeCsvField = escapeCsvField;
globalThis.escapeHtml = escapeHtml;

export {
  arrayToCSV,
  copyToClipboard,
  downloadCSV,
  downloadJSON,
  escapeHtml
};
