import { useState } from 'react';
import { Header, InputSection, FolderControl, FolderList } from '@/components';
import { useLeadsContext } from '@/context/LeadsContext';
import { getActiveTab } from '@/services';

function App() {
  const { leadsData, selectedFolderId, addFolder, saveLink } = useLeadsContext();

  const [inputVal, setInputVal] = useState('');
  const [newFolderVal, setNewFolderVal] = useState('');

  const handleSaveLink = () => {
    if (!inputVal) return;
    if (!selectedFolderId) {
      alert('Please select a destination folder first.');
      return;
    }

    // We use the URL itself as default name suggestion
    // Note: We might want to look up folder NAME for the prompt user experience
    const selectedFolder = leadsData.find((f) => f.id === selectedFolderId);
    const folderName = selectedFolder ? selectedFolder.name : 'Unknown';

    const name = window.prompt(`Saving to "${folderName}". Name for this link:`, inputVal);
    if (name && name.trim()) {
      saveLink(inputVal, name);
      setInputVal('');
    }
  };

  const handleSaveTab = () => {
    if (!selectedFolderId) {
      alert('Please select a destination folder first.');
      return;
    }

    const selectedFolder = leadsData.find((f) => f.id === selectedFolderId);
    const folderName = selectedFolder ? selectedFolder.name : 'Unknown';

    getActiveTab((link, title) => {
      const name = window.prompt(`Saving to "${folderName}". Name for this link:`, title || link);
      if (name && name.trim()) {
        saveLink(link, name);
      }
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderVal.trim()) return;

    // addFolder now returns true/false for success
    const success = addFolder(newFolderVal);

    if (success) {
      setNewFolderVal('');
    } else {
      alert(`Folder "${newFolderVal}" already exists.`);
    }
  };

  return (
    <>
      <Header />
      <div className="flex flex-col gap-0 mb-3 max-w-[600px]">
        <InputSection
          inputVal={inputVal}
          setInputVal={setInputVal}
          onSaveLink={handleSaveLink}
          onSaveTab={handleSaveTab}
        />
        <FolderControl
          folders={leadsData}
          selectedFolderId={selectedFolderId}
          newFolderVal={newFolderVal}
          setNewFolderVal={setNewFolderVal}
          onCreateFolder={handleCreateFolder}
        />
      </div>
      <FolderList />
    </>
  );
}

export default App;
