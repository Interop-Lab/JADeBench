function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return '';

  const stringValue = String(value);
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function arrayToCSV(rows, headers) {
  if (!rows || rows.length === 0) {
    return headers ? headers.join(',') : '';
  }

  const columns = headers || Object.keys(rows[0]);
  const lines = [columns.map(escapeCsvField).join(',')];

  rows.forEach((row) => {
    const values = columns.map((column) => escapeCsvField(row[column]));
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

function downloadCSV(rows, filename, headers = null) {
  const csv = arrayToCSV(rows, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8;',
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

const COPY_SUCCESS_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
const COPY_ERROR_ICON =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
const COPY_FEEDBACK_DURATION_MS = 1500;

async function copyToClipboard(text, indicatorElement) {
  const isDevtools = window.location.protocol === 'devtools:';

  if (!isDevtools) {
    try {
      await navigator.clipboard.writeText(text);
      if (indicatorElement) showCopySuccess(indicatorElement);
      return;
    } catch (error) {
      if (
        !error.message?.includes('permissions policy') &&
        !error.message?.includes('Permissions policy')
      ) {
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

    if (!copied) throw new Error('execCommand copy failed');
    if (indicatorElement) showCopySuccess(indicatorElement);
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    if (indicatorElement) {
      const originalHtml = indicatorElement.innerHTML;
      indicatorElement.innerHTML = COPY_ERROR_ICON;
      setTimeout(() => {
        if (indicatorElement) indicatorElement.innerHTML = originalHtml;
      }, COPY_FEEDBACK_DURATION_MS);
    }
  }
}

function showCopySuccess(indicatorElement) {
  if (!indicatorElement) return;

  const originalHtml = indicatorElement.innerHTML;
  indicatorElement.innerHTML = COPY_SUCCESS_ICON;
  setTimeout(() => {
    if (indicatorElement) indicatorElement.innerHTML = originalHtml;
  }, COPY_FEEDBACK_DURATION_MS);
}

function getHostname(urlString) {
  try {
    return new URL(urlString).hostname;
  } catch {
    return 'unknown';
  }
}

function highlightHTTP(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const separatorIndex = lines.findIndex((line) => line.trim() === '');
  const isResponse = lines[0]?.toUpperCase().startsWith('HTTP/');
  let html = '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (index === 0) {
      const firstSpace = line.indexOf(' ');
      if (firstSpace >= 0) {
        const method = line.substring(0, firstSpace);
        const remainder = line.substring(firstSpace + 1);
        const versionMatch = remainder.match(
          /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i,
        );
        const target = versionMatch
          ? remainder.substring(0, versionMatch.index)
          : remainder;
        const version = versionMatch
          ? remainder.substring(versionMatch.index)
          : '';

        html += `<span class="http-method">${escapeHtml(method)}</span> `;

        const queryIndex = target.indexOf('?');
        if (queryIndex >= 0) {
          const path = target.substring(0, queryIndex);
          const query = target.substring(queryIndex + 1);
          html += `<span class="http-path">${escapeHtml(path)}</span>?`;
          html += highlightParams(query);
        } else {
          html += `<span class="http-path">${escapeHtml(target)}</span>`;
        }

        if (version) {
          html += `<span class="http-version">${escapeHtml(version)}</span>`;
        }
      } else {
        html += escapeHtml(line);
      }
    } else if (separatorIndex === -1 || index < separatorIndex) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const name = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        html += `<span class="http-header-name">${escapeHtml(name)}</span>`;
        html += '<span class="http-colon">:</span>';

        if (name.trim().toLowerCase() === 'cookie') {
          html += highlightCookies(value);
        } else {
          html += `<span class="http-header-value">${escapeHtml(value)}</span>`;
        }
      } else {
        html += escapeHtml(line);
      }
    } else if (index > separatorIndex) {
      const body = lines.slice(separatorIndex + 1).join('\n');
      let highlightedBody = highlightJSON(body);
      if (!isResponse && highlightedBody === escapeHtml(body)) {
        highlightedBody = highlightParams(body);
      }
      html += highlightedBody;
      break;
    }

    if (index < lines.length - 1) html += '\n';
  }

  return html;
}

function highlightJSON(text) {
  const tokenPattern =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

  try {
    JSON.parse(text);
    return text.replace(tokenPattern, (token) => {
      let className = 'json-number';
      if (/^"/.test(token)) {
        className = /:$/.test(token) ? 'json-key' : 'json-string';
      } else if (/true|false/.test(token)) {
        className = 'json-boolean';
      } else if (/null/.test(token)) {
        className = 'json-null';
      }

      return `<span class="${className}">${escapeHtml(token)}</span>`;
    });
  } catch {
    return escapeHtml(text);
  }
}

function highlightParams(text) {
  if (text.trim().startsWith('<') || !text.includes('=')) {
    return escapeHtml(text);
  }

  return text
    .split('&')
    .map((part) => {
      const equalsIndex = part.indexOf('=');
      if (equalsIndex < 0) return escapeHtml(part);

      const key = part.substring(0, equalsIndex);
      const value = part.substring(equalsIndex + 1);
      return (
        `<span class="param-key">${escapeHtml(key)}</span>=` +
        `<span class="param-value">${escapeHtml(value)}</span>`
      );
    })
    .join('&');
}

function highlightCookies(text) {
  return text
    .split(';')
    .map((part) => {
      const equalsIndex = part.indexOf('=');
      if (equalsIndex < 0) return escapeHtml(part);

      const key = part.substring(0, equalsIndex);
      const value = part.substring(equalsIndex + 1);
      return (
        `<span class="cookie-key">${escapeHtml(key)}</span>=` +
        `<span class="cookie-value">${escapeHtml(value)}</span>`
      );
    })
    .join(';');
}

function testRegex(pattern, text) {
  try {
    return new RegExp(pattern).test(text);
  } catch {
    return false;
  }
}

function decodeJWT(token) {
  function decodeBase64UrlUtf8(segment) {
    let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';

    try {
      const bytes = atob(base64);
      const percentEncoded = bytes
        .split('')
        .map(
          (character) =>
            `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`,
        )
        .join('');
      return decodeURIComponent(percentEncoded);
    } catch (error) {
      throw new Error(`Failed to decode base64: ${error.message}`);
    }
  }

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      throw new Error(
        'Invalid JWT format. Expected format: header.payload.signature',
      );
    }

    let header;
    try {
      header = JSON.parse(decodeBase64UrlUtf8(parts[0]));
    } catch (error) {
      throw new Error(`Failed to decode JWT header: ${error.message}`);
    }

    let payload;
    try {
      payload = JSON.parse(decodeBase64UrlUtf8(parts[1]));
    } catch (error) {
      throw new Error(`Failed to decode JWT payload: ${error.message}`);
    }

    let output =
      'JWT Decoded:\n\n' +
      '=== HEADER ===\n' +
      JSON.stringify(header, null, 2) +
      '\n\n=== PAYLOAD ===\n' +
      JSON.stringify(payload, null, 2) +
      '\n\n=== SIGNATURE ===\n' +
      parts[2] +
      '\n(Signature verification not performed)';

    if (payload.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const expired = expiresAt < now;

      output += '\n\n=== TOKEN INFO ===\n';
      output += `Expiration: ${expiresAt.toISOString()}\n`;
      output += `Status: ${expired ? 'EXPIRED' : 'VALID'}\n`;

      if (expired) {
        const minutes = Math.floor((now - expiresAt) / 1000 / 60);
        output += `Expired ${minutes} minutes ago`;
      } else {
        const minutes = Math.floor((expiresAt - now) / 1000 / 60);
        output += `Expires in ${minutes} minutes`;
      }
    }

    return output;
  } catch (error) {
    throw new Error(`JWT decode failed: ${error.message}`);
  }
}

function renderDiff(oldText, newText) {
  if (typeof Diff === 'undefined') {
    return highlightHTTP(newText);
  }

  const changes = Diff.diffLines(oldText, newText);
  let html =
    '<pre style="margin: 0; padding: 10px; font-family: monospace; ' +
    'font-size: 12px; line-height: 1.5;">';

  changes.forEach((change) => {
    const lines = change.value.split('\n');
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === '') return;

      const escapedLine = escapeHtml(line);
      if (change.added) {
        html += `<div class="diff-add">+ ${escapedLine}</div>`;
      } else if (change.removed) {
        html += `<div class="diff-remove">- ${escapedLine}</div>`;
      } else {
        html += `<div>  ${escapedLine}</div>`;
      }
    });
  });

  return `${html}</pre>`;
}

export { decodeJWT, renderDiff, testRegex };
