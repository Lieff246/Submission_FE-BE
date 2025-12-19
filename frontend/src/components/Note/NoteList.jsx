import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import NoteItem from './NoteItem';
import Button from '../UI/Button';
import Input from '../UI/Input';
import api from '../../api/axios';

const NoteList = ({ onAddClick }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      setNotes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const handleToggleFavorite = (noteId) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, is_favorite: !note.is_favorite }
        : note
    ));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = search === '' || 
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'favorite' && note.is_favorite);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
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
              placeholder="Cari catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Catatan</option>
              <option value="favorite">Favorit</option>
            </select>
          </div>
          
          <Button onClick={onAddClick}>
            <Plus size={20} className="mr-2" />
            Catatan Baru
          </Button>
        </div>
      </div>
      
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredNotes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada catatan ditemukan
          </h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Coba cari dengan kata kunci lain' : 'Buat catatan pertama Anda'}
          </p>
          {!search && (
            <Button onClick={onAddClick}>
              <Plus size={20} className="mr-2" />
              Buat Catatan Baru
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteList;