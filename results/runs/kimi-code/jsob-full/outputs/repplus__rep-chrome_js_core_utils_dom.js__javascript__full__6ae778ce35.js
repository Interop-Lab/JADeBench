function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return "";

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

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) {
    return headers ? headers.join(",") : "";
  }

  const columns = headers || Object.keys(rows[0]);
  const lines = [columns.map(escapeCsvField).join(",")];
  rows.forEach((row) => {
    lines.push(columns.map((column) => escapeCsvField(row[column])).join(","));
  });
  return lines.join("\n");
}

function downloadCSV(rows, filename, headers = null) {
  downloadBlob(
    arrayToCSV(rows, headers),
    filename,
    "text/csv;charset=utf-8;",
  );
}

function downloadJSON(data, filename) {
  downloadBlob(
    JSON.stringify(data, null, 2),
    filename,
    "application/json;charset=utf-8;",
  );
}

function downloadBlob(contents, filename, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const SUCCESS_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';

const ERROR_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';

async function copyToClipboard(text, statusElement) {
  const clipboardApiAllowed = window.location.protocol !== "devtools:";

  if (clipboardApiAllowed) {
    try {
      await navigator.clipboard.writeText(text);
      showCopySuccess(statusElement);
      return;
    } catch (error) {
      if (
        !error.message?.includes("permissions policy") &&
        !error.message?.includes("Permissions policy")
      ) {
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }
  }

  const textarea = document.createElement("textarea");
  try {
    textarea.value = text;
    Object.assign(textarea.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      opacity: "0",
      pointerEvents: "none",
    });
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

    if (!document.execCommand("copy")) {
      throw new Error("execCommand copy failed");
    }
    document.body.removeChild(textarea);
    showCopySuccess(statusElement);
  } catch (error) {
    if (textarea.parentNode) document.body.removeChild(textarea);
    console.error("Copy to clipboard failed:", error);
    showCopyError(statusElement);
  }
}

function showCopySuccess(element) {
  temporarilyReplaceContents(element, SUCCESS_ICON);
}

function showCopyError(element) {
  temporarilyReplaceContents(element, ERROR_ICON);
}

function temporarilyReplaceContents(element, contents) {
  if (!element) return;

  const previousContents = element.innerHTML;
  element.innerHTML = contents;
  setTimeout(() => {
    if (element) element.innerHTML = previousContents;
  }, 1500);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
