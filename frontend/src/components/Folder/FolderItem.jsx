import React, { useState } from 'react';
import { Folder, FileText, Edit, Trash2, MoreVertical } from 'lucide-react';
import Modal from '../UI/Modal';
import FolderForm from './FolderForm';
import api from '../../api/axios';

const FolderItem = ({ folder, onDelete, onUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/folders/${folder.id}`);
      onDelete(folder.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    onUpdate();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Folder className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-gray-600 mt-1">{folder.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <FileText size={14} className="mr-1" />
                <span>{folder.note_count || 0} catatan</span>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical size={20} className="text-gray-400" />
            </button>
            
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash2 size={16} className="mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Folder"
      >
        <FolderForm
          folder={folder}
          onSuccess={handleUpdateSuccess}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Hapus Folder"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus folder "{folder.name}"?
            Semua catatan dalam folder ini akan tetap ada.
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FolderItem;