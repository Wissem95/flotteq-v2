import { Link } from 'react-router-dom';
import { PortalGrid, PORTAL_DEFS, type PortalCard } from '../components/PortalGrid';

const CARDS: PortalCard[] = [
  { ...PORTAL_DEFS.client, href: 'https://app.flotteq.fr/register' },
  { ...PORTAL_DEFS.partner, href: 'https://partner.flotteq.fr/register' },
  {
    ...PORTAL_DEFS.driver,
    description: 'Les conducteurs sont invités par leur entreprise.',
    href: 'https://driver.flotteq.fr/register',
  },
];

export default function RegisterPortalPage() {
  return (
    <PortalGrid
      title="Rejoindre FlotteQ"
      subtitle="Choisissez le type de compte que vous souhaitez créer."
      cards={CARDS}
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-flotteq-blue hover:text-flotteq-navy underline-offset-2 hover:underline">
            Se connecter
          </Link>
        </>
      }
    />
  );
}
