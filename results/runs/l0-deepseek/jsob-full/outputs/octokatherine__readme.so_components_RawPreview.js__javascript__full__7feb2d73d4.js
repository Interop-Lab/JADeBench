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
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var RawPreview_exports = {};
__export(RawPreview_exports, { default: () => RawPreview });
module.exports = __toCommonJS(RawPreview_exports);

var import_react = __toESM(require("react"));

function RawPreview({ text }) {
  const textareaRef = import_react.useRef(null);
  const [copied, setCopied] = import_react.useState(false);
  const timeoutRef = import_react.useRef(null);

  import_react.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      textareaRef.current.select();
      document.execCommand("copy");
    }
    setCopied(true);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return import_react.default.createElement(
    "div",
    { className: "relative" },
    import_react.default.createElement(
      "button",
      {
        className: "absolute top-2 right-2 z-10 p-2 rounded-md bg-gray-800/80 text-gray-200 hover:bg-gray-700/80 backdrop-blur-sm transition-colors",
        type: "button",
        "aria-label": copied ? "Copied" : "Copy code",
        onClick: handleCopy
      },
      !copied
        ? import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor"
            },
            import_react.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            })
          )
        : import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-4 w-4",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor"
            },
            import_react.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M5 13l4 4L19 7"
            })
          )
    ),
    import_react.default.createElement("textarea", {
      ref: textareaRef,
      readOnly: true,
      className: "w-full h-64 bg-gray-900/50 text-gray-100 font-mono text-sm p-4 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none",
      value: text
    })
  );
}
