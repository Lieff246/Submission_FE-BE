import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Folder, 
  Tag, 
  Star,
  TrendingUp
} from 'lucide-react';
import api from '../api/axios';
import NoteList from '../components/Note/NoteList';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalFolders: 0,
    totalTags: 0,
    favoriteNotes: 0,
  });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [notesRes, foldersRes, tagsRes] = await Promise.all([
        api.get('/api/notes'),
        api.get('/api/folders'),
        api.get('/api/tags'),
      ]);

      const notes = notesRes.data.data || [];
      const favoriteNotes = notes.filter(note => note.is_favorite).length;

      setStats({
        totalNotes: notes.length,
        totalFolders: foldersRes.data.data?.length || 0,
        totalTags: tagsRes.data.data?.length || 0,
        favoriteNotes,
      });

      setRecentNotes(notes.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di aplikasi catatan pribadi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Catatan</p>
              <p className="text-2xl font-bold">{stats.totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <Folder className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Folder</p>
              <p className="text-2xl font-bold">{stats.totalFolders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tag</p>
              <p className="text-2xl font-bold">{stats.totalTags}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Favorit</p>
              <p className="text-2xl font-bold">{stats.favoriteNotes}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Catatan Terbaru</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          
          {recentNotes.length > 0 ? (
            <div className="space-y-4">
              {recentNotes.map(note => (
                <div key={note.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {new Date(note.updated_at).toLocaleDateString('id-ID')}
                      </span>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <span
                              key={tag.id}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{note.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {note.is_favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Belum ada catatan
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Aktivitas Terakhir</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm">Login berhasil</p>
                <p className="text-xs text-gray-500">Baru saja</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm">Aplikasi siap digunakan</p>
                <p className="text-xs text-gray-500">Hari ini</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;