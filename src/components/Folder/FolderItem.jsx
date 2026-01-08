import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { LeadList } from '@/components/Lead';
import { useLeadsContext } from '@/context/LeadsContext';

export default function FolderItem({ folder, isSelected }) {
  const { renameFolder, deleteFolder } = useLeadsContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 300); // 300ms delay to open
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 300); // 300ms delay to close
  };

  const handleBlur = (e) => {
    const newNameWithCount = e.target.textContent.trim();
    const newName = newNameWithCount.replace(/\s*\(\d+\)$/, '').trim();

    if (newName && newName !== folder.name) {
      renameFolder(folder.id, newName);
    } else {
      e.target.textContent = `${folder.name} (${folder.items.length})`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <div
      className={`bg-dark-card rounded-[10px] p-[10px] mb-3 transition-all duration-300 shadow-card border border-transparent max-w-[600px] group ${
        isSelected ? 'shadow-glow-selected border-neon-blue' : ''
      }`}
      id={`folder-div-${folder.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="flex justify-between items-center select-none cursor-pointer py-1 m-0 hover:text-link-blue">
        <span
          className="cursor-text px-1 rounded grow focus:outline-none focus:shadow-none focus:bg-transparent focus:border-b-2 focus:border-neon-blue focus:pb-0"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        >
          {folder.name} ({folder.items.length})
        </span>
        <button
          className="bg-transparent text-delete-red p-2 rounded hover:bg-dark-bg transition-colors opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete folder "${folder.name}" and all its links?`)) {
              deleteFolder(folder.id);
            }
          }}
          title="Delete Folder"
        >
          <Trash2 size={18} />
        </button>
      </h3>

      <LeadList leads={folder.items} folderId={folder.id} isExpanded={isExpanded} />
    </div>
  );
}
