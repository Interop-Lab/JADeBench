"use strict";

var React = require("react");
var sortable = require("@dnd-kit/sortable");
var utilities = require("@dnd-kit/utilities");
var headlessui = require("@headlessui/react");
var core = require("@dnd-kit/core");
var modifiers = require("@dnd-kit/modifiers");

function useLocalStorage(key, initialValue) {
  var _React$useState = React.useState(function () {
    try {
      var storedValue = localStorage.getItem(key);
      return storedValue === null
        ? typeof initialValue === "function"
          ? initialValue()
          : initialValue
        : JSON.parse(storedValue);
    } catch (error) {
      return typeof initialValue === "function" ? initialValue() : initialValue;
    }
  });
  var value = _React$useState[0];
  var setValue = _React$useState[1];

  var updateValue = React.useCallback(
    function (nextValue) {
      setValue(function (currentValue) {
        var resolvedValue =
          typeof nextValue === "function"
            ? nextValue(currentValue)
            : nextValue;
        try {
          localStorage.setItem(key, JSON.stringify(resolvedValue));
        } catch (error) {
          if (typeof console !== "undefined" && console.error) {
            console.error(error);
          }
        }
        return resolvedValue;
      });
    },
    [key]
  );

  React.useEffect(
    function () {
      function handleStorage(event) {
        if (event.key !== key) return;
        try {
          setValue(
            event.newValue === null
              ? typeof initialValue === "function"
                ? initialValue()
                : initialValue
              : JSON.parse(event.newValue)
          );
        } catch (error) {
          if (typeof console !== "undefined" && console.error) {
            console.error(error);
          }
        }
      }

      if (typeof window !== "undefined") {
        window.addEventListener("storage", handleStorage);
        return function () {
          window.removeEventListener("storage", handleStorage);
        };
      }
    },
    [key, initialValue]
  );

  return [value, updateValue];
}

function getSectionId(section) {
  if (section && typeof section === "object") {
    return section.id != null
      ? section.id
      : section.key != null
        ? section.key
        : section.name != null
          ? section.name
          : section.title;
  }
  return section;
}

