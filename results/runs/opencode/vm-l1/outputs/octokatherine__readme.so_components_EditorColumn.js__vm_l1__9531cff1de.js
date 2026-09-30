"use strict";

const React = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent));
  }, []);

  return { isMobile };
}

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [, setStorageError] = React.useState(null);

  React.useEffect(() => {
    try {
      const savedBackup = localStorage.getItem("readme-backup");
      if (savedBackup) setBackup(JSON.parse(savedBackup));
    } catch (error) {
      setStorageError(error);
    }
  }, []);

  const saveBackup = React.useCallback((templates) => {
    try {
      localStorage.setItem("readme-backup", JSON.stringify(templates));
      setBackup(templates);
    } catch {
      console.error("Failed to create local backup");
    }
  }, []);

  const deleteBackup = React.useCallback(() => {
    try {
      localStorage.removeItem("readme-backup");
      setBackup(null);
    } catch {
      console.error("Failed to delete local backup");
    }
  }, []);

  return { backup, saveBackup, deleteBackup };
}

function EditorColumn({ focusedSectionSlug, templates, setTemplates, theme }) {
  const selectedTemplate = templates.find(({ slug }) => slug === focusedSectionSlug);
  const [markdown, setMarkdown] = React.useState(selectedTemplate?.markdown);
  const { isMobile } = useDeviceDetect();
  const [MonacoEditor, setMonacoEditor] = React.useState(null);
  const { saveBackup } = useLocalStorage();
  const editorRef = React.useRef(null);
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    const currentTemplate = templates.find(({ slug }) => slug === focusedSectionSlug);
    setMarkdown(currentTemplate?.markdown);
  }, [focusedSectionSlug, templates]);

  React.useEffect(() => {
    if (!MonacoEditor && !isMobile) {
      import("@monaco-editor/react").then(({ default: Editor }) => setMonacoEditor(() => Editor));
    }
  }, [MonacoEditor, isMobile, setMonacoEditor]);

  const updateMarkdown = (value) => {
    const nextMarkdown = value ?? "";
    setMarkdown(nextMarkdown);

    const updatedTemplates = templates.map((template) =>
      template.slug === focusedSectionSlug
        ? { ...template, markdown: nextMarkdown }
        : template,
    );
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleTextareaChange = (event) => updateMarkdown(event.target.value);
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  let editor = null;
  if (isMobile) {
    editor = React.createElement("textarea", {
      ref: textareaRef,
      onChange: handleTextareaChange,
      value: markdown,
      className: "full-screen rounded-sm border border-gray-500 w-full p-6 resize-none",
    });
  } else if (MonacoEditor) {
    editor = React.createElement(MonacoEditor, {
      onMount: handleEditorMount,
      wrapperClassName: "rounded-sm border border-gray-500",
      className: "full-screen",
      theme,
      language: "markdown",
      value: markdown,
      onChange: updateMarkdown,
      loading: "Loading...",
      "aria-label": "Markdown Editor",
      options: {
        minimap: { enabled: false },
        lineNumbers: false,
        wordWrap: true,
      },
    });
  }

  return React.createElement(React.Fragment, null, editor);
}

module.exports = { EditorColumn };
