import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import documentService from '../../services/documentService';
import { useToast } from './ToastContext';
import { type DocumentData } from './DocumentTable';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, document }) => {
  const [shareLink, setShareLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && document) {
      generateLink();
    } else {
      setShareLink('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, document]);

  const generateLink = async () => {
    if (!document) return;
    setIsLoading(true);
    try {
      const res = await documentService.shareDocument(document.id);
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      setShareLink(`${baseUrl}/share/${res.shareToken}`);
      showToast('Share link generated successfully.', 'success');
    } catch {
      showToast('Failed to generate share link.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    showToast('Link copied to clipboard!', 'success');
  };

  const handleRevoke = async () => {
    if (!document) return;
    setIsRevoking(true);
    try {
      await documentService.revokeShare(document.id);
      showToast('Share link revoked.', 'success');
      onClose();
    } catch {
      showToast('Failed to revoke link.', 'error');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Share Document" 
      description="Anyone with this link can view the document."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
        {isLoading ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>
            Generating secure link…
          </div>
        ) : shareLink ? (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input 
                id="share-link" 
                value={shareLink} 
                readOnly 
                style={{ flex: 1 }} 
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button onClick={handleCopy}>
                Copy Link
              </Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className="btn-secondary-sm" onClick={onClose} disabled={isRevoking}>
                Close
              </button>
              <button className="btn-danger-sm" onClick={handleRevoke} disabled={isRevoking}>
                {isRevoking ? 'Revoking…' : 'Revoke Link'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};
