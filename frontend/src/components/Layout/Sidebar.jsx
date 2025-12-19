import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Folder, 
  Tag, 
  LogOut,
  FileText,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/notes', icon: FileText, label: 'Catatan' },
    { path: '/folders', icon: Folder, label: 'Folder' },
    { path: '/tags', icon: Tag, label: 'Tag' },
  ];

  return (
    <div className="w-64 bg-white shadow-md h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">
          {import.meta.env.VITE_APP_NAME}
        </h1>
      </div>
      
      <nav className="mt-8">
        <div className="px-4 mb-6">
          <Link
            to="/notes/new"
            className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Catatan Baru
          </Link>
        </div>
        
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path} className="mb-1">
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                    isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-full p-6">
        <button
          onClick={logout}
          className="flex items-center text-gray-700 hover:text-red-600 w-full"
        >
          <LogOut size={20} className="mr-3" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;