function escapeHtml(value) {
  const container = document.createElement('div');
  container.textContent = value;
  return container.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return '';

  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) {
    return headers ? headers.join(',') : '';
  }

  const columns = headers || Object.keys(rows[0]);
  const lines = [columns.map(escapeCsvField).join(',')];

  rows.forEach(row => {
    lines.push(columns.map(column => escapeCsvField(row[column])).join(','));
  });

  return lines.join('\n');
}

function downloadCSV(rows, filename, headers = null) {
  const csv = arrayToCSV(rows, headers);
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

async function copyToClipboard(text, statusElement) {
  const isDevToolsProtocol = window.location.protocol === 'devtools:';

  if (!isDevToolsProtocol) {
    try {
      await navigator.clipboard.writeText(text);
      if (statusElement) showCopySuccess(statusElement);
      return;
    } catch (error) {
      if (
        !error.message?.includes('permissions policy') &&
        !error.message?.includes('Permissions policy')
      ) {
        console.warn('Clipboard API failed, trying fallback:', error);
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
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    if (/ipad|iphone/i.test(navigator.userAgent)) {
      const range = document.createRange();
      range.selectNodeContents(textarea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textarea.setSelectionRange(0, 999999);
    }

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (copied) {
      if (statusElement) showCopySuccess(statusElement);
    } else {
      throw new Error('execCommand copy failed');
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    if (statusElement) {
      const originalContent = statusElement.innerHTML;
      statusElement.innerHTML =
        '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
      setTimeout(() => {
        if (statusElement) statusElement.innerHTML = originalContent;
      }, 1500);
    }
  }
}

function showCopySuccess(statusElement) {
  if (!statusElement) return;

  const originalContent = statusElement.innerHTML;
  statusElement.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => {
    if (statusElement) statusElement.innerHTML = originalContent;
  }, 1500);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
