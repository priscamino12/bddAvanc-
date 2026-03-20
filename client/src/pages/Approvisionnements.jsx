// pages/Approvisionnements.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  getApprovisionnements, 
  createApprovisionnement, 
  updateApprovisionnement, 
  deleteApprovisionnement,
  getProduits,
  getFournisseurs
} from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, 
  CheckCircleIcon, XMarkIcon, ArrowPathIcon 
} from '@heroicons/react/24/outline';

const Approvisionnements = () => {
  const { user } = useContext(AuthContext);
  const [approvisionnements, setApprovisionnements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ n_frs: '', n_produit: '', qte_entree: '' });
  const [editingKeys, setEditingKeys] = useState(null); // {n_frs, n_produit}
  const [modalOpen, setModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modal suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approRes, prodRes, frsRes] = await Promise.all([
        getApprovisionnements(),
        getProduits(),
        getFournisseurs()
      ]);
      setApprovisionnements(approRes.data);
      setProduits(prodRes.data);
      setFournisseurs(frsRes.data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.n_frs) errors.n_frs = 'Fournisseur requis';
    if (!form.n_produit) errors.n_produit = 'Produit requis';
    if (!form.qte_entree || form.qte_entree <= 0) errors.qte_entree = 'Quantité positive requise';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const payload = {
        n_frs: parseInt(form.n_frs),
        n_produit: parseInt(form.n_produit),
        qte_entree: parseInt(form.qte_entree)
      };

      if (editingKeys) {
        await updateApprovisionnement(editingKeys.n_frs, editingKeys.n_produit, { qte_entree: payload.qte_entree });
      } else {
        await createApprovisionnement(payload);
      }

      fetchData();
      setModalOpen(false);
      setForm({ n_frs: '', n_produit: '', qte_entree: '' });
      setEditingKeys(null);
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’enregistrement');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      n_frs: item.n_frs,
      n_produit: item.n_produit,
      qte_entree: item.qte_entree
    });
    setEditingKeys({ n_frs: item.n_frs, n_produit: item.n_produit });
    setModalOpen(true);
    setFormErrors({});
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteApprovisionnement(itemToDelete.n_frs, itemToDelete.n_produit);
      fetchData();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const openAddModal = () => {
    setForm({ n_frs: '', n_produit: '', qte_entree: '' });
    setEditingKeys(null);
    setModalOpen(true);
    setFormErrors({});
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Approvisionnements
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Entrées de stock et commandes fournisseurs
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Nouvel approvisionnement
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-5 py-4 rounded-xl mb-8 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Contenu principal */}
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow animate-pulse h-96"></div>
            ) : approvisionnements.length === 0 ? (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <ArrowPathIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Aucun approvisionnement enregistré</p>
                <button
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Créer le premier
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Tableau premium */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Fournisseur
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Quantité entrée
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {approvisionnements.map((item) => {
                        const frs = fournisseurs.find(f => f.n_frs === item.n_frs);
                        const prod = produits.find(p => p.n_produit === item.n_produit);

                        return (
                          <tr 
                            key={`${item.n_frs}-${item.n_produit}`}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {frs?.nom || `N° ${item.n_frs}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {prod?.design || `N° ${item.n_produit}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                +{item.qte_entree}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition-colors"
                              >
                                <PencilIcon className="h-5 w-5 inline" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              >
                                <TrashIcon className="h-5 w-5 inline" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Ajout / Modification */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingKeys ? 'Modifier l’approvisionnement' : 'Nouvel approvisionnement'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fournisseur
                </label>
                <select
                  value={form.n_frs}
                  onChange={(e) => setForm({ ...form, n_frs: e.target.value })}
                  disabled={editingKeys} // Clé composite non modifiable facilement
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.n_frs ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map(frs => (
                    <option key={frs.id} value={frs.n_frs}>
                      {frs.nom} (N° {frs.n_frs})
                    </option>
                  ))}
                </select>
                {formErrors.n_frs && <p className="mt-1 text-sm text-red-600">{formErrors.n_frs}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Produit
                </label>
                <select
                  value={form.n_produit}
                  onChange={(e) => setForm({ ...form, n_produit: e.target.value })}
                  disabled={editingKeys}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.n_produit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.map(prod => (
                    <option key={prod.id} value={prod.n_produit}>
                      {prod.design} (N° {prod.n_produit})
                    </option>
                  ))}
                </select>
                {formErrors.n_produit && <p className="mt-1 text-sm text-red-600">{formErrors.n_produit}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité entrée
                </label>
                <input
                  type="number"
                  value={form.qte_entree}
                  onChange={(e) => setForm({ ...form, qte_entree: e.target.value })}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.qte_entree ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Quantité reçue"
                  required
                />
                {formErrors.qte_entree && <p className="mt-1 text-sm text-red-600">{formErrors.qte_entree}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`flex-1 py-3 px-6 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 shadow-md
                    ${submitLoading 
                      ? 'bg-amber-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg active:scale-[0.98]'
                    }`}
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      {editingKeys ? 'Modifier' : 'Ajouter'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
            </div>

            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Voulez-vous vraiment supprimer cette entrée d’approvisionnement ?
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {itemToDelete.nom || `Fournisseur N° ${itemToDelete.n_frs}`} → {itemToDelete.design || `Produit N° ${itemToDelete.n_produit}`}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-4 font-medium">
                Quantité : +{itemToDelete.qte_entree} unités
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Cette action est irréversible et ajustera le stock en conséquence.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>

              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-md transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <TrashIcon className="h-5 w-5" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvisionnements;