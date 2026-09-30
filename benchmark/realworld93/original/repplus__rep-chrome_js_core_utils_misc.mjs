// ../work/repplus__rep-chrome/js/core/utils/dom.js
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
function escapeCsvField(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers ? headers.join(",") : "";
  }
  const csvHeaders = headers || Object.keys(data[0]);
  const rows = [csvHeaders.map(escapeCsvField).join(",")];
  data.forEach((item) => {
    const row = csvHeaders.map((header) => {
      const value = item[header];
      return escapeCsvField(value);
    });
    rows.push(row.join(","));
  });
  return rows.join("\n");
}
function downloadCSV(data, filename, headers = null) {
  const csvContent = arrayToCSV(data, headers);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
async function copyToClipboard(text, btn) {
  const isDevToolsContext = window.location.protocol === "devtools:";
  if (!isDevToolsContext) {
    try {
      await navigator.clipboard.writeText(text);
      if (btn) {
        showCopySuccess(btn);
      }
      return;
    } catch (err) {
      if (!err.message?.includes("permissions policy") && !err.message?.includes("Permissions policy")) {
        console.warn("Clipboard API failed, trying fallback:", err);
      }
    }
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);
    }
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (successful) {
      if (btn) {
        showCopySuccess(btn);
      }
    } else {
      throw new Error("execCommand copy failed");
    }
  } catch (fallbackErr) {
    console.error("Copy to clipboard failed:", fallbackErr);
    if (btn) {
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
      setTimeout(() => {
        if (btn) {
          btn.innerHTML = originalHtml;
        }
      }, 1500);
    }
  }
}
function showCopySuccess(btn) {
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => {
    if (btn) {
      btn.innerHTML = originalHtml;
    }
  }, 1500);
}

// ../work/repplus__rep-chrome/js/core/utils/network.js
function getHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return "unknown";
  }
}
function highlightHTTP(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let inBody = false;
  let bodyStartIndex = -1;
  const isResponse = lines[0] && lines[0].toUpperCase().startsWith("HTTP/");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      inBody = true;
      bodyStartIndex = i;
      break;
    }
  }
  let highlighted = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      const firstSpace = line.indexOf(" ");
      if (firstSpace > -1) {
        const method = line.substring(0, firstSpace);
        const rest = line.substring(firstSpace + 1);
        highlighted += `<span class="http-method">${escapeHtml(method)}</span> `;
        let path = rest;
        let version = "";
        const versionRegex = /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i;
        const match = rest.match(versionRegex);
        if (match) {
          path = rest.substring(0, match.index);
          version = rest.substring(match.index);
        }
        const qIndex = path.indexOf("?");
        if (qIndex > -1) {
          highlighted += `<span class="http-path">${escapeHtml(path.substring(0, qIndex))}</span>?`;
          highlighted += highlightParams(path.substring(qIndex + 1));
        } else {
          highlighted += `<span class="http-path">${escapeHtml(path)}</span>`;
        }
        if (version) {
          highlighted += `<span class="http-version">${escapeHtml(version)}</span>`;
        }
      } else {
        highlighted += escapeHtml(line);
      }
    } else if (!inBody || i < bodyStartIndex) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const headerName = line.substring(0, colonIndex);
        const headerValue = line.substring(colonIndex + 1);
        highlighted += `<span class="http-header-name">${escapeHtml(headerName)}</span>`;
        highlighted += '<span class="http-colon">:</span>';
        if (headerName.trim().toLowerCase() === "cookie") {
          highlighted += highlightCookies(headerValue);
        } else {
          highlighted += `<span class="http-header-value">${escapeHtml(headerValue)}</span>`;
        }
      } else {
        highlighted += escapeHtml(line);
      }
    } else if (i === bodyStartIndex) {
      highlighted += "";
    } else {
      const bodyContent = lines.slice(bodyStartIndex + 1).join("\n");
      let bodyHighlighted = highlightJSON(bodyContent);
      if (!isResponse && bodyHighlighted === escapeHtml(bodyContent)) {
        bodyHighlighted = highlightParams(bodyContent);
      }
      highlighted += bodyHighlighted;
      break;
    }
    if (i < lines.length - 1) {
      highlighted += "\n";
    }
  }
  return highlighted;
}
function highlightJSON(text) {
  try {
    JSON.parse(text);
    return text.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "json-key";
          } else {
            cls = "json-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "json-boolean";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${escapeHtml(match)}</span>`;
      }
    );
  } catch (e) {
    return escapeHtml(text);
  }
}
function highlightParams(text) {
  if (text.trim().startsWith("<")) return escapeHtml(text);
  if (text.indexOf("=") === -1) return escapeHtml(text);
  return text.split("&").map((part) => {
    const eqIndex = part.indexOf("=");
    if (eqIndex > -1) {
      const key = part.substring(0, eqIndex);
      const value = part.substring(eqIndex + 1);
      return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
    } else {
      return escapeHtml(part);
    }
  }).join("&");
}
function highlightCookies(text) {
  return text.split(";").map((part) => {
    const eqIndex = part.indexOf("=");
    if (eqIndex > -1) {
      const key = part.substring(0, eqIndex);
      const value = part.substring(eqIndex + 1);
      return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
    } else {
      return escapeHtml(part);
    }
  }).join(";");
}

