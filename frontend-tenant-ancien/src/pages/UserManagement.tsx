// UserManagement.tsx - Gestion des utilisateurs pour les admins de tenant
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { registerTenantUser } from "@/services/authService";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Edit, 
  Trash2, 
  Crown, 
  User,
  Search,
  Filter
} from "lucide-react";

interface TenantUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Form states for adding new user
  const [newUser, setNewUser] = useState({
    email: "",
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    password_confirmation: "",
    role: "user"
  });

  // Form states for invitation
  const [inviteData, setInviteData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "user",
    message: ""
  });

  // Fetch users from current tenant
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/users");
      const usersData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setUsers(usersData);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Create new user directly
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (newUser.password !== newUser.password_confirmation) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);
      
      // Utiliser registerTenantUser pour créer un utilisateur dans le tenant courant
      const response = await registerTenantUser({
        ...newUser,
        company_name: "", // Pas besoin pour un utilisateur
      });

      // Rafraîchir la liste
      await fetchUsers();
      
      // Reset form
      setNewUser({
        email: "",
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        password_confirmation: "",
        role: "user"
      });
      
      setIsAddUserDialogOpen(false);
      setSuccess("Utilisateur créé avec succès");
      
    } catch (err: any) {
      console.error("Error creating user:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erreur lors de la création de l'utilisateur";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send invitation (placeholder - nécessite implémentation backend)
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      setLoading(true);
      
      // TODO: Implémenter l'endpoint d'invitation
      await api.post("/invitations", inviteData);
      
      setInviteData({
        email: "",
        first_name: "",
        last_name: "",
        role: "user",
        message: ""
      });
      
      setIsInviteDialogOpen(false);
      setSuccess("Invitation envoyée avec succès");
      
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError("Fonction d'invitation non encore implémentée");
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }
    
    try {
      setError("");
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      setSuccess("Utilisateur supprimé avec succès");
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError("Erreur lors de la suppression de l'utilisateur");
    }
  };

  // Toggle user status
  const handleToggleUserStatus = async (userId: string) => {
    try {
      setError("");
      const response = await api.patch(`/users/${userId}/toggle-status`);
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: !user.is_active }
          : user
      ));
      setSuccess("Statut utilisateur modifié avec succès");
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      setError("Erreur lors de la modification du statut");
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les utilisateurs de votre entreprise
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Envoyer Invitation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Envoyer une Invitation</DialogTitle>
                  <DialogDescription>
                    Invitez quelqu'un à rejoindre votre équipe par email.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="invite_first_name">Prénom</Label>
                      <Input
                        id="invite_first_name"
                        value={inviteData.first_name}
                        onChange={(e) => setInviteData({...inviteData, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite_last_name">Nom</Label>
                      <Input
                        id="invite_last_name"
                        value={inviteData.last_name}
                        onChange={(e) => setInviteData({...inviteData, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="invite_email">Email</Label>
                    <Input
                      id="invite_email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite_role">Rôle</Label>
                    <select
                      id="invite_role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={inviteData.role}
                      onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="invite_message">Message personnalisé (optionnel)</Label>
                    <textarea
                      id="invite_message"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={inviteData.message}
                      onChange={(e) => setInviteData({...inviteData, message: e.target.value})}
                      placeholder="Un message d'accueil personnalisé..."
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Envoi..." : "Envoyer l'Invitation"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Ajouter Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un Nouvel Utilisateur</DialogTitle>
                  <DialogDescription>
                    Créez directement un compte utilisateur pour votre équipe.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input
                        id="first_name"
                        value={newUser.first_name}
                        onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom</Label>
                      <Input
                        id="last_name"
                        value={newUser.last_name}
                        onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <select
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Mot de passe temporaire</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password_confirmation">Confirmation</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        value={newUser.password_confirmation}
                        onChange={(e) => setNewUser({...newUser, password_confirmation: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Création..." : "Créer l'Utilisateur"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date d'ajout</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {user.role === 'admin' ? (
                            <Crown className="w-5 h-5 text-blue-600" />
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-900">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Commencez par ajouter des utilisateurs à votre équipe.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

