export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function escapeCsvField(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function arrayToCSV(data, headers) {
  if (!data || data.length === 0) return headers ? headers.join(',') : '';
  const cols = headers || Object.keys(data[0]);
  const lines = [cols.map(escapeCsvField).join(',')];
  data.forEach(row => {
    const values = cols.map(col => {
      const val = row[col];
      return escapeCsvField(val);
    });
    lines.push(values.join(','));
  });
  return lines.join('\n');
}

export function downloadCSV(data, filename, headers = null) {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text, button) {
  const isSecure = window.location.protocol === 'https:';
  if (!isSecure) {
    try {
      await navigator.clipboard.writeText(text);
      button && showCopySuccess(button);
      return;
    } catch (err) {
      if (!err.message?.includes('clipboard') && !err.message?.includes('NotAllowed')) {
        console.error('Clipboard error:', err);
      }
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
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
      if (button) {
        showCopySuccess(button);
      }
    } else {
      throw new Error('Copy command failed');
    }
  } catch (err) {
    console.error('Clipboard error:', err);
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Failed!';
      setTimeout(() => {
        button && (button.textContent = originalText);
      }, 2000);
    }
  }
}

export function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  setTimeout(() => {
    button && (button.textContent = originalText);
  }, 2000);
}

export function getHostname(url) {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch (e) {
    return '';
  }
}

export function highlightHTTP(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let foundStatus = false;
  let statusIdx = -1;
  const hasValidStatus = lines[0] && lines[0].trim().startsWith('HTTP/');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') {
      foundStatus = true;
      statusIdx = i;
      break;
    }
  }

  let result = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i === 0) {
      const spaceIdx = line.indexOf(' ');
      if (spaceIdx > -1) {
        const method = line.substring(0, spaceIdx);
        const rest = line.substring(spaceIdx + 1);
        result += '<span class="http-method">' + escapeHtml(method) + '</span> ';

        let path = rest;
        let protocol = '';
        const protoMatch = rest.match(/(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i);
        if (protoMatch) {
          path = rest.substring(0, protoMatch.index);
          protocol = rest.substring(protoMatch.index);
        }

        const queryIdx = path.indexOf('?');
        if (queryIdx > -1) {
          result += '<span class="http-path">' + escapeHtml(path.substring(0, queryIdx)) + '</span>';
          result += highlightParams(path.substring(queryIdx + 1));
        } else {
          result += '<span class="http-path">' + escapeHtml(path) + '</span>';
        }

        if (protocol) {
          result += '<span class="http-protocol">' + escapeHtml(protocol) + '</span>';
        }
      } else {
        result += escapeHtml(line);
      }
    } else {
      if (!foundStatus || i < statusIdx) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > -1) {
          const headerName = line.substring(0, colonIdx);
          const headerValue = line.substring(colonIdx + 1);
          result += '<span class="http-header-name">' + escapeHtml(headerName) + '</span>:';
          if (headerName.toLowerCase().includes('cookie')) {
            result += highlightCookies(headerValue);
          } else {
            result += '<span class="http-header-value">' + escapeHtml(headerValue) + '</span>';
          }
        } else {
          result += escapeHtml(line);
        }
      } else {
        if (i > statusIdx) result += '';
        else {
          const body = lines.slice(statusIdx + 1).join('\n');
          let highlighted = highlightJSON(body);
          if (!hasValidStatus && highlighted === escapeHtml(body)) {
            highlighted = highlightParams(body);
          }
          result += highlighted;
          break;
        }
      }
    }

    if (i < lines.length - 1) {
      result += '\n';
    }
  }

  return result;
}

export function highlightJSON(json) {
  try {
    JSON.parse(json);
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else {
        if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
      }
      return '<span class="' + cls + '">' + escapeHtml(match) + '</span>';
    });
  } catch (e) {
    return escapeHtml(json);
  }
}

export function highlightParams(params) {
  if (params.trim().startsWith('<')) return escapeHtml(params);
  if (params.indexOf('=') === -1) return escapeHtml(params);
  return params.split('&').map(function(pair) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx > -1) {
      const key = pair.substring(0, eqIdx);
      const value = pair.substring(eqIdx + 1);
      return '<span class="param-key">' + escapeHtml(key) + '</span>=<span class="param-value">' + escapeHtml(value) + '</span>';
    } else {
      return escapeHtml(pair);
    }
  }).join('&');
}

export function highlightCookies(cookies) {
  return cookies.split(';').map(function(cookie) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx > -1) {
      const name = cookie.substring(0, eqIdx);
      const value = cookie.substring(eqIdx + 1);
      return '<span class="cookie-name">' + escapeHtml(name) + '</span>=<span class="cookie-value">' + escapeHtml(value) + '</span>';
    } else {
      return escapeHtml(cookie);
    }
  }).join(';');
}

export function testRegex(pattern, testString) {
  try {
    const regex = new RegExp(pattern);
    return regex.test(testString);
  } catch (e) {
    return false;
  }
}

export function decodeJWT(token) {
  try {
    let base64UrlDecode = function(str) {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      while (str.length % 4) {
        str += '=';
      }
      try {
        const decoded = atob(str);
        return decodeURIComponent(decoded.split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      } catch (e) {
        throw new Error('Failed to decode base64: ' + e.message);
      }
    };

    token = token.trim();
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');

    let header;
    try {
      const headerJson = base64UrlDecode(parts[0]);
      header = JSON.parse(headerJson);
    } catch (e) {
      throw new Error('Failed to parse JWT header: ' + e.message);
    }

    let payload;
    try {
      const payloadJson = base64UrlDecode(parts[1]);
      payload = JSON.parse(payloadJson);
    } catch (e) {
      throw new Error('Failed to parse JWT payload: ' + e.message);
    }

    let result = '';
    result += 'Header:\n';
    result += JSON.stringify(header, null, 2);
    result += '\nPayload:\n';
    result += JSON.stringify(payload, null, 2);
    result += '\nSignature:\n';
    result += parts[2] + '\n';

    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      result += 'Expiration:\n';
      result += '  Date: ' + expDate.toLocaleString() + '\n';
      result += '  Status: ' + (isExpired ? 'EXPIRED' : 'VALID') + '\n';
      if (isExpired) {
        result += '  Expired ' + Math.round((now - expDate) / 1000) + ' seconds ago\n';
      } else {
        result += '  Expires in ' + Math.round((expDate - now) / 1000) + ' seconds\n';
      }
    }

    return result;
  } catch (e) {
    throw new Error('JWT decode error: ' + e.message);
  }
}

export function renderDiff(oldText, newText) {
  if (typeof Diff === 'undefined') {
    return highlightHTTP(newText);
  }
  const diff = Diff.diffLines(oldText, newText);
  let result = '';
  diff.forEach(function(part) {
    const lines = part.value.split('\n');
    lines.forEach(function(line, idx) {
      if (idx === lines.length - 1 && line === '') return;
      if (part.added) {
        result += '<span class="diff-added">' + escapeHtml(line) + '</span>';
      } else if (part.removed) {
        result += '<span class="diff-removed">' + escapeHtml(line) + '</span>';
      } else {
        result += '<span class="diff-unchanged">' + escapeHtml(line) + '</span>';
      }
    });
  });
  result += '';
  return result;
}
