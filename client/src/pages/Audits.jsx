import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAudits } from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const Audits = () => {
  const { user } = useContext(AuthContext);

  const [audits, setAudits] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAudits();
  }, []);
  const deleteAudits = async () => {
    if (!window.confirm("Supprimer tous les audits ?")) return;

    try {
      await fetch("http://localhost:8000/audits", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchAudits(); // reload
    } catch (err) {
      console.error(err);
      alert("Erreur suppression");
    }
  };

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data } = await getAudits();

      setAudits(data.audits || []);
      setStats(data.stats || {});
    } catch (err) {
      setError('Erreur lors du chargement des audits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'ajout':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'modification':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'suppression':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Audits
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Historique des actions sur les approvisionnements
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border">
                <p className="text-sm text-gray-500">Ajouts</p>
                <h2 className="text-2xl font-bold text-green-600">
                  {stats.insertions || 0}
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border">
                <p className="text-sm text-gray-500">Modifications</p>
                <h2 className="text-2xl font-bold text-blue-600">
                  {stats.modifications || 0}
                </h2>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border">
                <p className="text-sm text-gray-500">Suppressions</p>
                <h2 className="text-2xl font-bold text-red-600">
                  {stats.suppressions || 0}
                </h2>
              </div>
            </div>

            {/* ERREUR */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6" />
                {error}
              </div>
            )}

            {/* TABLE */}
            {loading ? (
              <div className="bg-white dark:bg-gray-800 h-64 rounded-2xl animate-pulse"></div>
            ) : audits.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <ClipboardDocumentListIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                Aucun audit trouvé
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden border">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold">
                          Fournisseur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold">
                          Quantité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold">
                          Utilisateur
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {audits.map((audit) => (
                        <tr
                          key={audit.id}
                          className="border-t hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(
                                audit.type_action
                              )}`}
                            >
                              {audit.type_action}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {audit.nom_fournisseur || audit.nom || '-'}
                          </td>

                          <td className="px-6 py-4">
                            {audit.design}
                          </td>

                          <td className="px-6 py-4">
                            {audit.qte_entree_nouv}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(audit.date_mise_a_jour).toLocaleString()}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-medium">
                                {audit.utilisateur ? audit.utilisateur.charAt(0).toUpperCase() : '?'}
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {audit.utilisateur || 'Inconnu'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REFRESH */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={fetchAudits}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Rafraîchir
              </button>
              <button
                onClick={deleteAudits}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer tout
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Audits;
