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

// ../work/octokatherine__readme.so/components/SectionsColumn.js
var SectionsColumn_exports = {};
__export(SectionsColumn_exports, {
  SectionsColumn: () => SectionsColumn
});
module.exports = __toCommonJS(SectionsColumn_exports);

// ../work/octokatherine__readme.so/hooks/useLocalStorage.js
var import_react = require("react");
function useLocalStorage() {
  const [backup, setBackup] = (0, import_react.useState)(null);
  const [timer, setTimer] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    const localBackup = localStorage.getItem("readme-backup");
    if (localBackup) {
      setBackup(JSON.parse(localBackup));
    }
  }, []);
  const saveBackup = (templates) => {
    try {
      if (timer) {
        clearTimeout(timer);
      }
      setTimer(
        setTimeout(() => {
          localStorage.setItem("readme-backup", JSON.stringify(templates));
        }, 1e3)
      );
    } catch (_) {
      console.error("Failed to create local backup");
    }
  };
  const deleteBackup = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (_) {
      console.error("Failed to delete local backup");
    }
  };
  return { backup, saveBackup, deleteBackup };
}

// ../work/octokatherine__readme.so/components/SortableItem.js
var import_react2 = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");
var SortableItem = (0, import_react2.memo)(function SortableItem2(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = (0, import_sortable.useSortable)({ id: props.id });
  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };
  const onClickSection = () => {
    localStorage.setItem("current-focused-slug", props.id);
    props.setFocusedSectionSlug(props.id);
  };
  const onClickTrash = (e) => {
    props.onDeleteSection(e, props.section.slug);
  };
  const onClickReset = (e) => {
    const sectionResetConfirmed = window.confirm(
      "The section will be reset to default template; to continue, click OK"
    );
    if (sectionResetConfirmed === true) {
      props.onResetSection(e, props.section.slug);
    }
  };
  const onKeyUp = (e) => {
    if (e.key.toLowerCase() === "enter") {
      onClickSection();
    }
  };
  return /* @__PURE__ */ React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: onClickSection,
      onKeyUp,
      className: `bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors ${props.section.slug === props.focusedSectionSlug ? "ring-2 ring-emerald-400" : ""}`
    },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners
      },
      /* @__PURE__ */ React.createElement("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" })
    ),
    /* @__PURE__ */ React.createElement("p", null, props.section.name),
    props.section.slug === props.focusedSectionSlug && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
        type: "button",
        "aria-label": "Reset section",
        onClick: onClickReset
      },
      /* @__PURE__ */ React.createElement("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" })
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
        type: "button",
        "aria-label": "Delete section",
        onClick: onClickTrash
      },
      /* @__PURE__ */ React.createElement("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" })
    ))
  );
});

