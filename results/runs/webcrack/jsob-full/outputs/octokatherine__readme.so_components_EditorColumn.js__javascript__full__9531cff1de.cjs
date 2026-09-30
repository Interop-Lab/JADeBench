var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x3ef48f, _0x5978ec) => {
  for (var _0x2104f8 in _0x5978ec) {
    __defProp(_0x3ef48f, _0x2104f8, {
      get: _0x5978ec[_0x2104f8],
      enumerable: true
    });
  }
};
var __copyProps = (_0x5f0a10, _0x4b6661, _0x305d22, _0x454046) => {
  if (_0x4b6661 && typeof _0x4b6661 === "object" || typeof _0x4b6661 === "function") {
    for (let _0x44ac21 of __getOwnPropNames(_0x4b6661)) {
      if (!__hasOwnProp.call(_0x5f0a10, _0x44ac21) && _0x44ac21 !== _0x305d22) {
        __defProp(_0x5f0a10, _0x44ac21, {
          get: () => _0x4b6661[_0x44ac21],
          enumerable: !(_0x454046 = __getOwnPropDesc(_0x4b6661, _0x44ac21)) || _0x454046.enumerable
        });
      }
    }
  }
  return _0x5f0a10;
};
var __toESM = (_0x6d4ece, _0x5b793d, _0x1a2dd4) => {
  _0x1a2dd4 = _0x6d4ece != null ? __create(__getProtoOf(_0x6d4ece)) : {};
  return __copyProps(_0x5b793d || !_0x6d4ece || !_0x6d4ece.__esModule ? __defProp(_0x1a2dd4, "default", {
    value: _0x6d4ece,
    enumerable: true
  }) : _0x1a2dd4, _0x6d4ece);
};
const _0x373837 = {
  value: true
};
var __toCommonJS = _0x16a621 => __copyProps(__defProp({}, "__esModule", _0x373837), _0x16a621);
var EditorColumn_exports = {};
const _0x7bcbee = {
  EditorColumn: () => EditorColumn
};
__export(EditorColumn_exports, _0x7bcbee);
module.exports = __toCommonJS(EditorColumn_exports);
var import_react = require("react");
function useDeviceDetect() {
  const [_0x9a28e0, _0x37b445] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const _0x5cd021 = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const _0x59b029 = Boolean(_0x5cd021.match(/Mobi|Android|BlackBerry|iPhone/i));
    _0x37b445(_0x59b029);
  }, []);
  const _0xa76eba = {
    isMobile: _0x9a28e0
  };
  return _0xa76eba;
}
var import_react2 = require("react");
function useLocalStorage() {
  const [_0x58c47f, _0x11af49] = (0, import_react2.useState)(null);
  const [_0x514fca, _0x261470] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
    const _0x314618 = localStorage.getItem("readme-backup");
    if (_0x314618) {
      _0x11af49(JSON.parse(_0x314618));
    }
  }, []);
  const _0x390959 = _0x1307ba => {
    try {
      if (_0x514fca) {
        clearTimeout(_0x514fca);
      }
      _0x261470(setTimeout(() => {
        localStorage.setItem("readme-backup", JSON.stringify(_0x1307ba));
      }, 1000));
    } catch (_0x1ab2a6) {
      console.error("Failed to create local backup");
    }
  };
  const _0x307928 = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (_0x287ae5) {
      console.error("Failed to delete local backup");
    }
  };
  const _0x13911b = {
    backup: _0x58c47f,
    saveBackup: _0x390959,
    deleteBackup: _0x307928
  };
  return _0x13911b;
}
var import_react3 = require("react");
var EditorColumn = ({
  focusedSectionSlug: _0x568c91,
  templates: _0x489aaf,
  setTemplates: _0x1f76ff,
  theme: _0x399f86
}) => {
  const _0x5278ed = () => {
    const _0x243507 = _0x489aaf.find(_0x195604 => _0x195604.slug === _0x568c91);
    if (_0x243507) {
      return _0x243507.markdown;
    } else {
      return "";
    }
  };
  const [_0x579633, _0x69a9c6] = (0, import_react3.useState)(_0x5278ed());
  const {
    isMobile: _0x5821be
  } = useDeviceDetect();
  const [_0x3d5a1a, _0x523796] = (0, import_react3.useState)(null);
  const {
    saveBackup: _0x28c04c
  } = useLocalStorage();
  const _0x266e6d = (0, import_react3.useRef)(null);
  const _0x1625a6 = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    const _0x27e9ea = _0x5278ed();
    _0x69a9c6(_0x27e9ea);
  }, [_0x568c91, _0x489aaf]);
  const _0x49b58f = _0x2f9bbe => {
    _0x69a9c6(_0x2f9bbe);
    const _0x2f0ad8 = _0x489aaf.map(_0x2c051d => {
      if (_0x2c051d.slug === _0x568c91) {
        const _0xac24d1 = {
          ..._0x2c051d
        };
        _0xac24d1.markdown = _0x2f9bbe;
        return _0xac24d1;
      }
      return _0x2c051d;
    });
    _0x1f76ff(_0x2f0ad8);
    _0x28c04c(_0x2f0ad8);
  };
  const _0x48580b = _0xf6f52 => {
    _0x266e6d.current = _0xf6f52;
  };
  (0, import_react3.useEffect)(() => {
    if (!_0x5821be && !_0x3d5a1a) {
      import("@monaco-editor/react").then(_0x4a33a9 => {
        _0x523796(() => _0x4a33a9.default);
      });
    }
  }, [_0x3d5a1a, _0x5821be, _0x523796]);
  if (_0x568c91 === "noEdit") {
    return React.createElement("p", {
      className: "text-sm text-emerald-500 max-w-[28rem] text-center mx-auto mt-10"
    }, "Select a section from the left sidebar to edit the contents");
  }
  return <>{_0x5821be ? <textarea ref={_0x1625a6} onChange={_0xe53fe9 => _0x49b58f(_0xe53fe9.target.value)} value={_0x579633} className="full-screen rounded-sm border border-gray-500 w-full p-6 resize-none" /> : _0x3d5a1a && <_0x3d5a1a onMount={_0x48580b} wrapperClassName="rounded-sm border border-gray-500" className="full-screen" theme={_0x399f86} language="markdown" value={_0x579633} onChange={_0x49b58f} loading="Loading..." aria-label="Markdown Editor" options={{
      minimap: {
        enabled: false
      },
      lineNumbers: false,
      wordWrap: true
    }} />}</>;
};
const _0x4770cc = {
  EditorColumn: EditorColumn
};
if (0) {
  module.exports = _0x4770cc;
}