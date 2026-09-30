function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  const text = String(value);
  return /[,"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) return "";
  const columns = headers || Object.keys(rows[0]);
  return [columns, ...rows.map((row) => columns.map((column) => row[column]))]
    .map((row) => row.map(escapeCsvField).join(","))
    .join("\n");
}

function downloadFile(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename) {
  downloadFile(arrayToCSV(rows), filename, "text/csv;charset=utf-8;");
}

function downloadJSON(value, filename) {
  downloadFile(JSON.stringify(value, null, 2), filename, "application/json;charset=utf-8;");
}

function showCopySuccess(element) {
  const previousMarkup = element.innerHTML;
  element.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => { element.innerHTML = previousMarkup; }, 1500);
}

async function copyToClipboard(text, button) {
  if (window.location.protocol === "devtools:") return;
  try {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showCopySuccess(button);
        return;
      } catch (error) {
        if (!error.message?.includes("permissions policy") && !error.message?.includes("Permissions policy")) throw error;
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    Object.assign(textarea.style, { position: "fixed", left: "-9999px", top: "0", opacity: "0", pointerEvents: "none" });
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
    if (!copied) throw new Error("execCommand copy failed");
    showCopySuccess(button);
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    const previousMarkup = button.innerHTML;
    button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
    setTimeout(() => { button.innerHTML = previousMarkup; }, 1500);
  }
}

function getHostname(value) {
  try { return new URL(value).hostname; } catch { return "unknown"; }
}

function highlightParams(value) {
  if (value.trim().startsWith("<")) return escapeHtml(value);
  return value.split("&").map((parameter) => {
    const separator = parameter.indexOf("=");
    if (separator === -1) return escapeHtml(parameter);
    const key = parameter.substring(0, separator);
    const parameterValue = parameter.substring(separator + 1);
    return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(parameterValue)}</span>`;
  }).join("&");
}

function highlightCookies(value) {
  return value.split(";").map((cookie) => {
    const separator = cookie.indexOf("=");
    if (separator === -1) return escapeHtml(cookie);
    const key = cookie.substring(0, separator);
    const cookieValue = cookie.substring(separator + 1);
    return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(cookieValue)}</span>`;
  }).join(";");
}

function highlightJSON(value) {
  let json;
  try { json = JSON.stringify(JSON.parse(value), null, 2); } catch { return escapeHtml(value); }
  const tokenPattern = /("(\u[a-zA-Z0-9]{4}|\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
  return json.replace(tokenPattern, (token) => {
    let tokenClass = "json-number";
    if (/^"/.test(token)) tokenClass = /:$/.test(token) ? "json-key" : "json-string";
    else if (/true|false/.test(token)) tokenClass = "json-boolean";
    else if (/null/.test(token)) tokenClass = "json-null";
    return `<span class="${tokenClass}">${escapeHtml(token)}</span>`;
  });
}

function highlightHTTP(value) {
  const lines = value.split("\n");
  let inBody = false;
  return lines.map((line, index) => {
    if (inBody) return highlightJSON(line);
    if (line.trim() === "") { inBody = true; return ""; }
    if (index === 0) {
      if (line.trim().toUpperCase().startsWith("HTTP/")) return `<span class="http-version">${escapeHtml(line)}</span>`;
      const firstSpace = line.indexOf(" ");
      if (firstSpace !== -1) {
        const method = line.substring(0, firstSpace);
        const remainder = line.substring(firstSpace + 1);
        const versionMatch = remainder.match(/(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i);
        const version = versionMatch ? versionMatch[0] : "";
        const target = versionMatch ? remainder.substring(0, versionMatch.index) : remainder;
        const queryStart = target.indexOf("?");
        const path = queryStart === -1 ? target : target.substring(0, queryStart);
        const query = queryStart === -1 ? "" : target.substring(queryStart + 1);
        const highlightedQuery = queryStart === -1 ? "" : `?<span class="http-path">${highlightParams(query)}</span>`;
        return `<span class="http-method">${escapeHtml(method)}</span> <span class="http-path">${escapeHtml(path)}</span>${highlightedQuery}<span class="http-version">${escapeHtml(version)}</span>`;
      }
    }
    const colon = line.indexOf(":");
    if (colon !== -1) {
      const name = line.substring(0, colon);
      const headerValue = line.substring(colon + 1);
      const highlightedValue = name.toLowerCase() === "cookie" ? highlightCookies(headerValue) : escapeHtml(headerValue);
      return `<span class="http-header-name">${escapeHtml(name)}</span><span class="http-colon">:</span><span class="http-header-value">${highlightedValue}</span>`;
    }
    return escapeHtml(line);
  }).join("\n");
}

function testRegex(pattern, value) {
  try { return new RegExp(pattern).test(value); } catch { return false; }
}

function percentEncodeByte(character) {
  return `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`;
}

function decodeBase64Url(value) {
  try {
    let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    return decodeURIComponent(atob(base64).split("").map(percentEncodeByte).join(""));
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`);
  }
}

function decodeJWT(token) {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format. Expected format: header.payload.signature");
    let header;
    try { header = JSON.parse(decodeBase64Url(parts[0])); }
    catch (error) { throw new Error(`Failed to decode JWT header: ${error.message}`); }
    let payload;
    try { payload = JSON.parse(decodeBase64Url(parts[1])); }
    catch (error) { throw new Error(`Failed to decode JWT payload: ${error.message}`); }
    let result = "JWT Decoded:\n\n";
    result += `=== HEADER ===\n${JSON.stringify(header, null, 2)}`;
    result += `\n\n=== PAYLOAD ===\n${JSON.stringify(payload, null, 2)}`;
    result += `\n\n=== SIGNATURE ===\n${parts[2]}\n(Signature verification not performed)`;
    if (payload.exp) {
      const expiration = new Date(payload.exp * 1000);
      const now = new Date();
      const expired = expiration < now;
      const minutes = Math.floor(Math.abs(expiration - now) / 60000);
      result += `\n\n=== TOKEN INFO ===\nExpiration: ${expiration.toISOString()}\nStatus: ${expired ? "EXPIRED" : "VALID"}\n`;
      result += expired ? `Expired ${minutes} minutes ago` : `Expires in ${minutes} minutes`;
    }
    return result;
  } catch (error) {
    return `JWT decode failed: ${error.message}`;
  }
}

function renderDiff(before, after) {
  if (typeof Diff === "undefined") return highlightHTTP(after);
  const changes = Diff.diffLines(before, after);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  changes.forEach((change) => {
    change.value.split("\n").forEach((line) => {
      if (line === "") return;
      if (change.added) html += `<div class="diff-add">+ ${escapeHtml(line)}</div>`;
      else if (change.removed) html += `<div class="diff-remove">- ${escapeHtml(line)}</div>`;
      else html += `<div>  ${escapeHtml(line)}</div>`;
    });
  });
  return `${html}</pre>`;
}

Object.assign(globalThis, {
  escapeHtml, escapeCsvField, arrayToCSV, downloadCSV, downloadJSON,
  copyToClipboard, showCopySuccess, getHostname, highlightHTTP, highlightJSON,
  highlightParams, highlightCookies, testRegex, decodeJWT, renderDiff,
});

export { decodeJWT, renderDiff, testRegex };
