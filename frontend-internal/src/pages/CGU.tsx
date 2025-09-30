// 📁 clients/src/pages/CGU.tsx
import React from "react";
import Layout from "@/components/layout/Layout";

const CGU: React.FC = () => (
  <Layout>
    <div className="prose prose-sm lg:prose-base">
      <h1>Conditions Générales d’Utilisation (CGU)</h1>

      <p>Date de dernière mise à jour : 10 mai 2025</p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales d’Utilisation (CGU) définissent les droits et obligations de
        toute personne accédant et utilisant la plateforme Flotteq, accessible à l’adresse
        <a href="https://flotteq.fr">https://flotteq.fr</a> et à ses sous-domaines, incluant l’interface
        web de gestion de flotte automobile.
      </p>

      <h2>2. Acceptation</h2>
      <p>
        En créant un compte ou en naviguant sur Flotteq, vous acceptez sans réserve l’intégralité des
        présentes CGU. Si vous n’y consentez pas, vous devez immédiatement cesser d’utiliser notre service.
      </p>

      <h2>3. Définitions</h2>
      <ul>
        <li><strong>Utilisateur</strong> : toute personne physique ou morale accédant à la plateforme.</li>
        <li><strong>Compte</strong> : espace personnel sécurisé de l’Utilisateur, accessible après
          authentification.</li>
        <li><strong>Contenu</strong> : données, textes, images, documents et informations publiés ou
          téléchargés sur la plateforme.</li>
      </ul>

      <h2>4. Inscription et accès</h2>
      <p>
        L’Utilisateur peut s’inscrire en fournissant son adresse e-mail, un nom d’utilisateur et un
        mot de passe, ou via Google SSO. Il est seul responsable de la confidentialité de ses identifiants.
        Flotteq ne saurait être tenu responsable en cas d’utilisation non autorisée de son Compte.
      </p>

      <h2>5. Services proposés</h2>
      <p>Flotteq permet notamment :</p>
      <ul>
        <li>La création et la gestion de fiches véhicule (entretien, contrôles techniques, réparations, factures).</li>
        <li>Le suivi des entretiens périodiques et des échéances réglementaires.</li>
        <li>L’export de rapports et statistiques de flotte.</li>
        <li>La gestion multi-utilisateurs avec droits d’accès différenciés.</li>
      </ul>

      <h2>6. Obligations de l’Utilisateur</h2>
      <ul>
        <li>Fournir des informations exactes lors de l’inscription et leur mise à jour régulière.</li>
        <li>Ne pas porter atteinte aux droits de tiers ou diffuser de contenu illicite.</li>
        <li>Respecter la législation applicable en matière de données personnelles et de propriété intellectuelle.</li>
        <li>Ne pas tenter de contourner les mesures de sécurité ou d’accès.</li>
      </ul>

      <h2>7. Propriété intellectuelle</h2>
      <p>
        Tous les éléments de Flotteq (textes, logos, marques, bases de données, code source) sont
        protégés par le droit d’auteur et restent la propriété exclusive de Flotteq ou de ses partenaires.
        Toute reproduction ou représentation totale ou partielle est interdite sans autorisation écrite.
      </p>

      <h2>8. Données personnelles</h2>
      <p>
        Flotteq collecte et traite les données personnelles de ses Utilisateurs conformément à sa
        <a href="/privacy">Politique de Confidentialité</a>. Vous disposez d’un droit d’accès, de rectification,
        d’effacement et de portabilité de vos données. Pour l’exercer, contactez-nous à
        <a href="mailto:privacy@flotteq.fr">privacy@flotteq.fr</a>.
      </p>

      <h2>9. Tarification et paiements</h2>
      <p>
        Certains services peuvent être payants selon l’offre souscrite. Les tarifs en vigueur sont
        indiqués sur la page <a href="/pricing">Tarifs</a>. Les paiements sont sécurisés et récurrents
        (paiement mensuel ou annuel) via Stripe.
      </p>

      <h2>10. Responsabilité</h2>
      <p>
        Flotteq s’engage à assurer la disponibilité et la sécurité de la plateforme, hors cas de force
        majeure ou maintenance planifiée. En aucun cas Flotteq ne pourra être tenu responsable des
        dommages indirects (perte de données, préjudice commercial) consécutifs à l’utilisation du service.
      </p>

      <h2>11. Suspension et résiliation</h2>
      <p>
        Flotteq se réserve la possibilité de suspendre ou fermer immédiatement le Compte d’un
        Utilisateur en cas de manquement grave aux présentes CGU, sans préavis ni indemnité.
      </p>

      <h2>12. Évolution des CGU</h2>
      <p>
        Flotteq peut à tout moment modifier ces CGU. Les nouvelles versions seront publiées avec
        date de mise à jour. En continuant à utiliser le service, vous acceptez les CGU modifiées.
      </p>

      <h2>13. Loi applicable et juridiction</h2>
      <p>
        Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation
        ou exécution sera soumis aux tribunaux compétents de Paris.
      </p>

      <h2>14. Contact</h2>
      <p>
        Pour toute question ou réclamation, vous pouvez nous écrire à :
        <a href="mailto:support@flotteq.fr">support@flotteq.fr</a> ou par courrier postal à :
        <br />
        Flotteq SAS<br />
        123 rue de la Mobilité<br />
        75010 Paris<br />
        France
      </p>
    </div>
  </Layout>
);

export default CGU;
