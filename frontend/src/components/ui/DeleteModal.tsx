import React, { useState } from 'react';
import { Modal } from './Modal';
import documentService from '../../services/documentService';
import { useToast } from './ToastContext';
import { type DocumentData } from './DocumentTable';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
  onSuccess: (id: number) => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, document, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!document) return;
    setIsSubmitting(true);
    try {
      await documentService.deleteDocument(document.id);
      showToast('Document deleted successfully.', 'success');
      onSuccess(document.id);
      onClose();
    } catch {
      showToast('Failed to delete document.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Delete document" 
      description={`Delete "${document?.originalFileName}"? This action cannot be undone.`}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
        <button className="btn-secondary-sm" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </button>
        <button className="btn-danger-sm" onClick={handleDelete} disabled={isSubmitting}>
          {isSubmitting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};
