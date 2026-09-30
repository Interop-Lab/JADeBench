const COPY_SUCCESS_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
const COPY_FAILURE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';

  const field = String(value);
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function arrayToCSV(data, columns) {
  if (!data || data.length === 0) return '';

  const headers = columns || Object.keys(data[0]);
  const rows = [headers.map(escapeCsvField).join(',')];
  for (const item of data) {
    rows.push(headers.map((header) => escapeCsvField(item[header])).join(','));
  }
  return rows.join('\n');
}

function downloadCSV(data, filename) {
  const csv = arrayToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showCopySuccess(button, success = true) {
  if (!button) return;

  const originalContent = button.innerHTML;
  button.innerHTML = success ? COPY_SUCCESS_ICON : COPY_FAILURE_ICON;
  setTimeout(() => {
    button.innerHTML = originalContent;
  }, 1500);
}

function fallbackCopyToClipboard(text, button) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textarea.setSelectionRange(0, 999999);
    }

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopySuccess(button, copied);
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    showCopySuccess(button, false);
  }
}

async function copyToClipboard(text, button) {
  window.location.protocol;
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess(button);
  } catch (error) {
    console.warn('Clipboard API failed, trying fallback:', error);
    fallbackCopyToClipboard(text, button);
  }
}

globalThis.escapeCsvField = escapeCsvField;
globalThis.escapeHtml = escapeHtml;

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
