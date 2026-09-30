"use strict";

const React = require("react");
const { Dialog, Transition } = require("@headlessui/react");
const {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} = require("@dnd-kit/core");
const { restrictToVerticalAxis } = require("@dnd-kit/modifiers");
const {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");

const CURRENT_SLUG_LIST = "current-slug-list";
const CURRENT_FOCUSED_SLUG = "current-focused-slug";
const README_BACKUP = "readme-backup";
const DEFAULT_SECTION = "title-and-description";
const NO_EDIT = "noEdit";

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [saveTimer, setSaveTimer] = React.useState(null);

  React.useEffect(() => {
    const storedBackup = localStorage.getItem(README_BACKUP);
    if (storedBackup) setBackup(JSON.parse(storedBackup));
  }, []);

  const saveBackup = (templates) => {
    try {
      if (saveTimer) clearTimeout(saveTimer);
      setSaveTimer(
        setTimeout(() => {
          localStorage.setItem(README_BACKUP, JSON.stringify(templates));
        }, 1000),
      );
    } catch {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem(README_BACKUP);
    } catch {
      console.error("Failed to delete local backup");
    }
  };

  return { backup, saveBackup, deleteBackup };
}

const SortableItem = React.memo(function SortableItem({
  id,
  section,
  focusedSectionSlug,
  setFocusedSectionSlug,
  onDeleteSection,
  onResetSection,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const focusSection = () => {
    localStorage.setItem(CURRENT_FOCUSED_SLUG, id);
    setFocusedSectionSlug(id);
  };

  const handleKeyUp = (event) => {
    if (event.key.toLowerCase() === "enter") focusSection();
  };

  const resetSection = (event) => {
    if (
      window.confirm(
        "The section will be reset to default template; to continue, click OK",
      )
    ) {
      onResetSection(event, section.slug);
    }
  };

  const focused = section.slug === focusedSectionSlug;

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style: { transform: CSS.Transform.toString(transform), transition },
      ...attributes,
      onClick: focusSection,
      onKeyUp: handleKeyUp,
      className:
        "bg-white shadow rounded-md pl-1 py-2 flex items-center cursor-pointer hove" +
        "r:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eme" +
        `rald-400 relative select-none transition-colors ${focused ? "ring-2 ring-emerald-400" : ""}`,
    },
    React.createElement(
      "button",
      {
        type: "button",
        className:
          "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners,
      },
      React.createElement("img", {
        className: "w-5 h-5",
        src: "drag.svg",
        alt: "Drag to reorder",
      }),
    ),
    React.createElement("p", null, section.name),
    focused &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
            type: "button",
            "aria-label": "Reset section",
            onClick: resetSection,
          },
          React.createElement("img", {
            className: "w-auto h-5",
            src: "reset.svg",
            alt: "Reset section",
          }),
        ),
        React.createElement(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
            type: "button",
            "aria-label": "Delete section",
            onClick: onDeleteSection,
          },
          React.createElement("img", {
            className: "w-auto h-5",
            src: "trash.svg",
            alt: "Delete section",
          }),
        ),
      ),
  );
});

