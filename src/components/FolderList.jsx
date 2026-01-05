import React from "react";
import FolderItem from "./FolderItem";
import { useLeadsContext } from "@/context/LeadsContext";

export default function FolderList() {
  const { leadsData, selectedFolder } = useLeadsContext();

  if (Object.keys(leadsData).length === 0) {
    return (
      <div className="text-center p-4 text-text-placeholder">
        No folders yet. Create your first folder above!
      </div>
    );
  }

  return (
    <div id="ul-el">
      {Object.keys(leadsData).map((folderName) => (
        <FolderItem
          key={folderName}
          folderName={folderName}
          leads={leadsData[folderName]}
          isSelected={folderName === selectedFolder}
        />
      ))}
    </div>
  );
}
