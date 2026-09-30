var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, { get: exports[name], enumerable: true });
  }
};
var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let name of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, name) && name !== except) {
        __defProp(target, name, {
          get: () => source[name],
          enumerable: !(descriptor = __getOwnPropDesc(source, name)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};
var __toCommonJS = moduleValue =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleValue);

var SectionsColumn_exports = {};
__export(SectionsColumn_exports, { SectionsColumn: () => SectionsColumn });
module.exports = __toCommonJS(SectionsColumn_exports);

var React = require("react");
var { memo, useEffect, useMemo, useRef, useState } = React;
var { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } = require("@headlessui/react");
var { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } = require("@dnd-kit/core");
var { restrictToVerticalAxis } = require("@dnd-kit/modifiers");
var { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } = require("@dnd-kit/sortable");
var { CSS } = require("@dnd-kit/utilities");

function useLocalStorage() {
  const [backup, setBackup] = useState(null);
  const [saveTimer, setSaveTimer] = useState(null);

  useEffect(() => {
    const storedBackup = localStorage.getItem("readme-backup");
    if (storedBackup) setBackup(JSON.parse(storedBackup));
  }, []);

  const saveBackup = templates => {
    try {
      if (saveTimer) clearTimeout(saveTimer);
      setSaveTimer(setTimeout(() => {
        localStorage.setItem("readme-backup", JSON.stringify(templates));
      }, 1_000));
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

var SortableItem = memo(function SortableItem({
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
    localStorage.setItem("current-focused-slug", id);
    setFocusedSectionSlug(id);
  };
  const deleteSection = event => onDeleteSection(event, section.slug);
  const resetSection = event => {
    if (window.confirm("The section will be reset to default template; to continue, click OK")) {
      onResetSection(event, section.slug);
    }
  };
  const focusOnEnter = event => {
    if (event.key.toLowerCase() === "enter") focusSection();
  };
  const isFocused = section.slug === focusedSectionSlug;

  return React.createElement("li", {
    ref: setNodeRef,
    style,
    ...attributes,
    onClick: focusSection,
    onKeyUp: focusOnEnter,
    className: `bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors ${isFocused ? "ring-2 ring-emerald-400" : ""}`,
  },
  React.createElement("button", {
    type: "button",
    className: "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
    ...listeners,
  }, React.createElement("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" })),
  React.createElement("p", null, section.name),
  isFocused && React.createElement(React.Fragment, null,
    React.createElement("button", {
      className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
      type: "button", "aria-label": "Reset section", onClick: resetSection,
    }, React.createElement("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" })),
    React.createElement("button", {
      className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
      type: "button", "aria-label": "Delete section", onClick: deleteSection,
    }, React.createElement("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" })),
  ));
});

var CustomSection = ({
  setTemplates,
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const { saveBackup } = useLocalStorage();
  const titleInput = useRef(null);

  const addSection = event => {
    if (event) event.preventDefault();
    if (!title) return;
    setShowDialog(false);
    const section = {
      slug: `custom-${title.toLowerCase().replace(/\s/g, "-")}`,
      name: title,
      markdown: `\n## ${title}`,
    };
    localStorage.setItem("current-focused-slug", section.slug);
    setTemplates(templates => {
      const updatedTemplates = [...templates, section];
      saveBackup(updatedTemplates);
      return updatedTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs(slugs => [...slugs, section.slug]);
    setFocusedSectionSlug(localStorage.getItem("current-focused-slug"));
  };

  return React.createElement(React.Fragment, null,
    React.createElement(Transition, { show: showDialog },
      React.createElement(Dialog, {
        as: "div", className: "fixed z-10 inset-0 overflow-y-auto", initialFocus: titleInput,
        onClose: () => setShowDialog(false),
      }, React.createElement("div", { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" },
        React.createElement(TransitionChild, {
          enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100",
          leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0",
        }, React.createElement(DialogBackdrop, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" })),
        React.createElement("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, "\u200B"),
        React.createElement(TransitionChild, {
          enter: "ease-out duration-300", enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95", enterTo: "opacity-100 translate-y-0 sm:scale-100",
          leave: "ease-in duration-200", leaveFrom: "opacity-100 translate-y-0 sm:scale-100", leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
        }, React.createElement(DialogPanel, { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" },
          React.createElement("form", { onSubmit: addSection },
            React.createElement("div", { className: "mt-3 text-center sm:mt-5" },
              React.createElement(DialogTitle, { as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, "New Custom Section"),
              React.createElement("div", { className: "my-4" }, React.createElement("input", {
                ref: titleInput, type: "text", name: "title", id: "title",
                onChange: event => setTitle(event.target.value),
                className: "shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 block w-full sm:text-sm border border-gray-300 rounded-md",
                placeholder: "Section Title", "aria-label": "Section title",
              }))),
            React.createElement("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense" },
              React.createElement("button", {
                type: "button", disabled: !title, onClick: addSection,
                className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:col-start-2 sm:text-sm disabled:opacity-50",
              }, "Add Section"),
              React.createElement("button", {
                type: "button", onClick: () => setShowDialog(false),
                className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm",
              }, "Cancel")))))))),
    React.createElement("div", { className: "mb-3" }, React.createElement("button", {
      className: "flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white font-bold rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
      type: "button", onClick: () => setShowDialog(true),
    }, React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" },
      React.createElement("path", { fillRule: "evenodd", d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z", clipRule: "evenodd" })),
    React.createElement("span", { className: "ml-1" }, "Custom Section"))));
};

var SectionFilter = ({ searchFilter, setSearchFilter }) => React.createElement("input", {
  type: "text",
  placeholder: "Search for a section",
  "aria-label": "Search for a section",
  className: "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
  "data-testid": "slugs-filter",
  value: searchFilter,
  onChange: event => setSearchFilter(event.target.value),
});

var kebabCaseToTitleCase = value => value
  .split("-")
  .map(word => word.slice(0, 1).toUpperCase() + word.slice(1))
  .join(" ");

var SectionsColumn = ({
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
}) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [pageRefreshed, setPageRefreshed] = useState(false);
  const [addAction, setAddAction] = useState(false);
  const [storedSlugs, setStoredSlugs] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [filteredSlugs, setFilteredSlugs] = useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  useEffect(() => {
    const storedSlugList = localStorage.getItem("current-slug-list") === null
      ? "title-and-description"
      : localStorage.getItem("current-slug-list");
    setStoredSlugs(storedSlugList);
    if (storedSlugList.length > 0) {
      setPageRefreshed(true);
      const slugs = storedSlugList.split(",");
      slugs.forEach(slug => setSectionSlugs(available => available.filter(item => item !== slug)));
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem("current-focused-slug", slugs[0]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("current-slug-list", selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  useEffect(() => {
    if (!searchFilter) {
      setFilteredSlugs([]);
      return;
    }
    const matches = sectionSlugs.filter(slug =>
      getTemplate(slug).name.toLowerCase().includes(searchFilter.trim().toLowerCase()),
    );
    setFilteredSlugs(matches.length ? matches : [undefined]);
  }, [searchFilter]);

  const removeSlug = (slugs, slug) => slugs.filter(item => item !== slug);
  const clearSearch = () => setSearchFilter("");

  const addSection = (event, slug) => {
    localStorage.setItem("current-focused-slug", slug);
    setPageRefreshed(false);
    setAddAction(true);
    setSectionSlugs(slugs => removeSlug(slugs, slug));
    setFilteredSlugs(slugs => removeSlug(slugs, slug));
    setSelectedSectionSlugs(slugs => [...slugs, slug]);
    setFocusedSectionSlug(localStorage.getItem("current-focused-slug"));
    clearSearch();
  };

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over.id) {
      setSelectedSectionSlugs(slugs => {
        const oldIndex = slugs.findIndex(slug => slug === active.id);
        const newIndex = slugs.findIndex(slug => slug === over.id);
        return arrayMove(slugs, oldIndex, newIndex);
      });
    }
  };

  const deleteSection = (event, slug) => {
    event.stopPropagation();
    setSelectedSectionSlugs(slugs => slugs.filter(item => item !== slug));
    setSectionSlugs(slugs => [...slugs, slug]);
    setFocusedSectionSlug(null);
    localStorage.setItem("current-focused-slug", "noEdit");
  };

  const resetSection = (event, slug) => {
    event.stopPropagation();
    let restoredSection;
    if (slug.slice(0, 6) === "custom") {
      const title = kebabCaseToTitleCase(slug.slice(6));
      restoredSection = { slug, name: title, markdown: `\n## ${title}` };
    } else {
      restoredSection = originalTemplate.find(section => section.slug === slug);
    }
    const restoredTemplates = templates.map(section =>
      section.slug === restoredSection.slug ? restoredSection : section,
    );
    setTemplates(restoredTemplates);
    saveBackup(restoredTemplates);
  };

  const resetAllSections = () => {
    const currentSlugs = localStorage.getItem("current-slug-list");
    if (window.confirm("All sections of your readme will be removed; to continue, click OK")) {
      const removedSlugs = currentSlugs ? currentSlugs.split(",") : [];
      setSectionSlugs(slugs => [...slugs, ...removedSlugs].filter(slug => slug !== "title-and-description"));
      setSelectedSectionSlugs(["title-and-description"]);
      setFocusedSectionSlug("title-and-description");
      localStorage.setItem("current-focused-slug", "noEdit");
      setTemplates(originalTemplate);
      deleteBackup();
    }
  };

  const selectedSlugs = useMemo(
    () => pageRefreshed || addAction ? [...new Set(selectedSectionSlugs)] : selectedSectionSlugs,
    [selectedSectionSlugs, pageRefreshed, addAction],
  );

  const availableSlugs = useMemo(() => {
    const slugs = [...sectionSlugs];
    if (pageRefreshed && storedSlugs.indexOf("title-and-description") === -1 && !slugs.includes("title-and-description")) {
      slugs.push("title-and-description");
    }
    const displayedSlugs = filteredSlugs.length ? [...filteredSlugs].sort() : slugs.sort();
    return pageRefreshed || addAction ? [...new Set(displayedSlugs)] : displayedSlugs;
  }, [sectionSlugs, filteredSlugs, pageRefreshed, addAction, storedSlugs]);

  return React.createElement("div", { className: "sections w-full md:w-64 lg:w-80" },
    React.createElement("h3", { className: "px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none" },
      "Sections",
      React.createElement("button", {
        className: "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors",
        type: "button", onClick: resetAllSections,
      }, React.createElement("span", { className: "pl-2 float-right" }, "Reset"),
      React.createElement("img", { className: "w-auto h-5 inline-block", src: "reset.svg", alt: "Reset" }))),
    React.createElement("div", { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      selectedSectionSlugs.length > 0 && React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900" }, "Click on a section below to edit the contents"),
      React.createElement("ul", { className: "mb-12 space-y-3" },
        React.createElement(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, modifiers: [restrictToVerticalAxis] },
          React.createElement(SortableContext, { items: selectedSlugs }, selectedSlugs.map(slug => {
            const section = getTemplate(slug);
            return section && React.createElement(SortableItem, {
              key: slug, id: slug, section, focusedSectionSlug, setFocusedSectionSlug,
              onDeleteSection: deleteSection, onResetSection: resetSection,
            });
          })))),
      sectionSlugs.length > 0 && React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" }, "Click on a section below to add it to your readme"),
      React.createElement(SectionFilter, { searchFilter, setSearchFilter }),
      React.createElement(CustomSection, {
        setSelectedSectionSlugs, setFocusedSectionSlug, setpageRefreshed: setPageRefreshed,
        setAddAction, setTemplates,
      }),
      React.createElement("ul", { className: "mb-12 space-y-3" }, availableSlugs.map(slug => {
        if (slug === undefined) {
          return React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900", key: "unavailable-section" }, "The section you're looking for is unavailable");
        }
        const section = getTemplate(slug);
        return section && React.createElement("li", { key: slug },
          React.createElement("button", {
            className: "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
            type: "button", onClick: event => addSection(event, slug),
          }, React.createElement("span", null, section.name)));
      }))));
};
