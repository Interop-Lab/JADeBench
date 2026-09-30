"use strict";

const React = require("react");
const {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} = require("@dnd-kit/core");
const {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} = require("@dnd-kit/sortable");
const { restrictToVerticalAxis } = require("@dnd-kit/modifiers");
const { CSS } = require("@dnd-kit/utilities");
const { Dialog, Transition } = require("@headlessui/react");

const h = React.createElement;
const BACKUP_KEY = "readme-backup";
const CURRENT_SLUG_KEY = "current-slug";
const CURRENT_SLUG_LIST_KEY = "current-slug-list";
const CUSTOM_SLUG_PREFIX = "custom-";

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const saveTimer = React.useRef(null);

  React.useEffect(() => {
    const storedBackup = localStorage.getItem(BACKUP_KEY);
    if (storedBackup) setBackup(JSON.parse(storedBackup));
  }, []);

  const saveBackup = React.useCallback((templates) => {
    try {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(templates));
      }, 5594);
    } catch (error) {
      console.error("Failed to save local backup", error);
    }
  }, []);

  const deleteBackup = React.useCallback(() => {
    try {
      localStorage.removeItem(BACKUP_KEY);
      setBackup(null);
    } catch (error) {
      console.error("Failed to delete local backup", error);
    }
  }, []);

  return { backup, saveBackup, deleteBackup };
}

function icon(src, alt) {
  return h("img", { className: "h-5 w-5", src, alt });
}