function CustomSection({
  setTemplates,
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction,
}) {
  const [show, setShow] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const { saveBackup } = useLocalStorage();
  const titleInput = React.useRef(null);

  const addSection = (event) => {
    if (event) event.preventDefault();
    if (!title) return;

    setShow(false);
    const section = {
      slug: `custom-${title.toLowerCase().replace(/\s/g, "-")}`,
      name: title,
      markdown: `\n## ${title}`,
    };

    localStorage.setItem(CURRENT_FOCUSED_SLUG, section.slug);
    setTemplates((templates) => {
      const updatedTemplates = [...templates, section];
      saveBackup(updatedTemplates);
      return updatedTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((slugs) => [...slugs, section.slug]);
    setFocusedSectionSlug(section.slug);
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Transition,
      { show },
      React.createElement(
        Dialog,
        {
          as: "div",
          className: "fixed z-10 inset-0 overflow-y-auto",
          initialFocus: titleInput,
          onClose: () => setShow(false),
        },
        React.createElement(
          "div",
          {
            className:
              "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",
          },
          React.createElement(
            Transition.Child,
            {
              enter: "ease-out duration-300",
              enterFrom: "opacity-0",
              enterTo: "opacity-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100",
              leaveTo: "opacity-0",
            },
            React.createElement(Dialog.Backdrop, {
              className:
                "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
            }),
          ),
          React.createElement(
            "span",
            {
              className: "hidden sm:inline-block sm:align-middle sm:h-screen",
              "aria-hidden": "true",
            },
            "​",
          ),
          React.createElement(
            Transition.Child,
            {
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
              enterTo: "opacity-100 translate-y-0 sm:scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
              leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            },
            React.createElement(
              Dialog.Panel,
              {
                className:
                  "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6",
              },
              React.createElement(
                "form",
                { onSubmit: addSection },
                React.createElement(
                  "div",
                  { className: "mt-3 text-center sm:mt-5" },
                  React.createElement(
                    Dialog.Title,
                    {
                      as: "h3",
                      className: "text-lg leading-6 font-medium text-gray-900",
                    },
                    "New Custom Section",
                  ),
                  React.createElement(
                    "div",
                    { className: "my-4" },
                    React.createElement("input", {
                      ref: titleInput,
                      type: "text",
                      name: "title",
                      id: "title",
                      onChange: (event) => setTitle(event.target.value),
                      className:
                        "shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 block w-full sm:text-sm border border-gray-300 rounded-md",
                      placeholder: "Section Title",
                      "aria-label": "Section title",
                    }),
                  ),
                ),
                React.createElement(
                  "div",
                  { className: "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense" },
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      className:
                        "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:col-start-2 sm:text-sm disabled:opacity-50",
                      disabled: !title,
                      onClick: addSection,
                    },
                    "Add Section",
                  ),
                  React.createElement(
                    "button",
                    {
                      type: "button",
                      className:
                        "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm",
                      onClick: () => setShow(false),
                    },
                    "Cancel",
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      "div",
      { className: "mb-3" },
      React.createElement(
        "button",
        {
          className:
            "flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
          type: "button",
          onClick: () => setShow(true),
        },
        React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-5 w-5",
            viewBox: "0 0 20 20",
            fill: "currentColor",
          },
          React.createElement("path", {
            fillRule: "evenodd",
            d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
            clipRule: "evenodd",
          }),
        ),
        React.createElement("span", { className: "ml-1" }, "Custom Section"),
      ),
    ),
  );
}

function SectionFilter({ searchFilter, setSearchFilter }) {
  return React.createElement("input", {
    type: "text",
    placeholder: "Search for a section",
    "aria-label": "Search for a section",
    className:
      "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
    "data-testid": "slugs-filter",
    value: searchFilter,
    onChange: (event) => setSearchFilter(event.target.value),
  });
}

function kebabCaseToTitleCase(slug) {
  return slug
    .split("-")
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function SectionsColumn({
  selectedSectionSlugs,
  setSelectedSectionSlugs,
  sectionSlugs,
  setSectionSlugs,
  setFocusedSectionSlug,
  focusedSectionSlug,
  templates,
  originalTemplate,
  setTemplates,
  getTemplate,
}) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [pageRefreshed, setPageRefreshed] = React.useState(false);
  const [addAction, setAddAction] = React.useState(false);
  const [originalSelectedSlugs, setOriginalSelectedSlugs] = React.useState([]);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [filteredSectionSlugs, setFilteredSectionSlugs] = React.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  React.useEffect(() => {
    const stored = localStorage.getItem(CURRENT_SLUG_LIST) || DEFAULT_SECTION;
    setOriginalSelectedSlugs(stored);
    if (stored.length > 1) {
      setPageRefreshed(true);
      const slugs = stored.split(",");
      setSectionSlugs((available) =>
        available.filter((slug) => !slugs.includes(slug)),
      );
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem(CURRENT_FOCUSED_SLUG, slugs[0]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(CURRENT_SLUG_LIST, selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  React.useEffect(() => {
    if (!searchFilter) {
      setFilteredSectionSlugs([]);
      return;
    }
    const query = searchFilter.trim().toLowerCase();
    const matches = sectionSlugs.filter((slug) =>
      getTemplate(slug).name.toLowerCase().includes(query),
    );
    setFilteredSectionSlugs(matches.length ? matches : [undefined]);
  }, [searchFilter]);

  const selectedSlugs = React.useMemo(
    () =>
      pageRefreshed || addAction
        ? [...new Set(selectedSectionSlugs)]
        : selectedSectionSlugs,
    [selectedSectionSlugs, pageRefreshed, addAction],
  );

  const availableSlugs = React.useMemo(() => {
    const available = [...sectionSlugs];
    if (
      pageRefreshed &&
      originalSelectedSlugs.indexOf(DEFAULT_SECTION) !== -1 &&
      !available.includes(DEFAULT_SECTION)
    ) {
      available.push(DEFAULT_SECTION);
    }
    const slugs = filteredSectionSlugs.length
      ? [...filteredSectionSlugs].sort()
      : available.sort();
    return pageRefreshed || addAction ? [...new Set(slugs)] : slugs;
  }, [
    sectionSlugs,
    filteredSectionSlugs,
    pageRefreshed,
    addAction,
    originalSelectedSlugs,
  ]);

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      setSelectedSectionSlugs((slugs) => {
        const oldIndex = slugs.findIndex((slug) => slug === active.id);
        const newIndex = slugs.findIndex((slug) => slug === over.id);
        return arrayMove(slugs, oldIndex, newIndex);
      });
    }
  };

  const clearSearch = () => setSearchFilter("");

  const addSection = (event, slug) => {
    localStorage.setItem(CURRENT_FOCUSED_SLUG, slug);
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(localStorage.getItem(CURRENT_FOCUSED_SLUG));
    setSectionSlugs((slugs) => slugs.filter((candidate) => candidate !== slug));
    clearSearch();
    setFilteredSectionSlugs((slugs) =>
      slugs.filter((candidate) => candidate !== slug),
    );
    setPageRefreshed(false);
    setAddAction(true);
  };

  const deleteSection = (event, slug) => {
    event.stopPropagation();
    setSectionSlugs((slugs) => [...slugs, slug]);
    localStorage.setItem(CURRENT_FOCUSED_SLUG, NO_EDIT);
    setFocusedSectionSlug(null);
    setSelectedSectionSlugs((slugs) =>
      slugs.filter((candidate) => candidate !== slug),
    );
  };

  const resetSection = (event, slug) => {
    event.stopPropagation();
    let originalSection;
    if (slug.slice(0, 6) === "custom") {
      const title = kebabCaseToTitleCase(slug.slice(7));
      originalSection = { slug, name: title, markdown: `\n## ${title}` };
    } else {
      originalSection = originalTemplate.find((section) => section.slug === slug);
    }
    const updatedTemplates = templates.map((section) =>
      section.slug === originalSection.slug ? originalSection : section,
    );
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const resetAllSections = () => {
    const stored = localStorage.getItem(CURRENT_SLUG_LIST);
    if (
      !window.confirm(
        "All sections of your readme will be removed; to continue, click OK",
      )
    ) {
      return;
    }
    const previousSlugs = stored ? stored.split(",") : [];
    setSectionSlugs((slugs) =>
      [...slugs, ...previousSlugs].filter((slug) => slug !== DEFAULT_SECTION),
    );
    setSelectedSectionSlugs([DEFAULT_SECTION]);
    setFocusedSectionSlug(DEFAULT_SECTION);
    localStorage.setItem(CURRENT_FOCUSED_SLUG, NO_EDIT);
    setTemplates(originalTemplate);
    deleteBackup();
  };

  return React.createElement(
    "div",
    { className: "sections w-full md:w-64 lg:w-80" },
    React.createElement(
      "h3",
      {
        className:
          "px-1 text-lg font-medium mb-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none",
      },
      "Sections",
      React.createElement(
        "button",
        {
          className:
            "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors",
          type: "button",
          onClick: resetAllSections,
        },
        React.createElement("span", { className: "pl-2 float-right" }, "Reset"),
        React.createElement("img", {
          className: "w-auto h-5 inline-block",
          src: "reset.svg",
          alt: "Reset",
        }),
      ),
    ),
    React.createElement(
      "div",
      { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      selectedSectionSlugs.length > 0 &&
        React.createElement(
          "h4",
          { className: "mb-3 text-xs leading-6 text-gray-900" },
          "Click on a section below to edit the contents",
        ),
      React.createElement(
        "ul",
        { className: "mb-12 space-y-3" },
        React.createElement(
          DndContext,
          {
            sensors,
            collisionDetection: closestCenter,
            onDragEnd: handleDragEnd,
            modifiers: [restrictToVerticalAxis],
          },
          React.createElement(
            SortableContext,
            { items: selectedSlugs },
            selectedSlugs.map((slug) => {
              const section = getTemplate(slug);
              return (
                section &&
                React.createElement(SortableItem, {
                  key: slug,
                  id: slug,
                  section,
                  focusedSectionSlug,
                  setFocusedSectionSlug,
                  onDeleteSection: (event) => deleteSection(event, slug),
                  onResetSection: resetSection,
                })
              );
            }),
          ),
        ),
      ),
      sectionSlugs.length > 0 &&
        React.createElement(
          "h4",
          { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" },
          "Click on a section below to add it to your readme",
        ),
      React.createElement(SectionFilter, { searchFilter, setSearchFilter }),
      React.createElement(CustomSection, {
        setSelectedSectionSlugs,
        setFocusedSectionSlug,
        setpageRefreshed: setPageRefreshed,
        setAddAction,
        setTemplates,
      }),
      React.createElement(
        "ul",
        { className: "space-y-3" },
        availableSlugs.map((slug) => {
          if (slug === undefined) {
            return React.createElement(
              "h4",
              {
                className: "mb-3 text-xs leading-6 text-gray-900",
                key: "unavailable-section",
              },
              "The section you're looking for is unavailable",
            );
          }
          const section = getTemplate(slug);
          return (
            section &&
            React.createElement(
              "li",
              { key: slug },
              React.createElement(
                "button",
                {
                  className:
                    "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
                  type: "button",
                  onClick: (event) => addSection(event, slug),
                },
                React.createElement("span", null, section.name),
              ),
            )
          );
        }),
      ),
    ),
  );
}

module.exports = { SectionsColumn };
