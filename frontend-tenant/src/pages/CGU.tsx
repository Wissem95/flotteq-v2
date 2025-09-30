// 📁 clients/src/pages/CGU.tsx
import React from "react";
import Layout from "@/components/layout/Layout";

const CGU: React.FC = () => (
  <Layout>
    <div className="prose prose-sm lg:prose-base">
      <h1>Conditions Generales d'Utilisation (CGU)</h1>

      <p>Date de derniere mise a jour : 10 mai 2025</p>

      <h2>1. Objet</h2>
      <p>
        Les presentes Conditions Generales d'Utilisation (CGU) definissent les droits et obligations de
        toute personne accedant et utilisant la plateforme Flotteq, accessible a l'adresse
        <a href="https://flotteq.fr">https://flotteq.fr</a> et a ses sous-domaines, incluant l'interface
        web de gestion de flotte automobile.
      </p>

      <h2>2. Acceptation</h2>
      <p>
        En creant un compte ou en naviguant sur Flotteq, vous acceptez sans reserve l'integralite des
        presentes CGU. Si vous n'y consentez pas, vous devez immediatement cesser d'utiliser notre service.
      </p>

      <h2>3. Definitions</h2>
      <ul>
        <li><strong>Utilisateur</strong> : toute personne physique ou morale accedant a la plateforme.</li>
        <li><strong>Compte</strong> : espace personnel securise de l'Utilisateur, accessible apres
          authentification.</li>
        <li><strong>Contenu</strong> : donnees, textes, images, documents et informations publies ou
          telecharges sur la plateforme.</li>
      </ul>

      <h2>4. Inscription et acces</h2>
      <p>
        L'Utilisateur peut s'inscrire en fournissant son adresse e-mail, un nom d'utilisateur et un
        mot de passe, ou via Google SSO. Il est seul responsable de la confidentialite de ses identifiants.
        Flotteq ne saurait etre tenu responsable en cas d'utilisation non autorisee de son Compte.
      </p>

      <h2>5. Services proposes</h2>
      <p>Flotteq permet notamment :</p>
      <ul>
        <li>La creation et la gestion de fiches vehicule (entretien, controles techniques, reparations, factures).</li>
        <li>Le suivi des entretiens periodiques et des echeances reglementaires.</li>
        <li>L'export de rapports et statistiques de flotte.</li>
        <li>La gestion multi-utilisateurs avec droits d'acces differencies.</li>
      </ul>

      <h2>6. Obligations de l'Utilisateur</h2>
      <ul>
        <li>Fournir des informations exactes lors de l'inscription et leur mise a jour reguliere.</li>
        <li>Ne pas porter atteinte aux droits de tiers ou diffuser de contenu illicite.</li>
        <li>Respecter la legislation applicable en matiere de donnees personnelles et de propriete intellectuelle.</li>
        <li>Ne pas tenter de contourner les mesures de securite ou d'acces.</li>
      </ul>

      <h2>7. Propriete intellectuelle</h2>
      <p>
        Tous les elements de Flotteq (textes, logos, marques, bases de donnees, code source) sont
        proteges par le droit d'auteur et restent la propriete exclusive de Flotteq ou de ses partenaires.
        Toute reproduction ou representation totale ou partielle est interdite sans autorisation ecrite.
      </p>

      <h2>8. Donnees personnelles</h2>
      <p>
        Flotteq collecte et traite les donnees personnelles de ses Utilisateurs conformement a sa
        <a href="/privacy">Politique de Confidentialite</a>. Vous disposez d'un droit d'acces, de rectification,
        d'effacement et de portabilite de vos donnees. Pour l'exercer, contactez-nous a
        <a href="mailto:privacy@flotteq.fr">privacy@flotteq.fr</a>.
      </p>

      <h2>9. Tarification et paiements</h2>
      <p>
        Certains services peuvent etre payants selon l'offre souscrite. Les tarifs en vigueur sont
        indiques sur la page <a href="/pricing">Tarifs</a>. Les paiements sont securises et recurrents
        (paiement mensuel ou annuel) via Stripe.
      </p>

      <h2>10. Responsabilite</h2>
      <p>
        Flotteq s'engage a assurer la disponibilite et la securite de la plateforme, hors cas de force
        majeure ou maintenance planifiee. En aucun cas Flotteq ne pourra etre tenu responsable des
        dommages indirects (perte de donnees, prejudice commercial) consecutifs a l'utilisation du service.
      </p>

      <h2>11. Suspension et resiliation</h2>
      <p>
        Flotteq se reserve la possibilite de suspendre ou fermer immediatement le Compte d'un
        Utilisateur en cas de manquement grave aux presentes CGU, sans preavis ni indemnite.
      </p>

      <h2>12. Evolution des CGU</h2>
      <p>
        Flotteq peut a tout moment modifier ces CGU. Les nouvelles versions seront publiees avec
        date de mise a jour. En continuant a utiliser le service, vous acceptez les CGU modifiees.
      </p>

      <h2>13. Loi applicable et juridiction</h2>
      <p>
        Les presentes CGU sont regies par le droit francais. Tout litige relatif a leur interpretation
        ou execution sera soumis aux tribunaux competents de Paris.
      </p>

      <h2>14. Contact</h2>
      <p>
        Pour toute question ou reclamation, vous pouvez nous ecrire a :
        <a href="mailto:support@flotteq.fr">support@flotteq.fr</a> ou par courrier postal a :
        <br />
        Flotteq SAS<br />
        123 rue de la Mobilite<br />
        75010 Paris<br />
        France
      </p>
    </div>
  </Layout>
);

export default CGU;