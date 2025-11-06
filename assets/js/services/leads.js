import { truncateName } from '../utils/helpers.js';

// Lead management logic
export function saveLink(myLeadsByFolder, link, defaultTitle = null, folderName) {
    if (!link || !folderName || folderName === "") return myLeadsByFolder;

    const defaultName = truncateName(defaultTitle || link, 70);
    let newName = window.prompt(`Saving to "${folderName}". Set a name for the link:`, defaultName);
    
    if (newName === null || newName.trim() === "") {
        if (newName === null) {
            console.log("Link saving cancelled by user.");
        } else {
            alert("The link name cannot be empty. Saving cancelled.");
        }
        return myLeadsByFolder;
    }
    
    const finalLinkName = truncateName(newName);
    const updatedData = { ...myLeadsByFolder };
    
    if (!updatedData[folderName]) updatedData[folderName] = [];
    updatedData[folderName].push({ url: link, name: finalLinkName });
    
    return updatedData; // Let main.js handle reordering
}

export function deleteSingleLead(myLeadsByFolder, folderName, index) {
    const updatedData = { ...myLeadsByFolder };
    
    if (updatedData[folderName] && updatedData[folderName][index]) {
        updatedData[folderName].splice(index, 1);
        
        if (updatedData[folderName].length === 0) {
            delete updatedData[folderName];
        }
    }
    return updatedData; // Let main.js handle reordering
}

export function editLeadName(myLeadsByFolder, folderName, index, newName) {
    const updatedData = { ...myLeadsByFolder };
    
    if (updatedData[folderName] && updatedData[folderName][index]) {
        updatedData[folderName][index].name = truncateName(newName);
    }
    return updatedData; // Let main.js handle reordering
}