import { inputEl, folderInputEl, inputBtn, tabBtn, addFolderBtn, folderSelect } from '../constants/dom-elements.js';

// Event handlers setup (STATELESS - callbacks only)
export function setupEventHandlers(onAddFolder, onSaveLink, onSaveTab, onFolderSelect) {
    
    // Folder selection change
    folderSelect.addEventListener('change', (e) => {
        const selectedFolder = e.target.value;
        if (selectedFolder && onFolderSelect) {
            onFolderSelect(selectedFolder);
        }
    });

    // Enter key on folder input
    folderInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); 
            const folderName = folderInputEl.value.trim();
            if (folderName && onAddFolder) {
                onAddFolder(folderName);
            }
        }
    });

    // Enter key on link input
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); 
            const link = inputEl.value.trim();
            if (link && onSaveLink) {
                onSaveLink(link);
            }
        }
    });

    // Add folder button
    addFolderBtn.addEventListener("click", () => {
        const folderName = folderInputEl.value.trim();
        if (folderName && onAddFolder) {
            onAddFolder(folderName);
        }
    });

    // Save link button
    inputBtn.addEventListener("click", () => {
        const link = inputEl.value.trim();
        if (link && onSaveLink) {
            onSaveLink(link);
        }
    });

    // Save current tab
    tabBtn.addEventListener("click", () => {
        if (onSaveTab) {
            onSaveTab();
        }
    });
}