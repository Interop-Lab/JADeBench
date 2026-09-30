"use strict";

const React = require("react");
const { createElement: h, memo, useEffect, useMemo, useRef, useState, Fragment } = React;
const { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } = require("@dnd-kit/core");
const { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable } = require("@dnd-kit/sortable");
const { CSS } = require("@dnd-kit/utilities");
const { restrictToVerticalAxis } = require("@dnd-kit/modifiers");
const { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition, TransitionChild } = require("@headlessui/react");

const FOCUS_KEY = "current-focused-slug";
const SLUGS_KEY = "current-slug-list";
const BACKUP_KEY = "readme-backup";
const TITLE_SLUG = "title-and-description";
const NO_EDIT_SLUG = "noEdit";

function useLocalStorage() {
  const [backup, setBackup] = useState(() => {
    const saved = localStorage.getItem(BACKUP_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const timer = useRef();
  function saveBackup(value) {
    setBackup(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { localStorage.setItem(BACKUP_KEY, JSON.stringify(value)); }
      catch (error) { console.error("Failed to create local backup", error); }
    }, 1000);
  }
  function deleteBackup() {
    try { localStorage.removeItem(BACKUP_KEY); setBackup(null); }
    catch (error) { console.error("Failed to delete local backup", error); }
  }
  return { backup, saveBackup, deleteBackup };
}

const SortableItem = memo(function SortableItem({ id, section, focusedSectionSlug, setFocusedSectionSlug, onDeleteSection, onResetSection }) {
  const sortable = useSortable({ id });
  const focus = () => { localStorage.setItem(FOCUS_KEY, id); setFocusedSectionSlug(id); };
  const stopAnd = (action) => (event) => { event.stopPropagation(); action(section.slug); };
  const reset = (event) => {
    event.stopPropagation();
    if (window.confirm("The section will be reset to default template; to continue, click OK")) onResetSection(section.slug);
  };
  return h("li", {
    ref: sortable.setNodeRef,
    style: { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition },
    onClick: focus,
    onKeyUp: (event) => event.key.toLowerCase() === "enter" && focus(),
    tabIndex: 0,
    className: "bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " + (section.slug === focusedSectionSlug ? "ring-2 ring-emerald-400" : ""),
  },
  h("button", { type: "button", className: "p-2 -m-1 mr-1 focus:outline-none", ...sortable.attributes, ...sortable.listeners }, h("img", { className: "w-5 h-5", src: "drag.svg", alt: "Drag to reorder" })),
  h("p", null, section.name),
  h("button", { type: "button", className: "p-2 absolute right-8", onClick: reset, "aria-label": "Reset section" }, h("img", { className: "w-auto h-5", src: "reset.svg", alt: "Reset section" })),
  h("button", { type: "button", className: "p-2 absolute right-1", onClick: stopAnd(onDeleteSection), "aria-label": "Delete section" }, h("img", { className: "w-auto h-5", src: "trash.svg", alt: "Delete section" })));
});

function CustomSection({ setTemplates, setSelectedSectionSlugs, setFocusedSectionSlug, setpageRefreshed, setAddAction, saveBackup }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const input = useRef(null);
  function add(event) {
    event.preventDefault();
    const slug = `custom-${title.toLowerCase().replace(/\s/g, "-")}`;
    const section = { slug, name: title, markdown: `\n## ${title}` };
    localStorage.setItem(FOCUS_KEY, slug);
    setTemplates((templates) => { const next = [...templates, section]; saveBackup(next); return next; });
    setpageRefreshed(false); setAddAction(true);
    setSelectedSectionSlugs((slugs) => [...slugs, slug]);
    setFocusedSectionSlug(slug); setTitle(""); setOpen(false);
  }
  return h(Fragment, null,
    h("button", { type: "button", onClick: () => setOpen(true), className: "mb-3 flex items-center justify-center w-full py-2 bg-white font-bold rounded-md shadow" }, "+ Custom Section"),
    h(Transition, { show: open, as: Fragment }, h(Dialog, { as: "div", className: "fixed z-10 inset-0 overflow-y-auto", initialFocus: input, onClose: setOpen },
      h(TransitionChild, { as: Fragment, enter: "ease-out duration-300", enterFrom: "opacity-0", enterTo: "opacity-100", leave: "ease-in duration-200", leaveFrom: "opacity-100", leaveTo: "opacity-0" }, h(DialogBackdrop, { className: "fixed inset-0 bg-gray-500 bg-opacity-75" })),
      h("div", { className: "flex items-end justify-center min-h-screen p-4" }, h(DialogPanel, { className: "bg-white rounded-lg p-6 shadow-xl sm:max-w-lg sm:w-full" },
        h("form", { onSubmit: add }, h(DialogTitle, { as: "h3", className: "text-lg font-medium" }, "New Custom Section"),
          h("input", { ref: input, type: "text", name: "title", id: "title", value: title, onChange: (e) => setTitle(e.target.value), className: "my-4 shadow-sm p-2 w-full border rounded-md", placeholder: "Section title", "aria-label": "Section Title" }),
          h("div", { className: "grid grid-cols-2 gap-3" },
            h("button", { type: "button", onClick: () => setOpen(false), className: "border rounded-md px-4 py-2" }, "Cancel"),
            h("button", { type: "submit", disabled: !title, className: "bg-emerald-500 text-white rounded-md px-4 py-2 disabled:opacity-50" }, "Add Section"))))))));
}

function SectionFilter({ searchFilter, setSearchFilter }) {
  return h("input", { type: "text", placeholder: "Search for a section", "aria-label": "Search for a section", "data-testid": "slugs-filter", value: searchFilter, onChange: (e) => setSearchFilter(e.target.value), className: "mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow" });
}

function kebabCaseToTitleCase(slug) {
  return slug.split("-").map((word) => word.slice(0, 1).toUpperCase() + word.slice(1)).join(" ");
}

function SectionsColumn(props) {
  const { selectedSectionSlugs, setSelectedSectionSlugs, sectionSlugs, setSectionSlugs, setFocusedSectionSlug, focusedSectionSlug, templates, originalTemplate, setTemplates, getTemplate, setpageRefreshed, setAddAction } = props;
  const [searchFilter, setSearchFilter] = useState("");
  const { saveBackup, deleteBackup } = useLocalStorage();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    const saved = localStorage.getItem(SLUGS_KEY);
    if (saved) {
      const slugs = saved.split(",");
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(localStorage.getItem(FOCUS_KEY) || slugs[0]);
    } else if (!selectedSectionSlugs.length) {
      setpageRefreshed(true); setSelectedSectionSlugs([TITLE_SLUG]); setFocusedSectionSlug(TITLE_SLUG); localStorage.setItem(FOCUS_KEY, TITLE_SLUG);
    }
  }, []);
  useEffect(() => { localStorage.setItem(SLUGS_KEY, selectedSectionSlugs); }, [selectedSectionSlugs]);

  const selected = useMemo(() => new Set(selectedSectionSlugs), [selectedSectionSlugs]);
  const available = useMemo(() => sectionSlugs.filter((slug) => slug === TITLE_SLUG || !selected.has(slug)).sort(), [sectionSlugs, selected]);
  const filtered = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return query ? available.filter((slug) => getTemplate(slug).name.toLowerCase().includes(query)) : available;
  }, [available, getTemplate, searchFilter]);

  function focus(slug) { setFocusedSectionSlug(slug); localStorage.setItem(FOCUS_KEY, slug); }
  function add(slug) {
    setpageRefreshed(false); setAddAction(true);
    setSectionSlugs((items) => items.filter((item) => item !== slug));
    setSelectedSectionSlugs((items) => [...items, slug]); focus(slug); setSearchFilter("");
  }
  function remove(slug) {
    setSelectedSectionSlugs((items) => items.filter((item) => item !== slug));
    setSectionSlugs((items) => [...items, slug]); focus(NO_EDIT_SLUG);
  }
  function reset(slug) {
    const custom = slug.startsWith("custom-");
    const name = custom ? kebabCaseToTitleCase(slug.slice(7)) : getTemplate(slug).name;
    const replacement = custom ? { slug, name, markdown: `\n## ${name}` } : originalTemplate.find((item) => item.slug === slug);
    const next = templates.map((item) => item.slug === slug ? replacement : item);
    setTemplates(next); saveBackup(next);
  }
  function resetAll() {
    if (!window.confirm("All sections of your readme will be removed; to continue, click OK")) return;
    const saved = localStorage.getItem(SLUGS_KEY);
    const old = saved ? saved.split(",") : [];
    setSectionSlugs((items) => [...items, ...old.filter((slug) => slug !== TITLE_SLUG)]);
    setSelectedSectionSlugs([TITLE_SLUG]); focus(NO_EDIT_SLUG); setTemplates(originalTemplate); deleteBackup();
  }
  function dragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    setSelectedSectionSlugs((items) => arrayMove(items, items.indexOf(active.id), items.indexOf(over.id)));
  }

  const selectedItems = selectedSectionSlugs.map((slug) => h(SortableItem, { key: slug, id: slug, section: getTemplate(slug), focusedSectionSlug, setFocusedSectionSlug, onDeleteSection: remove, onResetSection: reset }));
  const availableItems = filtered.length ? filtered.map((slug) => h("li", { key: slug }, h("button", { type: "button", onClick: () => add(slug), className: "flex items-center w-full py-2 pl-3 bg-white rounded-md shadow" }, getTemplate(slug).name))) : h("h4", { className: "mb-3 text-xs", key: "unavailable-section" }, "The section you're looking for is unavailable");

  return h("div", { className: "sections w-full md:w-64 lg:w-80" },
    h("h3", { className: "px-1 text-sm font-medium text-emerald-500" }, "Sections", h("button", { type: "button", onClick: resetAll, className: "float-right" }, h("img", { className: "w-auto h-5 inline-block", src: "reset.svg", alt: "Reset" }), h("span", { className: "pl-2" }, "Reset"))),
    h("div", { className: "px-3 pr-4 overflow-y-scroll full-screen" },
      selectedSectionSlugs.length ? h("h4", { className: "mb-3 text-xs" }, "Click on a section below to edit the contents") : null,
      h("ul", { className: "mb-12 space-y-3" }, h(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: dragEnd, modifiers: [restrictToVerticalAxis] }, h(SortableContext, { items: selectedSectionSlugs }, selectedItems))),
      h("h4", { className: "mb-3 text-xs" }, "Click on a section below to add it to your readme"),
      h(SectionFilter, { searchFilter, setSearchFilter }),
      h(CustomSection, { setTemplates, setSelectedSectionSlugs, setFocusedSectionSlug, setpageRefreshed, setAddAction, saveBackup }),
      h("ul", { className: "mb-12 space-y-3" }, availableItems)));
}

Object.defineProperty(module.exports, "SectionsColumn", { enumerable: true, get: () => SectionsColumn });
