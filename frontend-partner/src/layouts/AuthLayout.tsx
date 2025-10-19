import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FlotteQ</h1>
          <p className="text-primary-100">Espace Partenaire</p>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Outlet />
        </div>
        <p className="text-center text-primary-100 text-sm mt-6">
          © 2025 FlotteQ. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
