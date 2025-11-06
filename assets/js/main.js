import { ulEl, folderSelect, validateDOMElements } from './constants/dom-elements.js';
import { loadFromStorage, saveToStorage } from './services/storage.js';
import { renderFolders, updateFolderDropdown } from './ui/renderer.js';
import { setupEventHandlers } from './ui/events.js';
import { highlightSelectedFolder } from './utils/helpers.js';
import { addFolder, renameFolder, deleteFolder, reorderFolders } from './services/folders.js';
import { saveLink, deleteSingleLead, editLeadName } from './services/leads.js';

// Main application
class LeadsManager {
    constructor() {
        if (!validateDOMElements()) {
            console.error("Critical DOM elements missing. Application cannot start.");
            return;
        }
        
        this.myLeadsByFolder = loadFromStorage();
        this.init();
    }

    init() {
        this.render();
        this.setupEvents();
    }

    render() {
        renderFolders(this.myLeadsByFolder, ulEl, folderSelect, 
            (folderName, newName) => {
                this.updateData(renameFolder(this.myLeadsByFolder, folderName, newName));
            },
            (folderName) => {
                if (confirm(`Delete folder "${folderName}" and all its links?`)) {
                    this.updateData(deleteFolder(this.myLeadsByFolder, folderName));
                }
            },
            (folderName, index, newName) => {
                this.updateData(editLeadName(this.myLeadsByFolder, folderName, index, newName));
            },
            (folderName, index) => {
                const leadName = this.myLeadsByFolder[folderName][index].name;
                if (confirm(`Delete "${leadName}"?`)) {
                    this.updateData(deleteSingleLead(this.myLeadsByFolder, folderName, index));
                }
            }
        );
        
        updateFolderDropdown(folderSelect, this.myLeadsByFolder);
        highlightSelectedFolder(folderSelect.value);
    }

    setupEvents() {
        setupEventHandlers(
            (folderName) => {
                if (!this.myLeadsByFolder[folderName]) {
                    let updatedData = addFolder(this.myLeadsByFolder, folderName);
                    updatedData = reorderFolders(updatedData, folderName);
                    this.updateData(updatedData);
                    folderSelect.value = folderName;
                    folderInputEl.value = "";
                } else {
                    alert(`Folder "${folderName}" already exists.`);
                }
            },
            (link) => {
                const folderName = folderSelect.value;
                if (!folderName || folderName === "") {
                    alert("Please select a destination folder first.");
                    return;
                }
                
                let updatedData = saveLink(this.myLeadsByFolder, link, null, folderName);
                if (updatedData !== this.myLeadsByFolder) {
                    updatedData = reorderFolders(updatedData, folderName);
                    this.updateData(updatedData);
                    inputEl.value = "";
                }
            },
            () => {
                if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const link = tabs[0].url;
                        const rawTitle = tabs[0].title || link;
                        const folderName = folderSelect.value;
                        
                        if (!folderName || folderName === "") {
                            alert("Please select a destination folder first.");
                            return;
                        }
                        
                        let updatedData = saveLink(this.myLeadsByFolder, link, rawTitle, folderName);
                        if (updatedData !== this.myLeadsByFolder) {
                            updatedData = reorderFolders(updatedData, folderName);
                            this.updateData(updatedData);
                        }
                    });
                } else {
                    alert("This functionality requires a browser extension environment (chrome.tabs).");
                }
            },
            (selectedFolder) => {
                const updatedData = reorderFolders(this.myLeadsByFolder, selectedFolder);
                this.updateData(updatedData);
                folderSelect.value = selectedFolder;
                highlightSelectedFolder(selectedFolder); // ✅ ADDED HERE - This is the key!
            }
        );
    }

    updateData(updatedData) {
        if (updatedData !== this.myLeadsByFolder) {
            this.myLeadsByFolder = updatedData;
            saveToStorage(this.myLeadsByFolder);
            this.render();
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new LeadsManager());
} else {
    new LeadsManager();
}

export default LeadsManager;