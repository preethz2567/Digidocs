import React from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import './DocumentTable.css';

export interface TagData {
  id: number;
  name: string;
  color: string;
}

export interface DocumentData {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
  isStarred?: boolean;
  tags?: TagData[];
}

interface DocumentTableProps {
  documents: DocumentData[];
  selectable?: boolean;
  selectedIds?: number[];
  onSelect?: (id: number) => void;
  onSelectAll?: (checked: boolean) => void;
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

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectable,
  selectedIds = [],
  onSelect,
  onSelectAll,
  onRename,
  onDelete,
  onShare,
  onDownload,
  onPreview,
  onToggleStar,
  onContextMenu,
  onManageTags
}) => {
  const allSelected = documents.length > 0 && selectedIds.length === documents.length;

  return (
    <div className="table-container">
      <table className="doc-table">
        <thead>
          <tr>
            {selectable && (
              <th className="doc-table__col-checkbox">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                />
              </th>
            )}
            <th className="doc-table__col-file">Name</th>
            <th style={{ width: '40px' }}></th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Tags</th>
            <th className="doc-table__col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            return (
              <tr 
                key={doc.id} 
                className={isSelected ? 'selected' : ''}
                onContextMenu={(e) => onContextMenu?.(e, doc)}
              >
                {selectable && (
                  <td className="doc-table__col-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelect?.(doc.id)}
                    />
                  </td>
                )}
                <td>
                  <div className="doc-table__file-info">
                    <div className="doc-table__file-icon">
                      <FileText size={14} strokeWidth={2} />
                    </div>
                    <span 
                      className="doc-table__filename" 
                      onClick={() => (onPreview ? onPreview(doc) : onDownload?.(doc))}
                      title="Click to preview"
                    >
                      {doc.originalFileName}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleStar?.(doc); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg
                      width="16"
                      height="16"
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
                </td>
                <td>{formatSize(doc.fileSize)}</td>
                <td>{formatDate(doc.uploadedAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {doc.tags?.map(tag => (
                      <span 
                        key={tag.id} 
                        style={{ 
                          fontSize: '12px', 
                          padding: '2px 6px', 
                          border: `1px solid ${tag.color}`,
                          color: tag.color,
                          backgroundColor: `${tag.color}15`, // slightly transparent background
                          fontWeight: 500 
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="doc-table__col-actions">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
