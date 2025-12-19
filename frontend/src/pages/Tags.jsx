import React, { useState } from 'react';
import TagList from '../components/Tag/TagList';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import api from '../api/axios';

const Tags = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    setLoading(true);
    try {
      await api.post('/api/tags', { name: newTagName });
      setNewTagName('');
      setShowAddModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding tag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tag</h1>
        <p className="text-gray-600 mt-2">
          Kelola tag untuk melabeli catatan Anda
        </p>
      </div>

      <TagList onAddClick={() => setShowAddModal(true)} />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tag Baru"
      >
        <div className="space-y-4">
          <Input
            label="Nama Tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nama tag"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Batal
            </button>
            <Button onClick={handleAddTag} disabled={loading || !newTagName.trim()}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tags;