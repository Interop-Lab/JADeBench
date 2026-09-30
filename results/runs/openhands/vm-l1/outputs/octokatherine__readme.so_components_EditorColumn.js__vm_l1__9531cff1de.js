const exported = {};

Object.defineProperty(exported, "__esModule", { value: true });
Object.defineProperty(exported, "EditorColumn", {
  enumerable: true,
  get: () => EditorColumn,
});

module.exports = exported;

const deviceReact = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = deviceReact.useState(false);

  deviceReact.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;

    setIsMobile(
      Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)),
    );
  }, []);

  return { isMobile };
}

const storageReact = require("react");

function useLocalStorage() {
  const [backup, setBackup] = storageReact.useState(null);
  const [backupTimeout, setBackupTimeout] = storageReact.useState(null);

  storageReact.useEffect(() => {
    const storedBackup = localStorage.getItem("readme-backup");
    if (storedBackup) {
      setBackup(JSON.parse(storedBackup));
    }
  }, []);

  const saveBackup = (newBackup) => {
    try {
      if (backupTimeout) {
        clearTimeout(backupTimeout);
      }

      setBackupTimeout(
        setTimeout(() => {
          localStorage.setItem(
            "readme-backup",
            JSON.stringify(newBackup),
          );
        }, 1000),
      );
    } catch (error) {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (error) {
      console.error("Failed to delete local backup");
    }
  };

  return { backup, saveBackup, deleteBackup };
}

const editorReact = require("react");

var EditorColumn = ({
  focusedSectionSlug,
  templates,
  setTemplates,
  theme,
}) => {
  const getMarkdown = () => {
    const template = templates.find(
      (candidate) => candidate.slug === focusedSectionSlug,
    );

    return template ? template.markdown : "";
  };

  const [markdown, setMarkdown] = editorReact.useState(getMarkdown());
  const { isMobile } = useDeviceDetect();
  const [Editor, setEditor] = editorReact.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = editorReact.useRef(null);

  editorReact.useEffect(() => {
    setMarkdown(getMarkdown());
  }, [focusedSectionSlug, templates]);

  const handleChange = (value) => {
    setMarkdown(value);

    const updatedTemplates = templates.map((template) =>
      template.slug === focusedSectionSlug
        ? { ...template, markdown: value }
        : template,
    );

    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  editorReact.useEffect(() => {
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

  return React.createElement(
    React.Fragment,
    null,
    isMobile
      ? React.createElement("textarea", {
          ref: editorRef,
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
            options: {
              minimap: { enabled: false },
              lineNumbers: false,
              wordWrap: true,
            },
          }),
  );
};
