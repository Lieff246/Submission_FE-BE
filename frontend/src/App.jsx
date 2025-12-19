import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Loading from './components/UI/Loading';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteForm from './components/Note/NoteForm';
import Folders from './pages/Folders';
import Tags from './pages/Tags';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Navigate to="/dashboard" />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/notes" element={
            <PrivateRoute>
              <Layout>
                <Notes />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/notes/new" element={
            <PrivateRoute>
              <Layout>
                <NoteForm />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/notes/:id" element={
            <PrivateRoute>
              <Layout>
                <NoteForm />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/notes/:id/edit" element={
            <PrivateRoute>
              <Layout>
                <NoteForm />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/folders" element={
            <PrivateRoute>
              <Layout>
                <Folders />
              </Layout>
            </PrivateRoute>
          } />
          
          <Route path="/tags" element={
            <PrivateRoute>
              <Layout>
                <Tags />
              </Layout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;