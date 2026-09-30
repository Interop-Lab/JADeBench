function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return "";
  const text = String(value);
  return /[,"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) return headers ? headers.join(",") : "";
  const columns = headers || Object.keys(rows[0]);
  const lines = [columns.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(columns.map(column => escapeCsvField(row[column])).join(","));
  }
  return lines.join("\n");
}

function downloadText(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename, headers = null) {
  downloadText(arrayToCSV(rows, headers), filename, "text/csv;charset=utf-8;");
}

function downloadJSON(value, filename) {
  downloadText(JSON.stringify(value, null, 2), filename, "application/json;charset=utf-8;");
}

async function copyToClipboard(text, button) {
  if (window.isSecureContext && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) showCopySuccess(button);
      return;
    } catch (error) {
      if (!error.message?.includes("denied") && !error.message?.includes("permission")) {
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    textarea.setAttribute("readonly", "");
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
    if (!copied) throw new Error("Copy command failed");
    if (button) showCopySuccess(button);
  } catch (error) {
    console.error("Clipboard fallback failed:", error);
    if (button) {
      const original = button.innerHTML;
      button.innerHTML = "Copy failed";
      setTimeout(() => { button.innerHTML = original; }, 1500);
    }
  }
}

function showCopySuccess(button) {
  const original = button.innerHTML;
  button.innerHTML = "Copied!";
  setTimeout(() => { button.innerHTML = original; }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function highlightParams(params) {
  return params.split("&").map(part => {
    const separator = part.indexOf("=");
    if (separator < 0) return `<span class="param-key">${escapeHtml(part)}</span>`;
    const key = part.slice(0, separator);
    const value = part.slice(separator + 1);
    return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
  }).join("&");
}

function highlightCookies(cookies) {
  return cookies.split(";").map(cookie => {
    const separator = cookie.indexOf("=");
    if (separator < 0) return escapeHtml(cookie);
    const key = cookie.slice(0, separator);
    const value = cookie.slice(separator + 1);
    return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
  }).join(";");
}

function highlightJSON(json) {
  try {
    JSON.parse(json);
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, token => {
      let type = "json-number";
      if (/^"/.test(token)) type = /:$/.test(token) ? "json-key" : "json-string";
      else if (/true|false/.test(token)) type = "json-boolean";
      else if (/null/.test(token)) type = "json-null";
      return `<span class="${type}">${escapeHtml(token)}</span>`;
    });
  } catch {
    return escapeHtml(json);
  }
}

function highlightHTTP(http) {
  if (!http) return "";
  const lines = http.split("\n");
  let inBody = false;
  let contentType = "";

  return lines.map((line, index) => {
    if (index === 0) {
      const request = line.match(/^([A-Z]+)\s+([^\s?]+)(\?[^\s]*)?(\s+HTTP\/\d(?:\.\d)?)$/);
      if (request) {
        const query = request[3] ? `?${highlightParams(request[3].slice(1))}` : "";
        return `<span class="http-method">${escapeHtml(request[1])}</span> <span class="http-path">${escapeHtml(request[2])}</span>${query}<span class="http-version">${escapeHtml(request[4])}</span>`;
      }
      const response = line.match(/^(HTTP\/\d(?:\.\d)?)\s+(\d{3})(.*)$/);
      if (response) {
        return `<span class="http-version">${escapeHtml(response[1])}</span> <span class="http-status">${escapeHtml(response[2])}</span>${escapeHtml(response[3])}`;
      }
    }

    if (!inBody && line === "") {
      inBody = true;
      return "";
    }
    if (!inBody) {
      const separator = line.indexOf(":");
      if (separator >= 0) {
        const name = line.slice(0, separator);
        const value = line.slice(separator + 1);
        if (name.toLowerCase() === "content-type") contentType = value.toLowerCase();
        const highlightedValue = name.toLowerCase() === "cookie" ? ` ${highlightCookies(value.trimStart())}` : escapeHtml(value);
        return `<span class="http-header-name">${escapeHtml(name)}</span><span class="http-colon">:</span><span class="http-header-value">${highlightedValue}</span>`;
      }
      return escapeHtml(line);
    }
    return line;
  }).join("\n").replace(/(?<=\n\n)[\s\S]*$/, body => contentType.includes("json") ? highlightJSON(body) : escapeHtml(body));
}

function testRegex(pattern, text) {
  try {
    return new RegExp(pattern).test(text);
  } catch {
    return false;
  }
}

function decodeBase64Url(value) {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = atob(base64);
  return decodeURIComponent(binary.split("").map(character =>
    `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`
  ).join(""));
}

function decodeJWT(token) {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format. Expected format: header.payload.signature");

    let header;
    try {
      header = JSON.parse(decodeBase64Url(parts[0]));
    } catch (error) {
      throw new Error(`Invalid JWT header: ${error.message}`);
    }

    let payload;
    try {
      payload = JSON.parse(decodeBase64Url(parts[1]));
    } catch (error) {
      throw new Error(`Invalid JWT payload: ${error.message}`);
    }

    let result = `JWT Decoded:\n\n=== HEADER ===\n${JSON.stringify(header, null, 2)}\n\n=== PAYLOAD ===\n${JSON.stringify(payload, null, 2)}\n\n=== SIGNATURE ===\n${parts[2]}\n(Signature verification not performed)`;
    if (payload.exp) {
      const expiration = new Date(payload.exp * 1000);
      const now = new Date();
      const expired = expiration < now;
      result += `\n\n=== EXPIRATION ===\nExpires: ${expiration.toLocaleString()}\nStatus: ${expired ? "EXPIRED" : "VALID"}\n`;
      result += expired
        ? `Expired ${Math.floor((now - expiration) / 60000)} minutes ago`
        : `Expires in ${Math.floor((expiration - now) / 60000)} minutes`;
    }
    return result;
  } catch (error) {
    throw new Error(`JWT decode failed: ${error.message}`);
  }
}

function renderDiff(original, updated) {
  if (typeof Diff === "undefined") return highlightHTTP(updated);
  const changes = Diff.diffLines(original, updated);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  for (const change of changes) {
    const lines = change.value.split("\n");
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === "") return;
      if (change.added) html += `<div class="diff-add">+ ${escapeHtml(line)}</div>`;
      else if (change.removed) html += `<div class="diff-remove">- ${escapeHtml(line)}</div>`;
      else html += `<div>${escapeHtml(line)}</div>`;
    });
  }
  return `${html}</pre>`;
}

export { decodeJWT, renderDiff, testRegex };