// ../work/repplus__rep-chrome/js/core/utils/misc.js
function testRegex(pattern, text) {
  try {
    const regex = new RegExp(pattern);
    return regex.test(text);
  } catch (e) {
    return false;
  }
}
function decodeJWT(jwt) {
  try {
    let base64UrlDecode = function(str) {
      str = str.replace(/-/g, "+").replace(/_/g, "/");
      while (str.length % 4) {
        str += "=";
      }
      try {
        const decoded = atob(str);
        return decodeURIComponent(
          decoded.split("").map(function(c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          }).join("")
        );
      } catch (e) {
        throw new Error("Failed to decode base64: " + e.message);
      }
    };
    jwt = jwt.trim();
    const parts = jwt.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format. Expected format: header.payload.signature");
    }
    let header;
    try {
      const headerJson = base64UrlDecode(parts[0]);
      header = JSON.parse(headerJson);
    } catch (e) {
      throw new Error("Failed to decode JWT header: " + e.message);
    }
    let payload;
    try {
      const payloadJson = base64UrlDecode(parts[1]);
      payload = JSON.parse(payloadJson);
    } catch (e) {
      throw new Error("Failed to decode JWT payload: " + e.message);
    }
    let output = "JWT Decoded:\n\n";
    output += "=== HEADER ===\n";
    output += JSON.stringify(header, null, 2);
    output += "\n\n=== PAYLOAD ===\n";
    output += JSON.stringify(payload, null, 2);
    output += "\n\n=== SIGNATURE ===\n";
    output += parts[2] + "\n";
    output += "(Signature verification not performed)";
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1e3);
      const now = /* @__PURE__ */ new Date();
      const isExpired = expDate < now;
      output += "\n\n=== TOKEN INFO ===\n";
      output += `Expiration: ${expDate.toISOString()}
`;
      output += `Status: ${isExpired ? "EXPIRED" : "VALID"}
`;
      if (isExpired) {
        output += `Expired ${Math.floor((now - expDate) / 1e3 / 60)} minutes ago`;
      } else {
        output += `Expires in ${Math.floor((expDate - now) / 1e3 / 60)} minutes`;
      }
    }
    return output;
  } catch (error) {
    throw new Error("JWT decode failed: " + error.message);
  }
}
function renderDiff(baseline, current) {
  if (typeof Diff === "undefined") {
    return highlightHTTP(current);
  }
  const diff = Diff.diffLines(baseline, current);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  diff.forEach((part) => {
    const lines = part.value.split("\n");
    lines.forEach((line, idx) => {
      if (idx === lines.length - 1 && line === "") return;
      if (part.added) {
        html += `<div class="diff-add">+ ${escapeHtml(line)}</div>`;
      } else if (part.removed) {
        html += `<div class="diff-remove">- ${escapeHtml(line)}</div>`;
      } else {
        html += `<div>  ${escapeHtml(line)}</div>`;
      }
    });
  });
  html += "</pre>";
  return html;
}
export {
  decodeJWT,
  renderDiff,
  testRegex
};
