"use strict";

const React = require("react");

const BACKUP_KEY = "readme-backup";
const MOBILE_USER_AGENT = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(MOBILE_USER_AGENT.test(navigator.userAgent));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);

  React.useEffect(() => {
    const storedBackup = localStorage.getItem(BACKUP_KEY);
    if (storedBackup) {
      setBackup(JSON.parse(storedBackup));
    }
  }, []);

  const saveBackup = (value) => {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(value));
  };

  const deleteBackup = () => {
    localStorage.removeItem(BACKUP_KEY);
  };

  return { backup, saveBackup, deleteBackup };
}

function EditorColumn({ focusedSectionSlug, templates, setTemplates, theme }) {
  const focusedTemplate = templates.find(
    (template) => template.slug === focusedSectionSlug,
  );
  const [markdown, setMarkdown] = React.useState(
    focusedTemplate ? focusedTemplate.markdown : "",
  );
  const { isMobile } = useDeviceDetect();
  const [Editor, setEditor] = React.useState(null);
  const { saveBackup } = useLocalStorage();
  const textareaRef = React.useRef(null);
  const [, setSaveTimer] = React.useState(null);

  React.useEffect(() => {
    const nextTemplate = templates.find(
      (template) => template.slug === focusedSectionSlug,
    );
    setMarkdown(nextTemplate ? nextTemplate.markdown : "");
  }, [focusedSectionSlug, templates]);

  React.useEffect(() => {
    if (!Editor && !isMobile) {
      import("@monaco-editor/react").then((module) => {
        setEditor(() => module.default);
      });
    }
  }, [Editor, isMobile, setEditor]);

  const updateMarkdown = (value) => {
    setMarkdown(value);
    const updatedTemplates = templates.map((template) =>
      template.slug === focusedSectionSlug
        ? { ...template, markdown: value }
        : template,
    );
    setTemplates(updatedTemplates);

    setSaveTimer(
      setTimeout(() => {
        saveBackup(updatedTemplates);
      }, 1000),
    );
  };

  const handleTextareaChange = (event) => {
    updateMarkdown(event.target.value);
  };

  const handleEditorChange = (value) => {
    updateMarkdown(value);
  };

  return React.createElement(
    React.Fragment,
    null,
    isMobile
      ? React.createElement("textarea", {
          ref: textareaRef,
          onChange: handleTextareaChange,
          value: markdown,
          className:
            "full-screen rounded-sm border border-gray-500 w-full p-6 resize-none",
        })
      : Editor
        ? React.createElement(Editor, {
            onMount: () => {},
            wrapperClassName: "rounded-sm border border-gray-500",
            className: "full-screen",
            theme,
            language: "markdown",
            value: markdown,
            onChange: handleEditorChange,
            loading: "Loading...",
            "aria-label": "Markdown Editor",
            options: {
              minimap: { enabled: false },
              lineNumbers: false,
              wordWrap: true,
            },
          })
        : null,
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "EditorColumn", {
  enumerable: true,
  get: () => EditorColumn,
});
