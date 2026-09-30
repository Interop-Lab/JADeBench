var React = require("react");

var RawPreview_exports = {};
Object.defineProperty(RawPreview_exports, "__esModule", {
  value: true
});
Object.defineProperty(RawPreview_exports, "RawPreview", {
  enumerable: true,
  get: function () {
    return RawPreview;
  }
});
module.exports = RawPreview_exports;

function RawPreview({ text }) {
  const textareaRef = React.useRef(null);
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef(null);

  React.useEffect(function () {
    return function () {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      textareaRef.current.select();
      document.execCommand("copy");
    }

    setCopied(true);
    timeoutRef.current = setTimeout(function () {
      setCopied(false);
    }, 3000);
  }

  return React.createElement(
    "div",
    { className: "relative" },
    React.createElement(
      "button",
      {
        className: "absolute top-2 right-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors",
        type: "button",
        "aria-label": copied ? "Copied!" : "Copy to clipboard",
        onClick: copyText
      },
      !copied
        ? React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor"
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            })
          )
        : React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-5 w-5",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor"
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M5 13l4 4L19 7"
            })
          )
    ),
    React.createElement("textarea", {
      ref: textareaRef,
      readOnly: true,
      className: "w-full h-full min-h-[200px] p-4 pr-12 bg-gray-900 text-gray-100 font-mono text-sm rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none",
      value: text
    })
  );
}
