import { useAuthStore } from '../stores/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du compte</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Entreprise</label>
            <p className="mt-1 text-sm text-gray-900">{user?.companyName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user?.status === 'approved' ? 'bg-green-100 text-green-800' :
              user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {user?.status === 'approved' ? 'Approuvé' :
               user?.status === 'pending' ? 'En attente' :
               user?.status === 'rejected' ? 'Rejeté' : 'Suspendu'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services proposés</h2>
        <p className="text-gray-500 text-center py-4">Gestion des services (à implémenter)</p>
      </div>
    </div>
  );
}
