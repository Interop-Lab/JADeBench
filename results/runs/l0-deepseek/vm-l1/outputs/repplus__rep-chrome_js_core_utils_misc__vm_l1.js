const globalObject = typeof globalThis !== 'undefined' ? globalThis :
  typeof window !== 'undefined' ? window :
  typeof self !== 'undefined' ? self :
  typeof global !== 'undefined' ? global : undefined;

const moduleContext = globalObject['__module_context__'] || (globalObject['__module_context__'] = {});

(function() {
  if (!moduleContext['module']) {
    try { moduleContext['module'] = module; } catch (_) {}
  }
  if (!moduleContext['exports']) {
    try { moduleContext['exports'] = exports; } catch (_) {}
  }
  if (!moduleContext['require']) {
    try { moduleContext['require'] = require; } catch (_) {}
  }
  if (!moduleContext['__dirname']) {
    try { moduleContext['__dirname'] = __dirname; } catch (_) {}
  }
  if (!moduleContext['__filename']) {
    try { moduleContext['__filename'] = __filename; } catch (_) {}
  }
})();

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (/[",\n\r]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function arrayToCSV(data, delimiter) {
  const delim = delimiter || ',';
  if (!Array.isArray(data) || data.length === 0) return '';
  return data.map(row => {
    if (!Array.isArray(row)) return escapeCsvField(row);
    return row.map(cell => escapeCsvField(cell)).join(delim);
  }).join('\n');
}

function downloadCSV(data, filename) {
  const csv = Array.isArray(data) ? arrayToCSV(data) : String(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'download.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'download.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function copyToClipboard(text, callback) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof callback === 'function') callback(true);
    }).catch(() => {
      if (typeof callback === 'function') callback(false);
    });
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    let success = false;
    try {
      success = document.execCommand('copy');
    } catch (_) {}
    document.body.removeChild(textarea);
    if (typeof callback === 'function') callback(success);
  }
}

function showCopySuccess(button) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  button.classList.add('copy-success');
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copy-success');
  }, 1500);
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (_) {
    return '';
  }
}

function highlightHTTP(text) {
  return escapeHtml(text).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<span class="highlight-http">$1</span>'
  );
}

function highlightJSON(text) {
  try {
    const parsed = JSON.parse(text);
    return '<pre class="highlight-json">' + escapeHtml(JSON.stringify(parsed, null, 2)) + '</pre>';
  } catch (_) {
    return '<pre class="highlight-json">' + escapeHtml(text) + '</pre>';
  }
}

function highlightParams(params) {
  if (!params) return '';
  const searchParams = new URLSearchParams(params);
  const parts = [];
  for (const [key, value] of searchParams.entries()) {
    parts.push(
      '<span class="param-key">' + escapeHtml(key) + '</span>' +
      '=' +
      '<span class="param-value">' + escapeHtml(value) + '</span>'
    );
  }
  return parts.join('&amp;');
}

function highlightCookies(cookieString) {
  if (!cookieString) return '';
  return cookieString.split(';').map(cookie => {
    const trimmed = cookie.trim();
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return escapeHtml(trimmed);
    const name = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    return '<span class="cookie-name">' + escapeHtml(name) + '</span>' +
      '=' +
      '<span class="cookie-value">' + escapeHtml(value) + '</span>';
  }).join('; ');
}

function testRegex(pattern, flags, testString) {
  try {
    const regex = new RegExp(pattern, flags);
    return {
      valid: true,
      matches: testString.match(regex) || [],
      test: regex.test(testString)
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT format' };
    }
    const base64UrlDecode = (str) => {
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      const padding = str.length % 4;
      if (padding) str += '='.repeat(4 - padding);
      const decoded = atob(str);
      return decodeURIComponent(
        decoded.split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    };
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return {
      valid: true,
      header,
      payload,
      signature: parts[2]
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function renderDiff(oldText, newText) {
  if (typeof Diff === 'undefined') {
    return '<pre>' + escapeHtml(newText) + '</pre>';
  }
  const diff = Diff.diffLines(oldText || '', newText || '');
  return '<pre class="diff">' + diff.map(part => {
    const className = part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-unchanged';
    return '<span class="' + className + '">' + escapeHtml(part.value) + '</span>';
  }).join('') + '</pre>';
}

moduleContext['renderDiff'] = renderDiff;
globalThis['renderDiff'] = moduleContext['renderDiff'];
moduleContext['decodeJWT'] = decodeJWT;
globalThis['decodeJWT'] = moduleContext['decodeJWT'];
moduleContext['testRegex'] = testRegex;
globalThis['testRegex'] = moduleContext['testRegex'];
moduleContext['highlightCookies'] = highlightCookies;
globalThis['highlightCookies'] = moduleContext['highlightCookies'];
moduleContext['highlightParams'] = highlightParams;
globalThis['highlightParams'] = moduleContext['highlightParams'];
moduleContext['highlightJSON'] = highlightJSON;
globalThis['highlightJSON'] = moduleContext['highlightJSON'];
moduleContext['highlightHTTP'] = highlightHTTP;
globalThis['highlightHTTP'] = moduleContext['highlightHTTP'];
moduleContext['getHostname'] = getHostname;
globalThis['getHostname'] = moduleContext['getHostname'];
moduleContext['showCopySuccess'] = showCopySuccess;
globalThis['showCopySuccess'] = moduleContext['showCopySuccess'];
moduleContext['copyToClipboard'] = copyToClipboard;
globalThis['copyToClipboard'] = moduleContext['copyToClipboard'];
moduleContext['downloadJSON'] = downloadJSON;
globalThis['downloadJSON'] = moduleContext['downloadJSON'];
moduleContext['downloadCSV'] = downloadCSV;
globalThis['downloadCSV'] = moduleContext['downloadCSV'];
moduleContext['arrayToCSV'] = arrayToCSV;
globalThis['arrayToCSV'] = moduleContext['arrayToCSV'];
moduleContext['escapeCsvField'] = escapeCsvField;
globalThis['escapeCsvField'] = moduleContext['escapeCsvField'];
moduleContext['escapeHtml'] = escapeHtml;
globalThis['escapeHtml'] = moduleContext['escapeHtml'];

export { decodeJWT, renderDiff, testRegex };
