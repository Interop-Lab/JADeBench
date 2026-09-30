function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function highlightJson(source) {
  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch {
    return escapeHtml(source);
  }
  const escaped = escapeHtml(JSON.stringify(parsed, null, 2));
  return escaped.replace(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (token) => {
      let className = "json-number";
      if (token.startsWith('"')) className = token.endsWith(":") ? "json-key" : "json-string";
      else if (token === "true" || token === "false") className = "json-boolean";
      else if (token === "null") className = "json-null";
      return `<span class="${className}">${token}</span>`;
    },
  );
}

function highlightParams(source) {
  if (source.startsWith("<") || !source.includes("=")) return escapeHtml(source);
  return source.split("&").map((parameter) => {
    const separator = parameter.indexOf("=");
    if (separator === -1) return escapeHtml(parameter);
    const key = parameter.slice(0, separator);
    const value = parameter.slice(separator + 1);
    return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
  }).join("&");
}

function highlightCookies(source) {
  return source.split(";").map((cookie) => {
    const separator = cookie.indexOf("=");
    if (separator === -1) return escapeHtml(cookie);
    const key = cookie.slice(0, separator);
    const value = cookie.slice(separator + 1);
    return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
  }).join(";");
}

function highlightRequestTarget(target) {
  const queryStart = target.indexOf("?");
  if (queryStart === -1) return `<span class="http-path">${escapeHtml(target)}</span>`;
  const path = target.slice(0, queryStart);
  const query = target.slice(queryStart + 1);
  return `<span class="http-path">${escapeHtml(path)}</span>?${highlightParams(query)}`;
}

function highlightHttp(source) {
  const lines = source.split("\n");
  const firstBlankLine = lines.findIndex((line) => line.trim() === "");
  const headerEnd = firstBlankLine === -1 ? lines.length : firstBlankLine;
  let output = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (index === 0) {
      const request = line.match(/^(\S+)\s+(\S+)\s+(HTTP\/\S+)$/);
      const response = line.match(/^(HTTP\/\S+)\s+(\d{3})(?:\s+(.*))?$/);
      if (request) {
        output += `<span class="http-method">${escapeHtml(request[1])}</span> `;
        output += `${highlightRequestTarget(request[2])} `;
        output += `<span class="http-version">${escapeHtml(request[3])}</span>`;
      } else if (response) {
        output += `<span class="http-version">${escapeHtml(response[1])}</span> `;
        output += `<span class="http-status">${escapeHtml(response[2])}</span>`;
        if (response[3]) output += ` <span class="http-status-text">${escapeHtml(response[3])}</span>`;
      } else output += escapeHtml(line);
    } else if (index < headerEnd) {
      const separator = line.indexOf(":");
      if (separator === -1) output += escapeHtml(line);
      else {
        const name = line.slice(0, separator);
        const value = line.slice(separator + 1);
        output += `<span class="http-header-name">${escapeHtml(name)}</span>:`;
        output += name.trim().toLowerCase() === "cookie"
          ? highlightCookies(value)
          : `<span class="http-header-value">${escapeHtml(value)}</span>`;
      }
    } else if (index > headerEnd) {
      const body = lines.slice(headerEnd + 1).join("\n");
      let highlighted = highlightJson(body);
      if (highlighted === escapeHtml(body)) highlighted = highlightParams(body);
      output += highlighted;
      break;
    }
    if (index < lines.length - 1) output += "\n";
  }
  return output;
}

function testRegex(pattern, input) {
  try {
    return new RegExp(pattern).test(input);
  } catch {
    return false;
  }
}

function decodeBase64Url(value) {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  try {
    const binary = atob(base64);
    const encodedBytes = Array.from(binary, (character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
    ).join("");
    return decodeURIComponent(encodedBytes);
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`);
  }
}

function decodeJWT(token) {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format. Expected format: header.payload.signature");

    let header;
    try {
      header = JSON.parse(decodeBase64Url(parts[0]));
    } catch (error) {
      throw new Error(`Failed to decode JWT header: ${error.message}`);
    }

    let payload;
    try {
      payload = JSON.parse(decodeBase64Url(parts[1]));
    } catch (error) {
      throw new Error(`Failed to decode JWT payload: ${error.message}`);
    }

    let result = "JWT Decoded:\n\n";
    result += `=== HEADER ===\n${JSON.stringify(header, null, 2)}`;
    result += `\n\n=== PAYLOAD ===\n${JSON.stringify(payload, null, 2)}`;
    result += `\n\n=== SIGNATURE ===\n${parts[2]}\n`;
    result += "(Signature verification not performed)";

    if (payload.exp) {
      const expiration = new Date(payload.exp * 1000);
      const now = new Date();
      const expired = expiration < now;
      const minutes = expired
        ? Math.floor((now - expiration) / 60000)
        : Math.floor((expiration - now) / 60000);
      result += "\n\n=== TOKEN INFO ===\n";
      result += `Expires: ${expiration.toLocaleString()}\n`;
      result += `Status: ${expired ? "EXPIRED" : "VALID"}\n`;
      result += expired ? `Expired ${minutes} minutes ago` : `Expires in ${minutes} minutes`;
    }
    return result;
  } catch (error) {
    throw new Error(`JWT decode failed: ${error.message}`);
  }
}

function renderDiff(previousText, nextText) {
  if (typeof Diff === "undefined") return highlightHttp(nextText);
  const changes = Diff.diffLines(previousText, nextText);
  let output = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  changes.forEach((change) => {
    const lines = change.value.split("\n");
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === "") return;
      if (change.added) output += `<div class="diff-added">+ ${escapeHtml(line)}</div>`;
      else if (change.removed) output += `<div class="diff-removed">- ${escapeHtml(line)}</div>`;
      else output += `<div>  ${escapeHtml(line)}</div>`;
    });
  });
  output += "</pre>";
  return output;
}

export { decodeJWT, renderDiff, testRegex };
