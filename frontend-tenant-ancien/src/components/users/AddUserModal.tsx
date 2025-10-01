// ==============================
// 📁 Fichier : src/components/users/AddUserModal.tsx
// ==============================

import React, { useState } from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<Props> = ({ onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await api.post("/users", formData);
      onUserAdded();
      onClose();
    } catch (error) {
      console.error("❌ Erreur ajout utilisateur :", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un utilisateur</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Prénom</Label>
            <Input name="first_name" value={formData.first_name} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Nom</Label>
            <Input name="last_name" value={formData.last_name} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Nom d'utilisateur</Label>
            <Input name="username" value={formData.username} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Mot de passe</Label>
            <Input type="password" name="password" value={formData.password} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Rôle</Label>
            <select name="role" value={formData.role} onChange={handleChange} className="border rounded px-2 py-1">
              <option value="user">Utilisateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <Button onClick={handleSubmit}>Ajouter</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;

