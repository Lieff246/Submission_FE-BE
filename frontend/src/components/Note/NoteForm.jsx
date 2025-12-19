import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import api from '../../api/axios';

const NoteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folder_id: '',
    is_favorite: false,
    tags: [],
  });
  
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFoldersAndTags();
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchFoldersAndTags = async () => {
    try {
      const [foldersRes, tagsRes] = await Promise.all([
        api.get('/api/folders'),
        api.get('/api/tags'),
      ]);
      setFolders(foldersRes.data.data || []);
      setTags(tagsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchNote = async () => {
    try {
      const response = await api.get(`/api/notes/${id}`);
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching note:', error);
      navigate('/notes');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (id) {
        await api.put(`/api/notes/${id}`, formData);
      } else {
        await api.post('/api/notes', formData);
      }
      navigate('/notes');
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Catatan' : 'Catatan Baru'}
        </h1>
        <p className="text-gray-600 mt-2">
          {id ? 'Edit catatan Anda' : 'Buat catatan baru'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Judul"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Judul catatan"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Konten
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tulis isi catatan di sini..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Folder
            </label>
            <select
              name="folder_id"
              value={formData.folder_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Pilih Folder</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_favorite"
                checked={formData.is_favorite}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Tandai sebagai favorit</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/notes')}
          >
            <X size={20} className="mr-2" />
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            <Save size={20} className="mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;