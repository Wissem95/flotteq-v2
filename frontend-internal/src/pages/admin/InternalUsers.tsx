// 📁 frontend/internal/src/pages/admin/InternalUsers.tsx


import React, { useState } from "react";
import { useInternalUsers } from "@/hooks/useInternalUsers";
import { Button } from "@/components/ui/button";

const InternalUsersPage: React.FC = () => {
  const { users, loading, error, addUser, updateUser, deleteUser } = useInternalUsers();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    mot_de_passe: "",
    internalRole: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, form);
        setMessage("Employé mis à jour.");
      } else {
        await addUser(form);
        setMessage("Employé ajouté.");
      }
      setForm({ prenom: "", nom: "", email: "", mot_de_passe: "", internalRole: "" });
      setEditingId(null);
    } catch {
      setMessage("Erreur lors de l’enregistrement.");
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setForm({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      mot_de_passe: "",
      internalRole: user.internalRole,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Confirmer la suppression ?")) {
      await deleteUser(id);
      setMessage("Employé supprimé.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">👥 Gestion des employés Flotteq</h1>

      {message && <p className="mb-4 text-blue-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Chargement...</p>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input
          type="text"
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder="Nom"
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border p-2 rounded"
        />
        {!editingId && (
          <input
            type="password"
            name="mot_de_passe"
            value={form.mot_de_passe}
            onChange={handleChange}
            placeholder="Mot de passe"
            required
            className="border p-2 rounded"
          />
        )}
        <select
          name="internalRole"
          value={form.internalRole}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        >
          <option value="">Sélectionner un rôle</option>
          <option value="admin">Admin</option>
          <option value="support">Support</option>
          <option value="commercial">Commercial</option>
        </select>
        <div className="md:col-span-2">
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
            {editingId ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </form>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Rôle</th>
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.prenom} {u.nom}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.internalRole}</td>
              <td className="p-2 text-center">
                <button onClick={() => handleEdit(u)} className="text-blue-600 mr-4">Modifier</button>
                <button onClick={() => handleDelete(u.id)} className="text-red-600">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InternalUsersPage;

