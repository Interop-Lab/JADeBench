const React = require("react");
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
  verticalListSortingStrategy,
} = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");
const { Dialog, Transition } = require("@headlessui/react");

const h = React.createElement;
const DEFAULT_SECTION = "title-and-description";
const FOCUSED_SECTION_KEY = "current-focused-slug";
const SELECTED_SECTIONS_KEY = "current-slug-list";
const BACKUP_KEY = "readme-backup";

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [pendingSave, setPendingSave] = React.useState(null);

  React.useEffect(() => {
    const storedBackup = localStorage.getItem(BACKUP_KEY);
    if (storedBackup) {
      try {
        setBackup(JSON.parse(storedBackup));
      } catch (error) {
        console.error("Failed to parse local backup", error);
      }
    }
  }, []);

  const saveBackup = React.useCallback(
    (value) => {
      if (pendingSave) clearTimeout(pendingSave);
      const timeout = setTimeout(() => {
        try {
          localStorage.setItem(BACKUP_KEY, JSON.stringify(value));
          setBackup(value);
        } catch (error) {
          console.error("Failed to save local backup", error);
        }
      }, 1000);
      setPendingSave(timeout);
    },
    [pendingSave],
  );

  const deleteBackup = React.useCallback(() => {
    try {
      localStorage.removeItem(BACKUP_KEY);
    } catch (error) {
      console.error("Failed to delete local backup", error);
    }
  }, []);

  return { backup, saveBackup, deleteBackup };
}

function focusSection(slug, setFocusedSectionSlug) {
  localStorage.setItem(FOCUSED_SECTION_KEY, slug);
  setFocusedSectionSlug(slug);
}

const SortableItem = React.memo(function SortableItem({
  id,
  section,
  focusedSectionSlug,
  setFocusedSectionSlug,
  onDeleteSection,
  onResetSection,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const selected = section.slug === focusedSectionSlug;
  const style = { transform: CSS.Transform.toString(transform), transition };

  const selectSection = () => focusSection(section.slug, setFocusedSectionSlug);
  const selectSectionFromKeyboard = (event) => {
    if (event.key === "Enter" || event.key === " ") selectSection();
  };
  const runRowAction = (handler) => (event) => {
    event.stopPropagation();
    handler(event);
  };

  return h(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      role: "button",
      onClick: selectSection,
      onKeyUp: selectSectionFromKeyboard,
      className:
        "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " +
        (selected ? "ring-2 ring-emerald-400" : ""),
    },
    h(
      "button",
      {
        type: "button",
        className:
          "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners,
      },
      h("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" }),
    ),
    h("p", null, section.name),
    selected &&
      h(
        React.Fragment,
        null,
        h(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
            type: "button",
            "aria-label": "Reset section",
            onClick: runRowAction(onResetSection),
          },
          h("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" }),
        ),
        h(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
            type: "button",
            "aria-label": "Delete section",
            onClick: runRowAction(onDeleteSection),
          },
          h("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" }),
        ),
      ),
  );
});

function slugifyCustomSection(title) {
  return "custom-" + title.trim().toLowerCase().replace(/\s+/g, "-");
}

