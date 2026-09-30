/** Browser-side formatting, highlighting, download, and clipboard helpers. */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function arrayToCSV(rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) return "";
  const headers = columns || Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(row[header])).join(","));
  }
  return lines.join("\n");
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

function downloadCSV(rows, filename = "data.csv") {
  downloadBlob(arrayToCSV(rows), filename, "text/csv;charset=utf-8;");
}

function downloadJSON(data, filename = "data.json") {
  downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
}

async function copyToClipboard(text, successElement) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    if (successElement) showCopySuccess(successElement);
    return true;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}

function showCopySuccess(element) {
  const originalText = element.textContent;
  element.textContent = "Copied!";
  element.classList.add("copy-success");
  setTimeout(() => {
    element.textContent = originalText;
    element.classList.remove("copy-success");
  }, 2000);
}

function getHostname(value) {
  try {
    return new URL(value).hostname || "unknown";
  } catch {
    return "unknown";
  }
}

function span(className, value) {
  return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function highlightJSON(value) {
  const json = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  const escaped = escapeHtml(json);
  return escaped.replace(
    /(&quot;(?:\\.|[^&])*?&quot;)(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi,
    (match, string, colon, boolean, nil, number) => {
      if (string) return colon
        ? `<span class="json-key">${string}</span>${colon}`
        : `<span class="json-string">${string}</span>`;
      if (boolean) return `<span class="json-boolean">${boolean}</span>`;
      if (nil) return `<span class="json-null">${nil}</span>`;
      if (number) return `<span class="json-number">${number}</span>`;
      return match;
    },
  );
}

function highlightParams(parameters) {
  return String(parameters).split("&").map((part) => {
    const separator = part.indexOf("=");
    const key = separator < 0 ? part : part.slice(0, separator);
    const value = separator < 0 ? "" : part.slice(separator + 1);
    return `${span("param-key", key)}=${span("param-value", value)}`;
  }).join("&");
}

function highlightCookies(cookies) {
  return String(cookies).split(";").map((cookie) => {
    const trimmed = cookie.trim();
    if (!trimmed) return "";
    const separator = trimmed.indexOf("=");
    const key = separator < 0 ? trimmed : trimmed.slice(0, separator);
    const value = separator < 0 ? "" : trimmed.slice(separator + 1);
    return `${span("cookie-key", key)}=${span("cookie-value", value)}`;
  }).filter(Boolean).join("; ");
}

function highlightHTTP(message) {
  const lines = String(message).split("\n");
  let inBody = false;
  return lines.map((line, index) => {
    if (inBody) {
      const body = lines.slice(index).join("\n");
      try { return highlightJSON(JSON.parse(body)); } catch { return escapeHtml(body); }
    }
    if (line.trim() === "") {
      inBody = true;
      return "";
    }
    if (index === 0) {
      const request = line.match(/^(\S+)\s+(\S+)\s+(HTTP\/\d(?:\.\d)?)$/);
      if (request) {
        const [, method, target, version] = request;
        const question = target.indexOf("?");
        const path = question < 0 ? target : target.slice(0, question);
        const query = question < 0 ? "" : `?${highlightParams(target.slice(question + 1))}`;
        return `${span("http-method", method)} ${span("http-path", path)}${query} ${span("http-version", version)}`;
      }
      const response = line.match(/^(HTTP\/\d(?:\.\d)?)\s+(\d{3})(?:\s+(.*))?$/);
      if (response) return `${span("http-version", response[1])} ${span("http-status", response[2])}${response[3] ? ` ${span("http-status-text", response[3])}` : ""}`;
    }
    const header = line.match(/^([^:]+):(.*)$/);
    if (header) return `${span("http-header-name", header[1])}<span class="http-colon">:</span>${span("http-header-value", header[2])}`;
    return escapeHtml(line);
  }).join("\n");
}

function testRegex(pattern, input) {
  try {
    return new RegExp(pattern).test(input);
  } catch {
    return false;
  }
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = atob(base64);
  const encoded = Array.from(bytes, (character) =>
    `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
  ).join("");
  return decodeURIComponent(encoded);
}

function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format. Expected format: header.payload.signature");
    }
    const [headerPart, payloadPart, signature] = parts;
    const header = JSON.parse(decodeBase64Url(headerPart));
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    return [
      "JWT Decoded:", "", "=== HEADER ===", JSON.stringify(header, null, 2), "",
      "=== PAYLOAD ===", JSON.stringify(payload, null, 2), "", "=== SIGNATURE ===",
      signature, "(Signature verification not performed)",
    ].join("\n");
  } catch (error) {
    throw new Error(`JWT decode failed: ${error.message}`);
  }
}

function renderDiff(oldText, newText) {
  return Diff.diffLines(oldText, newText).map((part) => {
    const className = part.added ? "diff-added" : part.removed ? "diff-removed" : "diff-unchanged";
    const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
    return part.value.split("\n").filter((line, index, lines) => line || index < lines.length - 1)
      .map((line) => `<div class="${className}">${prefix}${escapeHtml(line)}</div>`).join("");
  }).join("");
}

const publicUtilities = {
  renderDiff, decodeJWT, testRegex, highlightCookies, highlightParams,
  highlightJSON, highlightHTTP, getHostname, showCopySuccess,
  copyToClipboard, downloadJSON, downloadCSV, arrayToCSV,
  escapeCsvField, escapeHtml,
};

Object.assign(globalThis, publicUtilities);
