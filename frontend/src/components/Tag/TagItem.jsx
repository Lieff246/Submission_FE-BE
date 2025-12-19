import React, { useState } from 'react';
import { Tag, Edit, Trash2, MoreVertical } from 'lucide-react';
import Modal from '../UI/Modal';
import api from '../../api/axios';

const TagItem = ({ tag, onDelete, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    
    setLoading(true);
    try {
      await api.put(`/api/tags/${tag.id}`, { name: editName });
      onUpdate();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/api/tags/${tag.id}`);
      onDelete(tag.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting tag:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <Tag size={16} className="text-purple-600 mr-2" />
          <span className="text-gray-900">{tag.name}</span>
          <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {tag.note_count || 0} catatan
          </span>
        </div>
        
        <div className="relative group">
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical size={16} className="text-gray-400" />
          </button>
          
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit size={14} className="mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <Trash2 size={14} className="mr-2" />
              Hapus
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Tag"
      >
        <div className="space-y-4">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nama tag"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Batal
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading || !editName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Hapus Tag"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus tag "{tag.name}"?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TagItem;