const react = require("react");

const LOCAL_BACKUP_KEY = "readme-backup";
const MOBILE_USER_AGENT_PATTERN = /Mobi|Android|BlackBerry|iPhone/i;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = react.useState(false);

  react.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(Boolean(userAgent.match(MOBILE_USER_AGENT_PATTERN)));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = react.useState(null);
  const [saveTimeout, setSaveTimeout] = react.useState(null);

  react.useEffect(() => {
    const storedBackup = localStorage.getItem(LOCAL_BACKUP_KEY);
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
          localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(templates));
        }, 1000),
      );
    } catch {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem(LOCAL_BACKUP_KEY);
    } catch {
      console.error("Failed to delete local backup");
    }
  };

  return { backup, saveBackup, deleteBackup };
}

const EditorColumn = ({ focusedSectionSlug, templates, setTemplates, theme }) => {
  const getFocusedMarkdown = () => {
    const focusedTemplate = templates.find(
      (template) => template.slug === focusedSectionSlug,
    );
    return focusedTemplate ? focusedTemplate.markdown : "";
  };

  const [markdown, setMarkdown] = react.useState(getFocusedMarkdown());
  const { isMobile } = useDeviceDetect();
  const [MonacoEditor, setMonacoEditor] = react.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = react.useRef(null);
  const textareaRef = react.useRef(null);

  react.useEffect(() => {
    setMarkdown(getFocusedMarkdown());
  }, [focusedSectionSlug, templates]);

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

  react.useEffect(() => {
    if (!isMobile && !MonacoEditor) {
      import("@monaco-editor/react").then((module) => {
        setMonacoEditor(() => module.default);
      });
    }
  }, [MonacoEditor, isMobile, setMonacoEditor]);

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
      : MonacoEditor &&
          React.createElement(MonacoEditor, {
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
};

const recoveredExports = {};
Object.defineProperty(recoveredExports, "__esModule", { value: true });
Object.defineProperty(recoveredExports, "EditorColumn", {
  enumerable: true,
  get: () => EditorColumn,
});
module.exports = recoveredExports;
