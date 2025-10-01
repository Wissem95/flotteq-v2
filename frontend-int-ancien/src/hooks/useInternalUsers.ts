import { useState, useEffect } from "react";
import axios from "@/lib/api";

export interface InternalUser {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  internalRole: string;
  createdAt: string;
}

export const useInternalUsers = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/employes");
      setUsers(res.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des employés internes :", err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (data: Partial<InternalUser> & { mot_de_passe: string }) => {
    const res = await axios.post("/api/admin/employes", data);
    await fetchUsers();
    return res.data;
  };

  const updateUser = async (id: number, data: Partial<InternalUser>) => {
    await axios.put(`/api/admin/employes/${id}`, data);
    await fetchUsers();
  };

  const deleteUser = async (id: number) => {
    await axios.delete(`/api/admin/employes/${id}`);
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, addUser, updateUser, deleteUser };
};

