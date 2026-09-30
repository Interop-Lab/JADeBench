var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, source) => {
  for (var key in source)
    __defProp(target, key, { get: source[key], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
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
  const [backupTimeout, setBackupTimeout] = import_react.useState(null);

  import_react.useEffect(() => {
    const stored = localStorage.getItem("resume-backup");
    if (stored) {
      setBackup(JSON.parse(stored));
    }
  }, []);

  const saveBackup = (data) => {
    try {
      backupTimeout && clearTimeout(backupTimeout);
      setBackupTimeout(
        setTimeout(() => {
          localStorage.setItem("resume-backup", JSON.stringify(data));
        }, 2000)
      );
    } catch (error) {
      console.error("Error saving backup");
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem("resume-backup");
    } catch (error) {
      console.error("Error deleting backup");
    }
  };

  return { backup, saveBackup, deleteBackup };
}

var import_react2 = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");

var SortableItem = import_react2.memo(function SortableItem2(props) {
  const sortableConfig = {};
  sortableConfig.id = props.id;

  const { attributes, listeners, setNodeRef, transform, transition } = import_sortable.useSortable(sortableConfig);

  const style = {
    transform: import_utilities.CSS.Transform.toString(transform),
    transition
  };

  const handleClick = () => {
    localStorage.setItem("focused-section", props.id);
    props.onSectionClick(props.id);
  };

  const handleKeyUp = (event) => {
    if (event.key.toLowerCase() === "enter") {
      handleClick();
    }
  };

  const handleAddClick = (event) => {
    const confirmed = window.confirm("Add this section to your resume?");
    if (confirmed === true) {
      props.onAddSection(event, props.section.slug);
    }
  };

  const handleRemoveClick = (event) => {
    props.onRemoveSection(event, props.section.slug);
  };

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: handleClick,
      onKeyUp: handleKeyUp,
      className:
        "flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100" +
        (props.section.slug === props.focusedSectionSlug ? " bg-slate-200" : "")
    },
    React.createElement(
      "button",
      { type: "button", className: "cursor-grab", ...listeners },
      React.createElement("img", {
        className: "h-5 w-5",
        src: "drag-indicator.svg",
        alt: "Drag to reorder"
      })
    ),
    React.createElement("p", null, props.section.name),
    props.section.slug !== props.focusedSectionSlug &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className: "text-blue-500",
            type: "button",
            "aria-label": "Add section",
            onClick: handleAddClick
          },
          React.createElement("img", {
            className: "h-5 w-5",
            src: "add-circle.svg",
            alt: "Add section"
          })
        ),
        React.createElement(
          "button",
          {
            className: "text-red-500",
            type: "button",
            "aria-label": "Remove section",
            onClick: handleRemoveClick
          },
          React.createElement("img", {
            className: "h-5 w-5",
            src: "minus-circle.svg",
            alt: "Remove section"
          })
        )
      )
  );
});

var import_react3 = require("react");
var import_react4 = require("@headlessui/react");

