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
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isCommonJSModule, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    isCommonJSModule || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/EditorColumn.js
var EditorColumn_exports = {};
__export(EditorColumn_exports, {
  default: () => EditorColumn
});
module.exports = __toCommonJS(EditorColumn_exports);

var import_react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setIsMobile(mobile);
  }, []);
  return { isMobile };
}

var import_react2 = require("react");

function useLocalStorage() {
  const [storedValue, setStoredValue] = (0, import_react2.useState)(null);
  const [timeoutId, setTimeoutId] = (0, import_react2.useState)(null);

  (0, import_react2.useEffect)(() => {
    const item = localStorage.getItem("editor-templates");
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, []);

  const saveBackup = (value) => {
    try {
      if (timeoutId && clearTimeout(timeoutId));
      setTimeoutId(
        setTimeout(() => {
          localStorage.setItem("editor-templates", JSON.stringify(value));
        }, 1000)
      );
    } catch (e) {
      console.error("Failed to save templates");
    }
  };

  const clearBackup = () => {
    try {
      localStorage.removeItem("editor-templates");
    } catch (e) {
      console.error("Failed to clear templates");
    }
  };

  return { storedValue, saveBackup, clearBackup };
}

var import_react3 = require("react");

var EditorColumn = ({ focusedSectionSlug, templates, setTemplates, theme }) => {
  const getCurrentTemplate = () => {
    const current = templates.find((t) => t.slug === focusedSectionSlug);
    return current ? current.content : "";
  };

  const [value, setValue] = (0, import_react3.useState)(getCurrentTemplate());
  const { isMobile } = useDeviceDetect();
  const [Editor, setEditor] = (0, import_react3.useState)(null);
  const { saveBackup } = useLocalStorage();
  const wrapperRef = (0, import_react3.useRef)(null);
  const textareaRef = (0, import_react3.useRef)(null);

  (0, import_react3.useEffect)(() => {
    const newValue = getCurrentTemplate();
    setValue(newValue);
  }, [focusedSectionSlug, templates]);

  const handleChange = (newValue) => {
    setValue(newValue);
    const updatedTemplates = templates.map((t) => {
      if (t.slug === focusedSectionSlug) {
        const updated = { ...t };
        updated.content = newValue;
        return updated;
      }
      return t;
    });
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleEditorMount = (editor) => {
    wrapperRef.current = editor;
  };

  (0, import_react3.useEffect)(() => {
    if (!isMobile && !Editor) {
      import("@monaco-editor/react").then((monaco) => {
        setEditor(() => monaco.default);
      });
    }
  }, [Editor, isMobile, setEditor]);

  if (focusedSectionSlug === undefined) {
    return React.createElement("p", { style: "color: red;" }, "No section selected");
  }

  const options = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true
  };

  return React.createElement(
    React.Fragment,
    null,
    isMobile
      ? React.createElement("textarea", {
          ref: textareaRef,
          onChange: (e) => handleChange(e.target.value),
          value: value,
          className: "mobile-editor-textarea"
        })
      : Editor &&
        React.createElement(Editor, {
          onMount: handleEditorMount,
          wrapperClassName: "editor-wrapper",
          className: "editor",
          theme: theme,
          language: "markdown",
          value: value,
          onChange: handleChange,
          loading: "Loading editor...",
          "aria-label": "Code editor",
          options: options
        })
  );
};

const _default = EditorColumn;
module.exports = _default;
