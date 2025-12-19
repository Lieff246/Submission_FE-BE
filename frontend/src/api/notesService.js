import api from './axios';

export const notesService = {
  // Get all notes
  getNotes: async (params = {}) => {
    const response = await api.get('/api/notes', { params });
    return response.data;
  },

  // Get note by ID
  getNoteById: async (id) => {
    const response = await api.get(`/api/notes/${id}`);
    return response.data;
  },

  // Create new note
  createNote: async (noteData) => {
    const response = await api.post('/api/notes', noteData);
    return response.data;
  },

  // Update note
  updateNote: async (id, noteData) => {
    const response = await api.put(`/api/notes/${id}`, noteData);
    return response.data;
  },

  // Delete note
  deleteNote: async (id) => {
    const response = await api.delete(`/api/notes/${id}`);
    return response.data;
  }
};