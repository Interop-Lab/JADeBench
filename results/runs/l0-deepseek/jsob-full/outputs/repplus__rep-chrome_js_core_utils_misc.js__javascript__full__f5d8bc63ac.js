function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function arrayToCSV(data, delimiter) {
  if (!data || data.length === 0) return delimiter ? delimiter.join(',') : '';
  const headers = delimiter || Object.keys(data[0]);
  const lines = [headers.map(escapeCsvField).join(',')];
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      return escapeCsvField(value);
    });
    lines.push(values.join(','));
  });
  return lines.join('\n');
}

function downloadCSV(data, filename, delimiter = null) {
  const csv = arrayToCSV(data, delimiter);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyToClipboard(text, button) {
  const clipboard = window.navigator.clipboard;
  if (!clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      if (button) showCopySuccess(button);
      return;
    } catch (err) {
      if (!err?.message?.includes('document') && !err?.message?.includes('not focused')) {
        console.error('Clipboard write failed', err);
      }
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.overflow = 'hidden';
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
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      if (button) showCopySuccess(button);
    } else {
      throw new Error('Copy command failed');
    }
  } catch (err) {
    console.error('Copy failed', err);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Copy failed';
      setTimeout(() => {
        if (button) button.textContent = originalText;
      }, 1500);
    }
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  setTimeout(() => {
    if (button) button.textContent = originalText;
  }, 1500);
}

function getHostname(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch (e) {
    return '';
  }
}

function highlightHTTP(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let inBody = false;
  let bodyStart = -1;
  const isResponse = lines[0] && lines[0].trim().startsWith('HTTP/');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      inBody = true;
      bodyStart = i;
      break;
    }
  }
  let result = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0) {
      const parts = line.split(' ');
      if (parts.length > 1) {
        const method = line.substring(0, parts[0].length);
        const target = line.substring(parts[0].length + 1);
        result += '<span class="http-method">' + escapeHtml(method) + '</span>';
        let path = target;
        let version = '';
        const versionMatch = target.match(/(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i);
        if (versionMatch) {
          path = target.substring(0, versionMatch.index);
          version = target.substring(versionMatch.index);
        }
        const queryIndex = path.indexOf('?');
        if (queryIndex > -1) {
          result += '<span class="http-path">' + escapeHtml(path.substring(0, queryIndex)) + '</span>';
          result += highlightParams(path.substring(queryIndex + 1));
        } else {
          result += '<span class="http-path">' + escapeHtml(path) + '</span>';
        }
        if (version) {
          result += '<span class="http-version">' + escapeHtml(version) + '</span>';
        }
      } else {
        result += escapeHtml(line);
      }
    } else {
      if (!inBody || i <= bodyStart) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const name = line.substring(0, colonIndex);
          const value = line.substring(colonIndex + 1);
          result += '<span class="http-header">' + escapeHtml(name) + '</span>';
          result += ': ';
          if (name.toLowerCase().includes('cookie')) {
            result += highlightCookies(value);
          } else {
            result += escapeHtml(value);
          }
        } else {
          result += escapeHtml(line);
        }
      } else {
        if (i === bodyStart) {
          result += '';
        } else {
          const body = lines.slice(bodyStart + 1).join('\n');
          let highlighted = highlightJSON(body);
          if (!isResponse && highlighted === escapeHtml(body)) {
            highlighted = highlightParams(body);
          }
          result += highlighted;
          break;
        }
      }
    }
    if (i < lines.length - 1) result += '\n';
  }
  return result;
}

function highlightJSON(json) {
  try {
    JSON.parse(json);
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, token => {
      let cls = 'json-number';
      if (/^"/.test(token)) {
        if (/:$/.test(token)) cls = 'json-key';
        else cls = 'json-string';
      } else {
        if (/true|false/.test(token)) cls = 'json-boolean';
        else if (/null/.test(token)) cls = 'json-null';
      }
      return '<span class="' + cls + '">' + escapeHtml(token) + '</span>';
    });
  } catch (e) {
    return escapeHtml(json);
  }
}

function highlightParams(params) {
  if (params.trim().startsWith('<')) return escapeHtml(params);
  if (params.indexOf('=') === -1) return escapeHtml(params);
  return params.split('&').map(pair => {
    const eqIndex = pair.indexOf('=');
    if (eqIndex > -1) {
      const key = pair.substring(0, eqIndex);
      const value = pair.substring(eqIndex + 1);
      return '<span class="param-key">' + escapeHtml(key) + '</span>=<span class="param-value">' + escapeHtml(value) + '</span>';
    } else {
      return escapeHtml(pair);
    }
  }).join('&');
}

function highlightCookies(cookies) {
  return cookies.split(';').map(cookie => {
    const eqIndex = cookie.indexOf('=');
    if (eqIndex > -1) {
      const name = cookie.substring(0, eqIndex);
      const value = cookie.substring(eqIndex + 1);
      return '<span class="cookie-name">' + escapeHtml(name) + '</span>=<span class="cookie-value">' + escapeHtml(value) + '</span>';
    } else {
      return escapeHtml(cookie);
    }
  }).join(';');
}

function testRegex(pattern, value) {
  try {
    const regex = new RegExp(pattern);
    return regex.test(value);
  } catch (e) {
    return false;
  }
}

function decodeJWT(jwt) {
  try {
    const base64UrlDecode = function (input) {
      input = input.replace(/-/g, '+').replace(/_/g, '/');
      while (input.length % 4) {
        input += '=';
      }
      try {
        const decoded = atob(input);
        return decodeURIComponent(decoded.split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch (err) {
        throw new Error('Invalid base64 encoding: ' + err.message);
      }
    };
    jwt = jwt.trim();
    const parts = jwt.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    let header;
    try {
      const decodedHeader = base64UrlDecode(parts[0]);
      header = JSON.parse(decodedHeader);
    } catch (err) {
      throw new Error('Invalid JWT header: ' + err.message);
    }
    let payload;
    try {
      const decodedPayload = base64UrlDecode(parts[1]);
      payload = JSON.parse(decodedPayload);
    } catch (err) {
      throw new Error('Invalid JWT payload: ' + err.message);
    }
    let output = '';
    output += 'Header:\n';
    output += JSON.stringify(header, null, 2);
    output += '\n\nPayload:\n';
    output += JSON.stringify(payload, null, 2);
    output += '\n\nSignature:\n';
    output += parts[2] + '\n';
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const expired = expDate < now;
      output += '\nExpiration:\n';
      output += '  Date: ' + expDate.toLocaleString() + '\n';
      output += '  Status: ' + (expired ? 'Expired' : 'Valid') + '\n';
      if (expired) {
        output += '  Expired ' + Math.floor((now - expDate) / 1000) + ' seconds ago';
      } else {
        output += '  Expires in ' + Math.floor((expDate - now) / 1000) + ' seconds';
      }
    }
    return output;
  } catch (err) {
    throw new Error('JWT decoding failed: ' + err.message);
  }
}

function renderDiff(oldText, newText) {
  if (typeof Diff === 'undefined') {
    return highlightHTTP(newText);
  }
  const diff = Diff.diffLines(oldText, newText);
  let result = '';
  diff.forEach(part => {
    const lines = part.value.split('\n');
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === '') return;
      if (part.added) {
        result += '<span class="diff-added">' + escapeHtml(line) + '</span>';
      } else if (part.removed) {
        result += '<span class="diff-removed">' + escapeHtml(line) + '</span>';
      } else {
        result += '<span class="diff-context">' + escapeHtml(line) + '</span>';
      }
    });
  });
  result += '\n';
  return result;
}

export { decodeJWT, renderDiff, testRegex };
