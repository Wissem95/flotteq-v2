# Rotation du super administrateur

Cette procédure change uniquement le mot de passe d’un compte actif ayant le rôle `super_admin`. Elle invalide aussi son jeton de rafraîchissement et tout jeton de réinitialisation en attente. Un jeton d’accès déjà émis reste utilisable jusqu’à son expiration, configurée à 15 minutes par défaut.

## Préparation

1. Choisir un mot de passe unique d’au moins 12 caractères avec minuscule, majuscule, chiffre et caractère spécial.
2. Ne pas inscrire ce mot de passe dans Git, un ticket, un message ou l’historique du terminal.
3. Préparer une fenêtre d’au moins 15 minutes après la rotation. Le renouvellement est coupé immédiatement, mais les jetons d’accès déjà émis expirent selon `JWT_ACCESS_EXPIRES`.

## Exécution locale contrôlée

Depuis `backend/`, fournir les deux variables uniquement pour la durée de la commande :

```bash
SUPER_ADMIN_EMAIL="adresse-du-compte" \
SUPER_ADMIN_NEW_PASSWORD="secret-fourni-hors-git" \
npm run security:rotate-super-admin
```

Le script ne journalise jamais le nouveau mot de passe. Il confirme uniquement l’adresse du compte modifié.

## Production

Dans le conteneur backend déjà déployé, utiliser le fichier compilé `dist/security/rotate-super-admin-password.js` avec les variables éphémères équivalentes. Vérifier ensuite que l’ancien mot de passe est refusé, que le nouveau est accepté, que l’ancien jeton de rafraîchissement est refusé et qu’un ancien jeton d’accès ne fonctionne plus après son expiration.

Ne conserver le nouveau secret que dans le gestionnaire de mots de passe approuvé par BELPRE LOCATION.
