var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x335035, _0x4fdefb) => {
  for (var _0x3f67f5 in _0x4fdefb)
    __defProp(_0x335035, _0x3f67f5, { get: _0x4fdefb[_0x3f67f5], enumerable: true });
};
var __copyProps = (_0x5cf550, _0x54dcc1, _0x144ed7, _0x31f415) => {
  if (_0x54dcc1 && (typeof _0x54dcc1 === "object" || typeof _0x54dcc1 === "function")) {
    for (let _0x3953d8 of __getOwnPropNames(_0x54dcc1))
      if (!__hasOwnProp.call(_0x5cf550, _0x3953d8) && _0x3953d8 !== _0x144ed7)
        __defProp(_0x5cf550, _0x3953d8, {
          get: () => _0x54dcc1[_0x3953d8],
          enumerable: !(_0x31f415 = __getOwnPropDesc(_0x54dcc1, _0x3953d8)) || _0x31f415.enumerable,
        });
  }
  return _0x5cf550;
};
var __toESM = (_0x3e342d, _0x2f8df1, _0x43f77f) => (
  (_0x43f77f = _0x3e342d != null ? __create(__getProtoOf(_0x3e342d)) : {}),
  __copyProps(
    _0x2f8df1 || !_0x3e342d || !_0x3e342d.__esModule
      ? __defProp(_0x43f77f, "default", { value: _0x3e342d, enumerable: true })
      : _0x43f77f,
    _0x3e342d
  )
);
var __toCommonJS = (_0x2ba0eb) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), _0x2ba0eb);
var RawPreview_exports = {};
__export(RawPreview_exports, { RawPreview: () => RawPreview });
module.exports = __toCommonJS(RawPreview_exports);
var import_react = __toESM(require("react"));
function RawPreview({ text: _0x37803e }) {
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
    }, 2000);
  };
  return import_react.default.createElement(
    "div",
    { className: "raw-preview" },
    import_react.default.createElement(
      "button",
      {
        className: "raw-preview__copy",
        type: "button",
        "aria-label": _0x29ce12 ? "Copied!" : "Copy to clipboard",
        onClick: _0x507f0e,
      },
      !_0x29ce12
        ? import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "raw-preview__icon",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            import_react.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
            })
          )
        : import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "raw-preview__icon",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            import_react.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M5 13l4 4L19 7",
            })
          )
    ),
    import_react.default.createElement("textarea", {
      ref: _0x1bf60a,
      readOnly: true,
      className: "raw-preview__textarea",
      value: _0x37803e,
    })
  );
}
