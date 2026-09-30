"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "EditorColumn", {
  enumerable: true,
  get: () => EditorColumn,
});

const React = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(
      Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)),
    );
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [saveTimeout, setSaveTimeout] = React.useState(null);
  const storageKey = "editor-backup";

  React.useEffect(() => {
    const savedBackup = localStorage.getItem(storageKey);
    if (savedBackup) {
      setBackup(JSON.parse(savedBackup));
    }
  }, []);

  const saveBackup = (value) => {
    try {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      setSaveTimeout(
        setTimeout(() => {
          localStorage.setItem(storageKey, JSON.stringify(value));
        }, 1000),
      );
    } catch (error) {
      console.error("Unable to save editor backup.");
    }
  };

  const clearBackup = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Unable to clear editor backup.");
    }
  };

  return {
    backup,
    saveBackup,
    clearBackup,
  };
}

const EditorColumn = ({
  focusedSectionSlug,
  templates,
  setTemplates,
  theme,
}) => {
  const getFocusedContent = () => {
    const template = templates.find(
      (item) => item.slug === focusedSectionSlug,
    );
    return template ? template.content : "";
  };

  const [value, setValue] = React.useState(() => getFocusedContent());
  const { isMobile } = useDeviceDetect();
  const [MonacoEditor, setMonacoEditor] = React.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    setValue(getFocusedContent());
  }, [focusedSectionSlug, templates]);

  const handleChange = (nextValue) => {
    setValue(nextValue);

    const updatedTemplates = templates.map((template) => {
      if (template.slug === focusedSectionSlug) {
        return {
          ...template,
          content: nextValue,
        };
      }

      return template;
    });

    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  React.useEffect(() => {
    if (!isMobile && !MonacoEditor) {
      import("@monaco-editor/react").then((module) => {
        setMonacoEditor(() => module.default);
      });
    }
  }, [MonacoEditor, isMobile, setMonacoEditor]);

  if (!focusedSectionSlug) {
    return React.createElement(
      "p",
      {
        className:
          "flex h-full items-center justify-center text-sm text-gray-500",
      },
      "Select a section to edit.",
    );
  }

  const options = {
    minimap: {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };

  return React.createElement(
    React.Fragment,
    null,
    isMobile
      ? React.createElement("textarea", {
          ref: textareaRef,
          onChange: (event) => handleChange(event.target.value),
          value,
          className:
            "h-full w-full resize-none p-4 font-mono text-sm focus:outline-none",
        })
      : MonacoEditor &&
          React.createElement(MonacoEditor, {
            onMount: handleMount,
            wrapperClassName: "h-full",
            className: "h-full",
            theme,
            language: "html",
            value,
            onChange: handleChange,
            loading: "Loading editor...",
            "aria-label": "Code editor",
            options,
          }),
  );
};
