const COPY_SUCCESS_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
const COPY_ERROR_ICON = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) {
    return '';
  }

  const text = String(value);
  if (
    text.includes(',') ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')
  ) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function arrayToCSV(data, columns) {
  if (!data || data.length === 0) {
    return columns ? columns.join(',') : '';
  }

  const headers = columns || Object.keys(data[0]);
  const rows = [headers.map(escapeCsvField).join(',')];

  data.forEach((row) => {
    const values = headers.map((header) => escapeCsvField(row[header]));
    rows.push(values.join(','));
  });

  return rows.join('\n');
}

function downloadCSV(data, filename, columns = null) {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text, button) {
  const isDevToolsPage = window.location.protocol === 'devtools:';

  if (!isDevToolsPage) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) {
        showCopySuccess(button);
      }
      return;
    } catch (error) {
      const blockedByPermissionsPolicy =
        error.message?.includes('permissions policy') ||
        error.message?.includes('Permissions policy');

      if (!blockedByPermissionsPolicy) {
        console.warn('Clipboard API failed, trying fallback:', error);
      }
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
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

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (copied) {
      if (button) {
        showCopySuccess(button);
      }
    } else {
      throw new Error('execCommand copy failed');
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);

    if (button) {
      const originalHtml = button.innerHTML;
      button.innerHTML = COPY_ERROR_ICON;
      setTimeout(() => {
        if (button) {
          button.innerHTML = originalHtml;
        }
      }, 1500);
    }
  }
}

function showCopySuccess(button) {
  if (!button) {
    return;
  }

  const originalHtml = button.innerHTML;
  button.innerHTML = COPY_SUCCESS_ICON;
  setTimeout(() => {
    if (button) {
      button.innerHTML = originalHtml;
    }
  }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return 'unknown';
  }
}

function highlightHTTP(httpText) {
  if (!httpText) {
    return '';
  }

  const lines = httpText.split('\n');
  const isResponse = lines[0] && lines[0].toUpperCase().startsWith('HTTP/');
  let hasBlankLine = false;
  let blankLineIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() === '') {
      hasBlankLine = true;
      blankLineIndex = index;
      break;
    }
  }

  let highlighted = '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (index === 0) {
      const firstSpace = line.indexOf(' ');
      if (firstSpace > -1) {
        const method = line.substring(0, firstSpace);
        const remainder = line.substring(firstSpace + 1);
        highlighted += `<span class="http-method">${escapeHtml(method)}</span> `;

        let path = remainder;
        let version = '';
        const versionMatch = remainder.match(/(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i);
        if (versionMatch) {
          path = remainder.substring(0, versionMatch.index);
          version = remainder.substring(versionMatch.index);
        }

        const queryStart = path.indexOf('?');
        if (queryStart > -1) {
          highlighted += `<span class="http-path">${escapeHtml(path.substring(0, queryStart))}</span>?`;
          highlighted += highlightParams(path.substring(queryStart + 1));
        } else {
          highlighted += `<span class="http-path">${escapeHtml(path)}</span>`;
        }

        if (version) {
          highlighted += `<span class="http-version">${escapeHtml(version)}</span>`;
        }
      } else {
        highlighted += escapeHtml(line);
      }
    } else if (!hasBlankLine || index < blankLineIndex) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const headerName = line.substring(0, colonIndex);
        const headerValue = line.substring(colonIndex + 1);
        highlighted += `<span class="http-header-name">${escapeHtml(headerName)}</span>`;
        highlighted += '<span class="http-colon">:</span>';

        if (headerName.trim().toLowerCase() === 'cookie') {
          highlighted += highlightCookies(headerValue);
        } else {
          highlighted += `<span class="http-header-value">${escapeHtml(headerValue)}</span>`;
        }
      } else {
        highlighted += escapeHtml(line);
      }
    } else if (index === blankLineIndex) {
      highlighted += '';
    } else {
      const body = lines.slice(blankLineIndex + 1).join('\n');
      let highlightedBody = highlightJSON(body);

      if (!isResponse && highlightedBody === escapeHtml(body)) {
        highlightedBody = highlightParams(body);
      }

      highlighted += highlightedBody;
      break;
    }

    if (index < lines.length - 1) {
      highlighted += '\n';
    }
  }

  return highlighted;
}

