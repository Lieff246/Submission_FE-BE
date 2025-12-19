import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="ml-64 bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <User size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;