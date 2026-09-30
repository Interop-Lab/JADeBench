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
  useSortable,
} = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");
const { restrictToVerticalAxis } = require("@dnd-kit/modifiers");
const { Dialog, Transition } = require("@headlessui/react");

const h = React.createElement;
const BACKUP_KEY = "readme-backup";
const CURRENT_SLUG_LIST_KEY = "current-slug-list";
const FOCUSED_SECTION_KEY = "current-focused-slug";
const DEFAULT_SECTION_SLUG = "title-and-description";

function useLocalStorage() {
  const [backup, setBackup] = React.useState(null);
  const [saveTimer, setSaveTimer] = React.useState(null);

  React.useEffect(() => {
    const storedBackup = localStorage.getItem(BACKUP_KEY);
    if (storedBackup) setBackup(JSON.parse(storedBackup));
  }, []);

  function saveBackup(value) {
    if (saveTimer) clearTimeout(saveTimer);
    setSaveTimer(
      setTimeout(() => {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(value));
      }, 1000),
    );
  }

  function deleteBackup() {
    localStorage.removeItem(BACKUP_KEY);
  }

  return { backup, saveBackup, deleteBackup };
}

function kebabCaseToTitleCase(value) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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

  function focusSection() {
    localStorage.setItem(FOCUSED_SECTION_KEY, section.slug);
    setFocusedSectionSlug(section.slug);
  }

  function handleKeyUp(event) {
    if (event.key === "Enter") focusSection();
  }

  const isFocused = focusedSectionSlug === section.slug;

  return h(
    "li",
    {
      ref: setNodeRef,
      style: { transform: CSS.Transform.toString(transform), transition },
      ...attributes,
      onClick: focusSection,
      onKeyUp: handleKeyUp,
      className:
        "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " +
        (isFocused ? "ring-2 ring-emerald-400" : ""),
    },
    h(
      "button",
      {
        type: "button",
        className: "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners,
      },
      h("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" }),
    ),
    h("p", null, section.name),
    isFocused
      ? h(
          React.Fragment,
          null,
          h(
            "button",
            {
              className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
              type: "button",
              "aria-label": "Reset section",
              onClick: (event) => onResetSection(event, section.slug),
            },
            h("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" }),
          ),
          h(
            "button",
            {
              className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
              type: "button",
              "aria-label": "Delete section",
              onClick: (event) => onDeleteSection(event, section.slug),
            },
            h("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" }),
          ),
        )
      : false,
  );
});

