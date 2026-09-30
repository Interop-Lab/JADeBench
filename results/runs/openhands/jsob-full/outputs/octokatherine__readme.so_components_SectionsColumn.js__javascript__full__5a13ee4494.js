var SectionsColumn;
var moduleExports = {};
Object.defineProperty(moduleExports, "__esModule", { value: true });
Object.defineProperty(moduleExports, "SectionsColumn", {
  enumerable: true,
  get: function () {
    return SectionsColumn;
  },
});
module.exports = moduleExports;

var reactLocalStorage = require("react");

function useLocalStorage() {
  var [backup, setBackup] = reactLocalStorage.useState(null);
  var [saveTimeout, setSaveTimeout] = reactLocalStorage.useState(null);

  reactLocalStorage.useEffect(function () {
    var storedBackup = localStorage.getItem("readme-backup");
    if (storedBackup) {
      setBackup(JSON.parse(storedBackup));
    }
  }, []);

  function saveBackup(nextBackup) {
    try {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      setSaveTimeout(
        setTimeout(function () {
          localStorage.setItem("readme-backup", JSON.stringify(nextBackup));
        }, 1000),
      );
    } catch (error) {
      console.error("Failed to create local backup");
    }
  }

  function deleteBackup() {
    try {
      localStorage.removeItem("readme-backup");
    } catch (error) {
      console.error("Failed to delete local backup");
    }
  }

  return { backup, saveBackup, deleteBackup };
}

var sortable = require("@dnd-kit/sortable");
var dndUtilities = require("@dnd-kit/utilities");

var SortableItem = react.memo(function SortableItem2(props) {
  var {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = sortable.useSortable({ id: props.id });
  var style = {
    transform: dndUtilities.CSS.Transform.toString(transform),
    transition,
  };

  function focusSection() {
    localStorage.setItem("current-focused-slug", props.id);
    props.setFocusedSectionSlug(props.id);
  }

  function deleteSection(event) {
    props.onDeleteSection(event, props.section.slug);
  }

  function resetSection(event) {
    var confirmed = window.confirm(
      "The section will be reset to default template; to continue, click OK",
    );
    if (confirmed === true) {
      props.onResetSection(event, props.section.slug);
    }
  }

  function handleKeyUp(event) {
    if (event.key.toLowerCase() === "enter") {
      focusSection();
    }
  }

  return React.createElement(
    "li",
    {
      ref: setNodeRef,
      style,
      ...attributes,
      onClick: focusSection,
      onKeyUp: handleKeyUp,
      className:
        "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " +
        (props.section.slug === props.focusedSectionSlug
          ? "ring-2 ring-emerald-400"
          : ""),
    },
    React.createElement(
      "button",
      {
        type: "button",
        className:
          "p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
        ...listeners,
      },
      React.createElement("img", {
        className: "w-5 h-5",
        src: "drag.svg",
        alt: "Drag to reorder",
      }),
    ),
    React.createElement("p", null, props.section.name),
    props.section.slug === props.focusedSectionSlug &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8",
            type: "button",
            "aria-label": "Reset section",
            onClick: resetSection,
          },
          React.createElement("img", {
            className: "w-auto h-5",
            src: "reset.svg",
            alt: "Reset section",
          }),
        ),
        React.createElement(
          "button",
          {
            className:
              "p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1",
            type: "button",
            "aria-label": "Delete section",
            onClick: deleteSection,
          },
          React.createElement("img", {
            className: "w-auto h-5",
            src: "trash.svg",
            alt: "Delete section",
          }),
        ),
      ),
  );
});

var headlessUi = require("@headlessui/react");

