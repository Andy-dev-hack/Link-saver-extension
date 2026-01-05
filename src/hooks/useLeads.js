import { useState, useEffect } from "react";
import {
  STORAGE_KEY,
  migrateData,
  truncateName,
  TRUNCATE_LENGTH_LONG,
} from "../utils/helpers";

export default function useLeads() {
  const [leadsData, setLeadsData] = useState({});
  const [selectedFolder, setSelectedFolder] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    // Defines storage key locally if not imported, but it is imported.

    const loadData = () => {
      // Check if chrome.storage is available
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            setIsLoaded(true); // Allow app to function even if storage fails?
            return;
          }

          const stored = result[STORAGE_KEY];

          if (stored) {
            // Data exists in chrome.storage.local
            // stored is already an object, no need to JSON.parse usually if saved with set({key: object})
            // But let's check if it was stringified. chrome.storage produces object if you pass object.
            // If we save using JSON.stringify, we parse. If we save object, we get object.
            // Let's assume we will save stringified to be consistent with localStorage logic or save object directly?
            // Best practice for chrome.storage is saving objects directly.
            // However, to reuse migrateData which expects object (parsed), we should see.

            let parsed = stored;
            // If for some reason it's a string (legacy compatibility or someone stringified it)
            if (typeof stored === "string") {
              try {
                parsed = JSON.parse(stored);
              } catch (e) {
                console.error("Error parsing stored data", e);
              }
            }

            const migrated = migrateData(parsed);
            setLeadsData(migrated);

            const folders = Object.keys(migrated);
            if (folders.length > 0) {
              setSelectedFolder(folders[0]);
            }
            setIsLoaded(true);
          } else {
            // No data in chrome.storage.local. CHECK LOCALSTORAGE (Migration)
            const localStored = localStorage.getItem(STORAGE_KEY);
            if (localStored) {
              console.log(
                "Migrating data from localStorage to chrome.storage.local..."
              );
              try {
                const parsed = JSON.parse(localStored);
                const migrated = migrateData(parsed);
                setLeadsData(migrated);

                // Save to chrome.storage.local immediately
                // We save the object directly
                chrome.storage.local.set({ [STORAGE_KEY]: migrated });

                // Optional: Clear localStorage?
                // localStorage.removeItem(STORAGE_KEY);

                const folders = Object.keys(migrated);
                if (folders.length > 0) {
                  setSelectedFolder(folders[0]);
                }
              } catch (e) {
                console.error("Migration failed:", e);
              }
            } else {
              // No data anywhere
              // Initialize empty?
            }
            setIsLoaded(true);
          }
        });
      } else {
        // Fallback for development (npm run dev) without extension context
        console.warn(
          "Chrome Storage API not available, falling back to localStorage"
        );
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const migrated = migrateData(parsed);
            setLeadsData(migrated);
            const folders = Object.keys(migrated);
            if (folders.length > 0) {
              setSelectedFolder(folders[0]);
            }
          } catch (e) {
            console.error(e);
          }
        }
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    // Only save if loaded (to avoid overwriting with empty state on init)
    if (isLoaded) {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        // We save object directly not stringified, it's cleaner in chrome storage
        chrome.storage.local.set({ [STORAGE_KEY]: leadsData });
      } else {
        // Fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leadsData));
      }
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
        setSelectedFolder(remaining.length > 0 ? remaining[0] : "");
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
      alert("Please select a destination folder first.");
      return;
    }

    const defaultName = truncateName(
      defaultTitle || link,
      TRUNCATE_LENGTH_LONG
    );
    let newName = window.prompt(
      `Saving to "${selectedFolder}". Set a name for the link:`,
      defaultName
    );

    if (newName === null || newName.trim() === "") {
      if (newName !== null)
        alert("The link name cannot be empty. Saving cancelled.");
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
    if (confirm("Delete this lead?")) {
      const newData = { ...leadsData };
      const newLeads = [...newData[folderName]];
      newLeads.splice(index, 1);
      newData[folderName] = newLeads;

      if (newLeads.length === 0) {
        delete newData[folderName];
        if (selectedFolder === folderName) {
          const remaining = Object.keys(newData);
          setSelectedFolder(remaining.length > 0 ? remaining[0] : "");
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