function highlightJSON(jsonText) {
  try {
    JSON.parse(jsonText);
    return jsonText.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (token) => {
        let className = 'json-number';
        if (/^"/.test(token)) {
          className = /:$/.test(token) ? 'json-key' : 'json-string';
        } else if (/true|false/.test(token)) {
          className = 'json-boolean';
        } else if (/null/.test(token)) {
          className = 'json-null';
        }
        return `<span class="${className}">${escapeHtml(token)}</span>`;
      },
    );
  } catch (error) {
    return escapeHtml(jsonText);
  }
}

function highlightParams(params) {
  if (params.trim().startsWith('<')) {
    return escapeHtml(params);
  }

  if (params.indexOf('=') === -1) {
    return escapeHtml(params);
  }

  return params
    .split('&')
    .map((part) => {
      const equalsIndex = part.indexOf('=');
      if (equalsIndex > -1) {
        const key = part.substring(0, equalsIndex);
        const value = part.substring(equalsIndex + 1);
        return `<span class="param-key">${escapeHtml(key)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
      }
      return escapeHtml(part);
    })
    .join('&');
}

function highlightCookies(cookies) {
  return cookies
    .split(';')
    .map((part) => {
      const equalsIndex = part.indexOf('=');
      if (equalsIndex > -1) {
        const key = part.substring(0, equalsIndex);
        const value = part.substring(equalsIndex + 1);
        return `<span class="cookie-key">${escapeHtml(key)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
      }
      return escapeHtml(part);
    })
    .join(';');
}

function testRegex(pattern, text) {
  try {
    const regex = new RegExp(pattern);
    return regex.test(text);
  } catch (error) {
    return false;
  }
}

function decodeBase64Url(value) {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  try {
    const decoded = atob(base64);
    return decodeURIComponent(
      decoded
        .split('')
        .map(
          (character) =>
            `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`,
        )
        .join(''),
    );
  } catch (error) {
    throw new Error(`Failed to decode base64: ${error.message}`);
  }
}

function decodeJWT(token) {
  try {
    token = token.trim();
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. Expected format: header.payload.signature');
    }

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

    let output = 'JWT Decoded:\n\n';
    output += '=== HEADER ===\n';
    output += JSON.stringify(header, null, 2);
    output += '\n\n=== PAYLOAD ===\n';
    output += JSON.stringify(payload, null, 2);
    output += '\n\n=== SIGNATURE ===\n';
    output += `${parts[2]}\n`;
    output += '(Signature verification not performed)';

    if (payload.exp) {
      const expiration = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expiration < now;

      output += '\n\n=== TOKEN INFO ===\n';
      output += `Expiration: ${expiration.toISOString()}\n`;
      output += `Status: ${isExpired ? 'EXPIRED' : 'VALID'}\n`;

      if (isExpired) {
        output += `Expired ${Math.floor((now - expiration) / 1000 / 60)} minutes ago`;
      } else {
        output += `Expires in ${Math.floor((expiration - now) / 1000 / 60)} minutes`;
      }
    }

    return output;
  } catch (error) {
    throw new Error(`JWT decode failed: ${error.message}`);
  }
}

function renderDiff(previousText, currentText) {
  if (typeof Diff === 'undefined') {
    return highlightHTTP(currentText);
  }

  const changes = Diff.diffLines(previousText, currentText);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';

  changes.forEach((change) => {
    const lines = change.value.split('\n');
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === '') {
        return;
      }

      if (change.added) {
        html += `<div class="diff-add">+ ${escapeHtml(line)}</div>`;
      } else if (change.removed) {
        html += `<div class="diff-remove">- ${escapeHtml(line)}</div>`;
      } else {
        html += `<div>  ${escapeHtml(line)}</div>`;
      }
    });
  });

  html += '</pre>';
  return html;
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
