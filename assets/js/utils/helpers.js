import { TRUNCATE_LENGTH, TRUNCATE_LENGTH_LONG } from '../constants/config.js';

// Utility Functions
export function truncateName(name, maxLength = TRUNCATE_LENGTH) {
    if (name.length > maxLength) {
        return name.substring(0, maxLength) + '...';
    }
    return name;
}

// Data Migration Helper
export function migrateData(data) {
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
export function highlightSelectedFolder(selectedFolderName) {
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

// Performance: Debounce function for expensive operations
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}