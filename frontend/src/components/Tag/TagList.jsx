import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import TagItem from './TagItem';
import Button from '../UI/Button';
import Input from '../UI/Input';
import api from '../../api/axios';

const TagList = ({ onAddClick }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/tags');
      setTags(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
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
              placeholder="Cari tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button onClick={onAddClick}>
          <Plus size={20} className="mr-2" />
          Tag Baru
        </Button>
      </div>
      
      {filteredTags.length > 0 ? (
        <div className="space-y-3">
          {filteredTags.map(tag => (
            <TagItem
              key={tag.id}
              tag={tag}
              onDelete={handleDelete}
              onUpdate={fetchTags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada tag ditemukan
          </h3>
          <p className="text-gray-500 mb-6">
            {search ? 'Coba cari dengan kata kunci lain' : 'Buat tag pertama Anda'}
          </p>
          {!search && (
            <Button onClick={onAddClick}>
              <Plus size={20} className="mr-2" />
              Buat Tag Baru
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TagList;