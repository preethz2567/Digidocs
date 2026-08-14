import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, FileText, Upload, User, LogOut, Download } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import documentService from '../../services/documentService';
import { type DocumentData } from './DocumentTable';
import './CommandPalette.css';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  section: string;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { isCommandPaletteOpen, setCommandPaletteOpen, setUploadModalOpen } = useUiStore();
  const { logout } = useAuthStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      documentService.getDocuments().then(data => setDocuments(data)).catch(console.error);
    }
  }, [isCommandPaletteOpen]);

  const close = () => {
    setCommandPaletteOpen(false);
    setQuery('');
  };

  const downloadDoc = async (doc: DocumentData) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.originalFileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const staticCommands: Command[] = [
    {
      id: 'nav-dashboard',
      name: 'Go to Dashboard',
      icon: <Home size={16} />,
      section: 'Navigation',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'nav-documents',
      name: 'Go to Documents',
      icon: <FileText size={16} />,
      section: 'Navigation',
      action: () => navigate('/documents'),
    },
    {
      id: 'nav-profile',
      name: 'Go to Profile',
      icon: <User size={16} />,
      section: 'Navigation',
      action: () => navigate('/profile'),
    },
    {
      id: 'action-upload',
      name: 'Upload Document',
      icon: <Upload size={16} />,
      section: 'Actions',
      action: () => setUploadModalOpen(true),
    },
    {
      id: 'action-search',
      name: 'Search Documents...',
      icon: <Search size={16} />,
      section: 'Actions',
      action: () => navigate('/documents'),
    },
    {
      id: 'action-logout',
      name: 'Log out',
      icon: <LogOut size={16} />,
      section: 'Actions',
      action: () => logout(),
    },
  ];

  const documentCommands: Command[] = documents.map(doc => ({
    id: `doc-${doc.id}`,
    name: doc.originalFileName,
    icon: <Download size={16} />,
    section: 'Documents',
    action: () => downloadDoc(doc),
  }));

  const allCommands = [...staticCommands, ...documentCommands];

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeCommand = filteredCommands[selectedIndex];
        if (activeCommand) {
          activeCommand.action();
          close();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    const activeItem = listRef.current?.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={close}>
      <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-header">
          <Search size={18} className="command-palette-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="command-palette-esc">ESC</kbd>
        </div>
        <ul className="command-palette-list" ref={listRef}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => (
              <li
                key={cmd.id}
                className={`command-palette-item ${idx === selectedIndex ? 'active' : ''}`}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => {
                  cmd.action();
                  close();
                }}
              >
                <div className="command-item-icon">{cmd.icon}</div>
                <div className="command-item-name">{cmd.name}</div>
                <div className="command-item-section">{cmd.section}</div>
              </li>
            ))
          ) : (
            <div className="command-palette-empty">No results found.</div>
          )}
        </ul>
      </div>
    </div>
  );
};
