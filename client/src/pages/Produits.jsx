import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProduits, createProduit, updateProduit, deleteProduit } from '../services/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const Produits = () => {
  const { user } = useContext(AuthContext);
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState({ n_produit: '', design: '', stock: '' });
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    const { data } = await getProduits();
    setProduits(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateProduit(editingId, form);
    } else {
      await createProduit(form);
    }
    fetchProduits();
    setModalOpen(false);
    setForm({ n_produit: '', design: '', stock: '' });
    setEditingId(null);
  };

  const handleEdit = (produit) => {
    setForm({ n_produit: produit.n_produit, design: produit.design, stock: produit.stock });
    setEditingId(produit.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer suppression')) {
      await deleteProduit(id);
      fetchProduits();
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">Produits</h2>
            <button onClick={() => setModalOpen(true)} className="button">Ajouter Produit</button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="p-2">ID</th>
                <th className="p-2">N° Produit</th>
                <th className="p-2">Design</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id} className="border-b dark:border-gray-600">
                  <td className="p-2">{p.id}</td>
                  <td className="p-2">{p.n_produit}</td>
                  <td className="p-2">{p.design}</td>
                  <td className="p-2">{p.stock}</td>
                  <td className="p-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-500 mr-2">Modifier</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                <h3 className="text-lg font-bold mb-4">{editingId ? 'Modifier' : 'Ajouter'} Produit</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="number"
                    placeholder="N° Produit"
                    value={form.n_produit}
                    onChange={(e) => setForm({ ...form, n_produit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    required
                    disabled={editingId} // Ne pas modifier n_produit si édition
                  />
                  <input
                    type="text"
                    placeholder="Design"
                    value={form.design}
                    onChange={(e) => setForm({ ...form, design: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  <button type="submit" className="button w-full">Enregistrer</button>
                  <button type="button" onClick={() => setModalOpen(false)} className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-600">Annuler</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Produits;