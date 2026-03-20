// pages/Fournisseurs.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  getFournisseurs, 
  createFournisseur, 
  updateFournisseur, 
  deleteFournisseur 
} from '../services/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { 
  PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, 
  CheckCircleIcon, XMarkIcon, BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

const Fournisseurs = () => {
  const { user } = useContext(AuthContext);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ n_frs: '', nom: '' });
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // États pour la confirmation de suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null);

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const { data } = await getFournisseurs();
      setFournisseurs(data);
    } catch (err) {
      setError('Erreur lors du chargement des fournisseurs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.n_frs || form.n_frs <= 0) errors.n_frs = 'Numéro fournisseur requis et positif';
    if (!form.nom?.trim()) errors.nom = 'Nom du fournisseur requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (editingId) {
        await updateFournisseur(editingId, {
          nom: form.nom,
          n_frs: editingId ? form.n_frs : parseInt(form.n_frs) // n_frs non modifiable en édition
        });
      } else {
        await createFournisseur({
          n_frs: parseInt(form.n_frs),
          nom: form.nom
        });
      }
      fetchFournisseurs();
      setModalOpen(false);
      setForm({ n_frs: '', nom: '' });
      setEditingId(null);
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’enregistrement');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (fournisseur) => {
    setForm({
      n_frs: fournisseur.n_frs,
      nom: fournisseur.nom
    });
    setEditingId(fournisseur.id);
    setModalOpen(true);
    setFormErrors({});
  };

  const handleDeleteClick = (fournisseur) => {
    setFournisseurToDelete(fournisseur);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fournisseurToDelete) return;

    try {
      await deleteFournisseur(fournisseurToDelete.id);
      fetchFournisseurs();
      setDeleteModalOpen(false);
      setFournisseurToDelete(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const openAddModal = () => {
    setForm({ n_frs: '', nom: '' });
    setEditingId(null);
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
                  Fournisseurs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gestion de vos partenaires d’approvisionnement
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                Ajouter un fournisseur
              </button>
            </div>

            {/* Erreur globale */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-5 py-4 rounded-xl mb-8 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Chargement */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-48 animate-pulse shadow"></div>
                ))}
              </div>
            ) : fournisseurs.length === 0 ? (
              <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">Aucun fournisseur trouvé</p>
                <button
                  onClick={openAddModal}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5" />
                  Ajouter le premier fournisseur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {fournisseurs.map((frs) => (
                  <div
                    key={frs.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* En-tête carte */}
                    <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {frs.nom}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            N° {frs.n_frs}
                          </p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          ID: {frs.id}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
                      <button
                        onClick={() => handleEdit(frs)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(frs)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
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
                {editingId ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
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
                  Numéro fournisseur
                </label>
                <input
                  type="number"
                  value={form.n_frs}
                  onChange={(e) => setForm({ ...form, n_frs: e.target.value })}
                  disabled={editingId} // Non modifiable en édition
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.n_frs ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ex: 5001"
                  required
                />
                {formErrors.n_frs && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.n_frs}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du fournisseur
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.nom ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Ex: SARL Fournimax"
                  required
                />
                {formErrors.nom && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className={`flex-1 py-3 px-6 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 shadow-md
                    ${submitLoading 
                      ? 'bg-emerald-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg active:scale-[0.98]'
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
                      {editingId ? 'Modifier' : 'Ajouter'}
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

      {/* Modal de confirmation de suppression */}
      {deleteModalOpen && fournisseurToDelete && (
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
                Voulez-vous vraiment supprimer ce fournisseur ?
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {fournisseurToDelete.nom} (N° {fournisseurToDelete.n_frs})
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Cette action est irréversible et peut affecter les approvisionnements liés.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setFournisseurToDelete(null);
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

export default Fournisseurs;