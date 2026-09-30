"use strict";

const React = require("react");

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "default", {
  enumerable: true,
  get: () => RawPreview,
});

function RawPreview({ text }) {
  const textAreaRef = React.useRef(null);
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  React.useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = 0;
    }
  }, []);

  return React.createElement(
    "div",
    { className: "h-full relative" },
    React.createElement(
      "button",
      {
        className:
          "absolute top-0 right-7 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        type: "button",
        "aria-label": copied ? "Copied" : "Copy to clipboard",
        onClick: copyToClipboard,
      },
      React.createElement(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          className: copied
            ? "h-6 w-6 text-emerald-500"
            : "h-6 w-6 hover:text-emerald-500 transition-colors",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
        },
        React.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: copied
            ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            : "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
        }),
      ),
    ),
    React.createElement("textarea", {
      ref: textAreaRef,
      value: text,
      readOnly: true,
      className: "h-full w-full resize-none bg-white focus:outline-none",
    }),
  );
}
