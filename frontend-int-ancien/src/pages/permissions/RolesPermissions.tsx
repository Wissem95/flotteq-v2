// RolesPermissions.tsx - Gestion des rôles et permissions FlotteQ

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash2, Users, Shield, Key, MoreHorizontal, Eye, UserCheck, Settings, Building2, Copy, } from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { permissionsService, type EmployeePermission, type EmployeeRole } from '@/services/permissionsService';

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name: string;
  status: 'active' | 'inactive';
  last_login: string;
}

const RolesPermissions: React.FC = () => {
  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [permissions, setPermissions] = useState<EmployeePermission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<EmployeeRole | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as number[]
  });
  const [categories, setCategories] = useState<string[]>([]);

  // Mock users data since we don't have a user management system yet
  const mockUsers: User[] = [
    { id: 1, name: "John Doe", email: "john@flotteq.com", role_id: 1, role_name: "Super Administrateur", status: "active", last_login: "2024-07-28T10:30:00Z" },
    { id: 2, name: "Jane Smith", email: "jane@flotteq.com", role_id: 2, role_name: "Administrateur", status: "active", last_login: "2024-07-28T09:15:00Z" },
    { id: 3, name: "Mike Johnson", email: "mike@flotteq.com", role_id: 3, role_name: "Support Client", status: "active", last_login: "2024-07-28T11:45:00Z" },
    { id: 4, name: "Sarah Wilson", email: "sarah@flotteq.com", role_id: 4, role_name: "Gestionnaire Partenaires", status: "active", last_login: "2024-07-27T16:20:00Z" },
    { id: 5, name: "Tom Brown", email: "tom@flotteq.com", role_id: 5, role_name: "Analyste", status: "inactive", last_login: "2024-07-25T14:10:00Z" },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRoles(),
        loadPermissions(),
        loadCategories()
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement initial:", error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await permissionsService.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await permissionsService.getPermissions();
      setPermissions(response.data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoryList = await permissionsService.getPermissionCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const loadMockUsers = () => {
    setUsers(mockUsers);
  };

  const handleCreateRole = async () => {
    try {
      if (!newRole.name.trim()) {
        toast({
          title: 'Erreur',
          description: 'Le nom du rôle est obligatoire',
          variant: 'destructive',
        });
        return;
      }

      const roleData = {
        name: newRole.name.trim(),
        description: newRole.description.trim(),
        permissions: newRole.permissions,
        is_active: true,
      };
      
      if (editingRole) {
        await permissionsService.updateRole(editingRole.id, roleData);
        toast({
          title: 'Succès',
          description: 'Le rôle a été modifié avec succès',
        });
      } else {
        await permissionsService.createRole(roleData);
        toast({
          title: 'Succès',
          description: 'Le rôle a été créé avec succès',
        });
      }
      
      setShowCreateRoleModal(false);
      setEditingRole(null);
      setNewRole({ name: '', description: '', permissions: [] });
      loadRoles();
    } catch (error) {
      console.error("Erreur lors de la création/modification du rôle:", error);
      toast({
        title: 'Erreur',
        description: editingRole ? 'Impossible de modifier le rôle' : 'Impossible de créer le rôle',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (role.employees_count && role.employees_count > 0) {
      toast({
        title: 'Impossible de supprimer',
        description: 'Ce rôle est assigné à des employés',
        variant: 'destructive',
      });
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }
    
    try {
      await permissionsService.deleteRole(roleId);
      toast({
        title: 'Succès',
        description: 'Le rôle a été supprimé avec succès',
      });
      loadRoles();
    } catch (error) {
      console.error("Erreur lors de la suppression du rôle:", error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le rôle',
        variant: 'destructive',
      });
    }
  };

  const handleEditRole = (role: EmployeeRole) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions.map(p => parseInt(p)) || []
    });
    setShowCreateRoleModal(true);
  };

  const handleDuplicateRole = async (role: EmployeeRole) => {
    try {
      await permissionsService.duplicateRole(role.id, `${role.name} (Copie)`, `${role.code}_COPY`);
      toast({
        title: 'Succès',
        description: 'Le rôle a été dupliqué avec succès',
      });
      loadRoles();
    } catch (error) {
      console.error('Error duplicating role:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de dupliquer le rôle',
        variant: 'destructive',
      });
    }
  };

  const togglePermission = (permissionId: number) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRoleBadge = (role: EmployeeRole) => {
    if (role.level && role.level >= 9) {
      return <Badge variant="secondary">Système</Badge>;
    }
    return <Badge variant="outline">Personnalisé</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge variant="secondary">Inactif</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, EmployeePermission[]>);

  useEffect(() => {
    loadMockUsers();
  }, [roles]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rôles et Permissions</h1>
          <p className="text-gray-600">Gestion des accès et autorisations de la plateforme FlotteQ</p>
        </div>
        <Dialog open={showCreateRoleModal} onOpenChange={setShowCreateRoleModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Créer un rôle
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Rôles ({roles.length})</TabsTrigger>
          <TabsTrigger value="permissions">Permissions ({permissions.length})</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs ({users.length})</TabsTrigger>
        </TabsList>

        {/* Rôles */}
        <TabsContent value="roles">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading || rolesLoading ? (
              <div className="col-span-full flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRole(role)} className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateRole(role)} className="flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            Dupliquer
                          </DropdownMenuItem>
                          {(!role.level || role.level < 9) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRole(role.id)}
                                className="flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      {getRoleBadge(role)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Employés</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{role.employees_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Permissions</span>
                      <div className="flex items-center gap-1">
                        <Key className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{role.permissions?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Créé le {formatDate(role.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions">
          <div className="space-y-6">
            {permissionsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {category}
                  </CardTitle>
                  <CardDescription>
                    {categoryPermissions.length} permission(s) dans cette catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-5 h-5 mt-0.5">
                          {permission.is_dangerous ? (
                            <Shield className="w-4 h-4 text-red-500" />
                          ) : (
                            <Key className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {permission.name}
                            {permission.is_dangerous && (
                              <Badge variant="destructive" className="text-xs">Sensible</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{permission.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {permission.code}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Utilisateurs */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Attribution des rôles</CardTitle>
              <CardDescription>Gestion des rôles assignés aux utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière connexion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role_name}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.last_login).toLocaleString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4" />
                              Changer le rôle
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Voir permissions
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de création de rôle */}
      <Dialog open={showCreateRoleModal} onOpenChange={setShowCreateRoleModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}</DialogTitle>
            <DialogDescription>
              Configurez les permissions pour ce rôle
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="role_name">Nom du rôle</Label>
                <Input
                  id="role_name"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Gestionnaire Marketing"
                />
              </div>
              
              <div>
                <Label htmlFor="role_description">Description</Label>
                <Textarea
                  id="role_description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du rôle et de ses responsabilités"
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <Label className="text-base font-medium">Permissions</Label>
              <p className="text-sm text-gray-600 mb-4">
                Sélectionnez les permissions à accorder à ce rôle
              </p>
              
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4" />
                      <h4 className="font-medium">{category}</h4>
                      <Badge variant="outline" className="ml-auto">
                        {categoryPermissions.filter(p => newRole.permissions.includes(p.id)).length} / {categoryPermissions.length}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-2">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id.toString()}
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <Label htmlFor={permission.id.toString()} className="text-sm flex items-center gap-2">
                            {permission.name}
                            {permission.is_dangerous && (
                              <Badge variant="destructive" className="text-xs">Sensible</Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateRoleModal(false);
              setEditingRole(null);
              setNewRole({ name: '', description: '', permissions: [] });
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateRole}
              disabled={!newRole.name || newRole.permissions.length === 0}
            >
              {editingRole ? 'Modifier le rôle' : 'Créer le rôle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesPermissions; 