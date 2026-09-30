function escapeHtml(value) {
  const text = String(value);
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightJSON(text) {
  try {
    JSON.parse(text);

    return text.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      token => {
        let type = "json-number";

        if (/^"/.test(token)) {
          type = /:$/.test(token) ? "json-key" : "json-string";
        } else if (/true|false/.test(token)) {
          type = "json-boolean";
        } else if (/null/.test(token)) {
          type = "json-null";
        }

        return `<span class="${type}">${escapeHtml(token)}</span>`;
      }
    );
  } catch {
    return escapeHtml(text);
  }
}

function highlightParams(params) {
  if (params.trim().startsWith("<") || !params.includes("=")) {
    return escapeHtml(params);
  }

  return params
    .split("&")
    .map(param => {
      const separator = param.indexOf("=");

      if (separator === -1) {
        return escapeHtml(param);
      }

      const name = param.substring(0, separator);
      const value = param.substring(separator + 1);

      return `<span class="param-name">${escapeHtml(name)}</span>=<span class="param-value">${escapeHtml(value)}</span>`;
    })
    .join("&");
}

function highlightCookies(cookies) {
  return cookies
    .split(";")
    .map(cookie => {
      const separator = cookie.indexOf("=");

      if (separator === -1) {
        return escapeHtml(cookie);
      }

      const name = cookie.substring(0, separator);
      const value = cookie.substring(separator + 1);

      return `<span class="cookie-name">${escapeHtml(name)}</span>=<span class="cookie-value">${escapeHtml(value)}</span>`;
    })
    .join(";");
}

function highlightHTTP(input) {
  if (!input) {
    return "";
  }

  const lines = input.split("\n");
  const isResponse = Boolean(
    lines[0] && lines[0].trim().toUpperCase().startsWith("HTTP/")
  );

  let bodyStart = -1;

  for (let index = 0; index < lines.length; index++) {
    if (lines[index].trim() === "") {
      bodyStart = index;
      break;
    }
  }

  let result = "";

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (index === 0) {
      const firstSpace = line.indexOf(" ");

      if (firstSpace !== -1) {
        const firstToken = line.substring(0, firstSpace);
        const remainder = line.substring(firstSpace + 1);

        result += `<span class="http-method">${escapeHtml(firstToken)}</span> `;

        let target = remainder;
        let protocol = "";
        const protocolMatch = remainder.match(
          /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i
        );

        if (protocolMatch) {
          target = remainder.substring(0, protocolMatch.index);
          protocol = remainder.substring(protocolMatch.index);
        }

        const queryIndex = target.indexOf("?");

        if (queryIndex !== -1) {
          result += `<span class="http-url">${escapeHtml(
            target.substring(0, queryIndex)
          )}</span>?`;
          result += highlightParams(target.substring(queryIndex + 1));
        } else {
          result += `<span class="http-url">${escapeHtml(target)}</span>`;
        }

        if (protocol) {
          result += `<span class="http-version">${escapeHtml(protocol)}</span>`;
        }
      } else {
        result += escapeHtml(line);
      }
    } else if (bodyStart === -1 || index < bodyStart) {
      const separator = line.indexOf(":");

      if (separator !== -1) {
        const name = line.substring(0, separator);
        const value = line.substring(separator + 1);

        result += `<span class="http-header-name">${escapeHtml(
          name
        )}</span>:`;

        if (name.trim().toLowerCase() === "cookie") {
          result += highlightCookies(value);
        } else {
          result += `<span class="http-header-value">${escapeHtml(
            value
          )}</span>`;
        }
      } else {
        result += escapeHtml(line);
      }
    } else if (index === bodyStart) {
      result += "";
    } else {
      const body = lines.slice(bodyStart + 1).join("\n");
      let highlighted = highlightJSON(body);

      if (!isResponse && highlighted === escapeHtml(body)) {
        highlighted = highlightParams(body);
      }

      result += highlighted;
      break;
    }

    if (index < lines.length - 1) {
      result += "\n";
    }
  }

  return result;
}

function testRegex(pattern, input) {
  try {
    return new RegExp(pattern).test(input);
  } catch {
    return false;
  }
}

function decodeBase64Url(value) {
  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  try {
    const decoded = atob(base64);
    const encoded = decoded
      .split("")
      .map(character => {
        return `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`;
      })
      .join("");

    return decodeURIComponent(encoded);
  } catch (error) {
    throw new Error(`Failed to decode Base64URL data: ${error.message}`);
  }
}

function decodeJWT(token) {
  try {
    token = token.trim();
    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Invalid JWT format. Expected 3 parts.");
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

    let output = "=== JWT Token Analysis ===\n";
    output += "\nHeader:\n";
    output += JSON.stringify(header, null, 2);
    output += "\n\nPayload:\n";
    output += JSON.stringify(payload, null, 2);
    output += "\n\nSignature:\n";
    output += `${parts[2]}\n`;
    output += "\n=== Token Status ===\n";

    if (payload.exp) {
      const expiration = new Date(payload.exp * 1000);
      const now = new Date();
      const isValid = expiration > now;

      output += "\nExpiration:\n";
      output += `Expires: ${expiration.toLocaleString()}\n`;
      output += `Status: ${isValid ? "VALID" : "EXPIRED"}\n`;

      const millisecondsPerDay = 1000 * 60 * 60 * 24;

      if (isValid) {
        const days = Math.ceil(
          (expiration.getTime() - now.getTime()) / millisecondsPerDay
        );
        output += `Expires in ${days} day${days === 1 ? "" : "s"}\n`;
      } else {
        const days = Math.ceil(
          (now.getTime() - expiration.getTime()) / millisecondsPerDay
        );
        output += `Expired ${days} day${days === 1 ? "" : "s"} ago\n`;
      }
    }

    return output;
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error.message}`);
  }
}

function renderDiff(oldText, newText) {
  if (typeof Diff === "undefined") {
    return highlightHTTP(newText);
  }

  const changes = Diff.diffLines(oldText, newText);
  let output = '<div class="diff-container">';

  changes.forEach(change => {
    const lines = change.value.split("\n");

    lines.forEach((line, index) => {
      if (index === lines.length - 1 && line === "") {
        return;
      }

      if (change.added) {
        output += `<div class="diff-line diff-added">+ ${escapeHtml(
          line
        )}</div>`;
      } else if (change.removed) {
        output += `<div class="diff-line diff-removed">- ${escapeHtml(
          line
        )}</div>`;
      } else {
        output += `<div class="diff-line diff-unchanged">  ${escapeHtml(
          line
        )}</div>`;
      }
    });
  });

  output += "</div>";
  return output;
}

export { decodeJWT, renderDiff, testRegex };
