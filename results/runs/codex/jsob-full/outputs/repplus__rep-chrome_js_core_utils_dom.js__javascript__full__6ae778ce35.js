function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return '';

  const field = String(value);
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) return headers ? headers.join(',') : '';

  const columns = headers || Object.keys(rows[0]);
  const lines = [columns.map(escapeCsvField).join(',')];
  rows.forEach((row) => {
    lines.push(columns.map((column) => escapeCsvField(row[column])).join(','));
  });
  return lines.join('\n');
}

function downloadCSV(rows, filename, headers = null) {
  const csv = arrayToCSV(rows, headers);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8;' }), filename);
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

async function copyToClipboard(text, feedbackElement) {
  const isSecure = window.location.protocol === 'https:';

  if (isSecure && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      showCopySuccess(feedbackElement);
      return;
    } catch (error) {
      const message = error?.message || '';
      if (!message.includes('denied') && !message.includes('permission')) {
        console.warn('Clipboard API failed:', error);
      }
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
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
    if (!copied) throw new Error('Copy command failed');
    showCopySuccess(feedbackElement);
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    showCopyFailure(feedbackElement);
  }
}

function showCopySuccess(element) {
  if (!element) return;
  const previous = element.innerHTML;
  element.innerHTML = 'Copied!';
  setTimeout(() => {
    if (element) element.innerHTML = previous;
  }, 2000);
}

function showCopyFailure(element) {
  if (!element) return;
  const previous = element.innerHTML;
  element.innerHTML = 'Copy failed';
  setTimeout(() => {
    if (element) element.innerHTML = previous;
  }, 2000);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
