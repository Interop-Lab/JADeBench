const React = require("react");

function RawPreview({ text }) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (!copied) return undefined;
    const timeout = setTimeout(() => setCopied(false), 3000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      textareaRef.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
  };

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
      copied
        ? React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6 text-emerald-500",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M5 13l4 4L19 7",
            }),
          )
        : React.createElement(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              className: "h-6 w-6 hover:text-emerald-500 transition-colors",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
            },
            React.createElement("path", {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
            }),
          ),
    ),
    React.createElement("textarea", {
      ref: textareaRef,
      readOnly: true,
      className: "h-full w-full resize-none bg-white focus:outline-none",
      value: text,
    }),
  );
}

module.exports = { default: RawPreview };
