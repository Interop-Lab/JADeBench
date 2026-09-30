var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var SectionsColumn_exports = {};
__export(SectionsColumn_exports, {
  default: () => SectionsColumn
});
module.exports = __toCommonJS(SectionsColumn_exports);
var import_react = require("react");

function useLocalStorage() {
  const [backup, setBackup] = import_react.useState(null);
  const [timeoutId, setTimeoutId] = import_react.useState(null);
  
  import_react.useEffect(() => {
    const saved = localStorage.getItem("readme-backup");
    if (saved) {
      setBackup(JSON.parse(saved));
    }
  }, []);
  
  const saveBackup = (data) => {
    try {
      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(setTimeout(() => {
        localStorage.setItem("readme-backup", JSON.stringify(data));
      }, 3000));
    } catch (e) {
      console.error("Failed to save backup");
    }
  };
  
  const deleteBackup = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (e) {
      console.error("Failed to delete backup");
    }
  };
  
  return { backup, saveBackup, deleteBackup };
}

var import_react2 = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem = import_react2.forwardRef(function SortableItem2(props, ref) {
  const { attributes, listeners, setNodeRef, transform, transition } = import_sortable.useSortable({
    id: props.id
  });
  
  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };
  
  const handleClick = () => {
    localStorage.setItem("focused-section-slug", props.id);
    props.setFocusedSectionSlug(props.id);
  };
  
  const handleKeyUp = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  };
  
  const handleRemove = (e) => {
    e.stopPropagation();
    props.setSelectedSectionSlugs((prev) => prev.filter((s) => s !== props.id));
    props.setSectionSlugs((prev) => [...prev, props.id]);
    props.setFocusedSectionSlug(null);
    localStorage.setItem("selected-section-slugs", props.setSelectedSectionSlugs.toString());
    localStorage.setItem("section-slugs", props.setSectionSlugs.toString());
  };
  
  const handleMoveUp = (e) => {
    e.stopPropagation();
    const confirm = window.confirm("Are you sure you want to move this section up?");
    if (confirm) {
      const currentIndex = props.selectedSectionSlugs.indexOf(props.id);
      if (currentIndex > 0) {
        const newSlugs = [...props.selectedSectionSlugs];
        [newSlugs[currentIndex], newSlugs[currentIndex - 1]] = [newSlugs[currentIndex - 1], newSlugs[currentIndex]];
        props.setSelectedSectionSlugs(newSlugs);
        localStorage.setItem("selected-section-slugs", newSlugs.join(","));
        localStorage.setItem("focused-section-slug", newSlugs[0]);
        props.setFocusedSectionSlug(newSlugs[0]);
      }
    }
  };
  
  const handleMoveDown = (e) => {
    e.stopPropagation();
    const confirm = window.confirm("Are you sure you want to move this section down?");
    if (confirm) {
      const currentIndex = props.selectedSectionSlugs.indexOf(props.id);
      if (currentIndex < props.selectedSectionSlugs.length - 1) {
        const newSlugs = [...props.selectedSectionSlugs];
        [newSlugs[currentIndex], newSlugs[currentIndex + 1]] = [newSlugs[currentIndex + 1], newSlugs[currentIndex]];
        props.setSelectedSectionSlugs(newSlugs);
        localStorage.setItem("selected-section-slugs", newSlugs.join(","));
        localStorage.setItem("focused-section-slug", newSlugs[newSlugs.length - 1]);
        props.setFocusedSectionSlug(newSlugs[newSlugs.length - 1]);
      }
    }
  };
  
  return React.createElement("li", {
    ref: setNodeRef,
    style,
    ...attributes,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    className: "cursor-pointer select-none flex items-center justify-between px-2 py-1 mb-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent focus:border-blue-500 focus:outline-none " + (props.id === props.focusedSectionSlug ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : "")
  }, React.createElement("div", {
    type: "button",
    className: "flex items-center flex-1 min-w-0",
    ...listeners
  }, React.createElement("img", {
    className: "w-4 h-4 mr-2 opacity-50",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z' clip-rule='evenodd'/%3E%3C/svg%3E",
    alt: "Drag handle"
  }), React.createElement("p", null, props.section.name)), props.id === props.focusedSectionSlug && React.createElement(React.Fragment, null, React.createElement("button", {
    className: "ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
    type: "button",
    "aria-label": "Move up",
    onClick: handleMoveUp
  }, React.createElement("img", {
    className: "w-4 h-4",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z' clip-rule='evenodd'/%3E%3C/svg%3E",
    alt: "Move up"
  })), React.createElement("button", {
    className: "ml-2 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
    type: "button",
    "aria-label": "Move down",
    onClick: handleMoveDown
  }, React.createElement("img", {
    className: "w-4 h-4",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E",
    alt: "Move down"
  })), React.createElement("button", {
    className: "ml-2 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300",
    type: "button",
    "aria-label": "Remove section",
    onClick: handleRemove
  }, React.createElement("img", {
    className: "w-4 h-4",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E",
    alt: "Remove"
  }))));
});

