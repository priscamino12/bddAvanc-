// components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, CubeIcon, TruckIcon, ArchiveBoxArrowDownIcon, 
  DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/produits', label: 'Produits', icon: CubeIcon },
  { path: '/fournisseurs', label: 'Fournisseurs', icon: TruckIcon },
  { path: '/approvisionnements', label: 'Approvisionnements', icon: ArchiveBoxArrowDownIcon },
  { path: '/audits', label: 'Audits', icon: DocumentTextIcon, adminOnly: true },
];

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 h-screen sticky top-0 z-20 overflow-hidden
        ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Header sidebar */}
      <div className="p-6 flex items-center justify-between border-b border-gray-700">
        {!isCollapsed && (
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Stock Audit
          </h2>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;

          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600/20 text-indigo-400 font-medium' 
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar (optionnel) */}
      <div className="absolute bottom-6 left-0 right-0 px-4">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Stock Audit
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;