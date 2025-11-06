// Folder management logic (STANDALONE - no circular imports)
export function reorderFolders(myLeadsByFolder, folderToPrioritize) {
    if (!folderToPrioritize || folderToPrioritize === "") return myLeadsByFolder;

    const newOrder = {};
    const keys = Object.keys(myLeadsByFolder);
    const index = keys.indexOf(folderToPrioritize);

    if (index > -1) {
        newOrder[folderToPrioritize] = myLeadsByFolder[folderToPrioritize];
        
        keys.splice(index, 1);
        keys.forEach(key => {
            newOrder[key] = myLeadsByFolder[key];
        });
        
        return newOrder;
    }
    return myLeadsByFolder;
}

export function addFolder(myLeadsByFolder, folderName) {
    if (!folderName.trim()) return myLeadsByFolder;

    if (!myLeadsByFolder[folderName]) {
        const updatedData = { ...myLeadsByFolder, [folderName]: [] };
        return reorderFolders(updatedData, folderName);
    }
    return myLeadsByFolder; // Return original if folder exists
}

export function renameFolder(myLeadsByFolder, oldName, newName) {
    newName = newName.trim();
    if (oldName === newName || newName === "" || myLeadsByFolder[newName]) {
        return myLeadsByFolder; // Return original if invalid
    }

    const updatedData = { ...myLeadsByFolder };
    updatedData[newName] = updatedData[oldName];
    delete updatedData[oldName];
    
    return reorderFolders(updatedData, newName);
}

export function deleteFolder(myLeadsByFolder, folderName) {
    const updatedData = { ...myLeadsByFolder };
    delete updatedData[folderName];
    return updatedData;
}