import React, { useEffect, useState } from 'react';
import { Download, Share2, X, FileText, Image as ImageIcon } from 'lucide-react';
import { DocumentData } from './DocumentTable';
import { Button } from './Button';
import './FilePreviewModal.css';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
  previewUrl: string | null;
  ownerName?: string;
  onDownload: (doc: DocumentData) => void;
  onShare: (doc: DocumentData) => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

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

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  previewUrl,
  ownerName,
  onDownload,
  onShare
}) => {
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document?.contentType && setIsError(false);
      window.document.body.style.overflow = 'hidden';
    } else {
      window.document.body.style.overflow = '';
    }
    return () => {
      window.document.body.style.overflow = '';
    };
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const isImage = document.contentType.startsWith('image/');
  const isPdf = document.contentType === 'application/pdf';
  const isSupported = isImage || isPdf;

  return (
    <div className="preview-modal-overlay">
      <div className="preview-modal-container">
        
        {/* Header */}
        <div className="preview-modal-header">
          <div className="preview-modal-title">
            {isImage ? <ImageIcon size={20} /> : <FileText size={20} />}
            <span className="preview-filename">{document.originalFileName}</span>
          </div>
          <div className="preview-modal-actions">
            <button className="preview-action-btn" onClick={() => onShare(document)} title="Share">
              <Share2 size={18} />
            </button>
            <button className="preview-action-btn" onClick={() => onDownload(document)} title="Download">
              <Download size={18} />
            </button>
            <div className="preview-divider" />
            <button className="preview-action-btn close-btn" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="preview-modal-body">
          <div className="preview-viewer-section">
            {!previewUrl ? (
              <div className="preview-loading">
                <div className="spinner"></div>
                <p>Loading preview...</p>
              </div>
            ) : !isSupported || isError ? (
              <div className="preview-unsupported">
                <FileText size={48} strokeWidth={1} color="#9ca3af" />
                <h3>Preview unavailable</h3>
                <p>This file type cannot be previewed in the browser.</p>
                <Button onClick={() => onDownload(document)}>Download File</Button>
              </div>
            ) : isImage ? (
              <div className="preview-image-container">
                <img 
                  src={previewUrl} 
                  alt={document.originalFileName} 
                  onError={() => setIsError(true)}
                />
              </div>
            ) : (
              <div className="preview-pdf-container">
                <object 
                  data={previewUrl} 
                  type="application/pdf" 
                  className="preview-pdf-object"
                  onError={() => setIsError(true)}
                >
                  <iframe 
                    src={previewUrl} 
                    title={document.originalFileName}
                    className="preview-pdf-iframe"
                  >
                    <p>Your browser does not support PDFs. <a href={previewUrl}>Download the PDF</a>.</p>
                  </iframe>
                </object>
              </div>
            )}
          </div>

          <div className="preview-details-section">
            <h3 className="details-heading">File Details</h3>
            
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value" title={document.originalFileName}>{document.originalFileName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Size</span>
              <span className="detail-value">{formatSize(document.fileSize)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Uploaded</span>
              <span className="detail-value">{formatDate(document.uploadedAt)}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Owner</span>
              <span className="detail-value">{ownerName || 'Unknown'}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Type</span>
              <span className="detail-value">{document.contentType || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
