import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
import type { TagData, DocumentData } from './DocumentTable';
import tagService from '../../services/tagService';

interface TagManagerModalProps {
  document: DocumentData;
  onClose: () => void;
  onTagChange: () => void; // callback to refresh documents
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  document,
  onClose,
  onTagChange
}) => {
  const [tags, setTags] = useState<TagData[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#1d6ef7');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await tagService.getAllTags();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      setLoading(true);
      await tagService.createTag({ name: newTagName, color: newTagColor });
      setNewTagName('');
      fetchTags();
    } catch (error) {
      console.error('Failed to create tag', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    try {
      setLoading(true);
      await tagService.deleteTag(tagId);
      fetchTags();
      onTagChange(); // Document tags might have been removed
    } catch (error) {
      console.error('Failed to delete tag', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTag = async (tagId: number) => {
    try {
      setLoading(true);
      await tagService.assignTag(document.id, tagId);
      onTagChange();
    } catch (error) {
      console.error('Failed to assign tag', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    try {
      setLoading(true);
      await tagService.removeTag(document.id, tagId);
      onTagChange();
    } catch (error) {
      console.error('Failed to remove tag', error);
    } finally {
      setLoading(false);
    }
  };

  const documentTagIds = document.tags?.map(t => t.id) || [];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(13,13,13,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#0d0d0d', border: '1px solid #374151',
        padding: '24px', width: '400px',
        color: '#fafafa', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TagIcon size={20} /> Manage Tags
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
          {document.originalFileName}
        </p>

        {/* Create Tag Form */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input 
            type="color" 
            value={newTagColor}
            onChange={e => setNewTagColor(e.target.value)}
            style={{ width: '40px', padding: 0, border: '1px solid #374151', background: 'none' }}
          />
          <input 
            type="text" 
            placeholder="New tag name"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            style={{ flex: 1, padding: '8px', background: '#111827', border: '1px solid #374151', color: '#fafafa' }}
          />
          <button 
            onClick={handleCreateTag}
            disabled={loading || !newTagName.trim()}
            style={{ padding: '8px 12px', background: '#fafafa', color: '#0d0d0d', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Tags List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {tags.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>No tags available</div>
          ) : (
            tags.map(tag => {
              const isAssigned = documentTagIds.includes(tag.id);
              
              return (
                <div key={tag.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', border: '1px solid #374151', background: '#111827' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => isAssigned ? handleRemoveTag(tag.id) : handleAssignTag(tag.id)}
                      disabled={loading}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ 
                      fontSize: '12px', padding: '2px 8px', border: `1px solid ${tag.color}`,
                      color: tag.color, backgroundColor: `${tag.color}15`, fontWeight: 500
                    }}>
                      {tag.name}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={loading}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Delete tag completely"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
