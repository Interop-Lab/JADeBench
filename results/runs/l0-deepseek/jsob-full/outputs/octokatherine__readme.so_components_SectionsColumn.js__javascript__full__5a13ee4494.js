const { DndContext, closestCenter, PointerSensor, useSensor, useSensors } = require('@dnd-kit/core');
const { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } = require('@dnd-kit/sortable');
const { restrictToVerticalAxis } = require('@dnd-kit/modifiers');
const { CSS } = require('@dnd-kit/utilities');
const React = require('react');
const { Dialog, Transition } = require('@headlessui/react');

function useLocalStorage() {
  const [activeSection, setActiveSection] = React.useState(null);
  const [timeoutId, setTimeoutId] = React.useState(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('activeSection');
    if (stored) {
      setActiveSection(JSON.parse(stored));
    }
  }, []);

  const saveBackup = (value) => {
    try {
      if (timeoutId) clearTimeout(timeoutId);
      setTimeoutId(setTimeout(() => {
        localStorage.setItem('activeSection', JSON.stringify(value));
      }, 500));
    } catch (error) {
      console.error('Error saving backup');
    }
  };

  const deleteBackup = () => {
    try {
      localStorage.removeItem('activeSection');
    } catch (error) {
      console.error('Error deleting backup');
    }
  };

  return { activeSection, saveBackup, deleteBackup };
}

const SortableItem = React.memo(function SortableItem({ id, template, focusedSectionSlug, setFocusedSectionSlug, onRemove, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    localStorage.setItem('focusedSectionSlug', id);
    setFocusedSectionSlug(id);
  };

  const handleDuplicate = (event) => {
    event.stopPropagation();
    onDuplicate(id);
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    onRemove(id);
  };

  const handleKeyUp = (event) => {
    if (event.target.tagName.toLowerCase() === 'button') {
      handleClick();
    }
  };

  return React.createElement('li', {
    ref: setNodeRef,
    style,
    ...attributes,
    onClick: handleClick,
    onKeyUp: handleKeyUp,
    className: 'sortable-item' + (focusedSectionSlug === id ? ' focused' : ''),
  },
    React.createElement('button', {
      type: 'button',
      className: 'drag-handle',
      ...listeners,
    },
      React.createElement('img', {
        className: 'drag-icon',
        src: '/icons/drag.svg',
        alt: 'Drag',
      }),
    ),
    React.createElement('p', null, template.name),
    focusedSectionSlug === id && React.createElement(React.Fragment, null,
      React.createElement('button', {
        className: 'duplicate-button',
        type: 'button',
        'aria-label': 'Duplicate section',
        onClick: handleDuplicate,
      },
        React.createElement('img', {
          className: 'duplicate-icon',
          src: '/icons/duplicate.svg',
          alt: 'Duplicate',
        }),
      ),
      React.createElement('button', {
        className: 'remove-button',
        type: 'button',
        'aria-label': 'Remove section',
        onClick: handleRemove,
      },
        React.createElement('img', {
          className: 'remove-icon',
          src: '/icons/remove.svg',
          alt: 'Remove',
        }),
      ),
    ),
  );
});

