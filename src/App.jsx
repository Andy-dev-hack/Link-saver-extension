import { useState } from 'react';
import { Header, InputSection, FolderControl, FolderList } from '@/components';
import { useLeadsContext } from '@/context/LeadsContext';
import { getActiveTab } from '@/services';

function App() {
  const { leadsData, selectedFolder, addFolder, saveLink } = useLeadsContext();

  const [inputVal, setInputVal] = useState('');
  const [newFolderVal, setNewFolderVal] = useState('');

  const handleSaveLink = () => {
    if (inputVal) {
      saveLink(inputVal);
      setInputVal('');
    }
  };

  const handleSaveTab = () => {
    getActiveTab((link, title) => {
      saveLink(link, title);
    });
  };

  const handleCreateFolder = () => {
    if (newFolderVal) {
      addFolder(newFolderVal);
      setNewFolderVal('');
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
          folders={Object.keys(leadsData)}
          selectedFolder={selectedFolder}
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
