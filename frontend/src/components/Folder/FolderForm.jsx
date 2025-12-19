import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import api from '../../api/axios';

const FolderForm = ({ folder, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: folder?.name || '',
    description: folder?.description || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (folder?.id) {
        await api.put(`/api/folders/${folder.id}`, formData);
      } else {
        await api.post('/api/folders', formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nama Folder"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Nama folder"
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Deskripsi
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Deskripsi folder"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          <Save size={20} className="mr-2" />
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
};

export default FolderForm;