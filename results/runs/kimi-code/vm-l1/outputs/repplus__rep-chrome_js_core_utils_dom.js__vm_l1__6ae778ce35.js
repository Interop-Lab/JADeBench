function escapeHtml(value) {
  if (value === null || value === undefined) return "";

  const container = document.createElement("div");
  container.textContent = value;
  return container.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function arrayToCSV(rows, columns) {
  if (!rows || rows.length === 0) return "";

  const selectedColumns = columns || Object.keys(rows[0]);
  const lines = [selectedColumns.map(escapeCsvField).join(",")];

  for (const row of rows) {
    lines.push(selectedColumns.map((column) => escapeCsvField(row[column])).join(","));
  }

  return lines.join("\n");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename) {
  const csv = arrayToCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  downloadBlob(blob, filename);
}

function showCopySuccess(button) {
  if (!button) return;

  const originalContent = button.innerHTML;
  button.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"></path></svg>';
  setTimeout(() => {
    button.innerHTML = originalContent;
  }, 1500);
}

function showCopyFailure(button) {
  if (!button) return;

  const originalContent = button.innerHTML;
  button.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"></path></svg>';
  setTimeout(() => {
    button.innerHTML = originalContent;
  }, 1500);
}

function copyWithExecCommand(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("execCommand copy failed");
}

async function copyToClipboard(text, button) {
  try {
    try {
      await navigator.clipboard.writeText(text);
    } catch (clipboardError) {
      console.warn("Clipboard API failed, trying fallback:", clipboardError);
      copyWithExecCommand(text);
    }
    showCopySuccess(button);
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    showCopyFailure(button);
  }
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
