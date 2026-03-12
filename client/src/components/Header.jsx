import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { logout, theme, toggleTheme } = useContext(AuthContext);

  return (
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-xl font-bold text-primary">Gestion Stock</h1>
      <div className="flex space-x-4">
        <button onClick={toggleTheme}>
          {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
        </button>
        <button onClick={logout} className="text-red-500">Logout</button>
      </div>
    </header>
  );
};

export default Header;