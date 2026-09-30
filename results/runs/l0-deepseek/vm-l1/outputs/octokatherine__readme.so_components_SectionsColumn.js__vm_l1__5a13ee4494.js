const React = require('react');
const { useSortable } = require('@dnd-kit/sortable');
const { CSS } = require('@dnd-kit/utilities');
const { useDroppable } = require('@dnd-kit/core');
const { restrictToVerticalAxis } = require('@dnd-kit/modifiers');
const { Menu, Transition } = require('@headlessui/react');

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = React.useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

function kebabCaseToTitleCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const SortableItemMemo = React.memo(SortableItem);

function CustomSection({ section, index, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(section.title || '');
  const [content, setContent] = React.useState(section.content || '');

  const handleSave = () => {
    onUpdate(index, { ...section, title, content });
    setIsEditing(false);
  };

  return (
    <div className="custom-section">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section title"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Section content"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>{title || 'Untitled Section'}</h3>
          <p>{content}</p>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onRemove(index)}>Remove</button>
        </div>
      )}
    </div>
  );
}

function SectionFilter({ filter, setFilter }) {
  return (
    <div className="section-filter">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter sections..."
      />
    </div>
  );
}

function SectionsColumn({ sections, setSections }) {
  const [filter, setFilter] = React.useState('');
  const [newSectionTitle, setNewSectionTitle] = React.useState('');
  const [newSectionContent, setNewSectionContent] = React.useState('');

  const { setNodeRef, isOver } = useDroppable({ id: 'sections-column' });

  const filteredSections = React.useMemo(() => {
    if (!filter.trim()) return sections;
    const lowerFilter = filter.toLowerCase();
    return sections.filter(
      (section) =>
        (section.title || '').toLowerCase().includes(lowerFilter) ||
        (section.content || '').toLowerCase().includes(lowerFilter)
    );
  }, [sections, filter]);

  const handleAddSection = () => {
    if (!newSectionTitle.trim() && !newSectionContent.trim()) return;
    const newSection = {
      id: Date.now().toString(),
      title: newSectionTitle.trim(),
      content: newSectionContent.trim(),
    };
    setSections([...sections, newSection]);
    setNewSectionTitle('');
    setNewSectionContent('');
  };

  const handleRemoveSection = (index) => {
    const actualIndex = sections.indexOf(filteredSections[index]);
    if (actualIndex === -1) return;
    const updated = [...sections];
    updated.splice(actualIndex, 1);
    setSections(updated);
  };

  const handleUpdateSection = (index, updatedSection) => {
    const actualIndex = sections.indexOf(filteredSections[index]);
    if (actualIndex === -1) return;
    const updated = [...sections];
    updated[actualIndex] = updatedSection;
    setSections(updated);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const updated = [...sections];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);
    setSections(updated);
  };

  return (
    <div ref={setNodeRef} className={`sections-column ${isOver ? 'is-over' : ''}`}>
      <SectionFilter filter={filter} setFilter={setFilter} />

      <div className="add-section">
        <input
          type="text"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder="New section title"
        />
        <textarea
          value={newSectionContent}
          onChange={(e) => setNewSectionContent(e.target.value)}
          placeholder="New section content"
        />
        <button onClick={handleAddSection}>Add Section</button>
      </div>

      <div className="sections-list">
        {filteredSections.map((section, index) => (
          <SortableItemMemo key={section.id} id={section.id}>
            <CustomSection
              section={section}
              index={index}
              onRemove={handleRemoveSection}
              onUpdate={handleUpdateSection}
            />
          </SortableItemMemo>
        ))}
      </div>
    </div>
  );
}

module.exports = { SectionsColumn };
