const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};
const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var EditorColumn_exports = {};
__export(EditorColumn_exports, {
  EditorColumn: () => EditorColumn
});
module.exports = __toCommonJS(EditorColumn_exports);

var import_react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);
  import_react.useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setIsMobile(mobile);
  }, []);
  return { isMobile };
}

var import_react2 = require("react");

function useLocalStorage() {
  const [storedValue, setStoredValue] = import_react2.useState(null);
  const [timeoutId, setTimeoutId] = import_react2.useState(null);

  import_react2.useEffect(() => {
    const item = localStorage.getItem("templates");
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, []);

  const saveBackup = (value) => {
    try {
      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(setTimeout(() => {
        localStorage.setItem("templates", JSON.stringify(value));
      }, 1000));
    } catch (error) {
      console.error("Error saving backup");
    }
  };

  const clearBackup = () => {
    try {
      localStorage.removeItem("templates");
    } catch (error) {
      console.error("Error clearing backup");
    }
  };

  return { storedValue, saveBackup, clearBackup };
}

var import_react3 = require("react");

const EditorColumn = ({ focusedSectionSlug, templates, setTemplates, theme }) => {
  const [content, setContent] = import_react3.useState(() => {
    const template = templates.find((t) => t.slug === focusedSectionSlug);
    return template ? template.content : "";
  });

  const { isMobile } = useDeviceDetect();
  const [editorRef, setEditorRef] = import_react3.useState(null);
  const { saveBackup } = useLocalStorage();
  const textareaRef = import_react3.useRef(null);
  const monacoRef = import_react3.useRef(null);

  import_react3.useEffect(() => {
    const value = (() => {
      const template = templates.find((t) => t.slug === focusedSectionSlug);
      return template ? template.content : "";
    })();
    setContent(value);
  }, [focusedSectionSlug, templates]);

  const handleChange = (newContent) => {
    setContent(newContent);
    const updatedTemplates = templates.map((template) => {
      if (template.slug === focusedSectionSlug) {
        const updated = { ...template };
        updated.content = newContent;
        return updated;
      }
      return template;
    });
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleMount = (editor) => {
    monacoRef.current = editor;
  };

  import_react3.useEffect(() => {
    if (!isMobile && !editorRef.current) {
      import("monaco-editor").then((monaco) => {
        setEditorRef(() => monaco.editor);
      });
    }
  }, [editorRef, isMobile, setEditorRef]);

  if (focusedSectionSlug === "header") {
    return React.createElement("p", null, "Header section");
  }

  const editorProps = {
    readOnly: false,
    autoFocus: true,
    minimap: { enabled: false }
  };

  return React.createElement(
    React.Fragment,
    null,
    isMobile
      ? React.createElement("textarea", {
          ref: textareaRef,
          onChange: (e) => handleChange(e.target.value),
          value: content,
          className: "editor-textarea"
        })
      : editorRef.current && React.createElement(editorRef.current, {
          onMount: handleMount,
          wrapperClassName: "editor-wrapper",
          className: "editor",
          theme: theme,
          language: "html",
          value: content,
          onChange: handleChange,
          loading: "Loading...",
          "aria-label": "Template editor",
          options: editorProps
        })
  );
};

module.exports = { EditorColumn };