const CustomSection = ({ setTemplates, setSelectedSectionSlugs, setFocusedSectionSlug, setpageRefreshed, setAddAction }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [sectionName, setSectionName] = React.useState('');
  const { saveBackup } = useLocalStorage();
  const initialFocusRef = React.useRef(null);

  const handleAddSection = (event) => {
    event?.preventDefault();
    if (!sectionName) return;
    setIsOpen(false);
    const newSection = {
      slug: 'custom-' + sectionName.toLowerCase().replace(/\s/g, '-'),
      name: sectionName,
      markdown: '# ' + sectionName,
    };
    localStorage.setItem('focusedSectionSlug', newSection.slug);
    setTemplates(prev => {
      const updated = [...prev, newSection];
      saveBackup(updated);
      return updated;
    });
    setpageRefreshed(false);
    setAddAction(true);
    setSelectedSectionSlugs(prev => [...prev, newSection.slug]);
    setFocusedSectionSlug(localStorage.getItem('focusedSectionSlug'));
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return React.createElement(React.Fragment, null,
    React.createElement('button', {
      type: 'button',
      className: 'add-section-button',
      onClick: openModal,
    },
      React.createElement('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        className: 'add-icon',
        viewBox: '0 0 20 20',
        fill: 'currentColor',
      },
        React.createElement('path', {
          fillRule: 'evenodd',
          d: 'M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z',
          clipRule: 'evenodd',
        }),
      ),
    ),
    React.createElement(Transition, {
      show: isOpen,
      as: React.Fragment,
      enter: 'transition ease-out duration-100',
      enterFrom: 'transform opacity-0 scale-95',
      enterTo: 'transform opacity-100 scale-100',
      leave: 'transition ease-in duration-75',
      leaveFrom: 'transform opacity-100 scale-100',
      leaveTo: 'transform opacity-0 scale-95',
    },
      React.createElement(Dialog, {
        as: 'div',
        className: 'modal-overlay',
        initialFocus: initialFocusRef,
        onClose: closeModal,
      },
        React.createElement('div', { className: 'modal-backdrop', 'aria-hidden': 'true' }, '\u200B'),
        React.createElement('div', { className: 'modal-container' },
          React.createElement(Transition.Child, {
            enter: 'transition ease-out duration-100',
            enterFrom: 'transform opacity-0 scale-95',
            enterTo: 'transform opacity-100 scale-100',
            leave: 'transition ease-in duration-75',
            leaveFrom: 'transform opacity-100 scale-100',
            leaveTo: 'transform opacity-0 scale-95',
          },
            React.createElement(Dialog.Panel, { className: 'modal-panel' },
              React.createElement(Dialog.Title, { as: 'h3', className: 'modal-title' }, 'Add Custom Section'),
              React.createElement('form', { className: 'modal-form', onSubmit: handleAddSection },
                React.createElement('input', {
                  ref: initialFocusRef,
                  type: 'text',
                  name: 'sectionName',
                  id: 'sectionName',
                  onChange: (e) => setSectionName(e.target.value),
                  className: 'modal-input',
                  placeholder: 'Section name',
                  'aria-label': 'Section name',
                }),
                React.createElement('button', {
                  type: 'submit',
                  className: 'modal-submit',
                  disabled: !sectionName,
                }, 'Add Section'),
                React.createElement('button', {
                  type: 'button',
                  className: 'modal-cancel',
                  onClick: closeModal,
                }, 'Cancel'),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};

const SectionFilter = ({ searchFilter, setSearchFilter }) => {
  return React.createElement('input', {
    type: 'text',
    placeholder: 'Search sections...',
    'aria-label': 'Search sections',
    className: 'section-filter',
    'data-testid': 'section-filter',
    value: searchFilter,
    onChange: (e) => setSearchFilter(e.target.value),
  });
};

function kebabCaseToTitleCase(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const SectionsColumn = ({
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
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const [pageRefreshed, setPageRefreshed] = React.useState(false);
  const [addAction, setAddAction] = React.useState(false);
  const [removedSlugs, setRemovedSlugs] = React.useState([]);
  const [searchFilter, setSearchFilter] = React.useState('');
  const [filteredSlugs, setFilteredSlugs] = React.useState([]);
  const { saveBackup, deleteBackup } = useLocalStorage();

  React.useEffect(() => {
    const stored = localStorage.getItem('selectedSectionSlugs');
    const parsed = stored ? JSON.parse(stored) : [];
    setSelectedSectionSlugs(parsed);
    if (parsed.length > 0) {
      setPageRefreshed(true);
      const slugs = parsed.join(',');
      slugs.split(',').forEach(slug => {
        setSectionSlugs(prev => prev.filter(s => s !== slug));
      });
      setSelectedSectionSlugs(slugs);
      setFocusedSectionSlug(slugs[0]);
      localStorage.setItem('focusedSectionSlug', slugs[0]);
    }
  }, []);

  const removeSlug = (slug) => {
    return sectionSlugs.filter(s => s !== slug);
  };

  const addSlug = (event, slug) => {
    event.preventDefault();
    setPageRefreshed(false);
    setSectionSlugs(prev => removeSlug(prev, slug));
    setSelectedSectionSlugs(prev => [...prev, slug]);
    setFocusedSectionSlug(localStorage.getItem('focusedSectionSlug'));
    setAddAction(true);
    localStorage.setItem('focusedSectionSlug', slug);
    setSectionSlugs(prev => removeSlug(prev, slug));
    setSelectedSectionSlugs(prev => [...prev, slug]);
    setPageRefreshed(false);
  };

  React.useEffect(() => {
    localStorage.setItem('selectedSectionSlugs', selectedSectionSlugs);
  }, [selectedSectionSlugs]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSelectedSectionSlugs(prev => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const removeSection = (event, slug) => {
    event.preventDefault();
    setSectionSlugs(prev => [...prev, slug]);
    setSelectedSectionSlugs(prev => prev.filter(s => s !== slug));
    setFocusedSectionSlug(null);
    localStorage.setItem('focusedSectionSlug', '');
  };

  const duplicateSection = (event, slug) => {
    event.preventDefault();
    let newTemplate;
    if (slug.slice(0, 7) === 'custom-') {
      const title = kebabCaseToTitleCase(slug.slice(7, slug.length));
      newTemplate = { slug, name: title, markdown: '# ' + title };
    } else {
      newTemplate = originalTemplate.find(t => t.slug === slug);
    }
    const updatedTemplates = templates.map(t => {
      if (t.slug === newTemplate.slug) {
        return newTemplate;
      }
      return t;
    });
    setTemplates(updatedTemplates);
    saveBackup(updatedTemplates);
  };

  const resetSections = () => {
    const stored = localStorage.getItem('selectedSectionSlugs');
    const confirmReset = window.confirm('Are you sure you want to reset sections?');
    if (confirmReset) {
      const slugs = stored ? stored.split(',') : [];
      setSectionSlugs(prev => [...prev, ...slugs].filter(s => s !== 'custom-section'));
      setSelectedSectionSlugs(['custom-section']);
      setFocusedSectionSlug('custom-section');
      localStorage.setItem('focusedSectionSlug', 'custom-section');
      setTemplates(originalTemplate);
      deleteBackup();
    }
  };

  const visibleSlugs = React.useMemo(() => {
    return pageRefreshed && addAction ? [...new Set(selectedSectionSlugs)] : selectedSectionSlugs;
  }, [selectedSectionSlugs, pageRefreshed, addAction]);

  const filteredSections = React.useMemo(() => {
    let sections = [...sectionSlugs];
    if (pageRefreshed && removedSlugs.indexOf('custom-section') === -1) {
      if (!sections.includes('custom-section')) {
        sections.push('custom-section');
      }
    }
    const filtered = filteredSlugs.length ? [...filteredSlugs].sort() : [...sections].sort();
    return pageRefreshed && addAction ? [...new Set(filtered)] : filtered;
  }, [sectionSlugs, filteredSlugs, pageRefreshed, addAction, removedSlugs]);

  const searchSections = (query) => {
    const results = sectionSlugs.filter(slug => {
      return getTemplate(slug).name.toLowerCase().includes(query.toLowerCase());
    });
    return results.length ? results : [undefined];
  };

  const clearSearch = () => setSearchFilter('');

  React.useEffect(() => {
    if (!searchFilter) {
      setFilteredSlugs([]);
      return;
    }
    const results = searchSections(searchFilter.toLowerCase());
    setFilteredSlugs(results);
  }, [searchFilter]);

  const sortableItems = visibleSlugs;

  return React.createElement('div', { className: 'sections-column' },
    React.createElement('h3', { className: 'sections-title' }, 'Sections',
      React.createElement('button', {
        className: 'reset-button',
        type: 'button',
        onClick: resetSections,
      },
        React.createElement('img', {
          className: 'reset-icon',
          src: '/icons/reset.svg',
          alt: 'Reset',
        }),
      ),
    ),
    React.createElement('div', { className: 'sections-list' },
      selectedSectionSlugs.length > 0 && React.createElement('h4', { className: 'selected-sections-title' }, 'Selected Sections'),
      React.createElement('ul', { className: 'selected-sections-list' },
        React.createElement(DndContext, {
          sensors,
          collisionDetection: closestCenter,
          onDragEnd: handleDragEnd,
          modifiers: [restrictToVerticalAxis],
        },
          React.createElement(SortableContext, {
            items: sortableItems,
            strategy: verticalListSortingStrategy,
          },
            sortableItems.map(slug => {
              const template = getTemplate(slug);
              if (template) {
                return React.createElement(SortableItem, {
                  key: slug,
                  id: slug,
                  template,
                  focusedSectionSlug,
                  setFocusedSectionSlug,
                  onRemove: removeSection,
                  onDuplicate: duplicateSection,
                });
              }
            }),
          ),
        ),
      ),
      sectionSlugs.length > 0 && React.createElement('h4', { className: 'available-sections-title' }, 'Available Sections'),
      React.createElement(SectionFilter, { searchFilter, setSearchFilter }),
      React.createElement(CustomSection, {
        setSelectedSectionSlugs,
        setFocusedSectionSlug,
        setpageRefreshed: setPageRefreshed,
        setAddAction,
        setTemplates,
      }),
      React.createElement('ul', { className: 'available-sections-list' },
        filteredSections.map(slug => {
          if (slug === undefined) {
            return React.createElement('h4', { className: 'no-results' }, 'No sections found');
          } else {
            const template = getTemplate(slug);
            if (template) {
              return React.createElement('li', { key: slug },
                React.createElement('button', {
                  className: 'add-section-button',
                  type: 'button',
                  onClick: (event) => addSlug(event, slug),
                },
                  React.createElement('span', null, template.name),
                ),
              );
            }
          }
        }),
      ),
    ),
  );
};

module.exports = { SectionsColumn };