// ../work/octokatherine__readme.so/components/CustomSection.js
var import_react3 = require("react");
var import_react4 = require("@headlessui/react");
var CustomSection = ({
  setTemplates,
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction
}) => {
  const [showModal, setShowModal] = (0, import_react3.useState)(false);
  const [title, setTitle] = (0, import_react3.useState)("");
  const { saveBackup } = useLocalStorage();
  const inputRef = (0, import_react3.useRef)(null);
  const addCustomSection = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!title) {
      return;
    }
    setShowModal(false);
    const section = {
      slug: "custom-" + title.toLowerCase().replace(/\s/g, "-"),
      name: title,
      markdown: `
## ${title}`
    };
    localStorage.setItem("current-focused-slug", section.slug);
    setTemplates((prev) => {
      const newTemplates = [...prev, section];
      saveBackup(newTemplates);
      return newTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((prev) => [...prev, section.slug]);
    setFocusedSectionSlug(localStorage.getItem("current-focused-slug"));
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(import_react4.Transition, { show: showModal }, /* @__PURE__ */ React.createElement(
    import_react4.Dialog,
    {
      as: "div",
      className: "fixed z-10 inset-0 overflow-y-auto",
      initialFocus: inputRef,
      onClose: () => setShowModal(false)
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" }, /* @__PURE__ */ React.createElement(
      import_react4.TransitionChild,
      {
        enter: "ease-out duration-300",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0"
      },
      /* @__PURE__ */ React.createElement(import_react4.DialogBackdrop, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" })
    ), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, "\u200B"), /* @__PURE__ */ React.createElement(
      import_react4.TransitionChild,
      {
        enter: "ease-out duration-300",
        enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
        enterTo: "opacity-100 translate-y-0 sm:scale-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
        leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      },
      /* @__PURE__ */ React.createElement(import_react4.DialogPanel, { className: "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" }, /* @__PURE__ */ React.createElement("form", { onSubmit: addCustomSection }, /* @__PURE__ */ React.createElement("div", { className: "mt-3 text-center sm:mt-5" }, /* @__PURE__ */ React.createElement(import_react4.DialogTitle, { as: "h3", className: "text-lg leading-6 font-medium text-gray-900" }, "New Custom Section"), /* @__PURE__ */ React.createElement("div", { className: "my-4" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          ref: inputRef,
          type: "text",
          name: "title",
          id: "title",
          onChange: (e) => setTitle(e.target.value),
          className: "shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 block w-full sm:text-sm border border-gray-300 rounded-md",
          placeholder: "Section Title",
          "aria-label": "Section title"
        }
      )))), /* @__PURE__ */ React.createElement("div", { className: "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:col-start-2 sm:text-sm disabled:opacity-50",
          disabled: !title,
          onClick: addCustomSection
        },
        "Add Section"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm",
          onClick: () => setShowModal(false)
        },
        "Cancel"
      )))
    ))
  )), /* @__PURE__ */ React.createElement("div", { className: "mb-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white font-bold rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
      type: "button",
      onClick: () => setShowModal(true)
    },
    /* @__PURE__ */ React.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        viewBox: "0 0 20 20",
        fill: "currentColor"
      },
      /* @__PURE__ */ React.createElement(
        "path",
        {
          fillRule: "evenodd",
          d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
          clipRule: "evenodd"
        }
      )
    ),
    /* @__PURE__ */ React.createElement("span", { className: "ml-1" }, "Custom Section")
  )));
};
var CustomSection_default = CustomSection;

// ../work/octokatherine__readme.so/components/SectionFilter.js
var SectionFilter = ({ searchFilter, setSearchFilter }) => {
  return /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      placeholder: "Search for a section",
      "aria-label": "Search for a section",
      className: "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
      "data-testid": "slugs-filter",
      value: searchFilter,
      onChange: (e) => setSearchFilter(e.target.value)
    }
  );
};
var SectionFilter_default = SectionFilter;