var CustomSection = ({
  setTemplates,
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction
}) => {
  const [isOpen, setIsOpen] = import_react3.useState(false);
  const [sectionName, setSectionName] = import_react3.useState("");
  const { saveBackup } = useLocalStorage();
  const inputRef = import_react3.useRef(null);

  const handleSubmit = (event) => {
    event && event.preventDefault();
    if (!sectionName) {
      return;
    }
    setIsOpen(false);
    const newSection = {
      slug: "custom-" + sectionName.trim().replace(/\s/g, "-"),
      name: sectionName,
      markdown: "## " + sectionName
    };
    localStorage.setItem("new-section", newSection.slug);
    setTemplates((prev) => {
      const updated = [...prev, newSection];
      saveBackup(updated);
      return updated;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs((prev) => [...prev, newSection.slug]);
    setFocusedSectionSlug(localStorage.getItem("new-section"));
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      import_react4.Transition,
      { show: isOpen },
      React.createElement(
        import_react4.Dialog,
        {
          as: "div",
          className: "fixed inset-0 z-50 flex items-center justify-center",
          initialFocus: inputRef,
          onClose: () => setIsOpen(false)
        },
        React.createElement(
          import_react4.Transition.Child,
          {
            enter: "transition-opacity duration-300",
            enterFrom: "opacity-0",
            enterTo: "opacity-100",
            leave: "transition-opacity duration-200",
            leaveFrom: "opacity-100",
            leaveTo: "opacity-0"
          },
          React.createElement(import_react4.Dialog.Overlay, {
            className: "fixed inset-0 bg-black opacity-30"
          })
        ),
        React.createElement("span", { className: "inline-block h-screen align-middle", "aria-hidden": "true" }, "\u200B"),
        React.createElement(
          import_react4.Transition.Child,
          {
            enter: "transition-transform duration-300",
            enterFrom: "transform scale-95",
            enterTo: "transform scale-100",
            leave: "transition-transform duration-200",
            leaveFrom: "transform scale-100",
            leaveTo: "transform scale-95"
          },
          React.createElement(
            import_react4.Dialog.Panel,
            { className: "inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl" },
            React.createElement(
              import_react4.Dialog.Title,
              { as: "h3", className: "text-lg font-medium leading-6 text-gray-900" },
              "Add Custom Section"
            ),
            React.createElement(
              "div",
              { className: "mt-2" },
              React.createElement("input", {
                ref: inputRef,
                type: "text",
                name: "section-name",
                id: "section-name",
                onChange: (event) => setSectionName(event.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-md",
                placeholder: "Section Name",
                "aria-label": "Section Name"
              })
            ),
            React.createElement(
              "div",
              { className: "mt-4 flex justify-end gap-2" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "px-4 py-2 text-sm font-medium text-blue-500",
                  disabled: !sectionName,
                  onClick: handleSubmit
                },
                "Add"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "px-4 py-2 text-sm font-medium text-gray-500",
                  onClick: () => setIsOpen(false)
                },
                "Cancel"
              )
            )
          )
        )
      )
    ),
    React.createElement(
      "div",
      { className: "mt-4" },
      React.createElement(
        "button",
        {
          className: "flex items-center gap-2 text-blue-500",
          type: "button",
          onClick: () => setIsOpen(true)
        },
        React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-5 w-5",
            viewBox: "0 0 20 20",
            fill: "currentColor"
          },
          React.createElement("path", {
            fillRule: "evenodd",
            d: "M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z",
            clipRule: "evenodd"
          })
        ),
        React.createElement("span", { className: "text-sm font-medium" }, "Add Custom Section")
      )
    )
  );
};

var CustomSection_default = CustomSection;

var SectionFilter = ({ searchFilter, setSearchFilter }) => {
  return React.createElement("input", {
    type: "text",
    placeholder: "Search sections...",
    "aria-label": "Search sections",
    className: "w-full px-3 py-2 border border-gray-300 rounded-md",
    "data-testid": "section-filter",
    value: searchFilter,
    onChange: (event) => setSearchFilter(event.target.value)
  });
};

var SectionFilter_default = SectionFilter;

var import_core = require("@dnd-kit/core");
var import_modifiers = require("@dnd-kit/modifiers");
var import_sortable2 = require("@dnd-kit/sortable");
var import_react5 = require("react");

