"use strict";

const React = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [saveTimer, setSaveTimer] = React.useState(null);

  React.useEffect(() => {
    const storedBackup = localStorage.getItem("readme-backup");
    if (storedBackup) {
      setBackup(JSON.parse(storedBackup));
    }
  }, []);

  const saveBackup = (templates) => {
    try {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
      setSaveTimer(
        setTimeout(() => {
          localStorage.setItem("readme-backup", JSON.stringify(templates));
        }, 1000),
      );
    } catch {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch {
      console.error("Failed to delete local backup");
    }
  };

  return { backup, saveBackup, deleteBackup };
}

function EditorColumn({ focusedSectionSlug, templates, setTemplates, theme }) {
  const getFocusedMarkdown = () => {
    const focusedTemplate = templates.find(
      (template) => template.slug === focusedSectionSlug,
    );
    return focusedTemplate ? focusedTemplate.markdown : "";
  };

  const [markdown, setMarkdown] = React.useState(getFocusedMarkdown);
  const { isMobile } = useDeviceDetect();
  const [Editor, setEditor] = React.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    setMarkdown(getFocusedMarkdown());
  }, [focusedSectionSlug, templates]);

  const handleChange = (value) => {
    setMarkdown(value);
    const updatedTemplates = templates.map((template) => {
      if (template.slug === focusedSectionSlug) {
        return { ...template, markdown: value };
      }
      return template;
    });
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  React.useEffect(() => {
    if (!isMobile && !Editor) {
      import("@monaco-editor/react").then((module) => {
        setEditor(() => module.default);
      });
    }
  }, [Editor, isMobile]);

  if (focusedSectionSlug === "noEdit") {
    return React.createElement(
      "p",
      {
        className:
          "text-sm text-emerald-500 max-w-[28rem] text-center mx-auto mt-10",
      },
      "Select a section from the left sidebar to edit the contents",
    );
  }

  const editorOptions = {
    minimap: { enabled: false },
    lineNumbers: false,
    wordWrap: true,
  };

  return React.createElement(
    React.Fragment,
    null,
    isMobile
      ? React.createElement("textarea", {
          ref: textareaRef,
          onChange: (event) => handleChange(event.target.value),
          value: markdown,
          className:
            "full-screen rounded-sm border border-gray-500 w-full p-6 resize-none",
        })
      : Editor &&
          React.createElement(Editor, {
            onMount: handleEditorMount,
            wrapperClassName: "rounded-sm border border-gray-500",
            className: "full-screen",
            theme,
            language: "markdown",
            value: markdown,
            onChange: handleChange,
            loading: "Loading...",
            "aria-label": "Markdown Editor",
            options: editorOptions,
          }),
  );
}

const exportsObject = {};
Object.defineProperty(exportsObject, "__esModule", { value: true });
Object.defineProperty(exportsObject, "EditorColumn", {
  enumerable: true,
  get: () => EditorColumn,
});
module.exports = exportsObject;
