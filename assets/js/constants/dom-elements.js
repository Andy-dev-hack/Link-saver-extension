// Safe DOM element getter with error handling
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`DOM element not found: ${id}`);
    }
    return element;
}

// DOM Elements (lazy evaluation)
export const inputEl = getElement("input-el");
export const folderInputEl = getElement("folder-input-el");
export const inputBtn = getElement("input-btn");
export const ulEl = getElement("ul-el");
export const tabBtn = getElement("tab-btn");
export const addFolderBtn = getElement("add-folder-btn");
export const folderSelect = getElement("folder-select");

// Validation
export function validateDOMElements() {
    const elements = { inputEl, folderInputEl, inputBtn, ulEl, tabBtn, addFolderBtn, folderSelect };
    const missing = Object.entries(elements).filter(([key, value]) => !value).map(([key]) => key);
    
    if (missing.length > 0) {
        console.error("Missing DOM elements:", missing);
        return false;
    }
    return true;
}