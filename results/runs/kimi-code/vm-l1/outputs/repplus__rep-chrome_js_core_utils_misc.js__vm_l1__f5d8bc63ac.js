function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function arrayToCSV(rows, columns) {
  if (!rows || rows.length === 0) return "";

  const headers = columns || Object.keys(rows[0]);
  const lines = [headers.map(escapeCsvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(row[header])).join(","));
  }
  return lines.join("\n");
}

function downloadBlob(contents, type, filename) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadCSV(rows, filename) {
  downloadBlob(arrayToCSV(rows), "text/csv;charset=utf-8;", filename);
}

function downloadJSON(value, filename) {
  downloadBlob(
    JSON.stringify(value, null, 2),
    "application/json;charset=utf-8;",
    filename,
  );
}

async function copyToClipboard(text, successElement) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess(successElement);
    return;
  } catch (error) {
    console.warn("Clipboard API failed, trying fallback:", error);
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    showCopySuccess(successElement);
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    showCopySuccess(successElement);
  }
}

function showCopySuccess(element) {
  element.innerHTML =
    '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"></path></svg>';
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function highlightJSON(text) {
  try {
    JSON.parse(text);
  } catch {
    return escapeHtml(text);
  }

  const tokenPattern = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  let output = "";
  let offset = 0;

  for (const match of text.matchAll(tokenPattern)) {
    output += escapeHtml(text.slice(offset, match.index));
    const token = match[0];
    let className;
    if (match[1]) className = "json-key";
    else if (match[2]) className = "json-string";
    else if (token === "true" || token === "false") className = "json-boolean";
    else if (token === "null") className = "json-null";
    else className = "json-number";
    output += `<span class="${className}">${escapeHtml(token)}</span>`;
    offset = match.index + token.length;
  }

  return output + escapeHtml(text.slice(offset));
}

function highlightParams(params) {
  if (!params) return "";
  return params
    .split("&")
    .map((part) => {
      const equals = part.indexOf("=");
      if (equals === -1) return escapeHtml(part);
      const key = part.slice(0, equals);
      const value = part.slice(equals + 1);
      return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
    })
    .join("&");
}

function highlightCookies(cookies) {
  if (!cookies) return "";
  return cookies
    .split(";")
    .map((part) => {
      const equals = part.indexOf("=");
      if (equals === -1) return escapeHtml(part);
      const key = part.slice(0, equals);
      const value = part.slice(equals + 1);
      return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
    })
    .join(";");
}

function highlightHTTP(message) {
  const lines = message.split("\n");
  const firstLine = lines.shift() || "";
  const firstSpace = firstLine.indexOf(" ");
  let output = escapeHtml(firstLine);

  if (firstSpace !== -1) {
    const method = firstLine.slice(0, firstSpace);
    const remainder = firstLine.slice(firstSpace + 1);
    const versionMatch = remainder.match(/( HTTP\/\S+)$/);
    const path = versionMatch
      ? remainder.slice(0, -versionMatch[1].length)
      : remainder;
    output = `<span class="http-method">${escapeHtml(method)}</span> <span class="http-path">${escapeHtml(path)}</span>`;
    if (versionMatch) {
      output += `<span class="http-version">${escapeHtml(versionMatch[1])}</span>`;
    }
  }

  let inBody = false;
  for (const line of lines) {
    output += "\n";
    if (inBody) {
      output += /^[\[{]/.test(line.trim())
        ? highlightJSON(line)
        : escapeHtml(line);
      continue;
    }
    if (line === "" || line === "\r") {
      inBody = true;
      continue;
    }

    const colon = line.indexOf(":");
    if (colon === -1) {
      output += escapeHtml(line);
    } else {
      output += `<span class="http-header-name">${escapeHtml(line.slice(0, colon))}</span><span class="http-colon">:</span><span class="http-header-value">${escapeHtml(line.slice(colon + 1))}</span>`;
    }
  }
  return output;
}

function testRegex(pattern, text, flags = "") {
  try {
    return new RegExp(pattern, flags).test(text);
  } catch {
    return false;
  }
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`);
  }
}

function decodeJwtPart(value, label) {
  try {
    return JSON.parse(decodeBase64Url(value));
  } catch (error) {
    throw new Error(`Failed to decode JWT ${label}: ${error.message}`);
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error(
        "Invalid JWT format. Expected format: header.payload.signature",
      );
    }

    const header = decodeJwtPart(parts[0], "header");
    const payload = decodeJwtPart(parts[1], "payload");
    return [
      "JWT Decoded:",
      "",
      "=== HEADER ===",
      JSON.stringify(header, null, 2),
      "",
      "=== PAYLOAD ===",
      JSON.stringify(payload, null, 2),
      "",
      "=== SIGNATURE ===",
      parts[2],
      "(Signature verification not performed)",
    ].join("\n");
  } catch (error) {
    throw new Error(`JWT decode failed: ${error.message}`);
  }
}

function renderDiff(before, after) {
  const changes = Diff.diffLines(before, after);
  let output =
    '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  for (const change of changes) {
    if (change.added) {
      output += `<div class="diff-add">+ ${escapeHtml(change.value)}</div>`;
    } else if (change.removed) {
      output += `<div class="diff-remove">- ${escapeHtml(change.value)}</div>`;
    } else {
      output += `<div>  ${escapeHtml(change.value)}</div>`;
    }
  }
  return `${output}</pre>`;
}

Object.assign(globalThis, {
  renderDiff,
  decodeJWT,
  testRegex,
  highlightCookies,
  highlightParams,
  highlightJSON,
  highlightHTTP,
  getHostname,
  showCopySuccess,
  copyToClipboard,
  downloadJSON,
  downloadCSV,
  arrayToCSV,
  escapeCsvField,
  escapeHtml,
});

export { decodeJWT, renderDiff, testRegex };
