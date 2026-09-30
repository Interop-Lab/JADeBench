"use strict";

var React = require("react");

var EditorColumn_exports = {};
Object.defineProperty(EditorColumn_exports, "__esModule", { value: true });
Object.defineProperty(EditorColumn_exports, "EditorColumn", {
  enumerable: true,
  get: function () {
    return EditorColumn;
  }
});
module.exports = EditorColumn_exports;

function useDeviceDetect() {
  var _React$useState = React.useState(false);
  var isMobile = _React$useState[0];
  var setMobile = _React$useState[1];

  React.useEffect(function () {
    var userAgent =
      typeof window === "undefined" ||
      typeof window.navigator === "undefined"
        ? ""
        : navigator.userAgent;

    setMobile(
      Boolean(
        userAgent.match(
          /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
        )
      )
    );
  }, []);

  return { isMobile: isMobile };
}

function useLocalStorage(key, initialValue) {
  var _React$useState2 = React.useState(function () {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      var item = localStorage.getItem(key);
      return item === null ? initialValue : JSON.parse(item);
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  var storedValue = _React$useState2[0];
  var setStoredValue = _React$useState2[1];

  var setValue = React.useCallback(
    function (value) {
      try {
        var valueToStore =
          typeof value === "function" ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

function EditorColumn(props) {
  props = props || {};

  var title = props.title || props.label || "Editor";
  var storageKey =
    props.storageKey || props.name || String(title || "editor-column");
  var initialValue =
    props.value !== undefined
      ? props.value
      : props.defaultValue !== undefined
        ? props.defaultValue
        : "";

  var _useDeviceDetect = useDeviceDetect();
  var isMobile = _useDeviceDetect.isMobile;

  var _useLocalStorage = useLocalStorage(storageKey, initialValue);
  var storedValue = _useLocalStorage[0];
  var setStoredValue = _useLocalStorage[1];

  var value = props.value !== undefined ? props.value : storedValue;
  var timeoutRef = React.useRef(null);

  React.useEffect(function () {
    return function () {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleChange(event) {
    var nextValue = event.target.value;

    if (props.value === undefined) {
      setStoredValue(nextValue);
    }

    if (typeof props.onChange === "function") {
      props.onChange(nextValue, event);
    }

    if (typeof props.onSave === "function") {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(function () {
        props.onSave(nextValue);
      }, props.saveDelay == null ? 300 : props.saveDelay);
    }
  }

  var className = [
    "editor-column",
    isMobile ? "editor-column--mobile" : "",
    props.className || ""
  ]
    .filter(Boolean)
    .join(" ");

  return React.createElement(
    "div",
    {
      className: className,
      style: props.style
    },
    props.hideTitle
      ? null
      : React.createElement(
          "div",
          { className: "editor-column__header" },
          React.createElement(
            "span",
            { className: "editor-column__title" },
            title
          )
        ),
    props.children !== undefined
      ? props.children
      : React.createElement("textarea", {
          className: "editor-column__editor",
          value: value == null ? "" : value,
          placeholder: props.placeholder,
          readOnly: props.readOnly,
          disabled: props.disabled,
          rows: props.rows,
          onChange: handleChange
        })
  );
}
