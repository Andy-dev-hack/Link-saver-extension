let myLeadsByFolder = {};
const inputEl = document.getElementById("input-el");
const folderInputEl = document.getElementById("folder-input-el");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const tabBtn = document.getElementById("tab-btn");
const addFolderBtn = document.getElementById("add-folder-btn");
const folderSelect = document.getElementById("folder-select");

// ----------------------
// Utility Functions
// ----------------------

function truncateName(name, maxLength = 45) {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
}

// Data Migration Helper
function migrateData(data) {
    const migratedData = {};
    for (const folderName in data) {
        migratedData[folderName] = data[folderName].map(lead => {
            if (typeof lead === 'string') {
                const fallbackName = truncateName(lead);
                return { url: lead, name: fallbackName };
            }
            lead.name = truncateName(lead.name); 
            return lead;
        });
    }
    return migratedData;
}

// Function to apply the blue glow/neon effect to the selected folder
function highlightSelectedFolder(selectedFolderName) {
    document.querySelectorAll('.folder').forEach(folderDiv => {
        folderDiv.classList.remove('neon-selected');
    });

    if (selectedFolderName && selectedFolderName !== "") {
        const folderToHighlight = document.getElementById(`folder-div-${selectedFolderName}`);
        if (folderToHighlight) {
            folderToHighlight.classList.add('neon-selected');
        }
    }
}


// ----------------------
// REORDERING LOGIC
// ----------------------

function reorderFolders(folderToPrioritize) {
    if (!folderToPrioritize || folderToPrioritize === "") return;

    const newOrder = {};
    const keys = Object.keys(myLeadsByFolder);
    const index = keys.indexOf(folderToPrioritize);

    if (index > -1) {
        newOrder[folderToPrioritize] = myLeadsByFolder[folderToPrioritize];
        
        keys.splice(index, 1);
        keys.forEach(key => {
            newOrder[key] = myLeadsByFolder[key];
        });
        
        myLeadsByFolder = newOrder;
    }
}

// ----------------------
// Load from localStorage & Initialization
// ----------------------
const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeadsByFolder"));
if (leadsFromLocalStorage) {
  myLeadsByFolder = migrateData(leadsFromLocalStorage);
  render(myLeadsByFolder);
  updateFolderDropdown();
  highlightSelectedFolder(folderSelect.value); 
}

// ----------------------
// Event Listeners
// ----------------------

folderSelect.addEventListener('change', (e) => {
    const selectedFolder = e.target.value;
    if (selectedFolder) {
        reorderFolders(selectedFolder);
        saveAndRender();
        folderSelect.value = selectedFolder;
    }
});


folderInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); 
        addFolder();
    }
});

function addFolder() {
  const folderName = folderInputEl.value.trim();
  if (!folderName) return;

  if (!myLeadsByFolder[folderName]) {
    myLeadsByFolder[folderName] = [];
    folderInputEl.value = "";
    reorderFolders(folderName);
    saveAndRender();
    updateFolderDropdown();
    folderSelect.value = folderName; 
    highlightSelectedFolder(folderName); 
  } else {
    alert(`Folder "${folderName}" already exists.`);
  }
}

// 🌟 CHANGE: Reverted to ONLY NAME PROMPT (no window.confirm)
inputBtn.addEventListener("click", () => {
  const link = inputEl.value.trim();
  const folderName = folderSelect.value;
  if (!link || !folderName || folderName === "") return; 

  const defaultName = truncateName(link, 70);

  // Prompt user to edit the name
  let newName = window.prompt(`Saving to "${folderName}". Set a name for the link:`, defaultName);
  
  if (newName === null || newName.trim() === "") {
    if (newName === null) {
        console.log("Link saving cancelled by user.");
    } else {
        alert("The link name cannot be empty. Saving cancelled.");
    }
    return; 
  }
  
  // Save directly after prompt
  const finalLinkName = truncateName(newName);
  
  if (!myLeadsByFolder[folderName]) myLeadsByFolder[folderName] = [];
  myLeadsByFolder[folderName].push({ url: link, name: finalLinkName });
  inputEl.value = "";
  reorderFolders(folderName);
  saveAndRender();
});