function CustomSection({
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction,
  setTemplates,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const titleInput = React.useRef(null);
  const { saveBackup } = useLocalStorage();

  React.useEffect(() => {
    if (!isOpen) setTitle("");
  }, [isOpen]);

  function closeDialog() {
    setIsOpen(false);
  }

  function addSection(event) {
    event.preventDefault();
    closeDialog();

    const slug = `custom-${title.toLowerCase().replaceAll(" ", "-")}`;
    const section = {
      slug,
      name: title,
      markdown: `\n## ${title}`,
    };

    localStorage.setItem(FOCUSED_SECTION_KEY, slug);
    setTemplates((templates) => {
      const updatedTemplates = [...templates, section];
      saveBackup(updatedTemplates);
      return updatedTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(localStorage.getItem(FOCUSED_SECTION_KEY));
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
          initialFocus: titleInput,
          onClose: closeDialog,
        },
        h(
          "div",
          { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" },
          h(
            Transition.Child,
            {
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
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
              enterTo: "opacity-100 translate-y-0 sm:scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
              leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            },
            h(
              Dialog.Panel,
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
                h("button", {
                  type: "button",
                  className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:col-start-2 sm:text-sm disabled:opacity-50",
                  disabled: !title,
                  onClick: addSection,
                  children: "Add Section",
                }),
                h("button", {
                  type: "button",
                  className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm",
                  onClick: closeDialog,
                  children: "Cancel",
                }),
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
    value: searchFilter,
    onChange: (event) => setSearchFilter(event.target.value),
  });
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
  const [, setPageRefreshed] = React.useState(false);
  const [, setAddAction] = React.useState(false);
  const [searchFilter, setSearchFilter] = React.useState("");
  const [filteredSectionSlugs, setFilteredSectionSlugs] = React.useState(sectionSlugs);
  const { saveBackup, deleteBackup } = useLocalStorage();

  React.useEffect(() => {
    const storedSlugs = localStorage.getItem(CURRENT_SLUG_LIST_KEY);
    if (storedSlugs) setSelectedSectionSlugs(JSON.parse(storedSlugs));
  }, []);

  React.useEffect(() => {
    const normalizedFilter = searchFilter.toLowerCase();
    setFilteredSectionSlugs(
      sectionSlugs.filter((section) =>
        section.name.toLowerCase().includes(normalizedFilter),
      ),
    );
  }, [searchFilter, sectionSlugs]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {}),
  );

  const selectedSections = selectedSectionSlugs.map((slug) => getTemplate(slug));

  function resetReadme() {
    localStorage.getItem(CURRENT_SLUG_LIST_KEY);
    if (!window.confirm("All sections of your readme will be removed; to continue, click OK")) return;

    setSectionSlugs(sectionSlugs);
    setSelectedSectionSlugs([DEFAULT_SECTION_SLUG]);
    setFocusedSectionSlug(DEFAULT_SECTION_SLUG);
    localStorage.setItem(FOCUSED_SECTION_KEY, "noEdit");
    setTemplates(originalTemplate);
    deleteBackup();
  }

  function handleDragEnd({ active, over }) {
    const oldIndex = selectedSectionSlugs.indexOf(active.id);
    const newIndex = selectedSectionSlugs.indexOf(over.id);
    setSelectedSectionSlugs(arrayMove(selectedSectionSlugs, oldIndex, newIndex));
  }

  function deleteSection(event, slug) {
    event.stopPropagation();
    setSelectedSectionSlugs((slugs) => slugs.filter((item) => item !== slug));
    setSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(null);
    localStorage.setItem(FOCUSED_SECTION_KEY, "noEdit");
  }

  function resetSection(event, slug) {
    event.stopPropagation();
    setTemplates((currentTemplates) => {
      const originalSection = originalTemplate.find((section) => section.slug === slug);
      const updatedTemplates = currentTemplates.map((section) =>
        section.slug === slug ? originalSection : section,
      );
      saveBackup(updatedTemplates);
      return updatedTemplates;
    });
  }

  function addSection(section) {
    localStorage.setItem(FOCUSED_SECTION_KEY, section);
    setPageRefreshed(false);
    setAddAction(true);
    setSectionSlugs((slugs) => slugs.filter((item) => item !== section));
    setFilteredSectionSlugs((slugs) => slugs.filter((item) => item !== section));
    setSelectedSectionSlugs((slugs) => [...slugs, section]);
    setFocusedSectionSlug(localStorage.getItem(FOCUSED_SECTION_KEY));
    setSearchFilter("");
  }

  const availableSections = filteredSectionSlugs.filter(
    (section) => !selectedSectionSlugs.includes(section),
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
        { className: "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors", type: "button", onClick: resetReadme },
        h("span", { className: "pl-2 float-right" }, "Reset"),
        h("img", { className: "w-auto h-5 inline-block", src: "reset.svg", alt: "Reset" }),
      ),
    ),
    h(
      "div",
      { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      selectedSectionSlugs.length > 0 && h("h4", { className: "mb-3 text-xs leading-6 text-gray-900" }, "Click on a section below to edit the contents"),
      h(
        "ul",
        { className: "mb-12 space-y-3" },
        h(
          DndContext,
          { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis] },
          h(
            SortableContext,
            { items: selectedSectionSlugs },
            selectedSections.map((section) => h(SortableItem, {
              key: section.slug,
              id: section.slug,
              section,
              focusedSectionSlug,
              setFocusedSectionSlug,
              onDeleteSection: deleteSection,
              onResetSection: resetSection,
            })),
          ),
        ),
      ),
      availableSections.length > 0 && h("h4", { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" }, "Click on a section below to add it to your readme"),
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
        { className: "mb-12 space-y-3" },
        availableSections.map((section) => h(
          "li",
          { key: section },
          h(
            "button",
            { className: "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors", type: "button", onClick: () => addSection(section) },
            h("span", null, kebabCaseToTitleCase(section.slug || section)),
          ),
        )),
      ),
    ),
  );
}

module.exports = { SectionsColumn };
