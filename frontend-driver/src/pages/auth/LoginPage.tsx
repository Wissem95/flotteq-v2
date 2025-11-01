import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password }, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900">
            FlotteQ Driver
          </h2>
          <p className="mt-2 text-center text-base text-gray-600">
            Connectez-vous à votre compte chauffeur
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border-2 border-red-200">
              <p className="text-base font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base"
                placeholder="Email"
                style={{ minHeight: '48px' }}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-flotteq-blue focus:border-flotteq-blue text-base"
                placeholder="Mot de passe"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 text-flotteq-blue focus:ring-flotteq-blue border-gray-300 rounded cursor-pointer"
                style={{ minWidth: '20px', minHeight: '20px' }}
              />
              <label htmlFor="remember-me" className="ml-2 block text-base text-gray-900 cursor-pointer">
                Se souvenir de moi
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-base font-medium text-flotteq-blue hover:text-flotteq-navy"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-flotteq-blue hover:bg-flotteq-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-flotteq-blue disabled:opacity-50 transition-colors"
              style={{ minHeight: '48px' }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
