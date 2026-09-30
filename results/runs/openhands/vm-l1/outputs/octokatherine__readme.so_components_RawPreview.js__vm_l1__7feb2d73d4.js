const createObject = Object.create;
const getPrototypeOf = Object.getPrototypeOf;
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

function defineExports(target, exports) {
  for (const name in exports) {
    defineProperty(target, name, {
      get: exports[name],
      enumerable: true,
    });
  }
}

function copyProperties(target, source, excludedProperty, descriptor) {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const property of getOwnPropertyNames(source)) {
      if (!hasOwnProperty.call(target, property) && property !== excludedProperty) {
        defineProperty(target, property, {
          get: () => source[property],
          enumerable:
            !(descriptor = getOwnPropertyDescriptor(source, property)) ||
            descriptor.enumerable,
        });
      }
    }
  }

  return target;
}

function toESModule(moduleValue, isNodeMode, target) {
  target =
    moduleValue != null
      ? createObject(getPrototypeOf(moduleValue))
      : {};

  return copyProperties(
    isNodeMode || !moduleValue || !moduleValue.__esModule
      ? defineProperty(target, "default", {
          value: moduleValue,
          enumerable: true,
        })
      : target,
    moduleValue,
  );
}

function toCommonJS(moduleValue) {
  return copyProperties(
    defineProperty({}, "__esModule", { value: true }),
    moduleValue,
  );
}

const RawPreviewExports = {};
defineExports(RawPreviewExports, { default: () => RawPreview });
module.exports = toCommonJS(RawPreviewExports);

const React = toESModule(require("react"));

function RawPreview({ text }) {
  const textareaRef = (0, React.useRef)(null);
  const [copied, setCopied] = (0, React.useState)(false);
  const timeoutRef = (0, React.useRef)(null);

  (0, React.useEffect)(() => {
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

  return React.default.createElement(
    "div",
    { className: "h-full relative" },
    React.default.createElement(
      "button",
      {
        className:
          "absolute top-0 right-7 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        type: "button",
        "aria-label": copied ? "Copied" : "Copy to clipboard",
        onClick: copyToClipboard,
      },
      !copied
        ? React.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className:
                "h-6 w-6 hover:text-emerald-500 transition-colors",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            React.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            }),
          )
        : React.default.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6 text-emerald-500",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            React.default.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
            }),
          ),
    ),
    React.default.createElement("textarea", {
      ref: textareaRef,
      readOnly: true,
      className: "h-full w-full resize-none bg-white focus:outline-none",
      value: text,
    }),
  );
}
