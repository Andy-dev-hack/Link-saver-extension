import React, { useState } from 'react';
import LeadList from './LeadList';
import { useLeadsContext } from '@/context/LeadsContext';

export default function FolderItem({ folderName, leads, isSelected }) {
  const { renameFolder, deleteFolder } = useLeadsContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = React.useRef(null);

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

    if (newName && newName !== folderName) {
      renameFolder(folderName, newName);
    } else {
      e.target.textContent = `${folderName} (${leads.length})`;
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
      id={`folder-div-${folderName}`}
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
          {folderName} ({leads.length})
        </span>
        <button
          className="bg-delete-red text-white border-none rounded-[5px] px-[15px] py-2 cursor-pointer font-bold flex-none transition-all duration-200 hover:bg-delete-red-hover hover:scale-105 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            deleteFolder(folderName);
          }}
        >
          Delete Folder
        </button>
      </h3>

      <LeadList leads={leads} folderName={folderName} isExpanded={isExpanded} />
    </div>
  );
}
