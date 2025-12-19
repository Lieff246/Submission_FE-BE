import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteList from '../components/Note/NoteList';
import Modal from '../components/UI/Modal';
import FolderForm from '../components/Folder/FolderForm';

const Notes = () => {
  const navigate = useNavigate();
  const [showFolderModal, setShowFolderModal] = useState(false);

  const handleAddNote = () => {
    navigate('/notes/new');
  };

  return (
    <div className="ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catatan</h1>
        <p className="text-gray-600 mt-2">
          Kelola semua catatan pribadi Anda
        </p>
      </div>

      <NoteList onAddClick={handleAddNote} />

      <Modal
        isOpen={showFolderModal}
        onClose={() => setShowFolderModal(false)}
        title="Folder Baru"
      >
        <FolderForm onSuccess={() => setShowFolderModal(false)} />
      </Modal>
    </div>
  );
};

export default Notes;