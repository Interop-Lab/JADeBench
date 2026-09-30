const React = require("react");
const { useCallback, useEffect, useMemo, useState } = React;
const {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} = require("@dnd-kit/core");
const { sortableKeyboardCoordinates, arrayMove, useSortable, SortableContext, verticalListSortingStrategy } = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");
const { restrictToVerticalAxis } = require("@dnd-kit/modifiers");
const { Dialog, Transition } = require("@headlessui/react");

const SELECTED_SECTIONS_KEY = "selected-section-slugs";
const FOCUSED_SECTION_KEY = "focused-section-slug";
const BACKUP_KEY = "section-backup";

function useLocalStorage() {
  const [selectedSections, setSelectedSections] = useState(null);
  const [backup, setBackup] = useState(null);

  useEffect(() => {
    try {
      const selected = localStorage.getItem(SELECTED_SECTIONS_KEY);
      if (selected) {
        setSelectedSections(JSON.parse(selected));
      }

      const storedBackup = localStorage.getItem(BACKUP_KEY);
      if (storedBackup) {
        setBackup(JSON.parse(storedBackup));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const saveBackup = useCallback((value) => {
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(value));
      setBackup(value);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const deleteBackup = useCallback(() => {
    try {
      localStorage.removeItem(BACKUP_KEY);
      setBackup(null);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return {
    selectedSections,
    backup,
    saveBackup,
    deleteBackup
  };
}

function SortableItem({
  id,
  section,
  focusedSectionSlug,
  setFocusedSectionSlug,
  deleteSection
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const selectSection = () => {
    localStorage.setItem(FOCUSED_SECTION_KEY, id);
    setFocusedSectionSlug(id);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    deleteSection(id);
  };

  const handleKeyUp = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      selectSection();
    }
  };

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners,
      onClick: selectSection,
      onKeyUp: handleKeyUp,
      className:
        "flex cursor-pointer items-center justify-between gap-2 rounded px-2 py-1 " +
        (focusedSectionSlug === id ? "bg-gray-100" : "")
    },
    React.createElement(
      "div",
      { className: "flex min-w-0 items-center gap-2" },
      React.createElement("span", {
        className: "cursor-grab",
        "aria-hidden": true
      }, "⋮⋮"),
      React.createElement(
        "p",
        { className: "truncate" },
        section.name
      )
    ),
    React.createElement(
      "button",
      {
        type: "button",
        "aria-label": `Delete ${section.name}`,
        onClick: handleDelete,
        className: "text-gray-500 hover:text-red-600"
      },
      "×"
    )
  );
}

function CustomSection({
  setTemplates,
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setPageRefreshed,
  setAddAction
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { saveBackup } = useLocalStorage();
  const inputRef = React.useRef(null);

  const addSection = () => {
    if (!name) return;

    const slug = `custom-${name.toLowerCase().trim().replace(/\s/g, "-")}`;
    const section = {
      slug,
      name,
      markdown: `# ${name}`
    };

    localStorage.setItem(slug, JSON.stringify(section));

    setTemplates((templates) => [...templates, section]);
    saveBackup(section);
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(slug);
    setPageRefreshed(false);
    setAddAction(true);
    setName("");
    setOpen(false);
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setOpen(true),
        className: "rounded bg-gray-900 px-3 py-2 text-sm text-white"
      },
      "Add section"
    ),
    React.createElement(
      Transition,
      { show: open, as: React.Fragment },
      React.createElement(
        Dialog,
        {
          as: "div",
          className: "relative z-10",
          initialFocus: inputRef,
          onClose: setOpen
        },
        React.createElement(
          "div",
          { className: "fixed inset-0 bg-black/30" }
        ),
        React.createElement(
          "div",
          { className: "fixed inset-0 overflow-y-auto" },
          React.createElement(
            "div",
            { className: "flex min-h-full items-center justify-center p-4" },
            React.createElement(
              "div",
              { className: "w-full max-w-md rounded bg-white p-6" },
              React.createElement(
                "h3",
                { className: "text-lg font-medium" },
                "Add custom section"
              ),
              React.createElement("input", {
                ref: inputRef,
                type: "text",
                name: "section-name",
                value: name,
                onChange: (event) => setName(event.target.value),
                className: "mt-4 w-full rounded border px-3 py-2",
                placeholder: "Section name",
                "aria-label": "Section name"
              }),
              React.createElement(
                "div",
                { className: "mt-4 flex justify-end gap-2" },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: () => setOpen(false),
                    className: "rounded border px-3 py-2"
                  },
                  "Cancel"
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    disabled: !name,
                    onClick: addSection,
                    className: "rounded bg-gray-900 px-3 py-2 text-white disabled:opacity-50"
                  },
                  "Add"
                )
              )
            )
          )
        )
      )
    )
  );
}

function SectionFilter({ searchFilter, setSearchFilter }) {
  return React.createElement("input", {
    type: "search",
    placeholder: "Search sections",
    "aria-label": "Search sections",
    className: "w-full rounded border px-3 py-2",
    "data-testid": "section-filter",
    value: searchFilter,
    onChange: (event) => setSearchFilter(event.target.value)
  });
}

function kebabCaseToTitleCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
  getTemplate
}) {
  const [searchFilter, setSearchFilter] = useState("");
  const [pageRefreshed, setPageRefreshed] = useState(false);
  const [addAction, setAddAction] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SELECTED_SECTIONS_KEY);
      if (stored) {
        setSelectedSectionSlugs(JSON.parse(stored));
      }
    } catch (error) {
      console.error(error);
    }
  }, [setSelectedSectionSlugs]);

  useEffect(() => {
    localStorage.setItem(
      SELECTED_SECTIONS_KEY,
      JSON.stringify(selectedSectionSlugs)
    );
  }, [selectedSectionSlugs]);

  const filteredSlugs = useMemo(() => {
    const filter = searchFilter.toLowerCase();
    return sectionSlugs.filter((slug) => {
      const template = getTemplate(slug);
      return template && (
        !filter ||
        template.name.toLowerCase().includes(filter) ||
        slug.toLowerCase().includes(filter)
      );
    });
  }, [sectionSlugs, searchFilter, getTemplate]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    setSectionSlugs((slugs) => {
      const oldIndex = slugs.indexOf(active.id);
      const newIndex = slugs.indexOf(over.id);
      return arrayMove(slugs, oldIndex, newIndex);
    });
  };

  const deleteSection = (slug) => {
    setSectionSlugs((slugs) => slugs.filter((item) => item !== slug));
    setSelectedSectionSlugs((slugs) => slugs.filter((item) => item !== slug));

    if (focusedSectionSlug === slug) {
      setFocusedSectionSlug(null);
      localStorage.removeItem(FOCUSED_SECTION_KEY);
    }

    localStorage.removeItem(slug);
  };

  const restoreTemplate = () => {
    setTemplates(originalTemplate);
    setSectionSlugs(originalTemplate.map((template) => template.slug));
    deleteBackup();
  };

  return React.createElement(
    "section",
    { className: "sections-column" },
    React.createElement(
      "div",
      { className: "mb-3 flex items-center justify-between gap-2" },
      React.createElement("h3", { className: "text-lg font-medium" }, "Sections"),
      React.createElement(CustomSection, {
        setTemplates,
        setSelectedSectionSlugs,
        setFocusedSectionSlug,
        setPageRefreshed,
        setAddAction
      })
    ),
    React.createElement(SectionFilter, {
      searchFilter,
      setSearchFilter
    }),
    React.createElement(
      DndContext,
      {
        sensors,
        collisionDetection: closestCenter,
        modifiers: [restrictToVerticalAxis],
        onDragStart: () => setIsDragging(true),
        onDragEnd: (event) => {
          setIsDragging(false);
          handleDragEnd(event);
        },
        onDragCancel: () => setIsDragging(false)
      },
      React.createElement(
        SortableContext,
        {
          items: filteredSlugs,
          strategy: verticalListSortingStrategy
        },
        React.createElement(
          "ul",
          { className: "mt-3 space-y-1" },
          filteredSlugs.map((slug) => {
            const section = getTemplate(slug);
            if (!section) return null;

            return React.createElement(SortableItem, {
              key: slug,
              id: slug,
              section,
              focusedSectionSlug,
              setFocusedSectionSlug,
              deleteSection
            });
          })
        )
      )
    ),
    selectedSectionSlugs.length > 0 &&
      React.createElement(
        "button",
        {
          type: "button",
          onClick: restoreTemplate,
          className: "mt-4 text-sm text-gray-600 underline"
        },
        "Restore sections"
      )
  );
}

module.exports = {
  SectionsColumn
};
