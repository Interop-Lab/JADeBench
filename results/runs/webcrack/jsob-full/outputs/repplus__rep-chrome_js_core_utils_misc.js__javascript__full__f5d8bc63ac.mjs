function escapeHtml(_0x1b3fbb) {
  const _0x59a1aa = document.createElement("div");
  _0x59a1aa.textContent = _0x1b3fbb;
  return _0x59a1aa.innerHTML;
}
function escapeCsvField(_0x262cea) {
  if (_0x262cea == null) {
    return "";
  }
  const _0xf48289 = String(_0x262cea);
  if (_0xf48289.includes(",") || _0xf48289.includes("\"") || _0xf48289.includes("\n") || _0xf48289.includes("\r")) {
    return "\"" + _0xf48289.replace(/"/g, "\"\"") + "\"";
  }
  return _0xf48289;
}
function arrayToCSV(_0x55a5a1, _0x4b774c) {
  if (!_0x55a5a1 || _0x55a5a1.length === 0) {
    if (_0x4b774c) {
      return _0x4b774c.join(",");
    } else {
      return "";
    }
  }
  const _0xe54ab8 = _0x4b774c || Object.keys(_0x55a5a1[0]);
  const _0x223b86 = [_0xe54ab8.map(escapeCsvField).join(",")];
  _0x55a5a1.forEach(_0x31752b => {
    const _0x3e4b1f = _0xe54ab8.map(_0x325b16 => {
      const _0x12d801 = _0x31752b[_0x325b16];
      return escapeCsvField(_0x12d801);
    });
    _0x223b86.push(_0x3e4b1f.join(","));
  });
  return _0x223b86.join("\n");
}
function downloadCSV(_0x4cb56a, _0x353f67, _0x1963d1 = null) {
  const _0x4423b5 = arrayToCSV(_0x4cb56a, _0x1963d1);
  const _0x12abb6 = new Blob([_0x4423b5], {
    type: "text/csv;charset=utf-8;"
  });
  const _0x543e59 = URL.createObjectURL(_0x12abb6);
  const _0x3a7e2b = document.createElement("a");
  _0x3a7e2b.href = _0x543e59;
  _0x3a7e2b.download = _0x353f67;
  document.body.appendChild(_0x3a7e2b);
  _0x3a7e2b.click();
  document.body.removeChild(_0x3a7e2b);
  URL.revokeObjectURL(_0x543e59);
}
function downloadJSON(_0x4ac812, _0x11c109) {
  const _0x676e7f = JSON.stringify(_0x4ac812, null, 2);
  const _0x579367 = new Blob([_0x676e7f], {
    type: "application/json;charset=utf-8;"
  });
  const _0x43c210 = URL.createObjectURL(_0x579367);
  const _0xd8505 = document.createElement("a");
  _0xd8505.href = _0x43c210;
  _0xd8505.download = _0x11c109;
  document.body.appendChild(_0xd8505);
  _0xd8505.click();
  document.body.removeChild(_0xd8505);
  URL.revokeObjectURL(_0x43c210);
}
async function copyToClipboard(_0x1bb6c9, _0x42f528) {
  const _0x5dfcff = window.location.protocol === "devtools:";
  if (!_0x5dfcff) {
    try {
      await navigator.clipboard.writeText(_0x1bb6c9);
      if (_0x42f528) {
        showCopySuccess(_0x42f528);
      }
      return;
    } catch (_0x327793) {
      if (!_0x327793.message?.includes("permissions policy") && !_0x327793.message?.includes("Permissions policy")) {
        console.warn("Clipboard API failed, trying fallback:", _0x327793);
      }
    }
  }
  try {
    const _0x42cb97 = document.createElement("textarea");
    _0x42cb97.value = _0x1bb6c9;
    _0x42cb97.style.position = "fixed";
    _0x42cb97.style.left = "-9999px";
    _0x42cb97.style.top = "0";
    _0x42cb97.style.opacity = "0";
    _0x42cb97.style.pointerEvents = "none";
    document.body.appendChild(_0x42cb97);
    _0x42cb97.focus();
    _0x42cb97.select();
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const _0x3096c5 = document.createRange();
      _0x3096c5.selectNodeContents(_0x42cb97);
      const _0x5eeb0c = window.getSelection();
      _0x5eeb0c.removeAllRanges();
      _0x5eeb0c.addRange(_0x3096c5);
      _0x42cb97.setSelectionRange(0, 999999);
    }
    const _0x49750d = document.execCommand("copy");
    document.body.removeChild(_0x42cb97);
    if (_0x49750d) {
      if (_0x42f528) {
        showCopySuccess(_0x42f528);
      }
    } else {
      throw new Error("execCommand copy failed");
    }
  } catch (_0x399c3b) {
    console.error("Copy to clipboard failed:", _0x399c3b);
    if (_0x42f528) {
      const _0x18d203 = _0x42f528.innerHTML;
      _0x42f528.innerHTML = "<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\" fill=\"#f28b82\"/></svg>";
      setTimeout(() => {
        if (_0x42f528) {
          _0x42f528.innerHTML = _0x18d203;
        }
      }, 1500);
    }
  }
}
function showCopySuccess(_0x29e071) {
  if (!_0x29e071) {
    return;
  }
  const _0x55b6bc = _0x29e071.innerHTML;
  _0x29e071.innerHTML = "<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\" fill=\"#81c995\"/></svg>";
  setTimeout(() => {
    if (_0x29e071) {
      _0x29e071.innerHTML = _0x55b6bc;
    }
  }, 1500);
}
function getHostname(_0x4bcbd2) {
  try {
    const _0x2030b5 = new URL(_0x4bcbd2);
    return _0x2030b5.hostname;
  } catch (_0x4a8ce1) {
    return "unknown";
  }
}
function highlightHTTP(_0x4e79f7) {
  if (!_0x4e79f7) {
    return "";
  }
  const _0x122ad4 = _0x4e79f7.split("\n");
  let _0x21711c = false;
  let _0x1b4fa6 = -1;
  const _0x3ef08f = _0x122ad4[0] && _0x122ad4[0].toUpperCase().startsWith("HTTP/");
  for (let _0x507221 = 0; _0x507221 < _0x122ad4.length; _0x507221++) {
    if (_0x122ad4[_0x507221].trim() === "") {
      _0x21711c = true;
      _0x1b4fa6 = _0x507221;
      break;
    }
  }
  let _0x2bd900 = "";
  for (let _0x245efa = 0; _0x245efa < _0x122ad4.length; _0x245efa++) {
    const _0x254bae = _0x122ad4[_0x245efa];
    if (_0x245efa === 0) {
      const _0x14e999 = _0x254bae.indexOf(" ");
      if (_0x14e999 > -1) {
        const _0x5428fb = _0x254bae.substring(0, _0x14e999);
        const _0x3af818 = _0x254bae.substring(_0x14e999 + 1);
        _0x2bd900 += "<span class=\"http-method\">" + escapeHtml(_0x5428fb) + "</span> ";
        let _0x3edc55 = _0x3af818;
        let _0x4e9d49 = "";
        const _0x3a0dc2 = /(\s*HTTP\/\d+(\.\d+)?|\s+([hH]\d+|QUIC))$/i;
        const _0x233e47 = _0x3af818.match(_0x3a0dc2);
        if (_0x233e47) {
          _0x3edc55 = _0x3af818.substring(0, _0x233e47.index);
          _0x4e9d49 = _0x3af818.substring(_0x233e47.index);
        }
        const _0x52df78 = _0x3edc55.indexOf("?");
        if (_0x52df78 > -1) {
          _0x2bd900 += "<span class=\"http-path\">" + escapeHtml(_0x3edc55.substring(0, _0x52df78)) + "</span>?";
          _0x2bd900 += highlightParams(_0x3edc55.substring(_0x52df78 + 1));
        } else {
          _0x2bd900 += "<span class=\"http-path\">" + escapeHtml(_0x3edc55) + "</span>";
        }
        if (_0x4e9d49) {
          _0x2bd900 += "<span class=\"http-version\">" + escapeHtml(_0x4e9d49) + "</span>";
        }
      } else {
        _0x2bd900 += escapeHtml(_0x254bae);
      }
    } else if (!_0x21711c || _0x245efa < _0x1b4fa6) {
      const _0x5e063e = _0x254bae.indexOf(":");
      if (_0x5e063e > 0) {
        const _0x1c9e1a = _0x254bae.substring(0, _0x5e063e);
        const _0x2817d4 = _0x254bae.substring(_0x5e063e + 1);
        _0x2bd900 += "<span class=\"http-header-name\">" + escapeHtml(_0x1c9e1a) + "</span>";
        _0x2bd900 += "<span class=\"http-colon\">:</span>";
        if (_0x1c9e1a.trim().toLowerCase() === "cookie") {
          _0x2bd900 += highlightCookies(_0x2817d4);
        } else {
          _0x2bd900 += "<span class=\"http-header-value\">" + escapeHtml(_0x2817d4) + "</span>";
        }
      } else {
        _0x2bd900 += escapeHtml(_0x254bae);
      }
    } else if (_0x245efa === _0x1b4fa6) {
      _0x2bd900 += "";
    } else {
      const _0x54ab77 = _0x122ad4.slice(_0x1b4fa6 + 1).join("\n");
      let _0x27db50 = highlightJSON(_0x54ab77);
      if (!_0x3ef08f && _0x27db50 === escapeHtml(_0x54ab77)) {
        _0x27db50 = highlightParams(_0x54ab77);
      }
      _0x2bd900 += _0x27db50;
      break;
    }
    if (_0x245efa < _0x122ad4.length - 1) {
      _0x2bd900 += "\n";
    }
  }
  return _0x2bd900;
}
function highlightJSON(_0x20295f) {
  try {
    JSON.parse(_0x20295f);
    return _0x20295f.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, _0x514fe5 => {
      let _0x5dad0a = "json-number";
      if (/^"/.test(_0x514fe5)) {
        if (/:$/.test(_0x514fe5)) {
          _0x5dad0a = "json-key";
        } else {
          _0x5dad0a = "json-string";
        }
      } else if (/true|false/.test(_0x514fe5)) {
        _0x5dad0a = "json-boolean";
      } else if (/null/.test(_0x514fe5)) {
        _0x5dad0a = "json-null";
      }
      return "<span class=\"" + _0x5dad0a + "\">" + escapeHtml(_0x514fe5) + "</span>";
    });
  } catch (_0x5dc7bf) {
    return escapeHtml(_0x20295f);
  }
}
function highlightParams(_0x468ba5) {
  if (_0x468ba5.trim().startsWith("<")) {
    return escapeHtml(_0x468ba5);
  }
  if (_0x468ba5.indexOf("=") === -1) {
    return escapeHtml(_0x468ba5);
  }
  return _0x468ba5.split("&").map(_0x382786 => {
    const _0x2fc0d2 = _0x382786.indexOf("=");
    if (_0x2fc0d2 > -1) {
      const _0x207e57 = _0x382786.substring(0, _0x2fc0d2);
      const _0x25b5e6 = _0x382786.substring(_0x2fc0d2 + 1);
      return "<span class=\"param-key\">" + escapeHtml(_0x207e57) + "</span>=<span class=\"param-value\">" + escapeHtml(_0x25b5e6) + "</span>";
    } else {
      return escapeHtml(_0x382786);
    }
  }).join("&");
}
function highlightCookies(_0x502ae5) {
  return _0x502ae5.split(";").map(_0x3b561e => {
    const _0xe5267 = _0x3b561e.indexOf("=");
    if (_0xe5267 > -1) {
      const _0x4d871c = _0x3b561e.substring(0, _0xe5267);
      const _0x3f0bb5 = _0x3b561e.substring(_0xe5267 + 1);
      return "<span class=\"cookie-key\">" + escapeHtml(_0x4d871c) + "</span>=<span class=\"cookie-value\">" + escapeHtml(_0x3f0bb5) + "</span>";
    } else {
      return escapeHtml(_0x3b561e);
    }
  }).join(";");
}
function testRegex(_0x385f68, _0x55e1b8) {
  try {
    const _0x121663 = new RegExp(_0x385f68);
    return _0x121663.test(_0x55e1b8);
  } catch (_0x5dc756) {
    return false;
  }
}
function decodeJWT(_0x13e908) {
  try {
    let _0x4e67a6 = function (_0x52d62a) {
      _0x52d62a = _0x52d62a.replace(/-/g, "+").replace(/_/g, "/");
      while (_0x52d62a.length % 4) {
        _0x52d62a += "=";
      }
      try {
        const _0x5e3eb0 = atob(_0x52d62a);
        return decodeURIComponent(_0x5e3eb0.split("").map(function (_0x41072b) {
          return "%" + ("00" + _0x41072b.charCodeAt(0).toString(16)).slice(-2);
        }).join(""));
      } catch (_0x36e2e7) {
        throw new Error("Failed to decode base64: " + _0x36e2e7.message);
      }
    };
    _0x13e908 = _0x13e908.trim();
    const _0x274721 = _0x13e908.split(".");
    if (_0x274721.length !== 3) {
      throw new Error("Invalid JWT format. Expected format: header.payload.signature");
    }
    let _0x33a51a;
    try {
      const _0x435a13 = _0x4e67a6(_0x274721[0]);
      _0x33a51a = JSON.parse(_0x435a13);
    } catch (_0x296b3b) {
      throw new Error("Failed to decode JWT header: " + _0x296b3b.message);
    }
    let _0x474fa8;
    try {
      const _0x4a52d1 = _0x4e67a6(_0x274721[1]);
      _0x474fa8 = JSON.parse(_0x4a52d1);
    } catch (_0x14c456) {
      throw new Error("Failed to decode JWT payload: " + _0x14c456.message);
    }
    let _0x49d77b = "JWT Decoded:\n\n";
    _0x49d77b += "=== HEADER ===\n";
    _0x49d77b += JSON.stringify(_0x33a51a, null, 2);
    _0x49d77b += "\n\n=== PAYLOAD ===\n";
    _0x49d77b += JSON.stringify(_0x474fa8, null, 2);
    _0x49d77b += "\n\n=== SIGNATURE ===\n";
    _0x49d77b += _0x274721[2] + "\n";
    _0x49d77b += "(Signature verification not performed)";
    if (_0x474fa8.exp) {
      const _0x4fcf8f = new Date(_0x474fa8.exp * 1000);
      const _0x5eccc0 = new Date();
      const _0x34c406 = _0x4fcf8f < _0x5eccc0;
      _0x49d77b += "\n\n=== TOKEN INFO ===\n";
      _0x49d77b += "Expiration: " + _0x4fcf8f.toISOString() + "\n";
      _0x49d77b += "Status: " + (_0x34c406 ? "EXPIRED" : "VALID") + "\n";
      if (_0x34c406) {
        _0x49d77b += "Expired " + Math.floor((_0x5eccc0 - _0x4fcf8f) / 1000 / 60) + " minutes ago";
      } else {
        _0x49d77b += "Expires in " + Math.floor((_0x4fcf8f - _0x5eccc0) / 1000 / 60) + " minutes";
      }
    }
    return _0x49d77b;
  } catch (_0xa270ab) {
    throw new Error("JWT decode failed: " + _0xa270ab.message);
  }
}
function renderDiff(_0x53795b, _0x547d94) {
  if (typeof Diff === "undefined") {
    return highlightHTTP(_0x547d94);
  }
  const _0x583b6c = Diff.diffLines(_0x53795b, _0x547d94);
  let _0x580e1d = "<pre style=\"margin: 0; padding: 10px; font-family: monospace; font-size: 12px; line-height: 1.5;\">";
  _0x583b6c.forEach(_0x3e5d70 => {
    const _0x4cf262 = _0x3e5d70.value.split("\n");
    _0x4cf262.forEach((_0x366649, _0x2b6ac9) => {
      if (_0x2b6ac9 === _0x4cf262.length - 1 && _0x366649 === "") {
        return;
      }
      if (_0x3e5d70.added) {
        _0x580e1d += "<div class=\"diff-add\">+ " + escapeHtml(_0x366649) + "</div>";
      } else if (_0x3e5d70.removed) {
        _0x580e1d += "<div class=\"diff-remove\">- " + escapeHtml(_0x366649) + "</div>";
      } else {
        _0x580e1d += "<div>  " + escapeHtml(_0x366649) + "</div>";
      }
    });
  });
  _0x580e1d += "</pre>";
  return _0x580e1d;
}
export { decodeJWT, renderDiff, testRegex };