// 🌟 CHANGE: Reverted to ONLY NAME PROMPT (no window.confirm)
tabBtn.addEventListener("click", () => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const link = tabs[0].url;
      const rawTitle = tabs[0].title || link; 
      
      const folderName = folderSelect.value;
      if (!folderName || folderName === "") return; 

      const defaultName = truncateName(rawTitle, 70);

      // Prompt user to edit the name
      let newName = window.prompt(`Saving to "${folderName}". Set a name for the tab:`, defaultName);

      if (newName === null || newName.trim() === "") {
        if (newName === null) {
            console.log("Tab saving cancelled by user.");
        } else {
            alert("The tab name cannot be empty. Saving cancelled.");
        }
        return; 
      }
      
      // Save directly after prompt
      const finalLinkName = truncateName(newName);
      
      if (!myLeadsByFolder[folderName]) myLeadsByFolder[folderName] = [];
      myLeadsByFolder[folderName].push({ url: link, name: finalLinkName });
      reorderFolders(folderName);
      saveAndRender();
    });
  } else {
      alert("This functionality requires a browser extension environment (chrome.tabs).");
  }
});

addFolderBtn.addEventListener("click", addFolder);

// ----------------------
// Global Actions
// ----------------------

function renameFolder(oldName, newName) {
  newName = newName.trim();
  if (oldName === newName || newName === "") return;

  if (myLeadsByFolder[newName]) {
    alert(`A folder named "${newName}" already exists.`);
    return;
  }

  myLeadsByFolder[newName] = myLeadsByFolder[oldName];
  delete myLeadsByFolder[oldName];
  
  reorderFolders(newName);
  saveAndRender();
  updateFolderDropdown();
  folderSelect.value = newName;
  highlightSelectedFolder(newName); 
}

function deleteFolder(folderName) {
  if (confirm(`Are you sure you want to delete the folder "${folderName}" and ALL its contained links? This cannot be undone.`)) {
    delete myLeadsByFolder[folderName];
    saveAndRender();
    updateFolderDropdown();
    highlightSelectedFolder(folderSelect.value); 
  }
}

function deleteSingleLead(folderName, index) {
    const leadName = myLeadsByFolder[folderName][index].name;
    if (confirm(`Are you sure you want to delete "${leadName}"?`)) {
        myLeadsByFolder[folderName].splice(index, 1);
        if (myLeadsByFolder[folderName].length === 0) {
            delete myLeadsByFolder[folderName];
        } else {
            reorderFolders(folderName);
        }
        saveAndRender();
        updateFolderDropdown();
        highlightSelectedFolder(folderSelect.value); 
    }
}

function editLeadName(folderName, index, newName) {
  if (myLeadsByFolder[folderName] && myLeadsByFolder[folderName][index]) {
    myLeadsByFolder[folderName][index].name = truncateName(newName);
    reorderFolders(folderName);
    saveAndRender();
  }
}

// ----------------------
// Render + Save
// ----------------------
function saveAndRender() {
  localStorage.setItem("myLeadsByFolder", JSON.stringify(myLeadsByFolder));
  render(myLeadsByFolder);
}

function updateFolderDropdown() {
  folderSelect.innerHTML = "";
  
  const placeholderOption = document.createElement("option");
  placeholderOption.value = ""; 
  placeholderOption.textContent = "Destination Folder";
  placeholderOption.disabled = true;
  placeholderOption.selected = true; 
  
  folderSelect.appendChild(placeholderOption);
  
  for (const folderName in myLeadsByFolder) {
    const option = document.createElement("option");
    option.value = folderName;
    option.textContent = folderName;
    folderSelect.appendChild(option);
  }
  
  if (folderSelect.value === "" && Object.keys(myLeadsByFolder).length > 0) {
      folderSelect.value = Object.keys(myLeadsByFolder)[0];
  }
}

// ----------------------
// Folder Visibility + Rendering
// ----------------------

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

function render(folders) {
  ulEl.innerHTML = "";
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
            renameFolder(folderName, newName);
        } else {
             e.target.textContent = `${folderName} (${leads.length})`;
        }
    });

    const deleteFolderBtn = document.createElement("button");
    deleteFolderBtn.className = "delete-folder-btn";
    deleteFolderBtn.textContent = "Delete Folder";

    deleteFolderBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteFolder(folderName);
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
          editLeadName(folderName, i, newName);
        } else {
           e.target.textContent = lead.name;
        }
      });
      
      const a = document.createElement("a");
      a.href = lead.url;
      a.target = "_blank";
      a.textContent = ' (Link)';
      a.title = lead.url;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-item-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteSingleLead(folderName, i));

      li.appendChild(nameSpan);
      li.appendChild(a);
      li.appendChild(deleteBtn);

      ul.appendChild(li);
    });

    folderDiv.appendChild(ul);
    ulEl.appendChild(folderDiv);
  }
}