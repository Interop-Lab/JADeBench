function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeCsvField(field) {
  if (field == null) return '';
  const str = String(field);
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(data, headers) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const keys = headers || Object.keys(data[0]);
  const rows = [keys.join(',')];
  for (const row of data) {
    const values = keys.map(k => escapeCsvField(row[k]));
    rows.push(values.join(','));
  }
  return rows.join('\n');
}

function downloadCSV(filename, data) {
  const csv = typeof data === 'string' ? data : arrayToCSV(data);
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

function downloadJSON(filename, data) {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function copyToClipboard(text, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback();
    }).catch(() => {
      fallbackCopy(text, callback);
    });
  } else {
    fallbackCopy(text, callback);
  }
}

function fallbackCopy(text, callback) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (e) {
    console.error('Copy failed', e);
  }
  document.body.removeChild(textarea);
}

function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  button.classList.add('copied');
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 2000);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
