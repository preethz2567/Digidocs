import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import documentService from '../../services/documentService';
import { useToast } from './ToastContext';
import { type DocumentData } from './DocumentTable';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
  onSuccess: (updatedDoc: DocumentData) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({ isOpen, onClose, document, onSuccess }) => {
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (isOpen && document) {
      setNewName(document.originalFileName);
    }
  }, [isOpen, document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document || !newName.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await documentService.renameDocument(document.id, newName.trim());
      showToast('Document renamed successfully.', 'success');
      onSuccess(updated);
      onClose();
    } catch {
      showToast('Failed to rename document.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Document">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input 
          id="rename-input" 
          label="New name" 
          value={newName} 
          onChange={e => setNewName(e.target.value)} 
          autoFocus 
          disabled={isSubmitting}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" className="btn-secondary-sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting} disabled={!newName.trim()}>
            Rename
          </Button>
        </div>
      </form>
    </Modal>
  );
};
