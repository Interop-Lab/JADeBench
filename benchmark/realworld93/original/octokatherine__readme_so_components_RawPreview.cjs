var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/octokatherine__readme.so/components/RawPreview.js
var RawPreview_exports = {};
__export(RawPreview_exports, {
  default: () => RawPreview
});
module.exports = __toCommonJS(RawPreview_exports);
var import_react = __toESM(require("react"));
function RawPreview({ text }) {
  const textAreaRef = (0, import_react.useRef)(null);
  const [copySuccess, setCopySuccess] = (0, import_react.useState)(false);
  const timerRef = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      textAreaRef.current.select();
      document.execCommand("copy");
    }
    setCopySuccess(true);
    timerRef.current = setTimeout(() => {
      setCopySuccess(false);
    }, 3e3);
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "h-full relative" }, /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      className: "absolute top-0 right-7 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
      type: "button",
      "aria-label": copySuccess ? "Copied" : "Copy to clipboard",
      onClick: copyToClipBoard
    },
    !copySuccess ? /* @__PURE__ */ import_react.default.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-6 w-6 hover:text-emerald-500 transition-colors",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor"
      },
      /* @__PURE__ */ import_react.default.createElement(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        }
      )
    ) : /* @__PURE__ */ import_react.default.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-6 w-6 text-emerald-500",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor"
      },
      /* @__PURE__ */ import_react.default.createElement(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        }
      )
    )
  ), /* @__PURE__ */ import_react.default.createElement(
    "textarea",
    {
      ref: textAreaRef,
      readOnly: true,
      className: "h-full w-full resize-none bg-white focus:outline-none",
      value: text
    }
  ));
}
