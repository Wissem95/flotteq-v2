import { Link } from 'react-router-dom';
import { Clock, Mail, Phone, CheckCircle } from 'lucide-react';
import { PARTNER_SUPPORT } from '../config/constants';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compte en attente de validation
          </h1>
          <p className="text-gray-600">
            Votre demande d'inscription a bien été reçue
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Inscription complétée</p>
                <p className="text-sm text-gray-500">Vos informations ont été enregistrées</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Validation en cours</p>
                <p className="text-sm text-gray-500">
                  Notre équipe examine votre dossier
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-400">Activation du compte</p>
                <p className="text-sm text-gray-400">
                  Vous recevrez un email de confirmation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Délai de validation :</strong> {PARTNER_SUPPORT.APPROVAL_DELAY}
          </p>
          <p className="text-sm text-blue-700">
            Vous recevrez un email dès que votre compte sera approuvé.
            Vous pourrez alors accéder à votre espace partenaire.
          </p>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Besoin d'aide ?</h2>
          <div className="space-y-3">
            <a
              href={`mailto:${PARTNER_SUPPORT.EMAIL}`}
              className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{PARTNER_SUPPORT.EMAIL}</span>
            </a>
            <a
              href={`tel:${PARTNER_SUPPORT.PHONE.replace(/\s/g, '')}`}
              className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{PARTNER_SUPPORT.PHONE}</span>
            </a>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
