function escapeHtml(_0x35a569) {
  const _0x437bfd = document.createElement("div");
  _0x437bfd.textContent = _0x35a569;
  return _0x437bfd.innerHTML;
}
function escapeCsvField(_0x4eed32) {
  if (_0x4eed32 == null) {
    return "";
  }
  const _0x2b06a6 = String(_0x4eed32);
  if (_0x2b06a6.includes(",") || _0x2b06a6.includes("\"") || _0x2b06a6.includes("\n") || _0x2b06a6.includes("\r")) {
    return "\"" + _0x2b06a6.replace(/"/g, "\"\"") + "\"";
  }
  return _0x2b06a6;
}
function arrayToCSV(_0x3ddef4, _0x44f119) {
  if (!_0x3ddef4 || _0x3ddef4.length === 0) {
    if (_0x44f119) {
      return _0x44f119.join(",");
    } else {
      return "";
    }
  }
  const _0x143a5c = _0x44f119 || Object.keys(_0x3ddef4[0]);
  const _0x304da5 = [_0x143a5c.map(escapeCsvField).join(",")];
  _0x3ddef4.forEach(_0x10430d => {
    const _0x10b263 = _0x143a5c.map(_0x39a6d6 => {
      const _0x409128 = _0x10430d[_0x39a6d6];
      return escapeCsvField(_0x409128);
    });
    _0x304da5.push(_0x10b263.join(","));
  });
  return _0x304da5.join("\n");
}
function downloadCSV(_0x56d766, _0x21379f, _0x327638 = null) {
  const _0x4cc705 = arrayToCSV(_0x56d766, _0x327638);
  const _0x657a3d = new Blob([_0x4cc705], {
    type: "text/csv;charset=utf-8;"
  });
  const _0x273580 = URL.createObjectURL(_0x657a3d);
  const _0x268c47 = document.createElement("a");
  _0x268c47.href = _0x273580;
  _0x268c47.download = _0x21379f;
  document.body.appendChild(_0x268c47);
  _0x268c47.click();
  document.body.removeChild(_0x268c47);
  URL.revokeObjectURL(_0x273580);
}
function downloadJSON(_0x6dc4e8, _0x515d5f) {
  const _0x1e6262 = JSON.stringify(_0x6dc4e8, null, 2);
  const _0x14ea67 = new Blob([_0x1e6262], {
    type: "application/json;charset=utf-8;"
  });
  const _0x44935e = URL.createObjectURL(_0x14ea67);
  const _0x514124 = document.createElement("a");
  _0x514124.href = _0x44935e;
  _0x514124.download = _0x515d5f;
  document.body.appendChild(_0x514124);
  _0x514124.click();
  document.body.removeChild(_0x514124);
  URL.revokeObjectURL(_0x44935e);
}
async function copyToClipboard(_0x251b1c, _0x33ca0a) {
  const _0x5d1603 = window.location.protocol === "devtools:";
  if (!_0x5d1603) {
    try {
      await navigator.clipboard.writeText(_0x251b1c);
      if (_0x33ca0a) {
        showCopySuccess(_0x33ca0a);
      }
      return;
    } catch (_0x5950d4) {
      if (!_0x5950d4.message?.includes("permissions policy") && !_0x5950d4.message?.includes("Permissions policy")) {
        console.warn("Clipboard API failed, trying fallback:", _0x5950d4);
      }
    }
  }
  try {
    const _0x41f90e = document.createElement("textarea");
    _0x41f90e.value = _0x251b1c;
    _0x41f90e.style.position = "fixed";
    _0x41f90e.style.left = "-9999px";
    _0x41f90e.style.top = "0";
    _0x41f90e.style.opacity = "0";
    _0x41f90e.style.pointerEvents = "none";
    document.body.appendChild(_0x41f90e);
    _0x41f90e.focus();
    _0x41f90e.select();
    if (navigator.userAgent.match(/ipad|iphone/i)) {
      const _0x3fed82 = document.createRange();
      _0x3fed82.selectNodeContents(_0x41f90e);
      const _0x273a76 = window.getSelection();
      _0x273a76.removeAllRanges();
      _0x273a76.addRange(_0x3fed82);
      _0x41f90e.setSelectionRange(0, 999999);
    }
    const _0x36a904 = document.execCommand("copy");
    document.body.removeChild(_0x41f90e);
    if (_0x36a904) {
      if (_0x33ca0a) {
        showCopySuccess(_0x33ca0a);
      }
    } else {
      throw new Error("execCommand copy failed");
    }
  } catch (_0x4db577) {
    console.error("Copy to clipboard failed:", _0x4db577);
    if (_0x33ca0a) {
      const _0x1c770d = _0x33ca0a.innerHTML;
      _0x33ca0a.innerHTML = "<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z\" fill=\"#f28b82\"/></svg>";
      setTimeout(() => {
        if (_0x33ca0a) {
          _0x33ca0a.innerHTML = _0x1c770d;
        }
      }, 1500);
    }
  }
}
function showCopySuccess(_0x2af32b) {
  if (!_0x2af32b) {
    return;
  }
  const _0x18bf08 = _0x2af32b.innerHTML;
  _0x2af32b.innerHTML = "<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\" fill=\"#81c995\"/></svg>";
  setTimeout(() => {
    if (_0x2af32b) {
      _0x2af32b.innerHTML = _0x18bf08;
    }
  }, 1500);
}
export { arrayToCSV, copyToClipboard, downloadCSV, downloadJSON, escapeHtml };