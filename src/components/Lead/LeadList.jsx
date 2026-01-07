import { useLeadsContext } from '@/context/LeadsContext';

export default function LeadList({ leads, folderId, isExpanded }) {
  const { deleteLead, editLead } = useLeadsContext();

  return (
    <ul
      className={`list-none p-0 m-0 min-h-[10px] transition-all duration-300 ${
        isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'
      }`}
    >
      {leads.map((lead, index) => (
        <li key={lead.id || index} className="list-none">
          <div className="flex justify-between items-center p-[10px] bg-dark-item mb-2 rounded-[5px] shadow-sm transition-all duration-200 hover:bg-dark-item-hover hover:translate-x-[5px] group/item">
            <div className="flex items-center gap-2 grow overflow-hidden">
              <span
                className="shrink-0 font-bold cursor-text px-1 rounded min-w-[50px] inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[60%] focus:outline-none focus:shadow-[0_0_0_2px_#4a6ea9] focus:bg-dark-input focus:whitespace-normal focus:overflow-auto text-text-main"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newName = e.target.textContent.trim();
                  if (newName && newName !== lead.name) {
                    editLead(folderId, index, newName);
                  } else {
                    e.target.textContent = lead.name;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                  }
                }}
              >
                {lead.name}
              </span>
              <a
                href={lead.url}
                target="_blank"
                rel="noopener noreferrer"
                title={lead.url}
                className="text-link-blue no-underline grow shrink break-all text-[0.85em] hover:underline"
              >
                (Link)
              </a>
            </div>
            <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
              <button
                className="bg-transparent border border-delete-red text-delete-red rounded-[3px] cursor-pointer text-xs px-2 py-1 hover:bg-delete-red hover:text-white"
                onClick={() => {
                  if (window.confirm('Delete this lead?')) {
                    deleteLead(folderId, index);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
