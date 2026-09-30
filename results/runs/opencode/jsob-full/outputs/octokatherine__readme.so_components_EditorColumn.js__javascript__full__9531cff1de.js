"use strict";

const React = require("react");

const BACKUP_KEY = "readme-backup";
const NO_EDIT_SECTION = "noEdit";

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
    const savedBackup = localStorage.getItem(BACKUP_KEY);
    if (savedBackup) {
      setBackup(JSON.parse(savedBackup));
    }
  }, []);

  const saveBackup = (templates) => {
    try {
      if (saveTimer) clearTimeout(saveTimer);
      setSaveTimer(
        setTimeout(() => {
          localStorage.setItem(BACKUP_KEY, JSON.stringify(templates));
        }, 1000),
      );
    } catch {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem(BACKUP_KEY);
    } catch {
      console.error("Failed to delete local backup");
    }
  };

  return { backup, saveBackup, deleteBackup };
}

const EditorColumn = ({
  focusedSectionSlug,
  templates,
  setTemplates,
  theme,
}) => {
  const getFocusedMarkdown = () => {
    const focusedTemplate = templates.find(
      (template) => template.slug === focusedSectionSlug,
    );
    return focusedTemplate ? focusedTemplate.markdown : "";
  };

  const [markdown, setMarkdown] = React.useState(getFocusedMarkdown);
  const { isMobile } = useDeviceDetect();
  const [MonacoEditor, setMonacoEditor] = React.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    setMarkdown(getFocusedMarkdown());
  }, [focusedSectionSlug, templates]);

  const updateMarkdown = (nextMarkdown) => {
    setMarkdown(nextMarkdown);

    const updatedTemplates = templates.map((template) =>
      template.slug === focusedSectionSlug
        ? { ...template, markdown: nextMarkdown }
        : template,
    );

    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  React.useEffect(() => {
    if (!isMobile && !MonacoEditor) {
      import("@monaco-editor/react").then((module) => {
        setMonacoEditor(() => module.default);
      });
    }
  }, [MonacoEditor, isMobile, setMonacoEditor]);

  if (focusedSectionSlug === NO_EDIT_SECTION) {
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
          onChange: (event) => updateMarkdown(event.target.value),
          value: markdown,
          className:
            "full-screen rounded-sm border border-gray-500 w-full p-6 resize-none",
        })
      : MonacoEditor &&
          React.createElement(MonacoEditor, {
            onMount: handleEditorMount,
            wrapperClassName: "rounded-sm border border-gray-500",
            className: "full-screen",
            theme,
            language: "markdown",
            value: markdown,
            onChange: updateMarkdown,
            loading: "Loading...",
            "aria-label": "Markdown Editor",
            options: editorOptions,
          }),
  );
};

module.exports = { EditorColumn };
