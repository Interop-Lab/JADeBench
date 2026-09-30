function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function arrayToCSV(data, columns) {
  const selectedColumns = columns || Object.keys(data[0] || {});
  const lines = [selectedColumns.map(escapeCsvField).join(',')];
  for (const row of data) {
    lines.push(selectedColumns.map(column => escapeCsvField(row[column])).join(','));
  }
  return lines.join('\n');
}

function downloadCSV(data, filename) {
  const blob = new Blob([arrayToCSV(data)], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showCopySuccess(button) {
  const originalHtml = button.innerHTML;
  button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#81c995"/></svg>';
  setTimeout(() => {
    button.innerHTML = originalHtml;
  }, 1500);
}

function showCopyFailure(button) {
  const originalHtml = button.innerHTML;
  button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#f28b82"/></svg>';
  setTimeout(() => {
    button.innerHTML = originalHtml;
  }, 1500);
}

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    showCopySuccess(button);
    return;
  } catch (error) {
    console.warn('Clipboard API failed, trying fallback:', error);
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showCopySuccess(button);
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    showCopyFailure(button);
  }
}

function getHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return 'unknown';
  }
}

function highlightHTTP(value) {
  return escapeHtml(value)
    .replace(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS) (\S+)( HTTP\/\d(?:\.\d)?)$/gm,
      '<span class="http-method">$1</span> <span class="http-path">$2</span><span class="http-version">$3</span>')
    .replace(/^([^:\n]+)(:)([^\n]*)$/gm,
      '<span class="http-header-name">$1</span><span class="http-colon">$2</span><span class="http-header-value">$3</span>');
}

function highlightJSON(value) {
  return escapeHtml(value).replace(
    /("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match, key, string, boolean, nil, number) => {
      if (key) return '<span class="json-key">' + key + '</span>';
      if (string) return '<span class="json-string">' + string + '</span>';
      if (boolean) return '<span class="json-boolean">' + boolean + '</span>';
      if (nil) return '<span class="json-null">' + nil + '</span>';
      return '<span class="json-number">' + number + '</span>';
    },
  );
}

function highlightParams(value) {
  return value.replace(
    /([^&=]+)=([^&]*)/g,
    (match, key, itemValue) => '<span class="param-key">' + escapeHtml(key) +
      '</span>=<span class="param-value">' + escapeHtml(itemValue) + '</span>',
  );
}

function highlightCookies(value) {
  return value.replace(
    /([^;=]+)=([^;]*)/g,
    (match, key, itemValue) => '<span class="cookie-key">' + escapeHtml(key) +
      '</span>=<span class="cookie-value">' + escapeHtml(itemValue) + '</span>',
  );
}

function testRegex(pattern, value) {
  try {
    return new RegExp(pattern).test(value);
  } catch {
    return false;
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. Expected format: header.payload.signature');
    }
    const decodePart = part => {
      const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(character =>
        '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2),
      ).join(''));
      return JSON.parse(json);
    };
    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    return 'JWT Decoded:\n\n=== HEADER ===\n' + JSON.stringify(header, null, 2) +
      '\n\n=== PAYLOAD ===\n' + JSON.stringify(payload, null, 2) +
      '\n\n=== SIGNATURE ===\n' + parts[2] +
      '\n(Signature verification not performed)';
  } catch (error) {
    throw new Error('JWT decode failed: ' + error.message);
  }
}

function renderDiff(before, after) {
  const parts = Diff.diffLines(before, after);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  for (const part of parts) {
    const element = document.createElement('div');
    element.textContent = part.value;
    const content = element.innerHTML;
    if (part.added) html += '<div class="diff-add">+ ' + content + '</div>';
    else if (part.removed) html += '<div class="diff-remove">- ' + content + '</div>';
    else html += '<div>  ' + content + '</div>';
  }
  return html + '</pre>';
}

Object.assign(globalThis, {
  escapeHtml,
  escapeCsvField,
  arrayToCSV,
  downloadCSV,
  downloadJSON,
  copyToClipboard,
  showCopySuccess,
  getHostname,
  highlightHTTP,
  highlightJSON,
  highlightParams,
  highlightCookies,
  testRegex,
  decodeJWT,
  renderDiff,
});

export { decodeJWT, renderDiff, testRegex };