const SortableItem = React.memo(function SortableItem({
  id,
  template,
  focusedSectionSlug,
  setFocusedSectionSlug,
  onResetSection,
  onDeleteSection,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isFocused = template.slug === focusedSectionSlug;
  const isCustom = template.slug.startsWith(CUSTOM_SLUG_PREFIX);

  const focusSection = () => {
    localStorage.setItem(CURRENT_SLUG_KEY, id);
    setFocusedSectionSlug(id);
  };

  const handleKeyUp = (event) => {
    if (event.key.toLowerCase() === "enter") focusSection();
  };

  const resetSection = (event) => {
    event.stopPropagation();
    if (window.confirm("The section will reset to default template; to continue, click OK")) {
      onResetSection(event, template.slug);
    }
  };

  const deleteSection = (event) => {
    event.stopPropagation();
    onDeleteSection(event, template.slug);
  };

  return h(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: focusSection,
      onKeyUp: handleKeyUp,
      className:
        "relative flex items-center cursor-pointer bg-white shadow hover:bg-gray-50 " +
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 " +
        "transition-colors " +
        (isFocused ? "ring-2 ring-emerald-400" : ""),
    },
    h(
      "button",
      {
        type: "button",
        className: "p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400",
        ...listeners,
      },
      icon("/icons/reorder.svg", "Reorder section"),
    ),
    h("p", null, template.name),
    !isCustom &&
      h(
        React.Fragment,
        null,
        h(
          "button",
          {
            className: "absolute right-8 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400",
            type: "button",
            "aria-label": "Reset section",
            onClick: resetSection,
          },
          icon("/icons/reset.svg", "Reset section"),
        ),
        h(
          "button",
          {
            className: "absolute right-0 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400",
            type: "button",
            "aria-label": "Delete section",
            onClick: deleteSection,
          },
          icon("/icons/delete.svg", "Delete section"),
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
  const [sectionName, setSectionName] = React.useState("");
  const inputRef = React.useRef(null);
  const { saveBackup } = useLocalStorage();

  const addSection = (event) => {
    event?.preventDefault();
    if (!sectionName) return;

    setShow(false);
    const slug = CUSTOM_SLUG_PREFIX + sectionName.toLowerCase().replace(/\s/g, "-");
    const section = { slug, name: sectionName, markdown: `## ${sectionName}` };
    localStorage.setItem(CURRENT_SLUG_KEY, slug);
    setTemplates((templates) => {
      const nextTemplates = [...templates, section];
      saveBackup(nextTemplates);
      return nextTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(localStorage.getItem(CURRENT_SLUG_KEY));
  };

  return h(
    React.Fragment,
    null,
    h(
      Transition,
      { show },
      h(
        Dialog,
        {
          as: "div",
          className: "fixed z-10 inset-0 overflow-y-auto",
          initialFocus: inputRef,
          onClose: () => setShow(false),
        },
        h(
          "div",
          { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" },
          h(Dialog.Overlay, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }),
          h("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": true }, "\u200b"),
          h(
            Dialog.Panel,
            { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" },
            h(
              "form",
              { onSubmit: addSection },
              h(
                "div",
                { className: "mt-3 sm:mt-5" },
                h(Dialog.Title, { as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, "New Custom Section"),
                h(
                  "div",
                  { className: "mt-2" },
                  h("input", {
                    ref: inputRef,
                    type: "text",
                    name: "section-name",
                    id: "section-name",
                    value: sectionName,
                    onChange: (event) => setSectionName(event.target.value),
                    className: "w-full p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 border border-gray-300 rounded-md",
                    placeholder: "Section name",
                    "aria-label": "Section name",
                  }),
                ),
              ),
              h(
                "div",
                { className: "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3" },
                h(
                  "button",
                  {
                    type: "submit",
                    className: "inline-flex justify-center rounded-md px-4 py-2 bg-emerald-600 text-white disabled:opacity-50",
                    disabled: !sectionName,
                  },
                  "Add Section",
                ),
                h(
                  "button",
                  { type: "button", className: "inline-flex justify-center rounded-md px-4 py-2 border", onClick: () => setShow(false) },
                  "Cancel",
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      { className: "mb-3" },
      h(
        "button",
        { className: "flex items-center justify-center w-full py-2 bg-white rounded-md shadow", type: "button", onClick: () => setShow(true) },
        h("span", { className: "mr-2" }, "+"),
        "Add custom section",
      ),
    ),
  );
}

function SectionFilter({ searchFilter, setSearchFilter }) {
  return h("input", {
    type: "text",
    placeholder: "Search for a section",
    "aria-label": "Search for a section",
    className: "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-emerald-400",
    "data-testid": "slugs-filter",
    value: searchFilter,
    onChange: (event) => setSearchFilter(event.target.value),
  });
}

function kebabCaseToTitleCase(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [pageRefreshed, setPageRefreshed] = React.useState(false);
  const [addAction, setAddAction] = React.useState(false);
  const [addedSectionSlugs, setAddedSectionSlugs] = React.useState([]);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [filteredSectionSlugs, setFilteredSectionSlugs] = React.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  React.useEffect(() => {
    const currentSlugList = localStorage.getItem(CURRENT_SLUG_LIST_KEY) || "";
    setAddedSectionSlugs(currentSlugList);
    if (currentSlugList.length > 0) {
      setPageRefreshed(true);
      const slugs = currentSlugList.split(",");
      slugs.forEach((slug) => setSectionSlugs((items) => items.filter((item) => item !== slug)));
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem(CURRENT_SLUG_KEY, slugs[0]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(CURRENT_SLUG_LIST_KEY, selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  const removeSlug = (slugs, slug) => slugs.filter((item) => item !== slug);

  const deleteSection = (event, slug) => {
    event.stopPropagation();
    localStorage.removeItem(slug);
    setSectionSlugs((slugs) => removeSlug(slugs, slug));
    setSelectedSectionSlugs((slugs) => removeSlug(slugs, slug));
    setFilteredSectionSlugs((slugs) => removeSlug(slugs, slug));
    setFocusedSectionSlug(localStorage.getItem(CURRENT_SLUG_KEY));
    setAddAction(true);
    setPageRefreshed(false);
    setSearchFilter("");
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setSelectedSectionSlugs((slugs) => {
      const oldIndex = slugs.findIndex((slug) => slug === active.id);
      const newIndex = slugs.findIndex((slug) => slug === over.id);
      return arrayMove(slugs, oldIndex, newIndex);
    });
  };

  const removeSelectedSection = (event, slug) => {
    event.stopPropagation();
    setSelectedSectionSlugs((slugs) => slugs.filter((item) => item !== slug));
    setSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(null);
    localStorage.setItem(CURRENT_SLUG_KEY, "");
  };

  const resetSection = (event, slug) => {
    event.stopPropagation();
    let replacement;
    if (slug.startsWith(CUSTOM_SLUG_PREFIX)) {
      const name = kebabCaseToTitleCase(slug.slice(CUSTOM_SLUG_PREFIX.length));
      replacement = { slug, name, markdown: `## ${name}` };
    } else {
      replacement = originalTemplate.find((template) => template.slug === slug);
    }
    if (!replacement) return;

    const nextTemplates = templates.map((template) =>
      template.slug === replacement.slug ? replacement : template,
    );
    setTemplates(nextTemplates);
    saveBackup(nextTemplates);
  };

  const restoreDefaults = () => {
    const storedSlugs = localStorage.getItem(CURRENT_SLUG_LIST_KEY);
    if (!window.confirm("Reset all sections to their defaults?")) return;
    const customSlugs = storedSlugs ? storedSlugs.split(",") : [];
    setSectionSlugs((slugs) => [...slugs, ...customSlugs].filter((slug) => !slug.startsWith(CUSTOM_SLUG_PREFIX)));
    setSelectedSectionSlugs([]);
    setFocusedSectionSlug(null);
    localStorage.setItem(CURRENT_SLUG_KEY, "");
    setTemplates(originalTemplate);
    deleteBackup();
  };

  const selectedSlugs = pageRefreshed && addAction
    ? [...new Set(selectedSectionSlugs)]
    : selectedSectionSlugs;

  const availableSlugs = React.useMemo(() => {
    let slugs = [...sectionSlugs];
    if (pageRefreshed && addedSectionSlugs.includes(CUSTOM_SLUG_PREFIX)) {
      if (!slugs.includes(CUSTOM_SLUG_PREFIX)) slugs.push(CUSTOM_SLUG_PREFIX);
    }
    const ordered = filteredSectionSlugs.length
      ? [...filteredSectionSlugs].reverse()
      : [...slugs].reverse();
    return pageRefreshed && addAction ? [...new Set(ordered)] : ordered;
  }, [sectionSlugs, filteredSectionSlugs, pageRefreshed, addAction, addedSectionSlugs]);

  const filterSections = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = sectionSlugs.filter((slug) => {
      const template = getTemplate(slug);
      return template.name.toLowerCase().includes(normalizedQuery);
    });
    return matches.length ? matches : [undefined];
  };

  React.useEffect(() => {
    if (!searchFilter) {
      setFilteredSectionSlugs([]);
      return;
    }
    setFilteredSectionSlugs(filterSections(searchFilter));
  }, [searchFilter]);

  return h(
    "section",
    { className: "sections-column" },
    h(
      "h3",
      { className: "flex items-center justify-between" },
      "Sections",
      h(
        "button",
        { className: "p-2", type: "button", onClick: restoreDefaults },
        h("span", { className: "sr-only" }, "Reset sections"),
        icon("/icons/reset.svg", "Reset sections"),
      ),
    ),
    h(
      "div",
      { className: "selected-sections" },
      selectedSlugs.length > 0 && h("h4", null, "Selected sections"),
      h(
        "ul",
        null,
        h(
          DndContext,
          { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis] },
          h(
            SortableContext,
            { items: selectedSlugs, strategy: verticalListSortingStrategy },
            selectedSlugs.map((slug) => {
              const template = getTemplate(slug);
              return template
                ? h(SortableItem, {
                    key: slug,
                    id: slug,
                    template,
                    focusedSectionSlug,
                    setFocusedSectionSlug,
                    onResetSection: resetSection,
                    onDeleteSection: removeSelectedSection,
                  })
                : null;
            }),
          ),
        ),
      ),
    ),
    sectionSlugs.length > 0 && h("h4", null, "Available sections"),
    h(SectionFilter, { searchFilter, setSearchFilter }),
    h(CustomSection, {
      setSelectedSectionSlugs,
      setFocusedSectionSlug,
      setpageRefreshed: setPageRefreshed,
      setAddAction,
      setTemplates,
    }),
    h(
      "ul",
      { className: "available-sections" },
      availableSlugs.map((slug) => {
        if (slug === undefined) return h("h4", { key: "no-results" }, "No sections found");
        const template = getTemplate(slug);
        if (!template) return null;
        return h(
          "li",
          { key: slug },
          h(
            "button",
            { className: "w-full p-2 text-left", type: "button", onClick: (event) => deleteSection(event, slug) },
            h("span", null, template.name),
          ),
        );
      }),
    ),
  );
}

module.exports = { SectionsColumn };
