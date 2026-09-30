export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function escapeCsvField(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function arrayToCSV(data, columns) {
  if (!data || data.length === 0) {
    return columns ? columns.join(',') : '';
  }
  const cols = columns || Object.keys(data[0]);
  const rows = [cols.map(escapeCsvField).join(',')];
  data.forEach(row => {
    const values = cols.map(col => {
      const val = row[col];
      return escapeCsvField(val);
    });
    rows.push(values.join(','));
  });
  return rows.join('\n');
}

export function downloadCSV(data, filename, columns = null) {
  const csv = arrayToCSV(data, columns);
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

export function downloadJSON(data, filename) {
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

export async function copyToClipboard(text, button) {
  const isSecure = window.isSecureContext === true;
  if (!isSecure) {
    try {
      await navigator.clipboard.writeText(text);
      button && showCopySuccess(button);
      return;
    } catch (err) {
      if (!err.message?.includes('NotAllowedError') && !err.message?.includes('AbortError')) {
        console.error('Clipboard error:', err);
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
      button && showCopySuccess(button);
    } else {
      throw new Error('execCommand copy failed');
    }
  } catch (err) {
    console.error('Clipboard error:', err);
    if (button) {
      const original = button.innerHTML;
      button.innerHTML = 'Copy failed';
      setTimeout(() => {
        button && (button.innerHTML = original);
      }, 2000);
    }
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const original = button.innerHTML;
  button.innerHTML = 'Copied!';
  setTimeout(() => {
    button && (button.innerHTML = original);
  }, 2000);
}