var CustomSection = ({
  setTemplates,
  setSelectedSectionSlugs,
  setFocusedSectionSlug,
  setpageRefreshed,
  setAddAction,
}) => {
  var [show, setShow] = react.useState(false);
  var [sectionTitle, setSectionTitle] = react.useState("");
  var { saveBackup } = useLocalStorage();
  var inputRef = react.useRef(null);

  function addCustomSection(event) {
    if (event) {
      event.preventDefault();
    }
    if (!sectionTitle) {
      return;
    }

    setShow(false);
    var section = {
      slug: "custom-" + sectionTitle.toLowerCase().replace(/\s/g, "-"),
      name: sectionTitle,
      markdown: "\n## " + sectionTitle,
    };

    localStorage.setItem("current-focused-slug", section.slug);
    setTemplates(function (templates) {
      var nextTemplates = [...templates, section];
      saveBackup(nextTemplates);
      return nextTemplates;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs(function (slugs) {
      return [...slugs, section.slug];
    });
    setFocusedSectionSlug(localStorage.getItem("current-focused-slug"));
  }

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      headlessUi.Transition,
      { show },
      React.createElement(
        headlessUi.Dialog,
        {
          as: "div",
          className: "fixed z-10 inset-0 overflow-y-auto",
          initialFocus: inputRef,
          onClose: function () {
            setShow(false);
          },
        },
        React.createElement(
          "div",
          {
            className:
              "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0",
          },
          React.createElement(
            headlessUi.TransitionChild,
            {
              enter: "ease-out duration-300",
              enterFrom: "opacity-0",
              enterTo: "opacity-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100",
              leaveTo: "opacity-0",
            },
            React.createElement(headlessUi.DialogBackdrop, {
              className:
                "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
            }),
          ),
          React.createElement(
            "span",
            {
              className:
                "hidden sm:inline-block sm:align-middle sm:h-screen",
              "aria-hidden": "true",
            },
            "\u200B",
          ),
          React.createElement(
            headlessUi.TransitionChild,
            {
              enter: "ease-out duration-300",
              enterFrom:
                "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
              enterTo: "opacity-100 translate-y-0 sm:scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
              leaveTo:
                "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            },
            React.createElement(
              headlessUi.DialogPanel,
              {
                className:
                  "inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6",
              },
              React.createElement(
                "form",
                { onSubmit: addCustomSection },
                React.createElement(
                  "div",
                  { className: "mt-3 text-center sm:mt-5" },
                  React.createElement(
                    headlessUi.DialogTitle,
                    {
                      as: "h3",
                      className:
                        "text-lg leading-6 font-medium text-gray-900",
                    },
                    "New Custom Section",
                  ),
                  React.createElement(
                    "div",
                    { className: "my-4" },
                    React.createElement("input", {
                      ref: inputRef,
                      type: "text",
                      name: "title",
                      id: "title",
                      onChange: function (event) {
                        setSectionTitle(event.target.value);
                      },
                      className:
                        "shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 block w-full sm:text-sm border border-gray-300 rounded-md",
                      placeholder: "Section Title",
                      "aria-label": "Section title",
                    }),
                  ),
                ),
              ),
              React.createElement(
                "div",
                {
                  className:
                    "mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense",
                },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    className:
                      "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:col-start-2 sm:text-sm disabled:opacity-50",
                    disabled: !sectionTitle,
                    onClick: addCustomSection,
                  },
                  "Add Section",
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    className:
                      "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm",
                    onClick: function () {
                      setShow(false);
                    },
                  },
                  "Cancel",
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
      React.createElement(
        "button",
        {
          className:
            "flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white font-bold rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
          type: "button",
          onClick: function () {
            setShow(true);
          },
        },
        React.createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-5 w-5",
            viewBox: "0 0 20 20",
            fill: "currentColor",
          },
          React.createElement("path", {
            fillRule: "evenodd",
            d: "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z",
            clipRule: "evenodd",
          }),
        ),
        React.createElement("span", { className: "ml-1" }, "Custom Section"),
      ),
    ),
  );
};

var SectionFilter = ({ searchFilter, setSearchFilter }) => {
  return React.createElement("input", {
    type: "text",
    placeholder: "Search for a section",
    "aria-label": "Search for a section",
    className:
      "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400",
    "data-testid": "slugs-filter",
    value: searchFilter,
    onChange: function (event) {
      setSearchFilter(event.target.value);
    },
  });
};

var dndCore = require("@dnd-kit/core");
var dndModifiers = require("@dnd-kit/modifiers");

var kebabCaseToTitleCase = (value) => {
  return value
    .split("-")
    .map(function (word) {
      return word.slice(0, 1).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

SectionsColumn = ({
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
  var sensors = dndCore.useSensors(
    dndCore.useSensor(dndCore.MouseSensor),
    dndCore.useSensor(dndCore.TouchSensor),
    dndCore.useSensor(dndCore.KeyboardSensor, {
      coordinateGetter: sortable.sortableKeyboardCoordinates,
    }),
  );
  var [pageRefreshed, setPageRefreshed] = react.useState(false);
  var [addAction, setAddAction] = react.useState(false);
  var [storedSlugList, setStoredSlugList] = react.useState([]);
  var [searchFilter, setSearchFilter] = react.useState("");
  var [searchResults, setSearchResults] = react.useState([]);
  var { saveBackup, deleteBackup } = useLocalStorage();

  react.useEffect(function () {
    var storedSlugs =
      localStorage.getItem("current-slug-list") === null
        ? "title-and-description"
        : localStorage.getItem("current-slug-list");
    setStoredSlugList(storedSlugs);

    if (storedSlugs.length > 0) {
      setPageRefreshed(true);
      var restoredSlugs = storedSlugs.split(",");
      restoredSlugs.forEach(function (slug) {
        setSectionSlugs(function (availableSlugs) {
          return availableSlugs.filter(function (availableSlug) {
            return availableSlug !== slug;
          });
        });
      });
      setSelectedSectionSlugs(restoredSlugs);
      setFocusedSectionSlug(restoredSlugs[0]);
      localStorage.setItem("current-focused-slug", restoredSlugs[0]);
    }
  }, []);

  function withoutSlug(slugs, slug) {
    return slugs.filter(function (candidate) {
      return candidate !== slug;
    });
  }

  function addSection(event, slug) {
    setPageRefreshed(false);
    setSectionSlugs(function (availableSlugs) {
      return withoutSlug(availableSlugs, slug);
    });
    setSelectedSectionSlugs(function (selectedSlugs) {
      return [...selectedSlugs, slug];
    });
    localStorage.setItem("current-focused-slug", slug);
    setFocusedSectionSlug(localStorage.getItem("current-focused-slug"));
    setAddAction(true);
    setSearchResults(function (results) {
      return withoutSlug(results, slug);
    });
    setSearchFilter("");
  }

  react.useEffect(
    function () {
      localStorage.setItem("current-slug-list", selectedSectionSlugs);
    },
    [selectedSectionSlugs],
  );

  function handleDragEnd(event) {
    var { active, over } = event;
    if (active.id !== over.id) {
      setSelectedSectionSlugs(function (slugs) {
        var oldIndex = slugs.findIndex(function (slug) {
          return slug === active.id;
        });
        var newIndex = slugs.findIndex(function (slug) {
          return slug === over.id;
        });
        return sortable.arrayMove(slugs, oldIndex, newIndex);
      });
    }
  }

  function deleteSection(event, slug) {
    event.stopPropagation();
    setSelectedSectionSlugs(function (selectedSlugs) {
      return selectedSlugs.filter(function (selectedSlug) {
        return selectedSlug !== slug;
      });
    });
    setFocusedSectionSlug(null);
    localStorage.setItem("current-focused-slug", "noEdit");
    setSectionSlugs(function (availableSlugs) {
      return [...availableSlugs, slug];
    });
  }

  function resetSection(event, slug) {
    event.stopPropagation();
    var replacement;

    if (slug.slice(0, 6) === "custom") {
      var name = kebabCaseToTitleCase(slug.slice(6, slug.length));
      replacement = {
        slug,
        name,
        markdown: "\n## " + name,
      };
    } else {
      replacement = originalTemplate.find(function (template) {
        return template.slug === slug;
      });
    }

    var resetTemplates = templates.map(function (template) {
      if (template.slug === replacement.slug) {
        return replacement;
      }
      return template;
    });
    setTemplates(resetTemplates);
    saveBackup(resetTemplates);
  }

  function resetAllSections() {
    var storedSlugs = localStorage.getItem("current-slug-list");
    var confirmed = window.confirm(
      "All sections of your readme will be removed; to continue, click OK",
    );

    if (confirmed === true) {
      var slugsToRestore = storedSlugs ? storedSlugs.split(",") : [];
      setSectionSlugs(function (availableSlugs) {
        return [...availableSlugs, ...slugsToRestore].filter(function (slug) {
          return slug !== "title-and-description";
        });
      });
      setSelectedSectionSlugs(["title-and-description"]);
      setFocusedSectionSlug("title-and-description");
      localStorage.setItem("current-focused-slug", "noEdit");
      setTemplates(originalTemplate);
      deleteBackup();
    }
  }

  var visibleSelectedSlugs = react.useMemo(
    function () {
      return pageRefreshed || addAction
        ? [...new Set(selectedSectionSlugs)]
        : selectedSectionSlugs;
    },
    [selectedSectionSlugs, pageRefreshed, addAction],
  );

  var visibleAvailableSlugs = react.useMemo(
    function () {
      var availableSlugs = [...sectionSlugs];
      if (
        pageRefreshed &&
        storedSlugList.indexOf("title-and-description") === -1 &&
        !availableSlugs.includes("title-and-description")
      ) {
        availableSlugs.push("title-and-description");
      }

      var displayedSlugs = searchResults.length
        ? [...searchResults].sort()
        : [...availableSlugs].sort();
      return pageRefreshed || addAction
        ? [...new Set(displayedSlugs)]
        : displayedSlugs;
    },
    [sectionSlugs, searchResults, pageRefreshed, addAction, storedSlugList],
  );

  function findSections(query) {
    var matches = sectionSlugs.filter(function (slug) {
      return getTemplate(slug).name.toLowerCase().includes(query.toLowerCase());
    });
    return matches.length ? matches : [undefined];
  }

  react.useEffect(
    function () {
      if (!searchFilter) {
        setSearchResults([]);
        return;
      }
      setSearchResults(findSections(searchFilter.trim()));
    },
    [searchFilter],
  );

  return React.createElement(
    "div",
    { className: "sections w-full md:w-64 lg:w-80" },
    React.createElement(
      "h3",
      {
        className:
          "px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none",
      },
      "Sections",
      React.createElement(
        "button",
        {
          className:
            "focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors",
          type: "button",
          onClick: resetAllSections,
        },
        React.createElement(
          "span",
          { className: "pl-2 float-right" },
          "Reset",
        ),
        React.createElement("img", {
          className: "w-auto h-5 inline-block",
          src: "reset.svg",
          alt: "Reset",
        }),
      ),
    ),
    React.createElement(
      "div",
      { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      selectedSectionSlugs.length > 0 &&
        React.createElement(
          "h4",
          { className: "mb-3 text-xs leading-6 text-gray-900" },
          "Click on a section below to edit the contents",
        ),
      React.createElement(
        "ul",
        { className: "mb-12 space-y-3" },
        React.createElement(
          dndCore.DndContext,
          {
            sensors,
            collisionDetection: dndCore.closestCenter,
            onDragEnd: handleDragEnd,
            modifiers: [dndModifiers.restrictToVerticalAxis],
          },
          React.createElement(
            sortable.SortableContext,
            { items: visibleSelectedSlugs },
            visibleSelectedSlugs.map(function (slug) {
              var section = getTemplate(slug);
              if (section) {
                return React.createElement(SortableItem, {
                  key: slug,
                  id: slug,
                  section,
                  focusedSectionSlug,
                  setFocusedSectionSlug,
                  onDeleteSection: deleteSection,
                  onResetSection: resetSection,
                });
              }
            }),
          ),
        ),
      ),
      sectionSlugs.length > 0 &&
        React.createElement(
          "h4",
          {
            className:
              "mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis",
          },
          "Click on a section below to add it to your readme",
        ),
      React.createElement(SectionFilter, {
        searchFilter,
        setSearchFilter,
      }),
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
        visibleAvailableSlugs.map(function (slug) {
          if (slug === undefined) {
            return React.createElement(
              "h4",
              {
                className: "mb-3 text-xs leading-6 text-gray-900",
                key: "unavailable-section",
              },
              "The section you're looking for is unavailable",
            );
          }

          var section = getTemplate(slug);
          if (section) {
            return React.createElement(
              "li",
              { key: slug },
              React.createElement(
                "button",
                {
                  className:
                    "flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors",
                  type: "button",
                  onClick: function (event) {
                    addSection(event, slug);
                  },
                },
                React.createElement("span", null, section.name),
              ),
            );
          }
        }),
      ),
    ),
  );
};
