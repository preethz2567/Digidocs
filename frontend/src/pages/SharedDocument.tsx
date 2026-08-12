import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, AlertCircle, Clock } from 'lucide-react';
import { getSharedDocument } from '../services/documentService';

type State = 'loading' | 'ready' | 'expired' | 'invalid';

const SharedDocument: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>('loading');
  const [fileName, setFileName] = useState('');
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    if (!token) { setState('invalid'); return; }

    const load = async () => {
      try {
        const { blob, filename } = await getSharedDocument(token);
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setFileName(filename);
        setState('ready');
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 410) setState('expired');
        else setState('invalid');
      }
    };

    load();
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'document';
    a.click();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      fontFamily: 'inherit',
      padding: '24px',
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '48px 40px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
      }}>
        {state === 'loading' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#9ca3af' }}>
              <FileText size={22} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading document…</p>
          </>
        )}

        {state === 'ready' && (
          <>
            <div style={{ width: '52px', height: '52px', borderRadius: '6px', background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#374151' }}>
              <FileText size={24} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>
              Shared Document
            </p>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '6px', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
              {fileName}
            </h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '28px' }}>
              Shared via DigiDocs
            </p>
            <button
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '36px',
                padding: '0 20px',
                background: '#111827',
                color: '#ffffff',
                border: '1px solid #111827',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Download size={14} strokeWidth={2} />
              Download
            </button>
          </>
        )}

        {state === 'expired' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#ea580c' }}>
              <Clock size={22} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Link expired
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              This share link has expired and is no longer available.
            </p>
          </>
        )}

        {state === 'invalid' && (
          <>
            <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#dc2626' }}>
              <AlertCircle size={22} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Invalid share link
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280' }}>
              This link is invalid or the document no longer exists.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SharedDocument;
