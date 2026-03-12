import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-xl font-bold text-primary">Bienvenue, {user.nom} ({user.role})</h2>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold">Produits</h3>
              <p className="text-2xl">25</p> {/* À dynamiser */}
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold">Fournisseurs</h3>
              <p className="text-2xl">10</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold">Stock Total</h3>
              <p className="text-2xl">500</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;