function kebabCaseToTitleCase(value) {
  return String(value || "")
    .split("-")
    .filter(Boolean)
    .map(function (part) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

var SortableItem = React.memo(function SortableItem(props) {
  var id = props.id;
  var children = props.children;
  var className = props.className;
  var disabled = props.disabled;
  var sortableItem = sortable.useSortable({ id: id, disabled: disabled });
  var style = Object.assign({}, props.style, {
    transform: utilities.CSS.Transform.toString(sortableItem.transform),
    transition: sortableItem.transition,
    opacity: sortableItem.isDragging ? 0.5 : undefined,
    zIndex: sortableItem.isDragging ? 1 : undefined
  });

  return React.createElement(
    "div",
    Object.assign(
      {
        ref: sortableItem.setNodeRef,
        className: className,
        style: style
      },
      sortableItem.attributes,
      sortableItem.listeners
    ),
    children
  );
});

function SectionFilter(props) {
  return React.createElement("input", {
    type: "search",
    value: props.value || "",
    placeholder: props.placeholder || "Filter sections",
    "aria-label": props["aria-label"] || "Filter sections",
    className: props.className,
    onChange: function (event) {
      if (props.onChange) props.onChange(event.target.value);
    }
  });
}

function CustomSection(props) {
  var initialSection = props.section || {};
  var _React$useState2 = React.useState(initialSection.title || "");
  var title = _React$useState2[0];
  var setTitle = _React$useState2[1];
  var _React$useState3 = React.useState(initialSection.url || "");
  var url = _React$useState3[0];
  var setUrl = _React$useState3[1];

  function submit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    if (props.onSubmit) {
      props.onSubmit({
        id: initialSection.id || title.trim().toLowerCase().replace(/\s+/g, "-"),
        title: title.trim(),
        url: url.trim(),
        custom: true
      });
    }
    if (!props.section) {
      setTitle("");
      setUrl("");
    }
  }

  return React.createElement(
    "form",
    { className: props.className, onSubmit: submit },
    React.createElement("input", {
      value: title,
      required: true,
      placeholder: "Section title",
      "aria-label": "Section title",
      onChange: function (event) {
        setTitle(event.target.value);
      }
    }),
    React.createElement("input", {
      value: url,
      type: "url",
      placeholder: "URL",
      "aria-label": "URL",
      onChange: function (event) {
        setUrl(event.target.value);
      }
    }),
    React.createElement(
      "button",
      { type: "submit" },
      props.submitLabel || (props.section ? "Save" : "Add section")
    )
  );
}

function SectionsColumn(props) {
  var controlledSections =
    props.sections != null
      ? props.sections
      : props.items != null
        ? props.items
        : undefined;
  var storageKey = props.storageKey || "sections";

  var _useLocalStorage = useLocalStorage(
    storageKey,
    controlledSections || props.defaultSections || []
  );
  var storedSections = _useLocalStorage[0];
  var setStoredSections = _useLocalStorage[1];

  var sections =
    controlledSections !== undefined ? controlledSections : storedSections;
  var setSections =
    props.setSections || props.onSectionsChange || setStoredSections;

  var _React$useState4 = React.useState("");
  var filter = _React$useState4[0];
  var setFilter = _React$useState4[1];

  var sectionIds = React.useMemo(
    function () {
      return sections.map(getSectionId);
    },
    [sections]
  );

  var sensors = core.useSensors(
    core.useSensor(core.PointerSensor),
    core.useSensor(core.KeyboardSensor, {
      coordinateGetter: sortable.sortableKeyboardCoordinates
    })
  );

  function update(nextSections) {
    setSections(nextSections);
    if (props.onChange && props.onChange !== setSections) {
      props.onChange(nextSections);
    }
  }

  function handleDragEnd(event) {
    var active = event.active;
    var over = event.over;
    if (!over || active.id === over.id) return;

    var oldIndex = sectionIds.indexOf(active.id);
    var newIndex = sectionIds.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    var nextSections = sortable.arrayMove(sections, oldIndex, newIndex);
    update(nextSections);

    if (props.onDragEnd) {
      props.onDragEnd(event, nextSections);
    }
  }

  function removeSection(section) {
    var id = getSectionId(section);
    var nextSections = sections.filter(function (item) {
      return getSectionId(item) !== id;
    });
    update(nextSections);
    if (props.onRemove) props.onRemove(section);
  }

  function addSection(section) {
    update(sections.concat(section));
    if (props.onAdd) props.onAdd(section);
  }

  var normalizedFilter = filter.trim().toLowerCase();
  var visibleSections = normalizedFilter
    ? sections.filter(function (section) {
        var id = getSectionId(section);
        var title =
          section && typeof section === "object"
            ? section.title || section.name || id
            : kebabCaseToTitleCase(id);
        return String(title).toLowerCase().includes(normalizedFilter);
      })
    : sections;

  return React.createElement(
    "section",
    {
      className: props.className,
      "data-section-column": props.id || props.title || "sections"
    },
    props.title
      ? React.createElement("h2", null, props.title)
      : null,
    props.filterable === false
      ? null
      : React.createElement(SectionFilter, {
          value: filter,
          onChange: setFilter,
          placeholder: props.filterPlaceholder
        }),
    React.createElement(
      core.DndContext,
      {
        sensors: sensors,
        collisionDetection: core.closestCenter,
        modifiers: props.modifiers || [
          modifiers.restrictToVerticalAxis,
          modifiers.restrictToParentElement
        ],
        onDragEnd: handleDragEnd
      },
      React.createElement(
        sortable.SortableContext,
        {
          items: sectionIds,
          strategy: sortable.verticalListSortingStrategy
        },
        visibleSections.map(function (section) {
          var id = getSectionId(section);
          var title =
            section && typeof section === "object"
              ? section.title || section.name || kebabCaseToTitleCase(id)
              : kebabCaseToTitleCase(id);

          return React.createElement(
            SortableItem,
            {
              key: id,
              id: id,
              className: props.itemClassName,
              disabled: props.disabled
            },
            props.renderSection
              ? props.renderSection(section, {
                  remove: function () {
                    removeSection(section);
                  }
                })
              : React.createElement(
                  React.Fragment,
                  null,
                  React.createElement("span", null, title),
                  props.removable === false
                    ? null
                    : React.createElement(
                        "button",
                        {
                          type: "button",
                          "aria-label": "Remove " + title,
                          onClick: function () {
                            removeSection(section);
                          }
                        },
                        "×"
                      )
                )
          );
        })
      )
    ),
    props.allowCustom
      ? React.createElement(CustomSection, {
          onSubmit: addSection,
          submitLabel: props.addLabel
        })
      : null,
    props.children
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "SectionsColumn", {
  enumerable: true,
  get: function () {
    return SectionsColumn;
  }
});
