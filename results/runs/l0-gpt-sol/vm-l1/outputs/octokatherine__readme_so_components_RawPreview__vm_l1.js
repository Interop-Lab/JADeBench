var React = require("react");

function RawPreview(props) {
  var content =
    props.content !== undefined
      ? props.content
      : props.value !== undefined
        ? props.value
        : props.raw !== undefined
          ? props.raw
          : props.children;

  var text = content == null ? "" : String(content);
  var state = React.useState(false);
  var copied = state[0];
  var setCopied = state[1];
  var timeoutRef = React.useRef(null);

  React.useEffect(function () {
    return function () {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function markCopied() {
    setCopied(true);

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(function () {
      timeoutRef.current = null;
      setCopied(false);
    }, 2000);
  }

  function fallbackCopy() {
    var textarea = document.createElement("textarea");
    textarea.value = text;

    Object.assign(textarea.style, {
      position: "fixed",
      left: "-9999px",
      top: "0"
    });

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
      markCopied();
    } finally {
      document.body.removeChild(textarea);
    }
  }

  function copy() {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      navigator.clipboard.writeText(text).then(markCopied, fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  return React.createElement(
    "div",
    { className: "raw-preview" },
    React.createElement(
      "button",
      {
        type: "button",
        className: "raw-preview-copy",
        onClick: copy
      },
      copied ? "Copied" : "Copy"
    ),
    React.createElement(
      "pre",
      { className: "raw-preview-content" },
      React.createElement("code", null, text)
    )
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: function () {
    return RawPreview;
  }
});
