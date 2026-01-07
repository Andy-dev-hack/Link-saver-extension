import { useState, useEffect } from 'react';
import { truncateName } from '@/utils';
import { TRUNCATE_LENGTH_LONG } from '@/constants';
import { isValidName, isDuplicateFolder } from '@/validators';
import { loadLeadsV2, saveLeadsV2 } from '@/services';

/**
 * Custom hook for managing leads data (V2 - Array Structure).
 *
 * @returns {Object} V2 Interface
 */
export default function useLeadsV2() {
  const [leadsData, setLeadsData] = useState([]); // Array<FolderV2>
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount (V2 Logic)
  useEffect(() => {
    const initData = async () => {
      const data = await loadLeadsV2();
      setLeadsData(data);

      if (data.length > 0) {
        setSelectedFolderId(data[0].id);
      }
      setIsLoaded(true);
    };

    initData();
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      saveLeadsV2(leadsData);
    }
  }, [leadsData, isLoaded]);

  /**
   * Adds a new folder.
   * @param {string} folderName
   * @returns {boolean} Success
   */
  const addFolder = (folderName) => {
    if (!isValidName(folderName)) return false;

    // Check duplicate name
    if (isDuplicateFolder(leadsData, folderName)) {
      return false;
    }

    const newFolder = {
      id: crypto.randomUUID(),
      name: folderName,
      items: [],
    };

    // Add to beginning
    const newData = [newFolder, ...leadsData];
    setLeadsData(newData);
    setSelectedFolderId(newFolder.id);
    return true;
  };

  const deleteFolder = (folderId) => {
    const newData = leadsData.filter((f) => f.id !== folderId);
    setLeadsData(newData);

    if (selectedFolderId === folderId) {
      setSelectedFolderId(newData.length > 0 ? newData[0].id : '');
    }
  };

  const renameFolder = (folderId, newName) => {
    if (!isValidName(newName)) return;
    if (isDuplicateFolder(leadsData, newName)) return; // Prevent duplicate names

    const newData = leadsData.map((f) => {
      if (f.id === folderId) {
        return { ...f, name: newName };
      }
      return f;
    });
    setLeadsData(newData);
  };

  const saveLink = (link, name = null) => {
    if (!selectedFolderId) return;
    if (!isValidName(name)) return;

    const finalLinkName = truncateName(name);

    const newData = leadsData.map((f) => {
      if (f.id === selectedFolderId) {
        return {
          ...f,
          items: [...f.items, { id: crypto.randomUUID(), url: link, name: finalLinkName }],
        };
      }
      return f;
    });

    // Move selected folder to top? (Optional, mimicking V1 behavior)
    // V1 moved executed folder to top. Let's keep that for consistency.
    const selectedFolder = newData.find((f) => f.id === selectedFolderId);
    const otherFolders = newData.filter((f) => f.id !== selectedFolderId);

    setLeadsData([selectedFolder, ...otherFolders]);
  };

  const deleteLead = (folderId, leadIndex) => {
    // NOTE: UI passes folderId now
    const newData = leadsData.map((f) => {
      if (f.id === folderId) {
        const newItems = [...f.items];
        newItems.splice(leadIndex, 1);
        return { ...f, items: newItems };
      }
      return f;
    });

    // V1 logic: If folder empty, delete it?
    // V1: "When last lead is deleted, folder is also deleted" -> verified in V1 tests.
    // Do we want to keep this intrusive behavior in V2?
    // Let's replicate it for now to match tests, but maybe ask user later.
    // Wait, V2 is "Structure Refactor". Changing business logic (auto-delete) is risky.
    // I will keep it for now.

    const targetFolder = newData.find((f) => f.id === folderId);
    if (targetFolder && targetFolder.items.length === 0) {
      deleteFolder(folderId); // Reuse deleteFolder logic
    } else {
      setLeadsData(newData);
    }
  };

  const editLead = (folderId, leadIndex, newName) => {
    const newData = leadsData.map((f) => {
      if (f.id === folderId) {
        const newItems = [...f.items];
        newItems[leadIndex] = { ...newItems[leadIndex], name: truncateName(newName) };
        return { ...f, items: newItems };
      }
      return f;
    });
    setLeadsData(newData);
  };

  const setSelectedFolder = (id) => {
    setSelectedFolderId(id);
    // V1: Clicking folder moved it to top.
    // V2: Let's do the same for consistency.
    const selected = leadsData.find((f) => f.id === id);
    if (selected) {
      const others = leadsData.filter((f) => f.id !== id);
      setLeadsData([selected, ...others]);
    }
  };

  // Missing: importTabs, reorderLeads, moveLead (DragDrop)
  // I will implement basic shells or full logic if possible.

  const importTabs = (tabs, folderName) => {
    // V2: Logic
    // Check if folder exists by NAME (since user inputs name).
    let targetId;
    let newData = [...leadsData];

    let existingFolder = newData.find((f) => f.name === folderName);

    const newLeads = tabs.map((tab) => ({
      id: crypto.randomUUID(),
      url: tab.url,
      name: truncateName(tab.title || tab.url, TRUNCATE_LENGTH_LONG),
    }));

    if (existingFolder) {
      targetId = existingFolder.id;
      newData = newData.map((f) => {
        if (f.id === targetId) {
          return { ...f, items: [...f.items, ...newLeads] };
        }
        return f;
      });
    } else {
      targetId = crypto.randomUUID();
      const newFolder = {
        id: targetId,
        name: folderName,
        items: newLeads,
      };
      newData = [newFolder, ...newData];
    }

    setLeadsData(newData);
    setSelectedFolderId(targetId);
  };

  return {
    leadsData,
    selectedFolderId, // Renamed from selectedFolder to match semantics
    setSelectedFolder, // Implementation handles ID
    addFolder,
    deleteFolder,
    renameFolder,
    saveLink,
    deleteLead,
    editLead,
    importTabs,
    // reorderLeads, moveLead -> Pending or TODO
  };
}
