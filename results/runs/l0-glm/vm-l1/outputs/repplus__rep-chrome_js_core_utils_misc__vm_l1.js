function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeCsvField(field) {
  if (field == null) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(data, headers) {
  if (!Array.isArray(data) || data.length === 0) return '';
  const keys = headers || Object.keys(data[0]);
  const rows = [keys.join(',')];
  for (const row of data) {
    rows.push(keys.map(k => escapeCsvField(row[k])).join(','));
  }
  return rows.join('\n');
}

function downloadCSV(filename, data) {
  const csv = typeof data === 'string' ? data : arrayToCSV(data);
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

function downloadJSON(filename, data) {
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

function copyToClipboard(text, callback) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      if (callback) callback();
    }).catch(() => {
      fallbackCopy(text, callback);
    });
  } else {
    fallbackCopy(text, callback);
  }
}

function fallbackCopy(text, callback) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (e) {}
  document.body.removeChild(textarea);
}

function showCopySuccess(element) {
  if (!element) return;
  const originalText = element.textContent;
  element.textContent = 'Copied!';
  element.classList.add('copy-success');
  setTimeout(() => {
    element.textContent = originalText;
    element.classList.remove('copy-success');
  }, 2000);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return '';
  }
}

function highlightHTTP(text) {
  return escapeHtml(text)
    .replace(/(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)(\s+)(\S+)/g, '<span class="http-method">$1</span>$2<span class="http-url">$3</span>')
    .replace(/(HTTP\/[\d.]+\s+\d{3}\s+\w+)/g, '<span class="http-status">$1</span>')
    .replace(/(Content-Type|Content-Length|Authorization|Accept|Cookie|Set-Cookie|Host|User-Agent)(:)([^\r\n]*)/g, '<span class="http-header">$1</span>$2<span class="http-value">$3</span>');
}

function highlightJSON(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function highlightParams(text) {
  return escapeHtml(text)
    .replace(/([?&])([^=&\s]+)=([^&\s#]*)/g, '$1<span class="param-key">$2</span>=<span class="param-value">$3</span>');
}

function highlightCookies(text) {
  return escapeHtml(text)
    .replace(/([^=;\s]+)=([^;]*)/g, '<span class="cookie-name">$1</span>=<span class="cookie-value">$2</span>');
}

function testRegex(pattern, flags, testString) {
  try {
    const regex = new RegExp(pattern, flags);
    const matches = [];
    let match;
    if (flags && flags.includes('g')) {
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    } else {
      match = regex.exec(testString);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }
    }
    return { valid: true, matches: matches };
  } catch (e) {
    return { valid: false, error: e.message };
  }
}

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { error: 'Invalid JWT format' };
  }
  try {
    const decodeBase64 = (str) => {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) str += '=';
      return decodeURIComponent(atob(str).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    };
    const header = JSON.parse(decodeBase64(parts[0]));
    const payload = JSON.parse(decodeBase64(parts[1]));
    return { header, payload, signature: parts[2] };
  } catch (e) {
    return { error: 'Failed to decode JWT: ' + e.message };
  }
}

function renderDiff(oldText, newText) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);
  let result = [];
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] !== undefined ? oldLines[i] : '';
    const newLine = newLines[i] !== undefined ? newLines[i] : '';
    if (oldLine === newLine) {
      result.push({ type: 'unchanged', text: oldLine });
    } else {
      if (oldLine) result.push({ type: 'removed', text: oldLine });
      if (newLine) result.push({ type: 'added', text: newLine });
    }
  }
  return result.map(line => {
    if (line.type === 'added') return '<div class="diff-added">+ ' + escapeHtml(line.text) + '</div>';
    if (line.type === 'removed') return '<div class="diff-removed">- ' + escapeHtml(line.text) + '</div>';
    return '<div class="diff-unchanged">  ' + escapeHtml(line.text) + '</div>';
  }).join('');
}

export { decodeJWT, renderDiff, testRegex };
