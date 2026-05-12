import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-flotteq-navy via-flotteq-blue to-flotteq-teal py-8 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FlotteQ</h1>
          <p className="text-white/85">Espace Partenaire</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
        <p className="text-center text-white/85 text-sm mt-6">
          © 2025 FlotteQ. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
