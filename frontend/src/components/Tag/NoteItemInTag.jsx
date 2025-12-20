import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Folder,
  Tag,
  Clock,
  Trash2,
  Edit
} from 'lucide-react';
import api from '../../api/axios';

const NoteItemInTag = ({ note, onDelete, onToggleFavorite }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      setIsDeleting(true);
      try {
        // Ambil detail note untuk mendapatkan tags
        const noteResponse = await api.get(`/api/notes/${note.id}`);
        const noteData = noteResponse.data.data;
        const tags = noteData.tags || [];
        
        // Hapus semua tag assignments
        for (const tag of tags) {
          await api.delete(`/api/notes/${note.id}/tags/${tag.id}`);
        }
        
        // Hapus note
        await api.delete(`/api/notes/${note.id}`);
        onDelete(note.id);
      } catch (error) {
        console.error('Error deleting note:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await api.put(`/api/notes/${note.id}`, {
        ...note,
        is_favorite: !note.is_favorite,
      });
      onToggleFavorite(note.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link to={`/notes/${note.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
              {note.title}
            </h3>
          </Link>
          <p className="text-gray-600 mt-2 line-clamp-3">
            {note.content}
          </p>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleToggleFavorite}
            className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
            title={note.is_favorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
          >
            <Star
              size={20}
              className={`${
                note.is_favorite
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-400'
              }`}
            />
          </button>

          <Link
            to={`/notes/${note.id}/edit`}
            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit catatan"
          >
            <Edit size={20} className="text-gray-400 hover:text-blue-600" />
          </Link>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            title="Hapus catatan"
          >
            <Trash2
              size={20}
              className={`${isDeleting ? 'text-red-300' : 'text-gray-400 hover:text-red-600'}`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center space-x-4">
          {note.folder_name && (
            <div className="flex items-center">
              <Folder size={14} className="mr-1" />
              <span>{note.folder_name}</span>
            </div>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <Tag size={14} className="mr-1" />
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    +{note.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <Clock size={14} className="mr-1" />
          <span>
            {new Date(note.updated_at).toLocaleDateString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteItemInTag;