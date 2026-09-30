var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, {
      get: exports[name],
      enumerable: true,
    });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable: !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

var __toESM = (module, isNodeMode, target) => (
  target = module != null ? __create(__getProtoOf(module)) : {},
  __copyProps(
    isNodeMode || !module || !module.__esModule
      ? __defProp(target, "default", { value: module, enumerable: true })
      : target,
    module,
  )
);

var __toCommonJS = (module) => __copyProps(
  __defProp({}, "__esModule", { value: true }),
  module,
);

var RawPreview_exports = {};
__export(RawPreview_exports, {
  default: () => RawPreview,
});
module.exports = __toCommonJS(RawPreview_exports);

var import_react = __toESM(require("react"));

function RawPreview({ text }) {
  const textareaRef = (0, import_react.useRef)(null);
  const [copied, setCopied] = (0, import_react.useState)(false);
  const timeoutRef = (0, import_react.useRef)(null);

  (0, import_react.useEffect)(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      textareaRef.current.select();
      document.execCommand("copy");
    }

    setCopied(true);
    timeoutRef.current = setTimeout(() => setCopied(false), 3000);
  };

  return import_react.default.createElement(
    "div",
    { className: "h-full relative" },
    import_react.default.createElement(
      "button",
      {
        className: "absolute top-0 right-7 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        type: "button",
        "aria-label": copied ? "Copied" : "Copy to clipboard",
        onClick: copyToClipboard,
      },
      copied
        ? import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6 text-emerald-500",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            import_react.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
            }),
          )
        : import_react.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6 hover:text-emerald-500 transition-colors",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            import_react.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            }),
          ),
    ),
    import_react.default.createElement("textarea", {
      ref: textareaRef,
      readOnly: true,
      className: "h-full w-full resize-none bg-white focus:outline-none",
      value: text,
    }),
  );
}
