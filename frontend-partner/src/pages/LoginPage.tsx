import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import axiosInstance from '../lib/axios';
import { API_CONFIG } from '../config/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.PARTNER_LOGIN, {
        email,
        password,
      });

      const { accessToken, partnerUser, partner } = response.data;

      // Check partner status before logging in
      if (partner.status === 'pending') {
        setError('Votre compte est en attente de validation. Vous recevrez un email dès qu\'il sera approuvé.');
        navigate('/pending-approval');
        return;
      }

      if (partner.status === 'rejected') {
        setError('Votre demande de partenariat a été refusée. Contactez le support pour plus d\'informations.');
        return;
      }

      if (partner.status === 'suspended') {
        setError('Votre compte a été suspendu. Contactez le support pour plus d\'informations.');
        return;
      }

      if (partner.status !== 'approved') {
        setError('Votre compte n\'est pas actif. Contactez le support.');
        return;
      }

      // Only login and redirect if status is approved
      login(accessToken, { ...partnerUser, partner });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            FlotteQ Partner
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous à votre espace partenaire
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue sm:text-sm"
              placeholder="Email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-flotteq-blue focus:border-flotteq-blue sm:text-sm"
              placeholder="Mot de passe"
            />
          </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-flotteq-blue hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue disabled:opacity-50"
            >
              <LogIn className="h-5 w-5 mr-2" />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">Pas encore partenaire ?</span>{' '}
            <Link
              to="/register"
              className="text-sm font-medium text-flotteq-blue hover:text-flotteq-navy"
            >
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
