import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText } from 'lucide-react';
import documentService from '../services/documentService';
import { DocumentTable, type DocumentData } from '../components/ui/DocumentTable';
import { DocumentToolbar, type FilterType, type SortType } from '../components/ui/DocumentToolbar';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonCard';
import { UploadModal } from '../components/ui/UploadModal';
import { RenameModal } from '../components/ui/RenameModal';
import { DeleteModal } from '../components/ui/DeleteModal';
import { ShareModal } from '../components/ui/ShareModal';
import { useToast } from '../components/ui/ToastContext';
import './Documents.css';

const ITEMS_PER_PAGE = 10;

const getExtension = (filename: string) => {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()?.toUpperCase() || '';
  }
  return '';
};

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Toolbar State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');
  const [sort, setSort] = useState<SortType>('Newest First');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Modals State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentData | null>(null);

  const { showToast } = useToast();

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await documentService.getDocuments('date');
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      showToast('Failed to load documents.', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Derived State (Client-side Search, Filter, Sort)
  const processedDocs = useMemo(() => {
    let result = [...documents];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(d => d.originalFileName.toLowerCase().includes(query));
    }

    // Filter by type
    if (filter !== 'All') {
      result = result.filter(d => getExtension(d.originalFileName) === filter);
    }

    // Sort
    result.sort((a, b) => {
      if (sort === 'Newest First') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      if (sort === 'Oldest First') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      if (sort === 'Largest First') return b.fileSize - a.fileSize;
      if (sort === 'Smallest First') return a.fileSize - b.fileSize;
      if (sort === 'Alphabetical') return a.originalFileName.localeCompare(b.originalFileName);
      return 0;
    });

    return result;
  }, [documents, search, filter, sort]);

  const totalPages = Math.ceil(processedDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedDocs.slice(start, start + ITEMS_PER_PAGE);
  }, [processedDocs, currentPage]);

  // Reset pagination on search/filter changes
  useEffect(() => { setCurrentPage(1); }, [search, filter, sort]);

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

  // Optimistic Handlers for Modals
  const onRenameSuccess = (updatedDoc: DocumentData) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, originalFileName: updatedDoc.originalFileName } : d));
  };

  const onDeleteSuccess = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="documents-page">
      <div className="documents-page__header">
        <div>
          <h1 className="documents-page__title">Documents</h1>
          <p className="documents-page__subtitle">Manage all uploaded files securely.</p>
        </div>
      </div>

      <DocumentToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        onUploadClick={() => setUploadOpen(true)}
      />

      {loading ? (
        <SkeletonTable />
      ) : processedDocs.length === 0 ? (
        <EmptyState
          title={search || filter !== 'All' ? 'No results found' : 'No documents uploaded'}
          description={search || filter !== 'All' ? 'Try adjusting your search or filters.' : ''}
          icon={<FileText size={24} strokeWidth={1.5} />}
          action={(!search && filter === 'All') && (
            <button className="btn-upload-sm" onClick={() => setUploadOpen(true)} style={{ marginTop: 12 }}>
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
            onRename={doc => { setActiveDoc(doc); setRenameOpen(true); }}
            onDelete={doc => { setActiveDoc(doc); setDeleteOpen(true); }}
            onShare={doc => { setActiveDoc(doc); setShareOpen(true); }}
          />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Modals composed of BaseModal */}
      <UploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} onSuccess={() => { setUploadOpen(false); fetchDocuments(); }} />
      <RenameModal isOpen={renameOpen} onClose={() => setRenameOpen(false)} document={activeDoc} onSuccess={onRenameSuccess} />
      <DeleteModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} document={activeDoc} onSuccess={onDeleteSuccess} />
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} document={activeDoc} />
    </div>
  );
};

export default Documents;
