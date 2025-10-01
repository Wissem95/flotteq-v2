// ==============================
// 📁 Fichier : src/components/users/AddUserModal.tsx
// ==============================

import React, { useState } from "react";
import axios from "@/lib/api";
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
    mot_de_passe: "",
    prenom: "",
    nom: "",
    role: "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/users", formData);
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
            <Input name="prenom" value={formData.prenom} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Nom</Label>
            <Input name="nom" value={formData.nom} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Nom d’utilisateur</Label>
            <Input name="username" value={formData.username} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Mot de passe</Label>
            <Input type="password" name="mot_de_passe" value={formData.mot_de_passe} onChange={handleChange} />
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

