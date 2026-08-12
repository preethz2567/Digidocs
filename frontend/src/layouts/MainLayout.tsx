import React, { useEffect } from 'react';
import { Sidebar } from '../components/ui/Sidebar';
import { Navbar } from '../components/ui/Navbar';
import { CommandPalette } from '../components/ui/CommandPalette';
import { UploadModal } from '../components/ui/UploadModal';
import { useUiStore } from '../store/uiStore';
import './MainLayout.css';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setCommandPaletteOpen, isUploadModalOpen, setUploadModalOpen } = useUiStore();

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [setCommandPaletteOpen]);

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Navbar />
        <main className="layout__content animate-fade-in">
          {children}
        </main>
      </div>

      <CommandPalette />
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onSuccess={() => {
          setUploadModalOpen(false);
          // Optional: we might need to trigger a re-fetch in Dashboard or Documents,
          // but for now relying on local state update when page re-mounts or we might need an event.
        }} 
      />
    </div>
  );
};
