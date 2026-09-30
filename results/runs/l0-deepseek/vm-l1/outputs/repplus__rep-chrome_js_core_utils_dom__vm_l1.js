const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const escapeCsvField = (field) => {
  if (field === null || field === undefined) return '';
  const s = String(field);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
};

const arrayToCSV = (rows, delimiter = ',') => {
  if (!Array.isArray(rows)) return '';
  return rows
    .map((row) =>
      Array.isArray(row)
        ? row.map((cell) => escapeCsvField(cell)).join(delimiter)
        : escapeCsvField(row)
    )
    .join('\n');
};

const downloadCSV = (filename, rows, delimiter = ',') => {
  const csv = arrayToCSV(rows, delimiter);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const downloadJSON = (filename, data) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const copyToClipboard = async (text, onSuccess) => {
  try {
    await navigator.clipboard.writeText(text);
    if (typeof onSuccess === 'function') onSuccess();
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const showCopySuccess = (button) => {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  button.disabled = true;
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 1500);
};

export {
  arrayToCSV,
  copyToClipboard,
  downloadCSV,
  downloadJSON,
  escapeHtml,
};
