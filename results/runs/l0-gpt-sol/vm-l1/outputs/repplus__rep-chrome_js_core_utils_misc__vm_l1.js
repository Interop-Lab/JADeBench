function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeCsvField(value) {
  const field = value == null ? "" : String(value);
  return /[",\r\n]/.test(field) ? `"${field.replace(/"/g, '""')}"` : field;
}

function arrayToCSV(rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) return "";

  let data = rows;
  let headers = columns;

  if (headers == null && rows.every(row => row && typeof row === "object" && !Array.isArray(row))) {
    headers = Array.from(
      rows.reduce((keys, row) => {
        Object.keys(row).forEach(key => keys.add(key));
        return keys;
      }, new Set())
    );
  }

  if (Array.isArray(headers)) {
    data = [
      headers,
      ...rows.map(row =>
        headers.map(column =>
          row && typeof row === "object" ? row[column] : undefined
        )
      )
    ];
  }

  return data
    .map(row =>
      (Array.isArray(row) ? row : [row])
        .map(escapeCsvField)
        .join(",")
    )
    .join("\r\n");
}

function downloadCSV(data, filename = "data.csv") {
  const csv = typeof data === "string" ? data : arrayToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename = "data.json") {
  const json = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(value, button) {
  const text = String(value ?? "");
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
  if (button) showCopySuccess(button);
}

function showCopySuccess(element) {
  if (!element) return;
  const originalText = element.textContent;
  element.textContent = "Copied!";
  setTimeout(() => {
    element.textContent = originalText;
  }, 1500);
}

function getHostname(url) {
  try {
    return new URL(String(url), window.location.href).hostname;
  } catch {
    return "";
  }
}

function highlightHTTP(value) {
  let result = escapeHtml(value);
  result = result.replace(
    /\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT|TRACE)\b/g,
    '<span class="http-method">$1</span>'
  );
  result = result.replace(
    /\b(HTTP\/\d(?:\.\d)?)\b/g,
    '<span class="http-version">$1</span>'
  );
  result = result.replace(
    /\b(\d{3})\b/g,
    '<span class="http-status">$1</span>'
  );
  return result;
}

function highlightJSON(value) {
  const source = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return escapeHtml(source).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b/g,
    (match, string, colon, number, literal) => {
      if (string) {
        return colon
          ? `<span class="json-key">${string}</span>${colon}`
          : `<span class="json-string">${string}</span>`;
      }
      if (number) return `<span class="json-number">${number}</span>`;
      return `<span class="json-literal">${literal}</span>`;
    }
  );
}

function highlightParams(value) {
  return escapeHtml(value).replace(
    /([?&;])([^=&#;\s]+)(=)([^&#;\s]*)/g,
    '$1<span class="param-name">$2</span>$3<span class="param-value">$4</span>'
  );
}

function highlightCookies(value) {
  return escapeHtml(value).replace(
    /(^|;\s*)([^=;]+)(=)([^;]*)/g,
    '$1<span class="cookie-name">$2</span>$3<span class="cookie-value">$4</span>'
  );
}

function testRegex(pattern, value) {
  try {
    const expression = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    return {
      valid: true,
      matches: String(value ?? "").match(expression)
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function decodeJWT(token) {
  const parts = String(token).split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT");
  }

  const decodePart = part => {
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  };

  return {
    header: decodePart(parts[0]),
    payload: decodePart(parts[1]),
    signature: parts[2]
  };
}

function renderDiff(left, right) {
  const before = String(left ?? "");
  const after = String(right ?? "");

  if (typeof Diff === "undefined") {
    return escapeHtml(after);
  }

  const changes = typeof Diff.diffWords === "function"
    ? Diff.diffWords(before, after)
    : typeof Diff.diffChars === "function"
      ? Diff.diffChars(before, after)
      : [{ value: after }];

  return changes
    .map(change => {
      const text = escapeHtml(change.value);
      if (change.added) return `<ins>${text}</ins>`;
      if (change.removed) return `<del>${text}</del>`;
      return text;
    })
    .join("");
}

globalThis.renderDiff = renderDiff;
globalThis.decodeJWT = decodeJWT;
globalThis.testRegex = testRegex;
globalThis.highlightCookies = highlightCookies;
globalThis.highlightParams = highlightParams;
globalThis.highlightJSON = highlightJSON;
globalThis.highlightHTTP = highlightHTTP;
globalThis.getHostname = getHostname;
globalThis.showCopySuccess = showCopySuccess;
globalThis.copyToClipboard = copyToClipboard;
globalThis.downloadJSON = downloadJSON;
globalThis.downloadCSV = downloadCSV;
globalThis.arrayToCSV = arrayToCSV;
globalThis.escapeCsvField = escapeCsvField;
globalThis.escapeHtml = escapeHtml;

export { decodeJWT, renderDiff, testRegex };
