import React, { useState } from 'react';
import FolderList from '../components/Folder/FolderList';
import Modal from '../components/UI/Modal';
import FolderForm from '../components/Folder/FolderForm';

const Folders = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Folder</h1>
        <p className="text-gray-600 mt-2">
          Kelola folder untuk mengorganisir catatan Anda
        </p>
      </div>

      <FolderList onAddClick={() => setShowAddModal(true)} />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Folder Baru"
      >
        <FolderForm onSuccess={() => {
          setShowAddModal(false);
          window.location.reload();
        }} />
      </Modal>
    </div>
  );
};

export default Folders;