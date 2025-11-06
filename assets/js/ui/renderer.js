import { highlightSelectedFolder } from '../utils/helpers.js';

// UI Rendering functions
export function renderFolders(folders, ulEl, folderSelect, onFolderRename, onFolderDelete, onLeadEdit, onLeadDelete) {
    ulEl.innerHTML = "";
    
    if (Object.keys(folders).length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No folders yet. Create your first folder above!';
        ulEl.appendChild(emptyState);
        return;
    }
    
    const currentlySelected = folderSelect.value; 

    for (const folderName in folders) {
        const leads = folders[folderName];

        // Folder container
        const folderDiv = document.createElement("div");
        folderDiv.className = "folder";
        folderDiv.id = `folder-div-${folderName}`; 
        
        if (folderName === currentlySelected) {
            folderDiv.classList.add('neon-selected');
        }
        
        folderDiv.addEventListener("mouseenter", () => toggleFolder(folderName, true));
        folderDiv.addEventListener("mouseleave", () => toggleFolder(folderName, false));

        // Folder title bar
        const titleBar = document.createElement("h3");
        titleBar.className = "folder-title";

        const titleLabel = document.createElement("span");
        titleLabel.className = "folder-label";
        titleLabel.textContent = `${folderName} (${leads.length})`;
        titleLabel.contentEditable = true; 
        
        titleLabel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                titleLabel.blur(); 
            }
        });

        titleLabel.addEventListener("blur", (e) => {
            const newNameWithCount = e.target.textContent.trim();
            const newName = newNameWithCount.replace(/\s*\(\d+\)$/, '').trim(); 
            
            if (newName && newName !== folderName) {
                onFolderRename(folderName, newName);
            } else {
                 e.target.textContent = `${folderName} (${leads.length})`;
            }
        });

        const deleteFolderBtn = document.createElement("button");
        deleteFolderBtn.className = "delete-folder-btn";
        deleteFolderBtn.textContent = "Delete Folder";

        deleteFolderBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            onFolderDelete(folderName);
        });

        titleBar.appendChild(titleLabel);
        titleBar.appendChild(deleteFolderBtn);
        folderDiv.appendChild(titleBar);

        // Folder content (list)
        const ul = document.createElement("ul");
        ul.className = "folder-list collapsed"; 
        ul.id = `folder-list-${folderName}`;

        // Link items
        leads.forEach((lead, i) => { 
            const li = document.createElement("li");
            li.className = "lead-item";
            
            const nameSpan = document.createElement("span");
            nameSpan.textContent = lead.name;
            nameSpan.className = "lead-name";
            nameSpan.contentEditable = true; 
            
            nameSpan.addEventListener("blur", (e) => {
                const newName = e.target.textContent.trim();
                if (newName && newName !== lead.name) {
                    onLeadEdit(folderName, i, newName);
                } else {
                    e.target.textContent = lead.name;
                }
            });
            
            const a = document.createElement("a");
            a.href = lead.url;
            a.target = "_blank";
            a.rel = "noopener noreferrer"; // Security best practice
            a.textContent = ' (Link)';
            a.title = lead.url;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-item-btn";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => {
                onLeadDelete(folderName, i);
            });

            li.appendChild(nameSpan);
            li.appendChild(a);
            li.appendChild(deleteBtn);

            ul.appendChild(li);
        });

        folderDiv.appendChild(ul);
        ulEl.appendChild(folderDiv);
    }
    
    highlightSelectedFolder(currentlySelected);
}

export function updateFolderDropdown(folderSelect, folders) {
    folderSelect.innerHTML = "";
    
    const placeholderOption = document.createElement("option");
    placeholderOption.value = ""; 
    placeholderOption.textContent = "Destination Folder";
    placeholderOption.disabled = true;
    
    folderSelect.appendChild(placeholderOption);
    
    for (const folderName in folders) {
        const option = document.createElement("option");
        option.value = folderName;
        option.textContent = folderName;
        folderSelect.appendChild(option);
    }
    
    // Auto-select first folder if none selected
    if (folderSelect.value === "" && Object.keys(folders).length > 0) {
        folderSelect.value = Object.keys(folders)[0];
        placeholderOption.selected = false;
    } else {
        placeholderOption.selected = true;
    }
}

function toggleFolder(folderName, open) {
    const folderList = document.getElementById(`folder-list-${folderName}`);
    if (folderList) {
        if (open) {
            folderList.classList.remove("collapsed");
        } else {
            folderList.classList.add("collapsed");
        }
    }
}
