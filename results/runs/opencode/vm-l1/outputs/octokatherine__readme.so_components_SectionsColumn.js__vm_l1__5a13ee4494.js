"use strict";

const React = require("react");
const { Dialog, Transition } = require("@headlessui/react");
const {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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

const h = React.createElement;

function readStoredJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.error(error);
    return fallback;
  }
}

function useReadmeBackup() {
  const [backup, setBackup] = React.useState(null);

  React.useEffect(() => {
    setBackup(readStoredJson("readme-backup", null));
  }, []);

  function saveBackup(value) {
    try {
      localStorage.setItem("readme-backup", JSON.stringify(value));
      setBackup(value);
    } catch (error) {
      console.error(error);
    }
  }

  function deleteBackup() {
    try {
      localStorage.removeItem("readme-backup");
      setBackup(null);
    } catch (error) {
      console.error(error);
    }
  }

  return { backup, saveBackup, deleteBackup };
}

function sectionTitle(section) {
  return section.name || kebabCaseToTitleCase(section.slug || "");
}

const SortableItem = React.memo(function SortableItem({
  id,
  section,
  focusedSectionSlug,
  setFocusedSectionSlug,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const select = () => setFocusedSectionSlug(section.slug);

  return h(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: select,
      onKeyUp: (event) => event.key === "Enter" && select(),
      className:
        "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer " +
        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
        `focus:ring-emerald-400 relative select-none transition-colors ${
          isDragging ? "opacity-50" : ""
        }`,
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
    h("p", null, sectionTitle(section)),
    section.slug === focusedSectionSlug &&
      h("span", {
        className: "absolute right-4 w-2 h-2 rounded-full bg-emerald-400",
        "aria-label": "Selected section",
      }),
  );
});

function CustomSection({ setSelectedSectionSlugs, setFocusedSectionSlug }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const inputRef = React.useRef(null);

  function close() {
    setIsOpen(false);
    setName("");
  }

  function addSection(event) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const section = { slug, name: trimmedName, custom: true };
    setSelectedSectionSlugs((sections) => [...sections, section]);
    setFocusedSectionSlug(slug);
    close();
  }

  return h(
    React.Fragment,
    null,
    h(
      Transition,
      { show: isOpen },
      h(
        Dialog,
        {
          as: "div",
          className: "fixed z-10 inset-0 overflow-y-auto",
          initialFocus: inputRef,
          onClose: close,
        },
        h(
          "div",
          { className: "min-h-screen px-4 text-center" },
          h(Dialog.Overlay, { className: "fixed inset-0 bg-black opacity-30" }),
          h(
            "form",
            {
              className: "inline-block p-6 my-20 overflow-hidden text-left align-middle bg-white shadow-xl rounded-md",
              onSubmit: addSection,
            },
            h(Dialog.Title, { className: "text-lg font-medium" }, "Add a custom section"),
            h("input", {
              ref: inputRef,
              value: name,
              onChange: (event) => setName(event.target.value),
              className: "w-full mt-4 py-2 px-3 border rounded-md",
              placeholder: "Section name",
            }),
            h(
              "div",
              { className: "mt-4 flex justify-end gap-2" },
              h("button", { type: "button", onClick: close }, "Cancel"),
              h("button", { type: "submit" }, "Add section"),
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
        {
          className:
            "flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white font-bold " +
            "rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 " +
            "focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
          type: "button",
          onClick: () => setIsOpen(true),
        },
        h("span", { className: "mr-2 text-xl" }, "+"),
        h("span", null, "Add custom section"),
      ),
    ),
  );
}

function SectionFilter({ setSearchFilter }) {
  return h("input", {
    type: "text",
    placeholder: "Search for a section",
    "aria-label": "Search for a section",
    className:
      "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none " +
      "focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
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
  const [pageRefreshed, setPageRefreshed] = React.useState(false);
  const [addAction, setAddAction] = React.useState(false);
  const [filteredSections, setFilteredSections] = React.useState([]);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [activeSection, setActiveSection] = React.useState(null);
  useReadmeBackup();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  React.useEffect(() => {
    const storedSections = readStoredJson("current-slug-list", null);
    const initialSections = storedSections || selectedSectionSlugs;
    setSectionSlugs(initialSections);
    const initialFocus = localStorage.getItem("current-focused-slug") || "title-and-description";
    setFocusedSectionSlug(initialFocus);
    setPageRefreshed(true);
  }, []);

  React.useEffect(() => {
    if (!pageRefreshed) return;
    localStorage.setItem("current-slug-list", JSON.stringify(sectionSlugs));
  }, [sectionSlugs, pageRefreshed]);

  React.useEffect(() => {
    const query = searchFilter.toLowerCase();
    setFilteredSections(
      selectedSectionSlugs.filter((section) =>
        sectionTitle(section).toLowerCase().includes(query),
      ),
    );
  }, [searchFilter, selectedSectionSlugs]);

  React.useEffect(() => {
    if (focusedSectionSlug) localStorage.setItem("current-focused-slug", focusedSectionSlug);
  }, [focusedSectionSlug]);

  function handleDragStart(event) {
    setActiveSection(sectionSlugs.find((section) => section.slug === event.active.id) || null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveSection(null);
    if (!over || active.id === over.id) return;
    setSectionSlugs((sections) => {
      const oldIndex = sections.findIndex((section) => section.slug === active.id);
      const newIndex = sections.findIndex((section) => section.slug === over.id);
      return arrayMove(sections, oldIndex, newIndex);
    });
  }

  const availableSections = searchFilter ? filteredSections : selectedSectionSlugs;

  return h(
    "div",
    { className: "sections w-full md:w-64 lg:w-80" },
    h(
      "h3",
      {
        className:
          "px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 " +
          "whitespace-nowrap focus:outline-none",
      },
      "Sections",
      h(
        "button",
        {
          className:
            "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right " +
            "hover:text-emerald-600 transition-colors",
          type: "button",
          onClick: () => setAddAction((value) => !value),
        },
        h("span", { className: "sr-only" }, "Add section"),
        h("img", { className: "w-5 h-5", src: "add.svg", alt: "Add section" }),
      ),
    ),
    h(
      "div",
      { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      addAction &&
        h(CustomSection, { setSelectedSectionSlugs, setFocusedSectionSlug }),
      h(
        "ul",
        { className: "mb-12 space-y-3" },
        h(
          DndContext,
          {
            sensors,
            collisionDetection: closestCenter,
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
            modifiers: [restrictToVerticalAxis],
          },
          h(
            SortableContext,
            {
              items: sectionSlugs.map((section) => section.slug),
              strategy: verticalListSortingStrategy,
            },
            sectionSlugs.map((section) =>
              h(SortableItem, {
                key: section.slug,
                id: section.slug,
                section,
                focusedSectionSlug,
                setFocusedSectionSlug,
              }),
            ),
          ),
          h(DragOverlay, null, activeSection && h("div", null, sectionTitle(activeSection))),
        ),
      ),
      h(SectionFilter, { searchFilter, setSearchFilter }),
      h(CustomSection, {
        setSelectedSectionSlugs,
        setFocusedSectionSlug,
        setPageRefreshed,
        setAddAction,
        setTemplates,
        templates,
        originalTemplate,
        getTemplate,
      }),
      h(
        "ul",
        { className: "mb-12 space-y-3" },
        availableSections.map((section) =>
          h(SortableItem, {
            key: section.slug,
            id: section.slug,
            section,
            focusedSectionSlug,
            setFocusedSectionSlug,
          }),
        ),
      ),
    ),
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionsColumn = SectionsColumn;
