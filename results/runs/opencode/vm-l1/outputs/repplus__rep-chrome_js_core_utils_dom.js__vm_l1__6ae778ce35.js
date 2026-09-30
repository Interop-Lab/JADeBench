/**
 * Browser helpers for escaping text, exporting tabular data, downloading
 * generated files, and copying text to the clipboard.
 */

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function arrayToCSV(rows, columns) {
  if (rows.length === 0) return "";

  const selectedColumns = columns || Object.keys(rows[0]);
  const header = selectedColumns.map(escapeCsvField).join(",");
  const body = rows.map((row) =>
    selectedColumns.map((column) => escapeCsvField(row[column])).join(","),
  );

  return [header, ...body].join("\n");
}

function downloadBlob(contents, mimeType, filename) {
  const blob = new Blob([contents], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

function downloadCSV(rows, filename) {
  downloadBlob(arrayToCSV(rows), "text/csv;charset=utf-8;", filename);
}

function downloadJSON(data, filename) {
  downloadBlob(
    JSON.stringify(data, null, 2),
    "application/json;charset=utf-8;",
    filename,
  );
}

const COPY_SUCCESS_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';

function showCopySuccess(button) {
  const previousContents = button.innerHTML;
  button.innerHTML = COPY_SUCCESS_ICON;
  setTimeout(() => {
    button.innerHTML = previousContents;
  }, 1500);
}

async function copyToClipboard(text, button) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  if (button) showCopySuccess(button);
}

Object.assign(globalThis, {
  escapeCsvField,
  escapeHtml,
  showCopySuccess,
  copyToClipboard,
  downloadJSON,
  downloadCSV,
  arrayToCSV,
});

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