var import_react3 = require("react");
var import_react4 = require("@headlessui/react");

var CustomSection = ({ setTemplates, setSelectedSectionSlugs, setFocusedSectionSlug, setpageRefreshed, setAddAction }) => {
  const [isOpen, setIsOpen] = import_react3.useState(false);
  const [sectionName, setSectionName] = import_react3.useState("");
  const { saveBackup } = useLocalStorage();
  const inputRef = import_react3.useRef(null);
  
  const handleAdd = () => {
    if (!sectionName) return;
    setIsOpen(false);
    const newTemplate = {
      slug: "custom-" + sectionName.toLowerCase().replace(/\s/g, "-"),
      name: sectionName,
      markdown: "## " + sectionName
    };
    localStorage.setItem("custom-section-slug", newTemplate.slug);
    setTemplates((prev) => {
      const updated = [...prev, newTemplate];
      saveBackup(updated);
      return updated;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((prev) => [...prev, newTemplate.slug]);
    setFocusedSectionSlug(localStorage.getItem("custom-section-slug"));
  };
  
  return React.createElement(React.Fragment, null, React.createElement(import_react4.Transition.Root, { show: isOpen }, React.createElement(import_react4.Dialog, {
    as: "div",
    className: "fixed inset-0 z-10 overflow-y-auto",
    initialFocus: inputRef,
    onClose: () => setIsOpen(false)
  }, React.createElement("div", { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" }, React.createElement(import_react4.Transition.Child, {
    enter: "ease-out duration-300",
    enterFrom: "opacity-0",
    enterTo: "opacity-100",
    leave: "ease-in duration-200",
    leaveFrom: "opacity-100",
    leaveTo: "opacity-0"
  }, React.createElement(import_react4.Dialog.Overlay, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" })), React.createElement("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, "\u200B"), React.createElement(import_react4.Transition.Child, {
    enter: "ease-out duration-300",
    enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
    enterTo: "opacity-100 translate-y-0 sm:scale-100",
    leave: "ease-in duration-200",
    leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
    leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  }, React.createElement(import_react4.Dialog.Panel, { className: "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" }, React.createElement("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4" }, React.createElement("div", { className: "sm:flex sm:items-start" }, React.createElement("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left" }, React.createElement(import_react4.Dialog.Title, { as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, "Add Custom Section"), React.createElement("div", { className: "mt-2" }, React.createElement("input", {
    ref: inputRef,
    type: "text",
    name: "section-name",
    id: "section-name",
    onChange: (e) => setSectionName(e.target.value),
    className: "shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md",
    placeholder: "Section name",
    "aria-label": "Section name"
  }))))), React.createElement("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse" }, React.createElement("button", {
    type: "button",
    className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm",
    disabled: !sectionName,
    onClick: handleAdd
  }, "Add"), React.createElement("button", {
    type: "button",
    className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",
    onClick: () => setIsOpen(false)
  }, "Cancel")))))), React.createElement("button", {
    className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
    type: "button",
    onClick: () => setIsOpen(true)
  }, React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    className: "-ml-0.5 mr-2 h-4 w-4",
    viewBox: "0 0 20 20",
    fill: "currentColor"
  }, React.createElement("path", {
    fillRule: "evenodd",
    d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
    clipRule: "evenodd"
  })), React.createElement("span", { className: "ml-2" }, "Add custom section")));
};

