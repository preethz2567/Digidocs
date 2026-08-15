import React from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';
import { type DocumentData } from './DocumentTable';
import { ActionMenu } from './ActionMenu';
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
  onToggleStar?: (doc: DocumentData) => void;
  onContextMenu?: (e: React.MouseEvent, doc: DocumentData) => void;
  onManageTags?: (doc: DocumentData) => void;
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
  onPreview,
  onToggleStar,
  onContextMenu,
  onManageTags
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
            onContextMenu={(e) => onContextMenu?.(e, doc)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => onToggleStar?.(doc)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={doc.isStarred ? "#eab308" : "none"}
                      stroke={doc.isStarred ? "#eab308" : "#9ca3af"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                  <ActionMenu
                    trigger={<MoreHorizontal size={16} strokeWidth={2} />}
                    items={[
                      { label: 'Preview', onClick: () => onPreview?.(doc) },
                      { label: 'Download', onClick: () => onDownload?.(doc) },
                      { label: 'Share', onClick: () => onShare?.(doc) },
                      { label: 'Manage Tags', onClick: () => onManageTags?.(doc) },
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
              
              {doc.tags && doc.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {doc.tags.map(tag => (
                    <span 
                      key={tag.id} 
                      style={{ 
                        fontSize: '11px', 
                        padding: '2px 6px', 
                        border: `1px solid ${tag.color}`,
                        color: tag.color,
                        backgroundColor: `${tag.color}15`,
                        fontWeight: 500 
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
