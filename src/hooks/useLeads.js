import { useState, useEffect } from 'react';
import { truncateName, TRUNCATE_LENGTH_LONG } from '@/utils';
import { loadLeadsFromStorage, saveLeadsToStorage } from '@/services';

/**
 * Custom hook for managing leads data, folder selection, and persistence.
 * Handles data loading from storage (with migration), syncing state, and all CRUD operations.
 *
 * @returns {Object} An object containing:
 * - leadsData: The main data object { [folderName]: [leads] }
 * - selectedFolder: The currently selected folder name
 * - setSelectedFolder: Function to select a folder
 * - addFolder, deleteFolder, renameFolder: Folder operations
 * - saveLink, deleteLead, editLead, reorderLeads, moveLead: Lead operations
 * - importTabs: Function to bulk import tabs
 */
export default function useLeads() {
  const [leadsData, setLeadsData] = useState({});
  const [selectedFolder, setSelectedFolder] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const initData = async () => {
      const data = await loadLeadsFromStorage();
      setLeadsData(data);

      const folders = Object.keys(data);
      if (folders.length > 0) {
        setSelectedFolder(folders[0]);
      }
      setIsLoaded(true);
    };

    initData();
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    // Only save if loaded (to avoid overwriting with empty state on init)
    if (isLoaded) {
      saveLeadsToStorage(leadsData);
    }
  }, [leadsData, isLoaded]);

  const addFolder = (folderName) => {
    if (!folderName.trim()) return;
    if (leadsData[folderName]) {
      alert(`Folder "${folderName}" already exists.`);
      return;
    }

    const newData = { ...leadsData, [folderName]: [] };
    // Reorder to put new folder first (or last? Original reordered to top I think)
    // Original: reorderFolders(updatedData, folderName) -> puts folderName at top

    const reordered = { [folderName]: [], ...leadsData };
    setLeadsData(reordered);
    setSelectedFolder(folderName);
  };

  const deleteFolder = (folderName) => {
    if (confirm(`Delete folder "${folderName}" and all its links?`)) {
      const newData = { ...leadsData };
      delete newData[folderName];
      setLeadsData(newData);

      if (selectedFolder === folderName) {
        const remaining = Object.keys(newData);
        setSelectedFolder(remaining.length > 0 ? remaining[0] : '');
      }
    }
  };

  const renameFolder = (oldName, newName) => {
    if (!newName || newName === oldName || leadsData[newName]) return;

    const newData = { ...leadsData };
    newData[newName] = newData[oldName];
    delete newData[oldName];

    // Reorder to put renamed folder at top? Original did that.
    const reordered = { [newName]: newData[newName], ...newData };
    // Wait, spreading newData again will duplicate? No, keys are unique.
    // But order matters.
    // Let's just create a new object with newName at top, then the rest.

    const finalData = {};
    finalData[newName] = newData[newName];
    Object.keys(newData).forEach((key) => {
      if (key !== newName) {
        finalData[key] = newData[key];
      }
    });

    setLeadsData(finalData);
    if (selectedFolder === oldName) {
      setSelectedFolder(newName);
    }
  };

  const saveLink = (link, defaultTitle = null) => {
    if (!selectedFolder) {
      alert('Please select a destination folder first.');
      return;
    }

    const defaultName = truncateName(defaultTitle || link, TRUNCATE_LENGTH_LONG);
    let newName = window.prompt(
      `Saving to "${selectedFolder}". Set a name for the link:`,
      defaultName
    );

    if (newName === null || newName.trim() === '') {
      if (newName !== null) alert('The link name cannot be empty. Saving cancelled.');
      return;
    }

    const finalLinkName = truncateName(newName);
    const newData = { ...leadsData };
    newData[selectedFolder] = [
      ...newData[selectedFolder],
      { id: crypto.randomUUID(), url: link, name: finalLinkName },
    ];

    // Move selected folder to top
    const finalData = {};
    finalData[selectedFolder] = newData[selectedFolder];
    Object.keys(newData).forEach((key) => {
      if (key !== selectedFolder) {
        finalData[key] = newData[key];
      }
    });

    setLeadsData(finalData);
  };

  const deleteLead = (folderName, index) => {
    if (confirm('Delete this lead?')) {
      const newData = { ...leadsData };
      const newLeads = [...newData[folderName]];
      newLeads.splice(index, 1);
      newData[folderName] = newLeads;

      if (newLeads.length === 0) {
        delete newData[folderName];
        if (selectedFolder === folderName) {
          const remaining = Object.keys(newData);
          setSelectedFolder(remaining.length > 0 ? remaining[0] : '');
        }
      }

      setLeadsData(newData);
    }
  };

  const editLead = (folderName, index, newName) => {
    const newData = { ...leadsData };
    const newLeads = [...newData[folderName]];
    newLeads[index] = { ...newLeads[index], name: truncateName(newName) };
    newData[folderName] = newLeads;
    setLeadsData(newData);
  };

  const selectAndReorderFolder = (folderName) => {
    setSelectedFolder(folderName);

    // Reorder leadsData to put the selected folder first
    if (leadsData[folderName]) {
      const reorderedData = {};
      reorderedData[folderName] = leadsData[folderName];
      Object.keys(leadsData).forEach((key) => {
        if (key !== folderName) {
          reorderedData[key] = leadsData[key];
        }
      });
      setLeadsData(reorderedData);
    }
  };

  const importTabs = (tabs, folderName) => {
    if (!tabs || tabs.length === 0 || !folderName) return;

    // Check if folder exists, if so append a number or alert?
    // For now, let's just append if it exists or let the user know.
    // Actually, the prompt allows them to pick a unique name.
    // If they pick an existing one, we should probably merge or alert.
    // Let's stick to simple creation for now, maybe alert if exists?
    // But useLeads logic usually overwrites or appends?
    // addFolder checks existence.

    // If folder exists, we'll just append the new leads to it.

    const newLeads = tabs.map((tab) => ({
      id: crypto.randomUUID(),
      url: tab.url,
      name: truncateName(tab.title || tab.url, TRUNCATE_LENGTH_LONG),
    }));

    const existingLeads = leadsData[folderName] || [];
    const mergedLeads = [...existingLeads, ...newLeads];

    const newData = { [folderName]: mergedLeads, ...leadsData };
    setLeadsData(newData);
    setSelectedFolder(folderName);
  };

  const reorderLeads = (folderName, oldIndex, newIndex) => {
    const newData = { ...leadsData };
    const newLeads = [...newData[folderName]];
    const [movedLead] = newLeads.splice(oldIndex, 1);
    newLeads.splice(newIndex, 0, movedLead);
    newData[folderName] = newLeads;
    setLeadsData(newData);
  };

  const moveLead = (activeId, overId) => {
    const activeFolder = Object.keys(leadsData).find((folder) =>
      leadsData[folder].some((lead) => lead.id === activeId)
    );

    // Find overFolder - could be a folder (if dropping on folder header) or a lead (if dropping on list)
    let overFolder = Object.keys(leadsData).find((folder) => folder === overId);

    if (!overFolder) {
      overFolder = Object.keys(leadsData).find((folder) =>
        leadsData[folder].some((lead) => lead.id === overId)
      );
    }

    if (!activeFolder || !overFolder || activeFolder === overFolder) return;

    const newData = { ...leadsData };
    const sourceLeads = [...newData[activeFolder]];
    const destLeads = [...newData[overFolder]];

    const activeLeadIndex = sourceLeads.findIndex((l) => l.id === activeId);
    const [movedLead] = sourceLeads.splice(activeLeadIndex, 1);

    // If dropping on a lead, insert before/after. If dropping on folder, add to end.
    if (leadsData[overFolder].some((l) => l.id === overId)) {
      const overLeadIndex = destLeads.findIndex((l) => l.id === overId);
      destLeads.splice(overLeadIndex, 0, movedLead);
    } else {
      destLeads.push(movedLead);
    }

    newData[activeFolder] = sourceLeads;
    newData[overFolder] = destLeads;
    setLeadsData(newData);
  };

  return {
    leadsData,
    selectedFolder,
    setSelectedFolder: selectAndReorderFolder,
    addFolder,
    deleteFolder,
    renameFolder,
    saveLink,
    deleteLead,
    editLead,
    importTabs,
    reorderLeads,
    moveLead,
  };
}
