import React from 'react';
import { RotateCw } from 'lucide-react';
import { useLeadsContext } from '@/context/LeadsContext';
import { getAllTabs } from '@/services';

export default function SyncButton({ className = '' }) {
  const { importTabs } = useLeadsContext();

  const handleSync = () => {
    getAllTabs((tabs) => {
      if (!tabs || tabs.length === 0) return;

      const date = new Date().toLocaleDateString();
      const time = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const defaultName = `Synced Tabs ${date} ${time}`;

      const folderName = window.prompt('Enter a name for the new folder:', defaultName);

      if (folderName) {
        importTabs(tabs, folderName);
      }
    });
  };

  return (
    <button
      onClick={handleSync}
      className={`bg-transparent border border-neon-blue text-neon-blue px-5 py-3 text-base font-bold cursor-pointer rounded-[5px] shadow-glow-ext transition-all duration-200 hover:bg-neon-blue hover:text-dark-bg hover:shadow-glow-hover flex items-center justify-center gap-2 ${className}`}
    >
      <RotateCw size={18} />
      SYNC TABS
    </button>
  );
}
