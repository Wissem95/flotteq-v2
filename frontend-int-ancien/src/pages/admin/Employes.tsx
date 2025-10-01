// 📁 frontend/internal/src/pages/admin/Employes.tsx

import React, { useEffect, useState } from "react";
import axios from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Employe {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  username: string;
  roleInterne: string;
  actif?: boolean;
}

const AdminEmployes: React.FC = () => {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [form, setForm] = useState<Partial<Employe> & { mot_de_passe?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const fetchEmployes = async () => {
    try {
      const res = await axios.get("/admin/employes");
      setEmployes(res.data);
    } catch (err) {
      setMessage("❌ Erreur de chargement");
    }
  };

  useEffect(() => {
    fetchEmployes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`/admin/employes/${editingId}`, form);
        setMessage("✅ Employé modifié");
      } else {
        await axios.post("/admin/employes", form);
        setMessage("✅ Employé ajouté");
      }
      setForm({});
      setEditingId(null);
      fetchEmployes();
    } catch (err) {
      setMessage("❌ Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = (e: Employe) => {
    setEditingId(e.id);
    setForm({ ...e });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer cet employé ?")) return;
    try {
      await axios.delete(`/admin/employes/${id}`);
      setMessage("✅ Employé supprimé");
      fetchEmployes();
    } catch {
      setMessage("❌ Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👥 Gestion des employés Flotteq</h1>
      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Input name="prenom" placeholder="Prénom" value={form.prenom || ""} onChange={handleChange} />
        <Input name="nom" placeholder="Nom" value={form.nom || ""} onChange={handleChange} />
        <Input name="email" placeholder="Email" value={form.email || ""} onChange={handleChange} />
        <Input name="username" placeholder="Identifiant" value={form.username || ""} onChange={handleChange} />
        <Input name="mot_de_passe" placeholder="Mot de passe" type="password" value={form.mot_de_passe || ""} onChange={handleChange} />
        <Input name="roleInterne" placeholder="Rôle interne (admin, support...)" value={form.roleInterne || ""} onChange={handleChange} />
      </div>

      <Button onClick={handleSubmit}>{editingId ? "Mettre à jour" : "Ajouter"}</Button>

      <hr className="my-6" />

      <table className="w-full text-sm border mt-6">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Identifiant</th>
            <th className="p-2 border">Rôle</th>
            <th className="p-2 border text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {employes.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-2">{e.prenom} {e.nom}</td>
              <td className="p-2">{e.email}</td>
              <td className="p-2">{e.username}</td>
              <td className="p-2">{e.roleInterne}</td>
              <td className="p-2 text-center">
                <button className="text-blue-600 mr-2 hover:underline" onClick={() => handleEdit(e)}>Modifier</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(e.id)}>Supprimer</button>
              </td>
            </tr>
          ))}
          {employes.length === 0 && (
            <tr><td colSpan={5} className="text-center p-4">Aucun employé trouvé.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminEmployes;

