import React from 'react';
import { useLeadsContext } from '../context/LeadsContext';

export default function FolderControl({ 
    folders, 
    selectedFolder, 
    newFolderVal, 
    setNewFolderVal, 
    onCreateFolder 
}) {
    const { setSelectedFolder } = useLeadsContext();

    return (
        <>
            <div className="flex flex-wrap gap-2 mt-3 pb-3 mb-3 border-b border-[#484848]">
                <span className="flex-none flex items-center pl-[5px] font-bold">Destination folder:</span>
                <select 
                    className="p-2 border border-neon-blue rounded-[5px] flex-[1_1_100px] min-w-[120px] bg-dark-card text-text-main transition-all duration-300 text-center text-center-last hover:cursor-pointer hover:shadow-[0_0_5px_rgba(74,110,169,0.8)]"
                    value={selectedFolder} 
                    onChange={(e) => setSelectedFolder(e.target.value)}
                >
                    {folders.map(folder => (
                        <option key={folder} value={folder}>{folder}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 mb-2">
                <input 
                    type="text" 
                    className="p-2 border border-neon-blue rounded-[5px] flex-[1_1_180px] min-w-[120px] bg-dark-card text-text-main transition-all duration-300 placeholder-[#aaa]"
                    placeholder="New folder name"
                    value={newFolderVal}
                    onChange={(e) => setNewFolderVal(e.target.value)}
                />
                <button className="bg-neon-blue text-white border-none rounded-[5px] px-[15px] py-2 cursor-pointer font-bold flex-none transition-all duration-200 hover:bg-neon-blue-hover hover:scale-105" onClick={onCreateFolder}>Create Folder</button>
            </div>
        </>
    );
}
