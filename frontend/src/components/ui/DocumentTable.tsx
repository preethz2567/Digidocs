import React from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';
import { ActionMenu } from './ActionMenu';
import './DocumentTable.css';

export interface DocumentData {
  id: number;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string; // matches backend DocumentResponse.uploadedAt
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
}

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(dateStr));
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getExtension = (filename: string) => {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() || 'FILE';
  }
  return 'FILE';
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
  onDownload
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
            <th className="doc-table__col-file">File</th>
            <th>Type</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th className="doc-table__col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            const ext = getExtension(doc.originalFileName);
            return (
              <tr key={doc.id} className={isSelected ? 'selected' : ''}>
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
                      onClick={() => onDownload?.(doc)}
                      title="Click to download"
                    >
                      {doc.originalFileName}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="doc-table__badge">{ext}</span>
                </td>
                <td>{formatSize(doc.fileSize)}</td>
                <td>{formatDate(doc.uploadedAt)}</td>
                <td className="doc-table__col-actions">
                  <ActionMenu
                    trigger={<MoreHorizontal size={16} strokeWidth={2} />}
                    items={[
                      { label: 'Download', onClick: () => onDownload?.(doc) },
                      { label: 'Share / Copy Link', onClick: () => onShare?.(doc) },
                      { label: 'Divider', onClick: () => {} },
                      { label: 'Rename', onClick: () => onRename?.(doc) },
                      { label: 'Divider', onClick: () => {} },
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