function CustomSection({
  setSelectedSectionSlugs,
  setTemplates,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const titleInput = React.useRef(null);
  const { saveBackup } = useLocalStorage();

  const closeDialog = () => setIsOpen(false);
  const addSection = (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    const slug = slugifyCustomSection(title);
    const newSection = { slug, name: title, markdown: "\n## " + title };
    closeDialog();
    localStorage.setItem(FOCUSED_SECTION_KEY, slug);
    setTemplates((templates) => {
      const nextTemplates = [...templates, newSection];
      saveBackup(nextTemplates);
      return nextTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(localStorage.getItem(FOCUSED_SECTION_KEY));
  };

  const dialog = h(
    Transition.Root,
    { show: isOpen, as: React.Fragment },
    h(
      Dialog,
      { as: "div", className: "fixed z-10 inset-0 overflow-y-auto", initialFocus: titleInput, onClose: closeDialog },
      h(
        "div",
        { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" },
        h(
          Transition.Child,
          {
            as: React.Fragment,
            enter: "ease-out duration-300",
            enterFrom: "opacity-0",
            enterTo: "opacity-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100",
            leaveTo: "opacity-0",
          },
          h("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" }),
        ),
        h("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, "​"),
        h(
          Transition.Child,
          {
            as: React.Fragment,
            enter: "ease-out duration-300",
            enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            enterTo: "opacity-100 translate-y-0 sm:scale-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
            leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
          },
          h(
            "div",
            { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" },
            h(
              "form",
              { onSubmit: addSection },
              h(
                "div",
                { className: "mt-3 text-center sm:mt-5" },
                h(Dialog.Title, { as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, "New Custom Section"),
                h(
                  "div",
                  { className: "my-4" },
                  h("input", {
                    ref: titleInput,
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
            ),
            h(
              "div",
              { className: "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense" },
              h(
                "button",
                {
                  type: "button",
                  className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:col-start-2 sm:text-sm disabled:opacity-50",
                  disabled: !title,
                  onClick: addSection,
                },
                "Add Section",
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm",
                  onClick: closeDialog,
                },
                "Cancel",
              ),
            ),
          ),
        ),
      ),
    ),
  );

  return h(
    React.Fragment,
    null,
    dialog,
    h(
      "div",
      { className: "mb-3" },
      h(
        "button",
        {
          className: "flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white font-bold rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
          type: "button",
          onClick: () => setIsOpen(true),
        },
        h(
          "svg",
          { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
          h("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" }),
        ),
        h("span", { className: "ml-1" }, "Custom Section"),
      ),
    ),
  );
}

function SectionFilter({ searchFilter, setSearchFilter }) {
  return h("input", {
    type: "text",
    placeholder: "Search for a section",
    "aria-label": "Search for a section",
    className: "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
    "data-testid": "slugs-filter",
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
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [pageRefreshed, setpageRefreshed] = React.useState(false);
  const [addAction, setAddAction] = React.useState(false);
  const [activeSectionSlug, setActiveSectionSlug] = React.useState([]);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [filteredSectionSlugs, setFilteredSectionSlugs] = React.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  React.useEffect(() => {
    const storedSlugs = localStorage.getItem(SELECTED_SECTIONS_KEY);
    if (storedSlugs) {
      const restoredSlugs = storedSlugs.split(",").filter(Boolean);
      setSelectedSectionSlugs(restoredSlugs);
      setSectionSlugs((slugs) => slugs.filter((slug) => !restoredSlugs.includes(slug)));
      const restoredFocus = localStorage.getItem(FOCUSED_SECTION_KEY) || restoredSlugs[0];
      setActiveSectionSlug(restoredFocus);
      setFocusedSectionSlug(restoredFocus);
    } else {
      setActiveSectionSlug(DEFAULT_SECTION);
      setpageRefreshed(true);
      setSectionSlugs((slugs) => slugs.filter((slug) => slug !== DEFAULT_SECTION));
      setSelectedSectionSlugs([DEFAULT_SECTION]);
      focusSection(DEFAULT_SECTION, setFocusedSectionSlug);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(SELECTED_SECTIONS_KEY, selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  const selectedSlugs = React.useMemo(
    () => [...selectedSectionSlugs],
    [selectedSectionSlugs, pageRefreshed, addAction],
  );
  const availableSlugs = React.useMemo(
    () => [...sectionSlugs].sort((left, right) => kebabCaseToTitleCase(left).localeCompare(kebabCaseToTitleCase(right))),
    [sectionSlugs, selectedSectionSlugs, pageRefreshed, addAction, filteredSectionSlugs],
  );

  React.useEffect(() => {
    const query = searchFilter.toLowerCase();
    setFilteredSectionSlugs(
      availableSlugs.filter((slug) => getTemplate(slug).name.toLowerCase().includes(query)),
    );
  }, [searchFilter]);

  const displayedAvailableSlugs = searchFilter ? filteredSectionSlugs : availableSlugs;
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setSelectedSectionSlugs((slugs) => {
      const oldIndex = slugs.indexOf(active.id);
      const newIndex = slugs.indexOf(over.id);
      return arrayMove(slugs, oldIndex, newIndex);
    });
  };

  const deleteSection = (slug) => {
    setSelectedSectionSlugs((slugs) => slugs.filter((item) => item !== slug));
    if (slug.startsWith("custom-")) {
      setSectionSlugs((slugs) => slugs.filter((item) => item !== slug));
      setTemplates((currentTemplates) => currentTemplates.filter((template) => template.slug !== slug));
    } else {
      setSectionSlugs((slugs) => (slugs.includes(slug) ? slugs : [...slugs, slug]));
    }
    focusSection("noEdit", setFocusedSectionSlug);
  };

  const resetSection = (slug) => {
    const original = originalTemplate.find((template) => template.slug === slug);
    if (!original) return;
    setTemplates((currentTemplates) => {
      const nextTemplates = currentTemplates.map((template) =>
        template.slug === slug ? { ...original } : template,
      );
      saveBackup(nextTemplates);
      return nextTemplates;
    });
  };

  const resetAllSections = () => {
    saveBackup(templates);
    const restoredTemplates = originalTemplate.map((template) => ({ ...template }));
    setTemplates(restoredTemplates);
    setSelectedSectionSlugs([DEFAULT_SECTION]);
    setSectionSlugs(
      restoredTemplates.map((template) => template.slug).filter((slug) => slug !== DEFAULT_SECTION),
    );
    focusSection(DEFAULT_SECTION, setFocusedSectionSlug);
    deleteBackup();
  };

  const addSection = (slug) => {
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setSectionSlugs((slugs) => slugs.filter((item) => item !== slug));
    setpageRefreshed(false);
    setAddAction(true);
    focusSection(slug, setFocusedSectionSlug);
  };

  const selectedList = h(
    "ul",
    { className: "mb-12 space-y-3" },
    h(
      DndContext,
      { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis] },
      h(
        SortableContext,
        { items: selectedSlugs, strategy: verticalListSortingStrategy },
        selectedSlugs.map((slug) =>
          h(SortableItem, {
            key: slug,
            id: slug,
            section: getTemplate(slug),
            focusedSectionSlug,
            setFocusedSectionSlug,
            onDeleteSection: () => deleteSection(slug),
            onResetSection: () => resetSection(slug),
          }),
        ),
      ),
    ),
  );

  const availableList = h(
    "ul",
    { className: "mb-12 space-y-3" },
    displayedAvailableSlugs.map((slug) => {
      const section = getTemplate(slug);
      return h(
        "li",
        { key: slug },
        h(
          "button",
          {
            className: "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
            type: "button",
            onClick: () => addSection(slug),
          },
          h("span", null, section.name),
        ),
      );
    }),
  );

  return h(
    "div",
    { className: "sections w-full md:w-64 lg:w-80" },
    h(
      "h3",
      { className: "px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none" },
      "Sections",
      h(
        "button",
        { className: "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors", type: "button", onClick: resetAllSections },
        h("span", { className: "pl-2 float-right" }, "Reset"),
        h("img", { className: "w-auto h-5 inline-block", src: "reset.svg", alt: "Reset" }),
      ),
    ),
    h(
      "div",
      { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      h("h4", { className: "mb-3 text-xs leading-6 text-gray-900" }, "Click on a section below to edit the contents"),
      selectedList,
      h("h4", { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" }, "Click on a section below to add it to your readme"),
      h(SectionFilter, { searchFilter, setSearchFilter }),
      h(CustomSection, { setSelectedSectionSlugs, setFocusedSectionSlug, setpageRefreshed, setAddAction, setTemplates }),
      availableList,
    ),
  );
}

module.exports = { SectionsColumn };
