"use strict";

const React = require("react");

const COPY_ICON_PATH =
  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" +
  "M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2";
const COPIED_ICON_PATH = `${COPY_ICON_PATH}m-6 9l2 2 4-4`;

function CopyIcon({ copied }) {
  return React.createElement(
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
      d: copied ? COPIED_ICON_PATH : COPY_ICON_PATH,
    }),
  );
}

function RawPreview({ text }) {
  const textareaRef = React.useRef(null);
  const [copied, setCopied] = React.useState(false);
  const resetTimerRef = React.useRef(null);

  React.useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    resetTimerRef.current = setTimeout(() => setCopied(false), 3000);
  }

  return React.createElement(
    "div",
    { className: "h-full relative" },
    React.createElement(
      "button",
      {
        className:
          "absolute top-0 right-7 rounded focus:outline-none focus:ring-2 " +
          "focus:ring-offset-2 focus:ring-emerald-400",
        type: "button",
        "aria-label": copied ? "Copied" : "Copy to clipboard",
        onClick: copyToClipboard,
      },
      CopyIcon({ copied }),
    ),
    React.createElement("textarea", {
      ref: textareaRef,
      readOnly: true,
      className: "h-full w-full resize-none bg-white focus:outline-none",
      value: text,
    }),
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => RawPreview,
});
