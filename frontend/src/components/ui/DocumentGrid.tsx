import React from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import { DocumentData } from './DocumentTable';
import './DocumentGrid.css';

interface DocumentGridProps {
  documents: DocumentData[];
  selectable?: boolean;
  selectedIds?: number[];
  onSelect?: (id: number) => void;
  onRename?: (doc: DocumentData) => void;
  onDelete?: (doc: DocumentData) => void;
  onShare?: (doc: DocumentData) => void;
  onDownload?: (doc: DocumentData) => void;
  onPreview?: (doc: DocumentData) => void;
}

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return 'Unknown';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateStr));
  } catch {
    return 'Unknown';
  }
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  selectable,
  selectedIds = [],
  onSelect,
  onRename,
  onDelete,
  onShare,
  onDownload,
  onPreview
}) => {
  return (
    <div className="document-grid">
      {documents.map((doc) => {
        const isSelected = selectedIds.includes(doc.id);
        
        return (
          <div 
            key={doc.id} 
            className={`document-card ${isSelected ? 'selected' : ''}`}
            onClick={() => selectable && onSelect && onSelect(doc.id)}
          >
            {selectable && (
              <div className="document-card__checkbox" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect?.(doc.id)}
                />
              </div>
            )}
            
            <div 
              className="document-card__preview"
              onClick={(e) => {
                if (selectable) e.stopPropagation();
                if (onPreview) onPreview(doc);
                else if (onDownload) onDownload(doc);
              }}
            >
              <FileText size={48} strokeWidth={1} color="#9ca3af" />
            </div>
            
            <div className="document-card__info">
              <div className="document-card__header">
                <span 
                  className="document-card__filename" 
                  title={doc.originalFileName}
                  onClick={(e) => {
                    if (selectable) e.stopPropagation();
                    if (onPreview) onPreview(doc);
                    else if (onDownload) onDownload(doc);
                  }}
                >
                  {doc.originalFileName}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    trigger={<MoreHorizontal size={16} strokeWidth={2} />}
                    items={[
                      { label: 'Preview', onClick: () => onPreview?.(doc) },
                      { label: 'Download', onClick: () => onDownload?.(doc) },
                      { label: 'Share', onClick: () => onShare?.(doc) },
                      { label: 'Rename', onClick: () => onRename?.(doc) },
                      { label: 'Delete', onClick: () => onDelete?.(doc), danger: true },
                    ]}
                  />
                </div>
              </div>
              
              <div className="document-card__meta">
                <span>{formatSize(doc.fileSize)}</span>
                <span>•</span>
                <span>{formatDate(doc.uploadedAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
