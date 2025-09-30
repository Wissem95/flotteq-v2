// 📁 frontend/internal/src/pages/admin/AdminPermissionsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

export default function AdminPermissionsPage() {
  const [users, setUsers] = useState([]);
  const [permsByDomain, setPermsByDomain] = useState({});
  const [editingUserId, setEditingUserId] = useState(null);
  const [userPerms, setUserPerms] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [loadingUserPerms, setLoadingUserPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  // Chargement initial des users et des perms globales
  useEffect(() => {
    // Récupère la liste des utilisateurs
    fetch("/admin/users", { headers: { "Content-Type": "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error("Échec chargement utilisateurs");
        return res.json();
      })
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de charger la liste des utilisateurs");
      })
      .finally(() => setLoadingUsers(false));

    // Récupère la liste de toutes les permissions et les groupe par domaine
    fetch("/admin/permissions", { headers: { "Content-Type": "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error("Échec chargement permissions");
        return res.json();
      })
      .then((all) => {
        const grouped = all.reduce((acc, perm) => {
          const [domain] = perm.key.split(".");
          if (!acc[domain]) acc[domain] = [];
          acc[domain].push(perm);
          return acc;
        }, {});
        setPermsByDomain(grouped);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de charger les permissions globales");
      })
      .finally(() => setLoadingPerms(false));
  }, []);

  // Ouvre le modal, charge les perms de l'utilisateur
  const openModal = async (user) => {
    setEditingUserId(user.id);
    setLoadingUserPerms(true);
    try {
      const res = await fetch(`/admin/users/${user.id}/permissions`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Échec chargement perms user");
      const data = await res.json();
      setUserPerms(data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger ses permissions");
      setEditingUserId(null);
    } finally {
      setLoadingUserPerms(false);
    }
  };

  const closeModal = () => {
    setEditingUserId(null);
    setUserPerms([]);
  };

  // Bascule une permission dans le state local
  const togglePerm = (key) => {
    setUserPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Enregistre les modifications
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/admin/users/${editingUserId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: userPerms }),
      });
      if (!res.ok) throw new Error("Échec mise à jour");
      toast.success("Permissions mises à jour !");
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loadingUsers || loadingPerms) {
    return <p>Chargement de la page en cours…</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gérer les autorisations</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.prenom} {u.nom}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Dialog
                  open={editingUserId === u.id}
                  onOpenChange={(open) => {
                    if (open) openModal(u);
                    else closeModal();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">Gérer</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[400px]">
                    <h2 className="text-lg font-semibold mb-2">
                      Droits de {u.prenom} {u.nom}
                    </h2>

                    {loadingUserPerms ? (
                      <p>Chargement des permissions…</p>
                    ) : (
                      <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                        {Object.entries(permsByDomain).map(([domain, perms]) => (
                          <fieldset key={domain}>
                            <legend className="font-medium mb-2">{domain}</legend>
                            {perms.map((perm) => (
                              <div key={perm.key} className="flex items-center mb-1">
                                <Checkbox
                                  checked={userPerms.includes(perm.key)}
                                  onCheckedChange={() => togglePerm(perm.key)}
                                />
                                <span className="ml-2">{perm.key}</span>
                              </div>
                            ))}
                          </fieldset>
                        ))}
                      </div>
                    )}
                    <Button onClick={save} disabled={saving || loadingUserPerms}>
                      {saving ? "Enregistrement…" : "Enregistrer"}
                    </Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

