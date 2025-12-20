import React, { useState, useEffect } from 'react';
import { Folder, FileText, Edit, Trash2, Star } from 'lucide-react';
import Modal from '../UI/Modal';
import FolderForm from './FolderForm';
import NoteItemInFolder from './NoteItemInFolder';
import api from '../../api/axios';

const FolderItem = ({ folder, onDelete, onUpdate, onToggleFavorite }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [folderNotes, setFolderNotes] = useState([]);
  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get(`/api/folders/${folder.id}/notes`);
        setFolderNotes(response.data.data);
        setNoteCount(response.data.data.length);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    fetchNotes();
  }, [folder.id]);

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

  const handleToggleFavorite = async () => {
    try {
      await api.patch(`/api/folders/${folder.id}`, {
        is_favorite: !folder.is_favorite
      });
      onToggleFavorite(folder.id, !folder.is_favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShowNotes = () => {
    setShowNotesModal(true);
  };

  const handleNoteDelete = (noteId) => {
    setFolderNotes(prev => prev.filter(note => note.id !== noteId));
    setNoteCount(prev => prev - 1);
  };

  const handleNoteToggleFavorite = (noteId) => {
    setFolderNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, is_favorite: !note.is_favorite } : note
    ));
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
              <h3 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={handleShowNotes}
              >
                {folder.name}
              </h3>
              {folder.description && (
                <p className="text-gray-600 mt-1">{folder.description}</p>
              )}
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <FileText size={14} className="mr-1" />
                <span>{noteCount} catatan</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={folder.is_favorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
            >
              <Star 
                size={20} 
                className={folder.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} 
              />
            </button>
            
            {/* Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit folder"
            >
              <Edit size={20} className="text-blue-600" />
            </button>
            
            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Hapus folder"
            >
              <Trash2 size={20} className="text-red-600" />
            </button>
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

      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title={`Catatan di Folder "${folder.name}"`}
      >
        <div className="space-y-4">
          {folderNotes.length > 0 ? (
            <div className="grid gap-4">
              {folderNotes.map(note => (
                <NoteItemInFolder
                  key={note.id}
                  note={note}
                  onDelete={handleNoteDelete}
                  onToggleFavorite={handleNoteToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada catatan di folder ini.</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default FolderItem;
