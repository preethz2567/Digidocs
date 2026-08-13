import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, FileText, LayoutGrid, List } from 'lucide-react';
import documentService from '../services/documentService';
import { DocumentTable, type DocumentData } from '../components/ui/DocumentTable';
import { DocumentGrid } from '../components/ui/DocumentGrid';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonCard';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';
import { FilePreviewModal } from '../components/ui/FilePreviewModal';
import { addRecentlyViewed } from '../services/recentlyViewedService';
import { useUiStore } from '../store/uiStore';
import './Documents.css';

const ITEMS_PER_PAGE = 10;

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Advanced filters & sort
  const [filterType, setFilterType] = useState('All Types');
  const [filterDate, setFilterDate] = useState('All Time');
  const [filterSize, setFilterSize] = useState('All Sizes');
  const [sortOrder, setSortOrder] = useState('Newest First');

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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

  // Bulk action state
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkShareOpen, setBulkShareOpen] = useState(false);
  const [bulkShareLinks, setBulkShareLinks] = useState<string[]>([]);

  const { showToast } = useToast();
  const { setUploadModalOpen } = useUiStore();

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
    let result = documents;

    if (search.trim()) {
      result = result.filter(d => d.originalFileName.toLowerCase().includes(search.toLowerCase()));
    }

    if (filterType !== 'All Types') {
      if (filterType === 'PDF') {
        result = result.filter(d => d.contentType === 'application/pdf');
      } else if (filterType === 'Images') {
        result = result.filter(d => d.contentType.startsWith('image/'));
      } else if (filterType === 'Documents') {
        result = result.filter(d => d.contentType.includes('word') || d.contentType.includes('document'));
      }
    }

    if (filterSize !== 'All Sizes') {
      if (filterSize === '< 1MB') {
        result = result.filter(d => d.fileSize < 1024 * 1024);
      } else if (filterSize === '1MB - 10MB') {
        result = result.filter(d => d.fileSize >= 1024 * 1024 && d.fileSize <= 10 * 1024 * 1024);
      } else if (filterSize === '> 10MB') {
        result = result.filter(d => d.fileSize > 10 * 1024 * 1024);
      }
    }

    if (filterDate !== 'All Time') {
      const now = new Date();
      if (filterDate === 'Past 24 Hours') {
        const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        result = result.filter(d => new Date(d.uploadedAt) >= past24h);
      } else if (filterDate === 'Past 7 Days') {
        const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(d => new Date(d.uploadedAt) >= past7d);
      } else if (filterDate === 'Past 30 Days') {
        const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter(d => new Date(d.uploadedAt) >= past30d);
      }
    }

    result = [...result].sort((a, b) => {
      if (sortOrder === 'Newest First') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      if (sortOrder === 'Oldest First') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      if (sortOrder === 'Largest First') return b.fileSize - a.fileSize;
      if (sortOrder === 'Smallest First') return a.fileSize - b.fileSize;
      return 0;
    });

    return result;
  }, [documents, search, filterType, filterSize, filterDate, sortOrder]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (!isInput && e.key === '/') {
        e.preventDefault();
        document.getElementById('doc-search-input')?.focus();
      }

      if (e.key === 'Escape') {
        if (search) setSearch('');
        else document.getElementById('doc-search-input')?.blur();
      }

      if (e.key === 'Delete' && !isInput && selectedIds.length > 0) {
        e.preventDefault();
        setBulkDeleteOpen(true);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && !isInput) {
        e.preventDefault();
        handleSelectAll(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [search, selectedIds, paginatedDocs]);

  const handleDownload = async (doc: DocumentData) => {
    try {
      addRecentlyViewed(doc.id);
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

  const handleBulkDownload = async () => {
    try {
      await Promise.all(selectedIds.map(async (id) => {
        const doc = documents.find(d => d.id === id);
        if (!doc) return;
        addRecentlyViewed(id);
        const blob = await documentService.downloadDocument(id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }));
    } catch {
      showToast('Some downloads failed.', 'error');
    }
  };

  const confirmBulkDelete = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => documentService.deleteDocument(id)));
      setDocuments(d => d.filter(doc => !selectedIds.includes(doc.id)));
      setSelectedIds([]);
      showToast('Selected documents deleted.', 'success');
      setBulkDeleteOpen(false);
    } catch {
      showToast('Failed to delete some documents.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkShare = async () => {
    setBulkShareOpen(true);
    setShareLoading(true);
    try {
      const links = await Promise.all(selectedIds.map(async id => {
        const res = await documentService.shareDocument(id);
        return `${window.location.origin}/share/${res.shareToken}`;
      }));
      setBulkShareLinks(links);
    } catch {
      showToast('Failed to generate some share links.', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  const handlePreview = async (doc: DocumentData) => {
    addRecentlyViewed(doc.id);
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
            id="doc-search-input"
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="toolbar__filters">
          <select className="toolbar__select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option>All Types</option>
            <option>PDF</option>
            <option>Images</option>
            <option>Documents</option>
          </select>
          <select className="toolbar__select" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
            <option>All Time</option>
            <option>Past 24 Hours</option>
            <option>Past 7 Days</option>
            <option>Past 30 Days</option>
          </select>
          <select className="toolbar__select" value={filterSize} onChange={e => setFilterSize(e.target.value)}>
            <option>All Sizes</option>
            <option>&lt; 1MB</option>
            <option>1MB - 10MB</option>
            <option>&gt; 10MB</option>
          </select>
          <select className="toolbar__select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Largest First</option>
            <option>Smallest First</option>
          </select>
          
          <div className="view-toggle-group" style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{ padding: '6px 8px', background: viewMode === 'list' ? '#f3f4f6' : '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="List View"
            >
              <List size={16} color={viewMode === 'list' ? '#111827' : '#6b7280'} />
            </button>
            <div style={{ width: '1px', backgroundColor: '#e5e7eb' }}></div>
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{ padding: '6px 8px', background: viewMode === 'grid' ? '#f3f4f6' : '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Grid View"
            >
              <LayoutGrid size={16} color={viewMode === 'grid' ? '#111827' : '#6b7280'} />
            </button>
          </div>
        </div>
        <button className="btn-upload-sm" onClick={() => setUploadModalOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          Upload
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="documents-page__bulk-actions">
          <span className="bulk-actions-info">{selectedIds.length} item(s) selected</span>
          <div className="bulk-actions-group">
            <button className="btn-secondary-sm" onClick={handleBulkDownload}>Download Selected</button>
            <button className="btn-secondary-sm" onClick={handleBulkShare}>Share Selected</button>
            <button className="btn-danger-sm" onClick={() => setBulkDeleteOpen(true)}>Delete Selected</button>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : 'No documents yet'}
          description={search ? 'Try adjusting your search.' : 'Upload your first document to get started.'}
          icon={<FileText size={24} strokeWidth={1.5} />}
          action={!search && (
            <button className="btn-upload-sm" onClick={() => setUploadModalOpen(true)}>
              <Plus size={14} strokeWidth={2.5} />
              Upload Document
            </button>
          )}
        />
      ) : (
        <div className="documents-page__table-wrapper">
          {viewMode === 'list' ? (
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
          ) : (
            <DocumentGrid
              documents={paginatedDocs}
              selectable
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onDownload={handleDownload}
              onPreview={handlePreview}
              onRename={doc => { setActiveDoc(doc); setNewName(doc.originalFileName); setRenameOpen(true); }}
              onDelete={doc => { setActiveDoc(doc); setDeleteOpen(true); }}
              onShare={handleShare}
            />
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

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

      <Modal isOpen={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Delete Documents" description={`Are you sure you want to delete ${selectedIds.length} document(s)? This cannot be undone.`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary-sm" onClick={() => setBulkDeleteOpen(false)} disabled={isSubmitting}>Cancel</button>
          <Button variant="danger" onClick={confirmBulkDelete} isLoading={isSubmitting} loadingText="Deleting...">
            Delete All
          </Button>
        </div>
      </Modal>

      <Modal isOpen={bulkShareOpen} onClose={() => setBulkShareOpen(false)} title="Share Selected Documents" description="Anyone with these links can view the documents.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {shareLoading ? (
            <p style={{ fontSize: 13, color: '#6b7280' }}>Generating secure links…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '200px', overflowY: 'auto' }}>
              {bulkShareLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 8 }}>
                  <Input id={`share-link-${idx}`} value={link} readOnly style={{ flex: 1 }} />
                  <Button onClick={() => { navigator.clipboard.writeText(link); showToast('Copied!', 'success'); }}>
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Button onClick={() => { navigator.clipboard.writeText(bulkShareLinks.join('\n')); showToast('All links copied!', 'success'); }}>
              Copy All Links
            </Button>
          </div>
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
