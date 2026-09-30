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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/octokatherine__readme.so/components/EditorColumn.js
var EditorColumn_exports = {};
__export(EditorColumn_exports, {
  EditorColumn: () => EditorColumn
});
module.exports = __toCommonJS(EditorColumn_exports);

// ../work/octokatherine__readme.so/hooks/useDeviceDetect.js
var import_react = require("react");
function useDeviceDetect() {
  const [isMobile, setMobile] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setMobile(mobile);
  }, []);
  return { isMobile };
}

// ../work/octokatherine__readme.so/hooks/useLocalStorage.js
var import_react2 = require("react");
function useLocalStorage() {
  const [backup, setBackup] = (0, import_react2.useState)(null);
  const [timer, setTimer] = (0, import_react2.useState)(null);
  (0, import_react2.useEffect)(() => {
    const localBackup = localStorage.getItem("readme-backup");
    if (localBackup) {
      setBackup(JSON.parse(localBackup));
    }
  }, []);
  const saveBackup = (templates) => {
    try {
      if (timer) {
        clearTimeout(timer);
      }
      setTimer(
        setTimeout(() => {
          localStorage.setItem("readme-backup", JSON.stringify(templates));
        }, 1e3)
      );
    } catch (_) {
      console.error("Failed to create local backup");
    }
  };
  const deleteBackup = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (_) {
      console.error("Failed to delete local backup");
    }
  };
  return { backup, saveBackup, deleteBackup };
}

// ../work/octokatherine__readme.so/components/EditorColumn.js
var import_react3 = require("react");
var EditorColumn = ({ focusedSectionSlug, templates, setTemplates, theme }) => {
  const getMarkdown = () => {
    const section = templates.find((s) => s.slug === focusedSectionSlug);
    return section ? section.markdown : "";
  };
  const [markdown, setMarkdown] = (0, import_react3.useState)(getMarkdown());
  const { isMobile } = useDeviceDetect();
  const [MonacoEditor, setMonacoEditor] = (0, import_react3.useState)(null);
  const { saveBackup } = useLocalStorage();
  const monacoEditorRef = (0, import_react3.useRef)(null);
  const textEditorRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    const markdown2 = getMarkdown();
    setMarkdown(markdown2);
  }, [focusedSectionSlug, templates]);
  const onEdit = (val) => {
    setMarkdown(val);
    const newTemplates = templates.map((template) => {
      if (template.slug === focusedSectionSlug) {
        return { ...template, markdown: val };
      }
      return template;
    });
    setTemplates(newTemplates);
    saveBackup(newTemplates);
  };
  const handleEditorDidMount = (editor) => {
    monacoEditorRef.current = editor;
  };
  (0, import_react3.useEffect)(() => {
    if (!isMobile && !MonacoEditor) {
      import("@monaco-editor/react").then((EditorComp) => {
        setMonacoEditor(() => EditorComp.default);
      });
    }
  }, [MonacoEditor, isMobile, setMonacoEditor]);
  if (focusedSectionSlug === "noEdit") {
    return /* @__PURE__ */ React.createElement("p", { className: "text-sm text-emerald-500 max-w-[28rem] text-center mx-auto mt-10" }, "Select a section from the left sidebar to edit the contents");
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, isMobile ? /* @__PURE__ */ React.createElement(
    "textarea",
    {
      ref: textEditorRef,
      onChange: (e) => onEdit(e.target.value),
      value: markdown,
      className: "full-screen rounded-sm border border-gray-500 w-full p-6 resize-none"
    }
  ) : MonacoEditor && /* @__PURE__ */ React.createElement(
    MonacoEditor,
    {
      onMount: handleEditorDidMount,
      wrapperClassName: "rounded-sm border border-gray-500",
      className: "full-screen",
      theme,
      language: "markdown",
      value: markdown,
      onChange: onEdit,
      loading: "Loading...",
      "aria-label": "Markdown Editor",
      options: {
        minimap: {
          enabled: false
        },
        lineNumbers: false,
        wordWrap: true
      }
    }
  ));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EditorColumn
});
