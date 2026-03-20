// pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import { getStatsDashboard } from '../services/api'; // ← à ajouter dans api.jsx
import { 
  CubeIcon, TruckIcon, ArchiveBoxIcon, ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    produitsCount: 0,
    fournisseursCount: 0,
    approvisionnementsCount: 0,
    totalStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStatsDashboard();
        setStats(data);
      } catch (err) {
        setError('Impossible de charger les statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Titre */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de bord
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Bienvenue, {user?.nom} • {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow animate-pulse h-40"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Produits" 
                  value={stats.produitsCount} 
                  icon={CubeIcon} 
                  color="bg-indigo-600" 
                />
                <StatCard 
                  title="Fournisseurs" 
                  value={stats.fournisseursCount} 
                  icon={TruckIcon} 
                  color="bg-emerald-600" 
                />
                <StatCard 
                  title="Approvisionnements" 
                  value={stats.approvisionnementsCount} 
                  icon={ArchiveBoxIcon} 
                  color="bg-amber-600" 
                />
                <StatCard 
                  title="Stock Total" 
                  value={stats.totalStock} 
                  icon={ArrowTrendingUpIcon} 
                  color="bg-purple-600" 
                />
              </div>
            )}

            {/* Tu peux ajouter ici d'autres sections : graphique, derniers mouvements, alertes stock bas, etc. */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;