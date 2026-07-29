import React, { useState, useRef, useCallback } from 'react';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';
import documentService from '../../services/documentService';
import { useToast } from './ToastContext';
import './UploadModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setProgress(0);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 85));
    }, 150);

    try {
      await documentService.uploadDocument(selectedFile);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        showToast(`"${selectedFile.name}" uploaded successfully.`, 'success');
        setSelectedFile(null);
        setProgress(0);
        setUploading(false);
        onSuccess();
      }, 400);
    } catch {
      clearInterval(interval);
      setProgress(0);
      setUploading(false);
      showToast('Upload failed. Please try again.', 'error');
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setSelectedFile(null);
    setProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="upload-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="upload-modal">
        <div className="upload-modal__header">
          <h3>Upload Document</h3>
          <button className="upload-modal__close" onClick={handleClose} disabled={uploading}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="upload-modal__body">
          {!selectedFile ? (
            <div
              className={`upload-dropzone${isDragging ? ' dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowse}
            >
              <div className="upload-dropzone__icon">
                <UploadCloud size={24} strokeWidth={1.5} />
              </div>
              <p className="upload-dropzone__title">Drop files here</p>
              <p className="upload-dropzone__sub">or</p>
              <button className="upload-dropzone__browse" type="button">
                Browse Files
              </button>
              <p className="upload-dropzone__supported">Supported: PDF DOC DOCX JPG PNG</p>
            </div>
          ) : (
            <div className="upload-file-preview">
              <div className="upload-file-preview__icon">
                <FileIcon size={18} strokeWidth={2} />
              </div>
              <div className="upload-file-preview__info">
                <span className="upload-file-preview__name">{selectedFile.name}</span>
                <span className="upload-file-preview__size">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              {!uploading && (
                <button className="upload-file-preview__remove" onClick={() => setSelectedFile(null)}>
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>
          )}

          {uploading && (
            <div className="upload-progress">
              <div className="upload-progress__bar">
                <div className="upload-progress__fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="upload-progress__label">{progress < 100 ? 'Uploading...' : 'Done!'}</span>
            </div>
          )}
        </div>

        <div className="upload-modal__footer">
          <button className="upload-btn-cancel" onClick={handleClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="upload-btn-submit"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
