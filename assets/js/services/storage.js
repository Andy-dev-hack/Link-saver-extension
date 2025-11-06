import { STORAGE_KEY } from '../constants/config.js';
import { migrateData } from '../utils/helpers.js';

// Storage management
export function saveToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Failed to save to storage:', error);
        return false;
    }
}

export function loadFromStorage() {
    try {
        const leadsFromLocalStorage = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (leadsFromLocalStorage) {
            return migrateData(leadsFromLocalStorage);
        }
        return {};
    } catch (error) {
        console.error('Failed to load from storage:', error);
        return {};
    }
}

export function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
}