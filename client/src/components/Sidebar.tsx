import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ user }) => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-6 space-y-4 shadow-lg">
      <Link to="/dashboard" className="block text-primary hover:underline">Dashboard</Link>
      <Link to="/produits" className="block text-primary hover:underline">Produits</Link>
      <Link to="/fournisseurs" className="block text-primary hover:underline">Fournisseurs</Link>
      <Link to="/approvisionnements" className="block text-primary hover:underline">Approvisionnements</Link>
      {user.role === 'admin' && <Link to="/audits" className="block text-primary hover:underline">Audits</Link>}
    </aside>
  );
};

export default Sidebar;