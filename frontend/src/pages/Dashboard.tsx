import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Share2, Pencil, Trash2, FileText, HardDrive, Link as LinkIcon, Plus } from 'lucide-react';
import documentService from '../services/documentService';
import userService from '../services/userService';
import { getRecentlyViewed, addRecentlyViewed } from '../services/recentlyViewedService';
import { StatsCard } from '../components/ui/StatsCard';
import { QuickActionCard } from '../components/ui/QuickActionCard';
import { DocumentTable, type DocumentData } from '../components/ui/DocumentTable';
import { SkeletonCard, SkeletonTable } from '../components/ui/SkeletonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { UploadModal } from '../components/ui/UploadModal';
import { StorageAnalytics } from '../components/ui/StorageAnalytics';
import './Dashboard.css';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    const docs = await documentService.getDocuments('date');
    if (Array.isArray(docs)) setDocuments(docs);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, docs] = await Promise.all([
          userService.getProfile(),
          documentService.getDocuments('date'),
        ]);
        if (profile?.name) setUserName(profile.name.split(' ')[0]);
        if (Array.isArray(docs)) setDocuments(docs);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStorage = documents.reduce((acc, doc) => acc + (doc?.fileSize || 0), 0);
  const viewedIds = getRecentlyViewed();
  const recentDocs = viewedIds
    .map(id => documents.find(doc => doc.id === id))
    .filter((doc): doc is DocumentData => doc !== undefined)
    .slice(0, 5);
  // Approximation for shared links since we don't have a direct endpoint for counts
  const sharedCount = 0; // Keeping it static or calculated if backend returned it

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date());

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">
            {greeting}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="dashboard__subtitle">{currentDate}</p>
        </div>
        <button className="btn-upload" onClick={() => setUploadOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          Upload
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard__stats-grid">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <StatsCard
              label="Documents"
              value={documents.length}
              icon={<FileText size={18} strokeWidth={2} />}
            />
            <StatsCard
              label="Storage Used"
              value={formatBytes(totalStorage)}
              icon={<HardDrive size={18} strokeWidth={2} />}
            />
            <StatsCard
              label="Shared Links"
              value={sharedCount}
              icon={<LinkIcon size={18} strokeWidth={2} />}
            />
          </>
        )}
      </div>

      {/* Main Grid: Left (Recent Docs) / Right (Quick Actions) */}
      <div className="dashboard__main-grid">
        
        {/* Left Column */}
        <div className="dashboard__col-left">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">Recently Viewed</h2>
            <button className="dashboard__btn-link" onClick={() => navigate('/documents')}>
              View all
            </button>
          </div>
          <div className="dashboard__table-wrapper">
            {loading ? (
              <SkeletonTable />
            ) : recentDocs.length > 0 ? (
              <DocumentTable
                documents={recentDocs}
                onRename={() => navigate('/documents')}
                onDelete={() => navigate('/documents')}
                onShare={() => navigate('/documents')}
                onDownload={async (doc) => {
                  addRecentlyViewed(doc.id);
                  const blob = await documentService.downloadDocument(doc.id);
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = doc.originalFileName;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
              />
            ) : (
              <EmptyState
                title="No recently viewed documents"
                description="Documents you view or download will appear here."
                icon={<FileText size={24} strokeWidth={1.5} />}
                action={
                  <button className="btn-upload" onClick={() => setUploadOpen(true)}>
                    <Plus size={16} strokeWidth={2.5} />
                    Upload Document
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard__col-right">
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">Quick Actions</h2>
          </div>
          <div className="quick-actions-grid-2x2">
            <QuickActionCard
              label="Upload"
              onClick={() => setUploadOpen(true)}
              icon={<Upload size={20} strokeWidth={1.5} />}
            />
            <QuickActionCard
              label="Share"
              onClick={() => navigate('/documents')}
              icon={<Share2 size={20} strokeWidth={1.5} />}
            />
            <QuickActionCard
              label="Rename"
              onClick={() => navigate('/documents')}
              icon={<Pencil size={20} strokeWidth={1.5} />}
            />
            <QuickActionCard
              label="Delete"
              onClick={() => navigate('/documents')}
              icon={<Trash2 size={20} strokeWidth={1.5} />}
            />
          </div>
        </div>

      </div>

      <StorageAnalytics documents={documents} />

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => { setUploadOpen(false); fetchDocs(); }}
      />
    </div>
  );
};

export default Dashboard;