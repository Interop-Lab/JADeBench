"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var RawPreview_exports = {};
var _0x23ab95 = {};
_0x23ab95.RawPreview = () => RawPreview;
__export(RawPreview_exports, _0x23ab95);
module.exports = __toCommonJS(RawPreview_exports);

var import_react = __toESM(require("react"));

function RawPreview({ text }) {
  const _0x1bf60a = import_react.useRef(null);
  const [_0x29ce12, _0x1f4324] = import_react.useState(false);
  const _0x147d69 = import_react.useRef(null);

  import_react.useEffect(() => {
    return () => {
      if (_0x147d69.current) {
        clearTimeout(_0x147d69.current);
      }
    };
  }, []);

  const _0x507f0e = async () => {
    try {
      await navigator.clipboard.writeText(text);
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
        className: "copy-button",
        type: "button",
        "aria-label": _0x29ce12 ? "Copied" : "Copy",
        onClick: _0x507f0e
      },
      !_0x29ce12
        ? import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "icon",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor"
            },
            import_react.default.createElement(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              }
            )
          )
        : import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "icon",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor"
            },
            import_react.default.createElement(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M5 13l4 4L19 7"
              }
            )
          )
    ),
    import_react.default.createElement("textarea", {
      ref: _0x1bf60a,
      readOnly: true,
      className: "raw-text",
      value: text
    })
  );
}