var CustomSection_default = CustomSection;

var SectionFilter = ({ searchFilter, setSearchFilter }) => {
  const strings = {
    type: "text",
    placeholder: "Filter sections...",
    ariaLabel: "Filter sections",
    className: "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white",
    dataTestid: "section-filter"
  };
  
  return React.createElement("input", {
    type: strings.type,
    placeholder: strings.placeholder,
    "aria-label": strings.ariaLabel,
    className: strings.className,
    "data-testid": strings.dataTestid,
    value: searchFilter,
    onChange: (e) => setSearchFilter(e.target.value)
  });
};

var SectionFilter_default = SectionFilter;

var import_core = require("@dnd-kit/core");
var import_modifiers = require("@dnd-kit/modifiers");
var import_sortable2 = require("@dnd-kit/sortable");
var import_react5 = require("react");

var kebabCaseToTitleCase = (str) => {
  return str.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
};

var SectionsColumn = ({ selectedSectionSlugs, setSelectedSectionSlugs, sectionSlugs, setSectionSlugs, setFocusedSectionSlug, focusedSectionSlug, templates, originalTemplate, setTemplates, getTemplate }) => {
  const sensors = import_core.useSensors(
    import_core.useSensor(import_core.PointerSensor),
    import_core.useSensor(import_core.KeyboardSensor, {
      coordinateGetter: import_sortable2.sortableKeyboardCoordinates
    })
  );
  
  const [isSearchFocused, setIsSearchFocused] = import_react5.useState(false);
  const [isSearchHovered, setIsSearchHovered] = import_react5.useState(false);
  const [searchFilter, setSearchFilter] = import_react5.useState("");
  const [filteredSlugs, setFilteredSlugs] = import_react5.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();
  
  import_react5.useEffect(() => {
    const saved = localStorage.getItem("selected-section-slugs") !== null ? localStorage.getItem("selected-section-slugs") : localStorage.getItem("section-slugs");
    setSectionSlugs(saved);
    if (saved && saved.length > 0) {
      setIsSearchFocused(true);
      const slugs = saved.split(",");
      slugs.forEach((slug) => {
        setSectionSlugs((prev) => prev.filter((s) => s !== slug));
      });
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem("focused-section-slug", slugs[0]);
    }
  }, []);
  
  import_react5.useEffect(() => {
    localStorage.setItem("selected-section-slugs", selectedSectionSlugs);
  }, [selectedSectionSlugs]);
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedSectionSlugs((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return import_sortable2.arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const handleAdd = (e, slug) => {
    e.stopPropagation();
    setSectionSlugs((prev) => prev.filter((s) => s !== slug));
    setSelectedSectionSlugs((prev) => [...prev, slug]);
    localStorage.setItem("section-slugs", sectionSlugs.toString());
    setFocusedSectionSlug(null);
    setIsSearchFocused(false);
  };
  
  const handleRemove = (e, slug) => {
    e.stopPropagation();
    setSelectedSectionSlugs((prev) => prev.filter((s) => s !== slug));
    setSectionSlugs((prev) => [...prev, slug]);
    setFocusedSectionSlug(null);
    localStorage.setItem("selected-section-slugs", selectedSectionSlugs.toString());
    localStorage.setItem("section-slugs", sectionSlugs.toString());
  };
  
  const handleReset = () => {
    const confirm = window.confirm("Are you sure you want to reset all sections?");
    if (confirm) {
      const saved = localStorage.getItem("section-slugs");
      const slugs = saved ? saved.split(",") : [];
      setSectionSlugs((prev) => [...prev, ...slugs].filter((s) => s !== "title-and-description" && s !== "table-of-contents"));
      setSelectedSectionSlugs(["title-and-description"]);
      setFocusedSectionSlug("title-and-description");
      localStorage.setItem("selected-section-slugs", "title-and-description");
      localStorage.setItem("section-slugs", "table-of-contents");
      setTemplates(originalTemplate);
      deleteBackup();
    }
  };
  
  const visibleSlugs = import_react5.useMemo(() => {
    return isSearchFocused && isSearchHovered ? [...filteredSlugs] : [...sectionSlugs];
  }, [sectionSlugs, filteredSlugs, isSearchFocused, isSearchHovered]);
  
  const filterSlugs = (query) => {
    const filtered = sectionSlugs.filter((slug) => {
      const template = getTemplate(slug);
      return template && template.name.toLowerCase().includes(query.toLowerCase());
    });
    return filtered.length ? filtered : [void 0];
  };
  
  const clearSearch = () => setSearchFilter("");
  
  import_react5.useEffect(() => {
    if (!searchFilter) {
      setFilteredSlugs([]);
      return;
    }
    const results = filterSlugs(searchFilter.toLowerCase());
    setFilteredSlugs(results);
  }, [searchFilter]);
  
  const searchProps = {
    searchFilter,
    setSearchFilter: setSearchFilter
  };
  
  return React.createElement("div", { className: "flex flex-col h-full" }, React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700" }, React.createElement("h3", { className: "text-lg font-medium text-gray-900 dark:text-white" }, "Sections"), React.createElement("button", {
    className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
    type: "button",
    onClick: handleReset
  }, React.createElement("span", { className: "mr-2" }, "Reset"), React.createElement("img", {
    className: "w-4 h-4",
    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z' clip-rule='evenodd'/%3E%3C/svg%3E",
    alt: "Reset"
  }))), selectedSectionSlugs.length > 0 && React.createElement("h4", { className: "px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400" }, "Selected"), React.createElement("ul", { className: "flex-1 overflow-y-auto px-2" }, React.createElement(import_core.DndContext, {
    sensors,
    collisionDetection: import_core.closestCenter,
    onDragEnd: handleDragEnd,
    modifiers: [import_modifiers.restrictToVerticalAxis]
  }, React.createElement(import_sortable2.SortableContext, {
    items: visibleSlugs
  }, visibleSlugs.map((slug) => {
    const section = getTemplate(slug);
    if (section) {
      return React.createElement(SortableItem, {
        key: slug,
        id: slug,
        section,
        focusedSectionSlug,
        setFocusedSectionSlug,
        selectedSectionSlugs,
        setSelectedSectionSlugs,
        setSectionSlugs
      });
    }
  })))), sectionSlugs.length > 0 && React.createElement("h4", { className: "px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400" }, "Available"), React.createElement(SectionFilter_default, searchProps), React.createElement(CustomSection_default, {
    setSelectedSectionSlugs,
    setFocusedSectionSlug,
    setpageRefreshed: setIsSearchFocused,
    setAddAction: setIsSearchHovered,
    setTemplates
  }), React.createElement("ul", { className: "flex-1 overflow-y-auto px-2" }, visibleSlugs.map((slug) => {
    if (slug === void 0) {
      return React.createElement("h4", {
        key: "no-results",
        className: "px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
      }, "No results found");
    } else {
      const section = getTemplate(slug);
      if (section) {
        return React.createElement("li", {
          key: slug,
          className: "cursor-pointer select-none flex items-center justify-between px-2 py-1 mb-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        }, React.createElement("button", {
          className: "flex items-center flex-1 min-w-0 text-left",
          type: "button",
          onClick: (e) => handleAdd(e, slug)
        }, React.createElement("span", null, section.name)));
      }
    }
  })));
};

var _export = {};
_export.default = SectionsColumn;
module.exports = _export;
