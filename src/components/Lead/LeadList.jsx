import { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import { useLeadsContext } from '@/context/LeadsContext';
import { getFaviconUrl } from '@/utils';
import Favicon from './Favicon';

export default function LeadList({ leads, folderId, isExpanded }) {
  const { deleteLead, editLead } = useLeadsContext();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleEditStart = (lead) => {
    setEditingId(lead.id);
    setEditValue(lead.name);
  };

  const handleEditSave = (index) => {
    if (editValue && editValue.trim()) {
      editLead(folderId, index, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      handleEditSave(index);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  return (
    <ul
      className={`list-none p-0 m-0 min-h-[10px] transition-all duration-300 ${
        isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
      }`}
    >
      {leads.map((lead, index) => {
        const isEditing = editingId === lead.id;

        return (
          <li key={lead.id || index} className="list-none">
            <div className="flex justify-between items-center p-[10px] bg-dark-item mb-2 rounded-[5px] shadow-sm transition-all duration-200 hover:bg-dark-item-hover hover:translate-x-[5px] group/item">
              <div className="flex items-center gap-2 grow overflow-hidden">
                {/* Favicon */}
                <Favicon url={lead.url} />

                {isEditing ? (
                  <input
                    type="text"
                    className="bg-dark-input text-text-main border border-neon-blue rounded px-2 py-1 w-full text-sm focus:outline-none"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    autoFocus
                  />
                ) : (
                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={lead.url}
                    className="text-text-main no-underline hover:underline hover:text-link-blue truncate grow block text-sm font-medium"
                  >
                    {lead.name}
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 items-center">
                {isEditing ? (
                  <>
                    <button
                      className="text-green-500 hover:text-green-400 p-1"
                      onClick={() => handleEditSave(index)}
                      title="Save"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-300 p-1"
                      onClick={handleEditCancel}
                      title="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="text-gray-400 hover:text-neon-blue p-1 transition-colors"
                      onClick={() => handleEditStart(lead)}
                      title="Edit Name"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="text-delete-red hover:text-delete-red-hover p-1 transition-colors"
                      onClick={() => {
                        if (window.confirm('Delete this lead?')) {
                          deleteLead(folderId, index);
                        }
                      }}
                      title="Delete Lead"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
