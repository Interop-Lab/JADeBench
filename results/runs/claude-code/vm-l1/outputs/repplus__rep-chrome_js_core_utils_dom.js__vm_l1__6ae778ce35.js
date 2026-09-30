function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n") ||
    text.includes("\r")
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function arrayToCSV(rows, columns) {
  if (!rows || rows.length === 0) return "";

  const headers = columns || Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvField).join(",")];
  rows.forEach(row => {
    const values = headers.map(header => escapeCsvField(row[header]));
    lines.push(values.join(","));
  });
  return lines.join("\n");
}

function downloadCSV(rows, filename) {
  const csv = arrayToCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const successIcon =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
const errorIcon =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';

async function copyToClipboard(text, button) {
  try {
    if (window.location.protocol !== "devtools:" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        showCopySuccess(button);
        return;
      } catch (error) {
        const message = error.message || "";
        if (
          !message.includes("permissions policy") &&
          !message.includes("Permissions policy")
        ) {
          console.warn("Clipboard API failed, trying fallback:", error);
        }
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
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

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) throw new Error("execCommand copy failed");
    showCopySuccess(button);
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    const originalIcon = button.innerHTML;
    button.innerHTML = errorIcon;
    setTimeout(() => {
      button.innerHTML = originalIcon;
    }, 1500);
  }
}

function showCopySuccess(button) {
  const originalIcon = button.innerHTML;
  button.innerHTML = successIcon;
  setTimeout(() => {
    button.innerHTML = originalIcon;
  }, 1500);
}

globalThis.escapeHtml = escapeHtml;
globalThis.escapeCsvField = escapeCsvField;
globalThis.arrayToCSV = arrayToCSV;
globalThis.downloadCSV = downloadCSV;
globalThis.downloadJSON = downloadJSON;
globalThis.copyToClipboard = copyToClipboard;
globalThis.showCopySuccess = showCopySuccess;

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
