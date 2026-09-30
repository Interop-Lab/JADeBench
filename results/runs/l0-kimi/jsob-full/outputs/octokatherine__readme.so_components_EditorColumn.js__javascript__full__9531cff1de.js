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
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var EditorColumn_exports = {};
__export(EditorColumn_exports, {
  default: () => EditorColumn
});
module.exports = __toCommonJS(EditorColumn_exports);

var import_react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);
  import_react.useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const isMobileDevice = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setIsMobile(isMobileDevice);
  }, []);
  return { isMobile };
}

var import_react2 = require("react");

function useLocalStorage() {
  const [templates, setTemplates] = import_react2.useState(null);
  const [backup, setBackup] = import_react2.useState(null);
  import_react2.useEffect(() => {
    const saved = localStorage.getItem("templates");
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);
  const saveBackup = (newTemplates) => {
    try {
      backup && clearTimeout(backup);
      setBackup(setTimeout(() => {
        localStorage.setItem("templates", JSON.stringify(newTemplates));
      }, 1000));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  };
  const clearBackup = () => {
    try {
      localStorage.removeItem("templates");
    } catch (e) {
      console.error("Error clearing localStorage:", e);
    }
  };
  return { templates, setTemplates, saveBackup, clearBackup };
}

var import_react3 = require("react");

var EditorColumn = ({ focusedSectionSlug, templates, setTemplates, theme }) => {
  const getTemplate = () => {
    const template = templates.find((t) => t.slug === focusedSectionSlug);
    return template ? template.content : "";
  };
  const [content, setContent] = import_react3.useState(getTemplate());
  const { isMobile } = useDeviceDetect();
  const [editor, setEditor] = import_react3.useState(null);
  const { saveBackup } = useLocalStorage();
  const textareaRef = import_react3.useRef(null);
  const editorRef = import_react3.useRef(null);
  import_react3.useEffect(() => {
    const newContent = getTemplate();
    setContent(newContent);
  }, [focusedSectionSlug, templates]);
  const handleContentChange = (newContent) => {
    setContent(newContent);
    const newTemplates = templates.map((t) => {
      if (t.slug === focusedSectionSlug) {
        const newTemplate = { ...t };
        newTemplate.content = newContent;
        return newTemplate;
      }
      return t;
    });
    setTemplates(newTemplates);
    saveBackup(newTemplates);
  };
  const handleEditorMount = (ed) => {
    editorRef.current = ed;
  };
  import_react3.useEffect(() => {
    if (!isMobile && !editor) {
      import("@monaco-editor/react").then((MonacoEditor) => {
        setEditor(() => MonacoEditor.default);
      });
    }
  }, [editor, isMobile, setEditor]);
  if (focusedSectionSlug === "preview") {
    const props = {};
    props.dangerouslySetInnerHTML = { __html: content };
    return React.createElement("div", props);
  }
  const divProps = {};
  divProps.className = "h-full";
  const editorProps = {};
  editorProps.className = "h-full";
  editorProps.wrapperClassName = "h-full";
  editorProps.theme = theme;
  editorProps.language = "markdown";
  editorProps.value = content;
  editorProps.onChange = handleContentChange;
  editorProps.loading = "Loading...";
  editorProps["aria-label"] = "Markdown editor";
  editorProps.options = { minimap: { enabled: false }, automaticLayout: true, wordWrap: "on" };
  return React.createElement(React.Fragment, null, isMobile ? React.createElement("textarea", {
    ref: textareaRef,
    onChange: (e) => handleContentChange(e.target.value),
    value: content,
    className: "w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
  }) : editor && React.createElement(editor, {
    onMount: handleEditorMount,
    wrapperClassName: "h-full",
    className: "h-full",
    theme: theme,
    language: "markdown",
    value: content,
    onChange: handleContentChange,
    loading: "Loading...",
    "aria-label": "Markdown editor",
    options: { minimap: { enabled: false }, automaticLayout: true, wordWrap: "on" }
  }));
};

var _0x4770cc = {};
_0x4770cc.default = EditorColumn;
-0x19ec + 0x2b * -0x8d + 0x1089 * 0x3 && (module.exports = _0x4770cc);
