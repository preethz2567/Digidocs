import React, { useMemo } from 'react';
import { type DocumentData } from './DocumentTable';
import './StorageAnalytics.css';

interface StorageAnalyticsProps {
  documents: DocumentData[];
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const StorageAnalytics: React.FC<StorageAnalyticsProps> = ({ documents }) => {
  const stats = useMemo(() => {
    const totalFiles = documents.length;
    const totalStorage = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
    const avgSize = totalFiles > 0 ? totalStorage / totalFiles : 0;

    const distribution = documents.reduce((acc, doc) => {
      let type = 'Other';
      if (doc.contentType === 'application/pdf') type = 'PDF';
      else if (doc.contentType.startsWith('image/')) type = 'Images';
      else if (doc.contentType.includes('word') || doc.contentType.includes('document')) type = 'Documents';

      if (!acc[type]) acc[type] = { count: 0, size: 0 };
      acc[type].count += 1;
      acc[type].size += doc.fileSize;
      return acc;
    }, {} as Record<string, { count: number; size: number }>);

    return { totalFiles, totalStorage, avgSize, distribution };
  }, [documents]);

  return (
    <div className="storage-analytics">
      <div className="storage-analytics__header">
        <h2 className="storage-analytics__title">Storage Analytics</h2>
      </div>
      <div className="storage-analytics__grid">
        <div className="storage-analytics__stat">
          <span className="stat-label">Total Storage</span>
          <span className="stat-value">{formatBytes(stats.totalStorage)}</span>
        </div>
        <div className="storage-analytics__stat">
          <span className="stat-label">Total Files</span>
          <span className="stat-value">{stats.totalFiles}</span>
        </div>
        <div className="storage-analytics__stat">
          <span className="stat-label">Avg File Size</span>
          <span className="stat-value">{formatBytes(stats.avgSize)}</span>
        </div>
      </div>

      <div className="storage-analytics__distribution">
        <h3 className="distribution-title">Distribution by Type</h3>
        {Object.keys(stats.distribution).length === 0 ? (
          <p className="distribution-empty">No files to display.</p>
        ) : (
          <div className="distribution-list">
            {Object.entries(stats.distribution).map(([type, data]) => (
              <div key={type} className="distribution-item">
                <div className="distribution-info">
                  <span className="distribution-type">{type}</span>
                  <span className="distribution-count">{data.count} files</span>
                </div>
                <div className="distribution-bar-bg">
                  <div 
                    className="distribution-bar-fill" 
                    style={{ width: `${stats.totalStorage > 0 ? (data.size / stats.totalStorage) * 100 : 0}%` }}
                  />
                </div>
                <span className="distribution-size">{formatBytes(data.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
