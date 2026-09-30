function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function escapeCsvField(value) {
  if (value == null) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function testRegex(pattern, value) {
  try {
    return new RegExp(pattern).test(value);
  } catch {
    return false;
  }
}

function decodeBase64Url(value, label) {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const bytes = atob(padded);
    const decoded = decodeURIComponent([...bytes].map(character => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format. Expected format: header.payload.signature');
    const header = decodeBase64Url(parts[0], 'Failed to decode JWT header');
    const payload = decodeBase64Url(parts[1], 'Failed to decode JWT payload');
    let result = `JWT Decoded:\n\n=== HEADER ===\n${JSON.stringify(header, null, 2)}\n\n=== PAYLOAD ===\n${JSON.stringify(payload, null, 2)}\n\n=== SIGNATURE ===\n${parts[2]}\n(Signature verification not performed)`;
    if (payload.exp) {
      const expiration = new Date(payload.exp * 1000);
      result += `\n\n=== TOKEN INFO ===\n${expiration < new Date() ? 'EXPIRED' : 'VALID'}\nExpires: ${expiration.toISOString()}`;
    }
    return result;
  } catch (error) {
    return `JWT decode failed: ${error.message}`;
  }
}

function highlightHTTP(text) {
  return escapeHtml(text).replace(/(https?:\/\/[^\s<]+)/g, '<span class="http-url">$1</span>');
}

function renderDiff(original, modified) {
  if (typeof Diff === 'undefined') return highlightHTTP(modified);
  const changes = Diff.diffLines(original, modified);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';
  changes.forEach(change => {
    change.value.split('\n').forEach((line, index, lines) => {
      if (index === lines.length - 1 && line === '') return;
      if (change.added) html += `<div class="diff-add">+ ${escapeHtml(line)}</div>`;
      else if (change.removed) html += `<div class="diff-remove">- ${escapeHtml(line)}</div>`;
      else html += `<div>  ${escapeHtml(line)}</div>`;
    });
  });
  return html + '</pre>';
}

export { decodeJWT, renderDiff, testRegex };
