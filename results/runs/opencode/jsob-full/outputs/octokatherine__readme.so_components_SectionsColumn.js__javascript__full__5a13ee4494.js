const React = require("react");
const { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } = require("@headlessui/react");
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
const BACKUP_KEY = "readme-backup";
const DEFAULT_SECTION_SLUG = "title-and-description";

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [saveTimer, setSaveTimer] = React.useState(null);

  React.useEffect(() => {
    const savedBackup = localStorage.getItem(BACKUP_KEY);
    if (savedBackup) setBackup(JSON.parse(savedBackup));
  }, []);

  const saveBackup = (templates) => {
    try {
      if (saveTimer) clearTimeout(saveTimer);
      setSaveTimer(setTimeout(() => {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(templates));
      }, 500));
    } catch (_error) {
      console.error("Failed to create local backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem(BACKUP_KEY);
    } catch (_error) {
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const focusSection = () => {
    localStorage.setItem(CURRENT_FOCUSED_SLUG, id);
    setFocusedSectionSlug(id);
  };

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: focusSection,
      onKeyUp: (event) => event.key.toLowerCase() === "enter" && focusSection(),
      className: `bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors ${
        section.slug === focusedSectionSlug ? "ring-2 ring-emerald-400" : ""
      }`,
    },
    React.createElement(
      "button",
      { type: "button", className: "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400", ...listeners },
      React.createElement("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" }),
    ),
    React.createElement("p", null, section.name),
    section.slug === focusedSectionSlug && React.createElement(
      React.Fragment,
      null,
      React.createElement(
        "button",
        {
          className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
          type: "button",
          "aria-label": "Reset section",
          onClick: (event) => onResetSection(event, section.slug),
        },
        React.createElement("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" }),
      ),
      React.createElement(
        "button",
        {
          className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
          type: "button",
          "aria-label": "Delete section",
          onClick: (event) => onDeleteSection(event, section.slug),
        },
        React.createElement("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" }),
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
  const inputRef = React.useRef(null);

  const addSection = (event) => {
    event?.preventDefault();
    if (!title) return;
    setShow(false);

    const section = {
      slug: `custom-${title.toLowerCase().replace(/\s/g, "-")}`,
      name: title,
      markdown: `\n## ${title}`,
    };
    localStorage.setItem(CURRENT_FOCUSED_SLUG, section.slug);
    setTemplates((templates) => {
      const updated = [...templates, section];
      saveBackup(updated);
      return updated;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((slugs) => [...slugs, section.slug]);
    setFocusedSectionSlug(localStorage.getItem(CURRENT_FOCUSED_SLUG));
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Transition,
      { show },
      React.createElement(
        Dialog,
        { as: "div", className: "fixed z-10 inset-0 overflow-y-auto", initialFocus: inputRef, onClose: () => setShow(false) },
        React.createElement(
          "div",
          { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" },
          React.createElement(
            TransitionChild,
            { enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" },
            React.createElement(DialogBackdrop, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }),
          ),
          React.createElement("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, "\u200B"),
          React.createElement(
            TransitionChild,
            { enter: "ease-out duration-300", enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95", enterTo: "opacity-100 translate-y-0 sm:scale-100", leave: "ease-in duration-200", leaveFrom: "opacity-100 translate-y-0 sm:scale-100", leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" },
            React.createElement(
              DialogPanel,
              { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" },
              React.createElement(
                "form",
                { onSubmit: addSection },
                React.createElement(
                  "div",
                  { className: "mt-3 text-center sm:mt-5" },
                  React.createElement(DialogTitle, { as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, "New Custom Section"),
                  React.createElement(
                    "div",
                    { className: "my-4" },
                    React.createElement("input", {
                      ref: inputRef,
                      type: "text",
                      name: "title",
                      id: "title",
                      onChange: (event) => setTitle(event.target.value),
                      className: "shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 block w-full sm:text-sm border border-gray-300 rounded-md",
                      placeholder: "Section Title",
                      "aria-label": "Section title",
                    }),
                  ),
                ),
                React.createElement(
                  "div",
                  { className: "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense" },
                  React.createElement("button", { type: "button", disabled: !title, onClick: addSection }, "Add Section"),
                  React.createElement("button", { type: "button", onClick: () => setShow(false) }, "Cancel"),
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
      React.createElement("button", { type: "button", onClick: () => setShow(true) }, "+ ", React.createElement("span", null, "Custom Section")),
    ),
  );
}

function SectionFilter({ searchFilter, setSearchFilter }) {
  return React.createElement("input", {
    type: "text",
    placeholder: "Search for a section",
    "aria-label": "Search for a section",
    className: "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
    "data-testid": "slugs-filter",
    value: searchFilter,
    onChange: (event) => setSearchFilter(event.target.value),
  });
}

function kebabCaseToTitleCase(value) {
  return value.split("-").map((word) => word.slice(0, 1).toUpperCase() + word.slice(1)).join(" ");
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
  const [unavailableSections, setUnavailableSections] = React.useState([]);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [filteredSelectedSlugs, setFilteredSelectedSlugs] = React.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  React.useEffect(() => {
    const stored = localStorage.getItem(CURRENT_SLUG_LIST) ?? DEFAULT_SECTION_SLUG;
    setUnavailableSections(stored);
    if (stored.length > 0) {
      setPageRefreshed(true);
      const slugs = stored.split(",");
      slugs.forEach((slug) => setSectionSlugs((items) => items.filter((item) => item !== slug)));
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem(CURRENT_FOCUSED_SLUG, slugs[0]);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(CURRENT_SLUG_LIST, selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  const removeFromList = (items, value) => items.filter((item) => item !== value);

  const addSelectedSection = (event, slug) => {
    event.stopPropagation();
    localStorage.setItem(CURRENT_FOCUSED_SLUG, slug);
    setSectionSlugs((items) => removeFromList(items, slug));
    setSelectedSectionSlugs((items) => [...items, slug]);
    setFilteredSelectedSlugs((items) => removeFromList(items, slug));
    setFocusedSectionSlug(localStorage.getItem(CURRENT_FOCUSED_SLUG));
    setAddAction(true);
    setPageRefreshed(false);
    setSearchFilter("");
  };

  const deleteSection = (event, slug) => {
    event.stopPropagation();
    setSectionSlugs((items) => [...items, slug]);
    setSelectedSectionSlugs((items) => items.filter((item) => item !== slug));
    setFocusedSectionSlug(null);
    localStorage.setItem(CURRENT_FOCUSED_SLUG, "noEdit");
  };

  const resetSection = (event, slug) => {
    event.stopPropagation();
    let restored;
    if (slug.slice(0, 6) === "custom") {
      const title = kebabCaseToTitleCase(slug.slice(7));
      restored = { slug, name: title, markdown: `\n## ${title}` };
    } else {
      restored = originalTemplate.find((section) => section.slug === slug);
    }
    const updated = templates.map((section) => section.slug === restored.slug ? restored : section);
    setTemplates(updated);
    saveBackup(updated);
  };

  const resetAll = () => {
    const stored = localStorage.getItem(CURRENT_SLUG_LIST);
    if (!window.confirm("All sections of your readme will be removed; to continue, click OK")) return;
    const slugs = stored ? stored.split(",") : [];
    setSectionSlugs((items) => [...items, ...slugs].filter((slug) => slug !== DEFAULT_SECTION_SLUG));
    setSelectedSectionSlugs([DEFAULT_SECTION_SLUG]);
    setFocusedSectionSlug(DEFAULT_SECTION_SLUG);
    localStorage.setItem(CURRENT_FOCUSED_SLUG, DEFAULT_SECTION_SLUG);
    setTemplates(originalTemplate);
    deleteBackup();
  };

  const visibleSelectedSlugs = React.useMemo(
    () => pageRefreshed && addAction ? [...new Set(selectedSectionSlugs)] : selectedSectionSlugs,
    [selectedSectionSlugs, pageRefreshed, addAction],
  );

  const visibleAvailableSlugs = React.useMemo(() => {
    let slugs = [...sectionSlugs];
    if (
      pageRefreshed &&
      unavailableSections.indexOf(DEFAULT_SECTION_SLUG) !== -1 &&
      !slugs.includes(DEFAULT_SECTION_SLUG)
    ) {
      slugs.push(DEFAULT_SECTION_SLUG);
    }
    const filtered = filteredSelectedSlugs.length ? [...filteredSelectedSlugs].reverse() : [...slugs].reverse();
    return pageRefreshed && addAction ? [...new Set(filtered)] : filtered;
  }, [sectionSlugs, filteredSelectedSlugs, pageRefreshed, addAction, unavailableSections]);

  const filterSections = (query) => {
    const matches = sectionSlugs.filter((slug) => getTemplate(slug).name.toLowerCase().includes(query.toLowerCase()));
    return matches.length ? matches : [undefined];
  };

  React.useEffect(() => {
    setFilteredSelectedSlugs(searchFilter ? filterSections(searchFilter.trim()) : []);
  }, [searchFilter]);

  const handleDragEnd = ({ active, over }) => {
    if (active.id === over.id) return;
    setSelectedSectionSlugs((slugs) => arrayMove(slugs, slugs.indexOf(active.id), slugs.indexOf(over.id)));
  };

  return React.createElement(
    "div",
    { className: "sections w-full md:w-64 lg:w-80" },
    React.createElement(
      "h3",
      { className: "px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none" },
      "Sections",
      React.createElement(
        "button",
        { className: "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors", type: "button", onClick: resetAll },
        React.createElement("span", { className: "pl-2 float-right" }, "Reset"),
        React.createElement("img", { className: "w-auto h-5 inline-block", src: "reset.svg", alt: "Reset" }),
      ),
    ),
    React.createElement(
      "div",
      { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      selectedSectionSlugs.length > 0 && React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" }, "Click on a section below to edit the contents"),
      React.createElement(
        "ul",
        { className: "mb-12 space-y-3" },
        React.createElement(
          DndContext,
          { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis] },
          React.createElement(
            SortableContext,
            { items: visibleSelectedSlugs },
            visibleSelectedSlugs.map((slug) => {
              const section = getTemplate(slug);
              return section && React.createElement(SortableItem, {
                key: slug,
                id: slug,
                section,
                focusedSectionSlug,
                setFocusedSectionSlug,
                onDeleteSection: deleteSection,
                onResetSection: resetSection,
              });
            }),
          ),
        ),
      ),
      sectionSlugs.length > 0 && React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" }, "Click on a section below to add it to your readme"),
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
        { className: "mb-12 space-y-3" },
        visibleAvailableSlugs.map((slug) => {
          if (slug === undefined) return React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900", key: "unavailable-section" }, "The section you're looking for is unavailable");
          const section = getTemplate(slug);
          return section && React.createElement(
            "li",
            { key: slug },
            React.createElement("button", { className: "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors", type: "button", onClick: (event) => addSelectedSection(event, slug) }, React.createElement("span", null, section.name)),
          );
        }),
      ),
    ),
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "SectionsColumn", { enumerable: true, get: () => SectionsColumn });