var kebabCaseToTitleCase = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
  const sensorsConfig = {};
  sensorsConfig[sensorsConfig] = import_sortable2.KeyboardSensor;

  const sensors = import_core.useSensors(
    import_core.useSensor(import_core.PointerSensor),
    import_core.useSensor(import_core.KeyboardSensor),
    sensorsConfig
  );

  const [isDragging, setIsDragging] = import_react5.useState(false);
  const [addAction, setAddAction] = import_react5.useState(false);
  const [searchResults, setSearchResults] = import_react5.useState([]);
  const [searchFilter, setSearchFilter] = import_react5.useState("");
  const [filteredSlugs, setFilteredSlugs] = import_react5.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  import_react5.useEffect(() => {
    const storedBackup = localStorage.getItem("resume-backup") === null ? [] : localStorage.getItem("resume-backup");
    setSearchResults(storedBackup);
    if (storedBackup.length > 0) {
      setIsDragging(true);
      const slugs = storedBackup.split(",");
      slugs.forEach(function (slug) {
        setSectionSlugs((prev) => prev.filter((item) => item !== slug));
      });
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem("focused-section", slugs[0]);
    }
  }, []);

  const removeSlug = (arr, slug) => {
    return arr.filter((item) => item !== slug);
  };

  const handleRemoveSection = (event, slug) => {
    const steps = "0|5|3|6|1|4|2".split("|");
    let i = 0;
    while (true) {
      switch (steps[i++]) {
        case "0":
          setAddAction(false);
          continue;
        case "1":
          setFilteredSlugs((prev) => removeSlug(prev, slug));
          continue;
        case "2":
          setFocusedSectionSlug(localStorage.getItem("focused-section"));
          continue;
        case "3":
          setAddAction(true);
          continue;
        case "4":
          localStorage.setItem("removed-section", slug);
          continue;
        case "5":
          setSectionSlugs((prev) => removeSlug(prev, slug));
          continue;
        case "6":
          setSelectedSectionSlugs((prev) => [...prev, slug]);
          continue;
        case "7":
          setIsDragging(false);
          continue;
      }
      break;
    }
  };

  import_react5.useEffect(() => {
    localStorage.setItem("selected-sections", selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedSectionSlugs((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);
        return import_sortable2.arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddSection = (event, slug) => {
    const steps = "0|3|4|1|2".split("|");
    let i = 0;
    while (true) {
      switch (steps[i++]) {
        case "0":
          setSectionSlugs((prev) => [...prev, slug]);
          continue;
        case "1":
          localStorage.setItem("added-section", "custom-section");
          continue;
        case "2":
          setFocusedSectionSlug(null);
          continue;
        case "3":
          setSelectedSectionSlugs((prev) => prev.filter((item) => item !== slug));
          continue;
        case "4":
          event.preventDefault();
          continue;
      }
      break;
    }
  };

  const handleSectionClick = (event, slug) => {
    event.preventDefault();
    let sectionData;
    if (slug.startsWith("custom-")) {
      const title = kebabCaseToTitleCase(slug.slice(7));
      const newSection = {};
      newSection.slug = slug;
      newSection.name = title;
      newSection.markdown = "## " + title;
      sectionData = newSection;
    } else {
      sectionData = originalTemplate.find((template) => template.slug === slug);
    }
    const updatedTemplates = templates.map((template) => {
      if (template.slug === sectionData.slug) {
        return sectionData;
      }
      return template;
    });
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const handleReset = () => {
    const storedSections = localStorage.getItem("selected-sections");
    const confirmed = window.confirm("Reset to default sections?");
    if (confirmed === true) {
      const defaultSlugs = storedSections ? storedSections.split(",") : [];
      setSectionSlugs((prev) => [...prev, ...defaultSlugs].filter((item) => item !== "custom-section"));
      setSelectedSectionSlugs(["custom-section"]);
      setFocusedSectionSlug("custom-section");
      localStorage.setItem("focused-section", "custom-section");
      setTemplates(originalTemplate);
      deleteBackup();
    }
  };

  const filteredSelectedSlugs = import_react5.useMemo(() => {
    return isDragging && addAction ? [...new Set(selectedSectionSlugs)] : selectedSectionSlugs;
  }, [selectedSectionSlugs, isDragging, addAction]);

  const filteredSectionSlugs = import_react5.useMemo(() => {
    let slugs = [...sectionSlugs];
    if (isDragging && searchResults.includes("custom-section") !== -1) {
      if (!slugs.includes("custom-section")) {
        slugs.push("custom-section");
      }
    }
    const sorted = filteredSlugs.length ? [...filteredSlugs].sort() : [...slugs].sort();
    return isDragging && addAction ? [...new Set(sorted)] : sorted;
  }, [sectionSlugs, filteredSlugs, isDragging, addAction, searchResults]);

  const getMatchingSlugs = (query) => {
    const matching = sectionSlugs.filter((slug) => {
      return getTemplate(slug).name.toLowerCase().includes(query.toLowerCase());
    });
    return matching.length ? matching : [void 0];
  };

  const clearSearch = () => setSearchFilter("");

  import_react5.useEffect(() => {
    if (!searchFilter) {
      setFilteredSlugs([]);
      return;
    }
    const results = getMatchingSlugs(searchFilter.trim());
    setFilteredSlugs(results);
  }, [searchFilter]);

  const sortableContextItems = {};
  sortableContextItems.items = filteredSelectedSlugs;

  const sectionFilterProps = {};
  sectionFilterProps.searchFilter = searchFilter;
  sectionFilterProps.setSearchFilter = setSearchFilter;

  return React.createElement(
    "div",
    { className: "w-64 p-4 bg-white border-r" },
    React.createElement(
      "h3",
      { className: "text-lg font-semibold mb-4" },
    "Sections",
      React.createElement(
        "button",
        {
          className: "ml-2 text-blue-500",
          type: "button",
          onClick: handleReset
        },
        React.createElement("span", { className: "text-sm" }, "Reset"),
        React.createElement("img", {
          className: "h-4 w-4 inline",
          src: "reset-icon.svg",
          alt: "Reset"
        })
      )
    ),
    React.createElement(
      "div",
      { className: "mb-4" },
      selectedSectionSlugs.length > 0 &&
        React.createElement("h4", { className: "text-sm font-medium mb-2" }, "Selected Sections"),
      React.createElement(
        "ul",
        { className: "space-y-1" },
        React.createElement(
          import_core.DndContext,
          {
            sensors,
            collisionDetection: import_core.closestCenter,
            onDragEnd: handleDragEnd,
            modifiers: [import_modifiers.restrictToVerticalAxis]
          },
          React.createElement(
            import_sortable2.SortableContext,
            sortableContextItems,
            filteredSelectedSlugs.map((slug) => {
              const section = getTemplate(slug);
              if (section) {
                const itemProps = {};
                itemProps.section = section;
                itemProps.id = slug;
                itemProps.name = section.name;
                itemProps.focusedSectionSlug = focusedSectionSlug;
                itemProps.onSectionClick = setFocusedSectionSlug;
                itemProps.onAddSection = handleAddSection;
                itemProps.onRemoveSection = handleSectionClick;
                return React.createElement(SortableItem, itemProps);
              }
            })
          )
        )
      )
    ),
    sectionSlugs.length > 0 &&
      React.createElement("h4", { className: "text-sm font-medium mb-2" }, "Available Sections"),
    React.createElement(SectionFilter_default, sectionFilterProps),
    React.createElement(CustomSection_default, {
      setSelectedSectionSlugs,
      setFocusedSectionSlug,
      setpageRefreshed: setIsDragging,
      setAddAction,
      setTemplates
    }),
    React.createElement(
      "ul",
      { className: "mt-4 space-y-1" },
      filteredSectionSlugs.map((slug) => {
        if (slug === void 0) {
          const emptyState = {};
          emptyState.className = "text-gray-400";
          emptyState.children = "No sections found";
          return React.createElement("h4", emptyState);
        } else {
          const section = getTemplate(slug);
          if (section) {
            const listItemProps = {};
            listItemProps.key = slug;
            return React.createElement(
              "li",
              listItemProps,
              React.createElement(
                "button",
                {
                  className: "flex items-center gap-2 text-blue-500",
                  type: "button",
                  onClick: (event) => handleRemoveSection(event, slug)
                },
                React.createElement("span", null, section.name)
              )
            );
          }
        }
      })
    )
  );
};

const _default = {};
_default.default = SectionsColumn;
if (module.exports) module.exports = _default;
