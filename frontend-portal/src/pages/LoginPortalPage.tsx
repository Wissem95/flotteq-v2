import { Link } from 'react-router-dom';
import { PortalGrid, PORTAL_DEFS, type PortalCard } from '../components/PortalGrid';

const CARDS: PortalCard[] = [
  { ...PORTAL_DEFS.client, href: 'https://app.flotteq.fr/login' },
  { ...PORTAL_DEFS.partner, href: 'https://partner.flotteq.fr/login' },
  { ...PORTAL_DEFS.driver, href: 'https://driver.flotteq.fr/login' },
  { ...PORTAL_DEFS.admin, href: 'https://admin.flotteq.fr/login' },
];

export default function LoginPortalPage() {
  return (
    <PortalGrid
      title="Bon retour parmi nous"
      subtitle="Sélectionnez l'espace correspondant à votre profil pour vous connecter."
      cards={CARDS}
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-flotteq-blue hover:text-flotteq-navy underline-offset-2 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    />
  );
}
