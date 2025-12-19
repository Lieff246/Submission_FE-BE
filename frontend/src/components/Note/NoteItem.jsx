import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Folder, 
  Tag, 
  Clock,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import api from '../../api/axios';

const NoteItem = ({ note, onDelete, onToggleFavorite }) => {
  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
      try {
        await api.delete(`/api/notes/${note.id}`);
        onDelete(note.id);
      } catch (error) {
        console.error('Error deleting note:', error);
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
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className="p-1 hover:bg-yellow-50 rounded"
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
          
          <div className="relative group">
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreVertical size={20} className="text-gray-400" />
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <Link
                to={`/notes/${note.id}/edit`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash2 size={16} className="mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center space-x-4">
          {note.folder && (
            <div className="flex items-center">
              <Folder size={14} className="mr-1" />
              <span>{note.folder.name}</span>
            </div>
          )}
          
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center">
              <Tag size={14} className="mr-1" />
              <span>{note.tags.length} tag</span>
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

export default NoteItem;