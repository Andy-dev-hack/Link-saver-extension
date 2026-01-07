import FolderItem from './FolderItem';
import { useLeadsContext } from '@/context/LeadsContext';

export default function FolderList() {
  const { leadsData, selectedFolderId } = useLeadsContext();

  if (leadsData.length === 0) {
    return (
      <div className="text-center p-4 text-text-placeholder">
        No folders yet. Create your first folder above!
      </div>
    );
  }

  return (
    <div id="ul-el">
      {leadsData.map((folder) => (
        <FolderItem key={folder.id} folder={folder} isSelected={folder.id === selectedFolderId} />
      ))}
    </div>
  );
}
