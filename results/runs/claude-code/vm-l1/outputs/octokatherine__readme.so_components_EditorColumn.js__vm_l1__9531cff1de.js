const React = require("react");

const { useEffect, useRef, useState } = React;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent =
      typeof window !== "undefined" && typeof navigator !== "undefined"
        ? navigator.userAgent
        : "";

    setIsMobile(Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = useState(null);
  const [saveTimer, setSaveTimer] = useState(null);

  useEffect(() => {
    const storedBackup = localStorage.getItem("readme-backup");
    if (storedBackup) {
      setBackup(JSON.parse(storedBackup));
    }
  }, []);

  const saveBackup = (value) => {
    if (saveTimer) {
      clearTimeout(saveTimer);
    }

    const timer = setTimeout(() => {
      try {
        localStorage.setItem("readme-backup", JSON.stringify(value));
        setBackup(value);
      } catch (error) {
        console.error("Failed to create local backup", error);
      }
    }, 1000);

    setSaveTimer(timer);
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (error) {
      console.error("Failed to delete local backup", error);
    }
  };

  return { backup, saveBackup, deleteBackup };
}

const EditorColumn = ({ focusedSectionSlug, templates, setTemplates, theme }) => {
  const [markdown, setMarkdown] = useState("");
  const { isMobile } = useDeviceDetect();
  const [Editor, setEditor] = useState(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const { saveBackup } = useLocalStorage();

  useEffect(() => {
    const focusedTemplate = templates.find(
      (template) => template.slug === focusedSectionSlug,
    );
    setMarkdown(focusedTemplate ? focusedTemplate.markdown : "");
  }, [focusedSectionSlug, templates]);

  useEffect(() => {
    if (!isMobile && !Editor) {
      import("@monaco-editor/react").then((module) => {
        setEditor(() => module.default);
      });
    }
  }, [Editor, isMobile, setEditor]);

  const updateMarkdown = (value) => {
    const updatedTemplates = templates.map((template) =>
      template.slug === focusedSectionSlug
        ? { ...template, markdown: value }
        : template,
    );

    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const mountEditor = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

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
          value: markdown,
          onChange: (event) => updateMarkdown(event.target.value),
          className:
            "full-screen rounded-sm border border-gray-500 w-full p-6 resize-none",
        })
      : Editor &&
        React.createElement(Editor, {
          value: markdown,
          theme,
          onChange: updateMarkdown,
          onMount: mountEditor,
          wrapperClassName: "rounded-sm border border-gray-500",
          className: "full-screen",
          language: "markdown",
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

module.exports = { EditorColumn };
