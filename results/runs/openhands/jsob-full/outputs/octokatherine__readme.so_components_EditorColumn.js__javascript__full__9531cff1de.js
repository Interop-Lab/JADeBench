const React = require("react");

const { useEffect, useRef, useState } = React;
const BACKUP_STORAGE_KEY = "readme-backup";
const BACKUP_DELAY_MS = 1000;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = useState(null);
  const [saveTimeout, setSaveTimeout] = useState(null);

  useEffect(() => {
    const storedBackup = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (storedBackup) {
      setBackup(JSON.parse(storedBackup));
    }
  }, []);

  const saveBackup = (templates) => {
    try {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      setSaveTimeout(
        setTimeout(() => {
          localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(templates));
        }, BACKUP_DELAY_MS),
      );
    } catch {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem(BACKUP_STORAGE_KEY);
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

  const [markdown, setMarkdown] = useState(getFocusedMarkdown());
  const { isMobile } = useDeviceDetect();
  const [Editor, setEditor] = useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
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

  useEffect(() => {
    if (!isMobile && !Editor) {
      import("@monaco-editor/react").then((module) => {
        setEditor(() => module.default);
      });
    }
  }, [Editor, isMobile, setEditor]);

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

module.exports = { EditorColumn };
