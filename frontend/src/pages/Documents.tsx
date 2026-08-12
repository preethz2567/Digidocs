import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import documentService from '../services/documentService';
import { DocumentTable, type DocumentData } from '../components/ui/DocumentTable';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonCard';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UploadModal } from '../components/ui/UploadModal';
import { useToast } from '../components/ui/ToastContext';
import { FilePreviewModal } from '../components/ui/FilePreviewModal';
import './Documents.css';

const ITEMS_PER_PAGE = 10;

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Modal state
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [newName, setNewName] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOwner, setPreviewOwner] = useState('');

  const { showToast } = useToast();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments('date');
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      showToast('Failed to load documents.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = useMemo(() => {
    if (!search.trim()) return documents;
    return documents.filter(d =>
      d.originalFileName.toLowerCase().includes(search.toLowerCase())
    );
  }, [documents, search]);

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDocs, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const handleSelect = (id: number) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSelectAll = (all: boolean) =>
    setSelectedIds(all ? paginatedDocs.map(d => d.id) : []);

  const handleDownload = async (doc: DocumentData) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Download failed.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!activeDoc) return;
    setIsSubmitting(true);
    try {
      await documentService.deleteDocument(activeDoc.id);
      setDocuments(d => d.filter(doc => doc.id !== activeDoc.id));
      showToast('Document deleted.', 'success');
      setDeleteOpen(false);
    } catch {
      showToast('Failed to delete document.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmRename = async () => {
    if (!activeDoc || !newName.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await documentService.renameDocument(activeDoc.id, newName.trim());
      setDocuments(d => d.map(doc => doc.id === activeDoc.id ? { ...doc, originalFileName: updated.originalFileName } : doc));
      showToast('Document renamed.', 'success');
      setRenameOpen(false);
    } catch {
      showToast('Failed to rename document.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async (doc: DocumentData) => {
    setActiveDoc(doc);
    setShareLink('');
    setShareOpen(true);
    setShareLoading(true);
    try {
      const res = await documentService.shareDocument(doc.id);
      setShareLink(`${window.location.origin}/share/${res.shareToken}`);
    } catch {
      showToast('Failed to generate share link.', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  const handlePreview = async (doc: DocumentData) => {
    setPreviewDoc(doc);
    setPreviewOpen(true);
    setPreviewUrl(null);
    setPreviewOwner('');

    try {
      const [blob, metadata] = await Promise.all([
        documentService.downloadDocument(doc.id),
        documentService.getMetadata(doc.id).catch(() => ({ ownerName: 'Unknown' }))
      ]);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      const ownerName = metadata.ownerName || (metadata.user && (metadata.user.name || metadata.user.email)) || 'Unknown';
      setPreviewOwner(ownerName);
    } catch {
      showToast('Failed to load preview.', 'error');
      setPreviewOpen(false);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewDoc(null);
    setPreviewUrl(null);
    setPreviewOwner('');
  };

  return (
    <div className="documents-page">
      <div className="documents-page__header">
        <div>
          <h1 className="documents-page__title">Documents</h1>
          <p className="documents-page__subtitle">
            {loading ? 'Loading...' : `${documents.length} file${documents.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="documents-page__toolbar">
        <div className="toolbar__search">
          <Search size={14} strokeWidth={2} className="toolbar__search-icon" color="#9ca3af" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar__filters">
          <select className="toolbar__select">
            <option>All Types</option>
            <option>PDF</option>
            <option>Images</option>
            <option>Documents</option>
          </select>
          <select className="toolbar__select">
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Largest First</option>
          </select>
        </div>
        <button className="btn-upload-sm" onClick={() => setUploadOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          Upload
        </button>
      </div>

      {loading ? (
        <SkeletonTable />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : 'No documents yet'}
          description={search ? 'Try adjusting your search.' : 'Upload your first document to get started.'}
          icon={<FileText size={24} strokeWidth={1.5} />}
          action={!search && (
            <button className="btn-upload-sm" onClick={() => setUploadOpen(true)}>
              <Plus size={14} strokeWidth={2.5} />
              Upload Document
            </button>
          )}
        />
      ) : (
        <div className="documents-page__table-wrapper">
          <DocumentTable
            documents={paginatedDocs}
            selectable
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onDownload={handleDownload}
            onPreview={handlePreview}
            onRename={doc => { setActiveDoc(doc); setNewName(doc.originalFileName); setRenameOpen(true); }}
            onDelete={doc => { setActiveDoc(doc); setDeleteOpen(true); }}
            onShare={handleShare}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={() => { setUploadOpen(false); fetchDocuments(); }} />

      <Modal isOpen={renameOpen} onClose={() => setRenameOpen(false)} title="Rename Document">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            id="rename-input"
            label="New name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !isSubmitting && newName.trim()) confirmRename(); }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn-secondary-sm" onClick={() => setRenameOpen(false)} disabled={isSubmitting}>Cancel</button>
            <Button onClick={confirmRename} isLoading={isSubmitting} loadingText="Renaming..." disabled={!newName.trim()}>Rename</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete document" description={`Delete "${activeDoc?.originalFileName}"? This cannot be undone.`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary-sm" onClick={() => setDeleteOpen(false)} disabled={isSubmitting}>Cancel</button>
          <Button variant="danger" onClick={confirmDelete} isLoading={isSubmitting} loadingText="Deleting...">
            Delete
          </Button>
        </div>
      </Modal>

      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)} title="Share Document" description="Anyone with this link can view the document.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {shareLoading ? (
            <p style={{ fontSize: 13, color: '#6b7280' }}>Generating secure link…</p>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Input id="share-link" value={shareLink} readOnly style={{ flex: 1 }} />
              <Button onClick={() => { navigator.clipboard.writeText(shareLink); showToast('Copied!', 'success'); }}>
                Copy
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <FilePreviewModal 
        isOpen={previewOpen} 
        onClose={closePreview} 
        document={previewDoc} 
        previewUrl={previewUrl}
        ownerName={previewOwner}
        onDownload={handleDownload}
        onShare={(doc) => { closePreview(); handleShare(doc); }}
      />
    </div>
  );
};

export default Documents;
