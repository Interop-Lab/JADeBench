const ReactForDeviceDetection = require("react");
const ReactForLocalStorage = require("react");
const React = require("react");

const BACKUP_KEY = "readme-backup";
const BACKUP_DELAY_MS = 1000;
const MOBILE_USER_AGENT = /Mobi|Android|BlackBerry|iPhone/i;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = ReactForDeviceDetection.useState(false);

  ReactForDeviceDetection.useEffect(() => {
    setIsMobile(Boolean(navigator.userAgent.match(MOBILE_USER_AGENT)));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = ReactForLocalStorage.useState(null);
  const [backupTimer, setBackupTimer] = ReactForLocalStorage.useState(null);

  ReactForLocalStorage.useEffect(() => {
    const savedBackup = localStorage.getItem(BACKUP_KEY);
    if (savedBackup) {
      setBackup(JSON.parse(savedBackup));
    }
  }, []);

  const saveBackup = (templates) => {
    try {
      if (backupTimer) {
        clearTimeout(backupTimer);
      }

      const timer = setTimeout(() => {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(templates));
      }, BACKUP_DELAY_MS);
      setBackupTimer(timer);
    } catch {
      console.error("Failed to create local backup");
    }
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
  const [markdown, setMarkdown] = React.useState(focusedTemplate.markdown);
  const { isMobile } = useDeviceDetect();
  const [MonacoEditor, setMonacoEditor] = React.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    const nextTemplate = templates.find(
      (template) => template.slug === focusedSectionSlug,
    );
    setMarkdown(nextTemplate.markdown);
  }, [focusedSectionSlug, templates]);

  React.useEffect(() => {
    if (!isMobile && !MonacoEditor) {
      import("@monaco-editor/react").then((module) => {
        setMonacoEditor(() => module.default);
      });
    }
  }, [MonacoEditor, isMobile, setMonacoEditor]);

  const handleChange = (nextMarkdown) => {
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
      : MonacoEditor
        ? React.createElement(MonacoEditor, {
            onMount: handleEditorMount,
            wrapperClassName: "rounded-sm border border-gray-500",
            className: "full-screen",
            theme,
            language: "markdown",
            value: markdown,
            onChange: handleChange,
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
