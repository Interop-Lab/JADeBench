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

function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers ? headers.join(",") : "";
  }

  const columns = headers || Object.keys(data[0]);
  const rows = [columns.map(escapeCsvField).join(",")];

  data.forEach((row) => {
    rows.push(columns.map((column) => escapeCsvField(row[column])).join(","));
  });

  return rows.join("\n");
}

function downloadCSV(data, filename, headers = null) {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
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
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text, button) {
  const isSecure = window.location.protocol === "https:";

  if (isSecure) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) showCopySuccess(button);
      return;
    } catch (error) {
      if (
        !error.message?.includes("Document is not focused") &&
        !error.message?.includes("Write permission denied")
      ) {
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "0";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
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

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (copied) {
      if (button) showCopySuccess(button);
    } else {
      throw new Error("Copy command failed");
    }
  } catch (error) {
    console.error("Failed to copy text:", error);
    if (button) {
      const oldText = button.innerHTML;
      button.innerHTML = "Failed to copy";
      setTimeout(() => {
        if (button) button.innerHTML = oldText;
      }, 2000);
    }
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const oldText = button.innerHTML;
  button.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => {
    if (button) button.innerHTML = oldText;
  }, 1500);
}

export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };
