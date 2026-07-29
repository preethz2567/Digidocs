import React from 'react';
import { Search, Plus } from 'lucide-react';
import './DocumentToolbar.css';

export type FilterType = 'All' | 'PDF' | 'DOC' | 'DOCX' | 'TXT' | 'PNG' | 'JPG';
export type SortType = 'Newest First' | 'Oldest First' | 'Largest First' | 'Smallest First' | 'Alphabetical';

interface DocumentToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filter: FilterType;
  onFilterChange: (val: FilterType) => void;
  sort: SortType;
  onSortChange: (val: SortType) => void;
  onUploadClick: () => void;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  search, onSearchChange, filter, onFilterChange, sort, onSortChange, onUploadClick
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar__search">
        <Search size={14} strokeWidth={2} className="toolbar__search-icon" color="#9ca3af" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <div className="toolbar__filters">
        <select 
          className="toolbar__select"
          value={filter}
          onChange={e => onFilterChange(e.target.value as FilterType)}
        >
          <option value="All">All</option>
          <option value="PDF">PDF</option>
          <option value="DOC">DOC</option>
          <option value="DOCX">DOCX</option>
          <option value="TXT">TXT</option>
          <option value="PNG">PNG</option>
          <option value="JPG">JPG</option>
        </select>
        <select 
          className="toolbar__select"
          value={sort}
          onChange={e => onSortChange(e.target.value as SortType)}
        >
          <option value="Newest First">Newest First</option>
          <option value="Oldest First">Oldest First</option>
          <option value="Largest First">Largest First</option>
          <option value="Smallest First">Smallest First</option>
          <option value="Alphabetical">Alphabetical</option>
        </select>
      </div>
      <button className="btn-upload-sm" onClick={onUploadClick}>
        <Plus size={14} strokeWidth={2.5} />
        Upload
      </button>
    </div>
  );
};
