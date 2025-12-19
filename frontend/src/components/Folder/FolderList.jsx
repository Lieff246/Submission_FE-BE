import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import FolderItem from './FolderItem';
import Button from '../UI/Button';
import Input from '../UI/Input';
import api from '../../api/axios';

const FolderList = ({ onAddClick }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await api.get('/api/folders');
      setFolders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (folderId) => {
    setFolders(folders.filter(folder => folder.id !== folderId));
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(search.toLowerCase()) ||
    folder.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Cari folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button onClick={onAddClick}>
          <Plus size={20} className="mr-2" />
          Folder Baru
        </Button>
      </div>
      
      {filteredFolders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFolders.map(folder => (
            <FolderItem
              key={folder.id}
              folder={folder}
              onDelete={handleDelete}
              onUpdate={fetchFolders}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada folder ditemukan
          </h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Coba cari dengan kata kunci lain' : 'Buat folder pertama Anda'}
          </p>
          {!search && (
            <Button onClick={onAddClick}>
              <Plus size={20} className="mr-2" />
              Buat Folder Baru
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FolderList;