// ../work/octokatherine__readme.so/components/SectionsColumn.js
var import_core = require("@dnd-kit/core");
var import_modifiers = require("@dnd-kit/modifiers");
var import_sortable2 = require("@dnd-kit/sortable");
var import_react5 = require("react");
var kebabCaseToTitleCase = (str) => {
  return str.split("-").map((word) => {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
  }).join(" ");
};
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
  getTemplate
}) => {
  const sensors = (0, import_core.useSensors)(
    (0, import_core.useSensor)(import_core.MouseSensor),
    (0, import_core.useSensor)(import_core.TouchSensor),
    (0, import_core.useSensor)(import_core.KeyboardSensor, {
      coordinateGetter: import_sortable2.sortableKeyboardCoordinates
    })
  );
  const [pageRefreshed, setpageRefreshed] = (0, import_react5.useState)(false);
  const [addAction, setAddAction] = (0, import_react5.useState)(false);
  const [slugsFromPreviousSession, setSlugsFromPreviousSession] = (0, import_react5.useState)([]);
  const [searchFilter, setSearchFilter] = (0, import_react5.useState)("");
  const [filteredSlugs, setFilteredSlugs] = (0, import_react5.useState)([]);
  const { saveBackup, deleteBackup } = useLocalStorage();
  (0, import_react5.useEffect)(() => {
    const storedSlugs = localStorage.getItem("current-slug-list") === null ? "title-and-description" : localStorage.getItem("current-slug-list");
    setSlugsFromPreviousSession(storedSlugs);
    if (storedSlugs.length > 0) {
      setpageRefreshed(true);
      const slugList = storedSlugs.split(",");
      slugList.forEach(function(entry) {
        setSectionSlugs((prev) => prev.filter((s) => s !== entry));
      });
      setSelectedSectionSlugs(slugList);
      setFocusedSectionSlug(slugList[0]);
      localStorage.setItem("current-focused-slug", slugList[0]);
    }
  }, []);
  const updateSlugsOnAdd = (previousState, section) => {
    return previousState.filter((slug) => slug !== section);
  };
  const onAddSection = (e, section) => {
    localStorage.setItem("current-focused-slug", section);
    setpageRefreshed(false);
    setAddAction(true);
    setSectionSlugs((prev) => updateSlugsOnAdd(prev, section));
    setFilteredSlugs((prev) => updateSlugsOnAdd(prev, section));
    setSelectedSectionSlugs((prev) => [...prev, section]);
    setFocusedSectionSlug(localStorage.getItem("current-focused-slug"));
    resetSearchFilter();
  };
  (0, import_react5.useEffect)(() => {
    localStorage.setItem("current-slug-list", selectedSectionSlugs);
  }, [selectedSectionSlugs]);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedSectionSlugs((sections) => {
        const oldIndex = sections.findIndex((s) => s === active.id);
        const newIndex = sections.findIndex((s) => s === over.id);
        return (0, import_sortable2.arrayMove)(sections, oldIndex, newIndex);
      });
    }
  };
  const onDeleteSection = (e, sectionSlug) => {
    e.stopPropagation();
    setSelectedSectionSlugs((prev) => prev.filter((s) => s !== sectionSlug));
    setSectionSlugs((prev) => [...prev, sectionSlug]);
    setFocusedSectionSlug(null);
    localStorage.setItem("current-focused-slug", "noEdit");
  };
  const onResetSection = (e, sectionSlug) => {
    e.stopPropagation();
    let originalSection;
    if (sectionSlug.slice(0, 6) === "custom") {
      const sectionTitle = kebabCaseToTitleCase(sectionSlug.slice(6, sectionSlug.length));
      originalSection = {
        slug: sectionSlug,
        name: sectionTitle,
        markdown: `
## ${sectionTitle}`
      };
    } else {
      originalSection = originalTemplate.find((s) => s.slug === sectionSlug);
    }
    const newTemplates = templates.map((s) => {
      if (s.slug === originalSection.slug) {
        return originalSection;
      }
      return s;
    });
    setTemplates(newTemplates);
    saveBackup(newTemplates);
  };
  const resetSelectedSections = () => {
    const data = localStorage.getItem("current-slug-list");
    const sectionResetConfirmed = window.confirm(
      "All sections of your readme will be removed; to continue, click OK"
    );
    if (sectionResetConfirmed === true) {
      const slugList = data ? data.split(",") : [];
      setSectionSlugs((prev) => [...prev, ...slugList].filter((s) => s !== "title-and-description"));
      setSelectedSectionSlugs(["title-and-description"]);
      setFocusedSectionSlug("title-and-description");
      localStorage.setItem("current-focused-slug", "noEdit");
      setTemplates(originalTemplate);
      deleteBackup();
    }
  };
  const dedupedSelectedSlugs = (0, import_react5.useMemo)(() => {
    return pageRefreshed || addAction ? [...new Set(selectedSectionSlugs)] : selectedSectionSlugs;
  }, [selectedSectionSlugs, pageRefreshed, addAction]);
  const availableSlugs = (0, import_react5.useMemo)(() => {
    let slugs = [...sectionSlugs];
    if (pageRefreshed && slugsFromPreviousSession.indexOf("title-and-description") === -1) {
      if (!slugs.includes("title-and-description")) {
        slugs.push("title-and-description");
      }
    }
    const sorted = filteredSlugs.length ? [...filteredSlugs].sort() : [...slugs].sort();
    return pageRefreshed || addAction ? [...new Set(sorted)] : sorted;
  }, [sectionSlugs, filteredSlugs, pageRefreshed, addAction, slugsFromPreviousSession]);
  const getAutoCompleteResults = (searchQuery) => {
    const suggestedSlugs = sectionSlugs.filter((slug) => {
      return getTemplate(slug).name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return suggestedSlugs.length ? suggestedSlugs : [void 0];
  };
  const resetSearchFilter = () => setSearchFilter("");
  (0, import_react5.useEffect)(() => {
    if (!searchFilter) {
      setFilteredSlugs([]);
      return;
    }
    const suggestedSlugs = getAutoCompleteResults(searchFilter.trim());
    setFilteredSlugs(suggestedSlugs);
  }, [searchFilter]);
  return /* @__PURE__ */ React.createElement("div", { className: "sections w-full md:w-64 lg:w-80" }, /* @__PURE__ */ React.createElement("h3", { className: "px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none" }, "Sections", /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors",
      type: "button",
      onClick: resetSelectedSections
    },
    /* @__PURE__ */ React.createElement("span", { className: "pl-2 float-right" }, "Reset"),
    /* @__PURE__ */ React.createElement("img", { className: "w-auto h-5 inline-block", src: "reset.svg", alt: "Reset" })
  )), /* @__PURE__ */ React.createElement("div", { className: "px-3 pr-4 overflow-y-scroll full-screen" }, selectedSectionSlugs.length > 0 && /* @__PURE__ */ React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900" }, "Click on a section below to edit the contents"), /* @__PURE__ */ React.createElement("ul", { className: "mb-12 space-y-3" }, /* @__PURE__ */ React.createElement(
    import_core.DndContext,
    {
      sensors,
      collisionDetection: import_core.closestCenter,
      onDragEnd: handleDragEnd,
      modifiers: [import_modifiers.restrictToVerticalAxis]
    },
    /* @__PURE__ */ React.createElement(import_sortable2.SortableContext, { items: dedupedSelectedSlugs }, dedupedSelectedSlugs.map((s) => {
      const template = getTemplate(s);
      if (template) {
        return /* @__PURE__ */ React.createElement(
          SortableItem,
          {
            key: s,
            id: s,
            section: template,
            focusedSectionSlug,
            setFocusedSectionSlug,
            onDeleteSection,
            onResetSection
          }
        );
      }
    }))
  )), sectionSlugs.length > 0 && /* @__PURE__ */ React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis" }, "Click on a section below to add it to your readme"), /* @__PURE__ */ React.createElement(SectionFilter_default, { searchFilter, setSearchFilter }), /* @__PURE__ */ React.createElement(
    CustomSection_default,
    {
      setSelectedSectionSlugs,
      setFocusedSectionSlug,
      setpageRefreshed,
      setAddAction,
      setTemplates
    }
  ), /* @__PURE__ */ React.createElement("ul", { className: "mb-12 space-y-3" }, availableSlugs.map((s) => {
    if (s === void 0) {
      return /* @__PURE__ */ React.createElement("h4", { className: "mb-3 text-xs leading-6 text-gray-900", key: "unavailable-section" }, "The section you're looking for is unavailable");
    } else {
      const template = getTemplate(s);
      if (template) {
        return /* @__PURE__ */ React.createElement("li", { key: s }, /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
            type: "button",
            onClick: (e) => onAddSection(e, s)
          },
          /* @__PURE__ */ React.createElement("span", null, template.name)
        ));
      }
    }
  }))));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SectionsColumn
});
