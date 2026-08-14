import React, { useState, useEffect, useMemo } from 'react';
import { Search, Trash2 } from 'lucide-react';
import documentService from '../services/documentService';
import { DocumentTable, type DocumentData } from '../components/ui/DocumentTable';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonCard';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/ToastContext';
import './Documents.css';

const ITEMS_PER_PAGE = 10;

const Trash: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    doc: DocumentData | null;
  }>({ isOpen: false, x: 0, y: 0, doc: null });

  const { showToast } = useToast();

  const handleContextMenu = (e: React.MouseEvent, doc: DocumentData) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      doc
    });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, isOpen: false }));
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDeletedDocuments('date');
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      showToast('Failed to load trash.', 'error');
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
    return result;
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

  const confirmDelete = async () => {
    if (!activeDoc) return;
    setIsSubmitting(true);
    try {
      await documentService.permanentlyDeleteDocument(activeDoc.id);
      setDocuments(d => d.filter(doc => doc.id !== activeDoc.id));
      showToast('Document permanently deleted.', 'success');
      setDeleteOpen(false);
    } catch {
      showToast('Failed to permanently delete document.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (doc: DocumentData) => {
    try {
      await documentService.restoreDocument(doc.id);
      setDocuments(d => d.filter(d => d.id !== doc.id));
      showToast('Document restored.', 'success');
    } catch {
      showToast('Failed to restore document.', 'error');
    }
  };

  const confirmBulkDelete = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedIds.map(id => documentService.permanentlyDeleteDocument(id)));
      setDocuments(d => d.filter(doc => !selectedIds.includes(doc.id)));
      setSelectedIds([]);
      showToast('Selected documents permanently deleted.', 'success');
      setBulkDeleteOpen(false);
    } catch {
      showToast('Failed to delete some documents.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkRestore = async () => {
    try {
      await Promise.all(selectedIds.map(id => documentService.restoreDocument(id)));
      setDocuments(d => d.filter(doc => !selectedIds.includes(doc.id)));
      setSelectedIds([]);
      showToast('Selected documents restored.', 'success');
    } catch {
      showToast('Failed to restore some documents.', 'error');
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-page__header">
        <div>
          <h1 className="documents-page__title">Trash</h1>
          <p className="documents-page__subtitle">
            {loading ? 'Loading...' : `${documents.length} file${documents.length !== 1 ? 's' : ''} in trash`}
          </p>
        </div>
      </div>

      <div className="documents-page__toolbar">
        <div className="toolbar__search">
          <Search size={14} strokeWidth={2} className="toolbar__search-icon" color="#9ca3af" />
          <input
            id="doc-search-input"
            type="text"
            placeholder="Search trash..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="documents-page__bulk-actions">
          <span className="bulk-actions-info">{selectedIds.length} item(s) selected</span>
          <div className="bulk-actions-group">
            <button className="btn-secondary-sm" onClick={handleBulkRestore}>Restore Selected</button>
            <button className="btn-danger-sm" onClick={() => setBulkDeleteOpen(true)}>Delete Forever</button>
          </div>
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : 'Trash is empty'}
          description={search ? 'Try adjusting your search.' : 'Items you delete will appear here.'}
          icon={<Trash2 size={24} strokeWidth={1.5} />}
        />
      ) : (
        <div className="documents-page__table-wrapper">
          <DocumentTable
            documents={paginatedDocs}
            selectable
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onDelete={doc => { setActiveDoc(doc); setDeleteOpen(true); }}
            onContextMenu={handleContextMenu}
            onPreview={handleRestore} // Overload preview to act as restore double-click
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Permanently delete document" description={`Delete "${activeDoc?.originalFileName}" forever? This cannot be undone.`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary-sm" onClick={() => setDeleteOpen(false)} disabled={isSubmitting}>Cancel</button>
          <Button variant="danger" onClick={confirmDelete} isLoading={isSubmitting} loadingText="Deleting...">
            Delete Forever
          </Button>
        </div>
      </Modal>

      <Modal isOpen={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Permanently Delete Documents" description={`Are you sure you want to delete ${selectedIds.length} document(s) forever? This cannot be undone.`}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary-sm" onClick={() => setBulkDeleteOpen(false)} disabled={isSubmitting}>Cancel</button>
          <Button variant="danger" onClick={confirmBulkDelete} isLoading={isSubmitting} loadingText="Deleting...">
            Delete All Forever
          </Button>
        </div>
      </Modal>

      {contextMenu.isOpen && contextMenu.doc && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            padding: '4px',
            minWidth: '160px',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="action-menu__item"
            onClick={() => { setContextMenu({ ...contextMenu, isOpen: false }); handleRestore(contextMenu.doc!); }}
          >Restore</button>
          <div className="action-menu__divider"></div>
          <button 
            className="action-menu__item action-menu__item--danger"
            onClick={() => { setContextMenu({ ...contextMenu, isOpen: false }); setActiveDoc(contextMenu.doc); setDeleteOpen(true); }}
          >Delete Forever</button>
        </div>
      )}
    </div>
  );
};

export default Trash;
