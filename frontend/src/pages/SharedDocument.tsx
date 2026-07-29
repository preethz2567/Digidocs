import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import documentService from '../services/documentService';
import { FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const SharedDocument: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ blob: Blob; filename: string } | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!token) return;
      try {
        const data = await documentService.getSharedDocument(token);
        setFileData(data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Invalid share link.');
        } else if (err.response?.status === 410) {
          setError('This share link has expired.');
        } else {
          setError('Failed to load shared document.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [token]);

  const handleDownload = () => {
    if (!fileData) return;
    const url = window.URL.createObjectURL(fileData.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fbfbfb' }}>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading document...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fbfbfb', padding: '20px' }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
      }}>
        {error ? (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Unavailable</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>{error}</p>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>Shared Document</h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '24px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              marginBottom: '24px'
            }}>
              <FileText size={32} color="#6b7280" strokeWidth={1.5} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{fileData?.filename}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Shared by DigiDocs</p>
              </div>
            </div>
            <Button onClick={handleDownload} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Download size={16} strokeWidth={2.5} />
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
