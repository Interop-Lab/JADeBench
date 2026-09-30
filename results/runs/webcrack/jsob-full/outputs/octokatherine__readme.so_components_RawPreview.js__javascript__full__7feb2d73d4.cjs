var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x335035, _0x4fdefb) => {
  for (var _0x3f67f5 in _0x4fdefb) {
    __defProp(_0x335035, _0x3f67f5, {
      get: _0x4fdefb[_0x3f67f5],
      enumerable: true
    });
  }
};
var __copyProps = (_0x5cf550, _0x54dcc1, _0x144ed7, _0x31f415) => {
  if (_0x54dcc1 && typeof _0x54dcc1 === "object" || typeof _0x54dcc1 === "function") {
    for (let _0x3953d8 of __getOwnPropNames(_0x54dcc1)) {
      if (!__hasOwnProp.call(_0x5cf550, _0x3953d8) && _0x3953d8 !== _0x144ed7) {
        __defProp(_0x5cf550, _0x3953d8, {
          get: () => _0x54dcc1[_0x3953d8],
          enumerable: !(_0x31f415 = __getOwnPropDesc(_0x54dcc1, _0x3953d8)) || _0x31f415.enumerable
        });
      }
    }
  }
  return _0x5cf550;
};
var __toESM = (_0x3e342d, _0x2f8df1, _0x43f77f) => {
  _0x43f77f = _0x3e342d != null ? __create(__getProtoOf(_0x3e342d)) : {};
  return __copyProps(_0x2f8df1 || !_0x3e342d || !_0x3e342d.__esModule ? __defProp(_0x43f77f, "default", {
    value: _0x3e342d,
    enumerable: true
  }) : _0x43f77f, _0x3e342d);
};
var _0x1760f5 = {
  value: true
};
var __toCommonJS = _0x2ba0eb => __copyProps(__defProp({}, "__esModule", _0x1760f5), _0x2ba0eb);
var RawPreview_exports = {};
var _0x23ab95 = {
  default: () => RawPreview
};
__export(RawPreview_exports, _0x23ab95);
module.exports = __toCommonJS(RawPreview_exports);
var import_react = __toESM(require("react"));
function RawPreview({
  text: _0x37803e
}) {
  const _0x1bf60a = (0, import_react.useRef)(null);
  const [_0x29ce12, _0x1f4324] = (0, import_react.useState)(false);
  const _0x147d69 = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    return () => {
      if (_0x147d69.current) {
        clearTimeout(_0x147d69.current);
      }
    };
  }, []);
  const _0x507f0e = async () => {
    try {
      await navigator.clipboard.writeText(_0x37803e);
    } catch {
      _0x1bf60a.current.select();
      document.execCommand("copy");
    }
    _0x1f4324(true);
    _0x147d69.current = setTimeout(() => {
      _0x1f4324(false);
    }, 3000);
  };
  return import_react.default.createElement("div", {
    className: "h-full relative"
  }, import_react.default.createElement("button", {
    className: "absolute top-0 right-7 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
    type: "button",
    "aria-label": _0x29ce12 ? "Copied" : "Copy to clipboard",
    onClick: _0x507f0e
  }, !_0x29ce12 ? import_react.default.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-6 w-6 hover:text-emerald-500 transition-colors",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, import_react.default.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
  })) : import_react.default.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    className: "h-6 w-6 text-emerald-500",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor"
  }, import_react.default.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
  }))), import_react.default.createElement("textarea", {
    ref: _0x1bf60a,
    readOnly: true,
    className: "h-full w-full resize-none bg-white focus:outline-none",
    value: _0x37803e
  }));
}