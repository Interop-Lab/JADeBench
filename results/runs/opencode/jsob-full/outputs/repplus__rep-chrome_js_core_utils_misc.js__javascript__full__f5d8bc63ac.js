function escapeHtml(value) {
  const element = document.createElement('div');
  element.innerText = value;
  return element.innerHTML;
}

function testRegex(pattern, testString) {
  try {
    const regex = new RegExp(pattern);
    return regex.test(testString);
  } catch (error) {
    return false;
  }
}

function decodeJWT(token) {
  try {
    function base64UrlDecode(value) {
      value = value.replace(/-/g, '+').replace(/_/g, '/');
      while (value.length % 4) {
        value += '=';
      }

      try {
        const decoded = atob(value);
        return decodeURIComponent(
          decoded
            .split('')
            .map((character) => '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
      } catch (error) {
        throw new Error('Failed to decode base64: ' + error.message);
      }
    }

    token = token.trim();
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format. Expected format: header.payload.signature');
    }

    let header;
    try {
      header = JSON.parse(base64UrlDecode(parts[0]));
    } catch (error) {
      throw new Error('Failed to decode JWT header: ' + error.message);
    }

    let payload;
    try {
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch (error) {
      throw new Error('Failed to decode JWT payload: ' + error.message);
    }

    let result = 'JWT Decoded:\n\n';
    result += '=== HEADER ===\n';
    result += JSON.stringify(header, null, 2);
    result += '\n\n=== PAYLOAD ===\n';
    result += JSON.stringify(payload, null, 2);
    result += '\n\n=== SIGNATURE ===\n';
    result += parts[2] + '\n';
    result += '(Signature verification not performed)';

    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const expired = expirationDate < now;

      result += '\n\n=== TOKEN INFO ===\n';
      result += 'Expiration: ' + expirationDate.toISOString() + '\n';
      result += 'Status: ' + (expired ? 'EXPIRED' : 'VALID') + '\n';
      if (expired) {
        result += 'Expired ' + Math.floor((now - expirationDate) / 60000) + ' minutes ago';
      } else {
        result += 'Expires in ' + Math.floor((expirationDate - now) / 60000) + ' minutes';
      }
    }

    return result;
  } catch (error) {
    throw new Error('JWT decode failed: ' + error.message);
  }
}

function renderDiff(oldText, newText) {
  if (typeof Diff === 'undefined') {
    return '';
  }

  const changes = Diff.diffLines(oldText, newText);
  let html = '<pre style="margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;">';

  changes.forEach((change) => {
    const lines = change.value.split('\n');
    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === '') {
        return;
      }

      if (change.added) {
        html += '<div class="diff-add">+ ' + escapeHtml(line) + '</div>';
      } else if (change.removed) {
        html += '<div class="diff-remove">- ' + escapeHtml(line) + '</div>';
      } else {
        html += '<div>  ' + escapeHtml(line) + '</div>';
      }
    });
  });

  html += '</pre>';
  return html;
}

export { decodeJWT, renderDiff, testRegex };
