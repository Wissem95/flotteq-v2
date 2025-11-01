import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersService } from '../../api/services/users.service';
import { UserRole } from '../../types/user.types';
import type { InviteUserDto } from '../../types/user.types';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<InviteUserDto>({
    email: '',
    role: UserRole.DRIVER,
  });
  const [invitationLink, setInvitationLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: usersService.invite,
    onSuccess: (data) => {
      setInvitationLink(data.invitationLink);
      setError('');
      toast.success(`Invitation envoyée à ${formData.email}`);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Erreur lors de la génération du lien';
      setError(message);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInvitationLink('');
    mutation.mutate(formData);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('Lien copié dans le presse-papier');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Erreur lors de la copie');
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: UserRole.DRIVER });
    setInvitationLink('');
    setError('');
    setCopied(false);
    onClose();
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.SUPPORT]: 'Support',
      [UserRole.TENANT_ADMIN]: 'Admin',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.DRIVER]: 'Conducteur',
      [UserRole.VIEWER]: 'Lecteur',
    };
    return labels[role] || role;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Inviter un utilisateur</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!invitationLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="nouveau@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                L'utilisateur recevra un lien pour créer son compte
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={UserRole.MANAGER}>{getRoleLabel(UserRole.MANAGER)}</option>
                <option value={UserRole.DRIVER}>{getRoleLabel(UserRole.DRIVER)}</option>
                <option value={UserRole.VIEWER}>{getRoleLabel(UserRole.VIEWER)}</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={mutation.isPending}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {mutation.isPending ? 'Génération...' : 'Générer le lien'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Lien d'invitation généré avec succès !</p>
                <p className="text-sm mt-1">
                  Partagez ce lien avec <strong>{formData.email}</strong>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien d'invitation (valide 48h)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationLink}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Le lien expirera dans 48 heures. L'utilisateur devra créer
                son mot de passe lors de sa première connexion.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
