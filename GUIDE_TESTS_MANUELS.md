# 🧪 Guide Tests Manuels - Stripe Integration

**Status** : ✅ Backend + Frontends lancés
**Base de données** : ✅ Prête (2 partners, 6 bookings, 1 service)

---

## ✅ Test 1 : Onboarding Partner (FACILE)

### Prérequis
- ✅ Backend lancé (port 3000)
- ✅ Frontend Partner lancé (port 5175)

### Étapes

1. **Ouvrir** http://localhost:5175/login
2. **Se connecter** avec un compte partner
3. **Aller dans Settings** (menu latéral)
4. **Vérifier l'affichage** :
   - ✅ Si "Paiements activés" (badge vert) → Partner déjà configuré
   - ⚠️ Si "Configuration incomplète" → Cliquer "Continuer la configuration"
   - 📝 Si "Connecter mon compte bancaire" → Cliquer pour commencer

5. **Compléter le formulaire Stripe** :
   - Pays : France
   - Email : email du partner
   - IBAN test : `FR14 2004 1010 0505 0001 3M02 606`
   - Accepter les CGU

6. **Vérifier le retour** :
   - URL : `/settings?stripe=success`
   - Toast : "Configuration Stripe terminée avec succès !"
   - Badge : "Paiements activés" (vert)
   - Message : "Vous recevrez automatiquement 90%..."

### Vérification DB
```bash
node -e "
const { execSync } = require('child_process');
const result = execSync(\"psql -h localhost -p 5432 -U postgres -d flotteq_dev -c \\\"SELECT company_name, stripe_account_id, stripe_onboarding_completed FROM partners\\\"\", {
  env: { ...process.env, PGPASSWORD: 'flotteq123' },
  encoding: 'utf-8'
});
console.log(result);
"
```

**Attendu** : `stripe_onboarding_completed = t` (true)

---

## ✅ Test 2 : Menu Settings Client (FACILE)

### Prérequis
- ✅ Backend lancé (port 3000)
- ✅ Frontend Client lancé (port 5174)

### Étapes

1. **Ouvrir** http://localhost:5174/login
2. **Se connecter** avec un compte tenant (ex: `3ws@3ws.com`)
3. **Vérifier le menu** :
   - ✅ Item "Paramètres" visible (icône Settings ⚙️)
   - Position : Après "Facturation"

4. **Cliquer sur Paramètres**
5. **Vérifier la page** :
   - ✅ 2 onglets : "Mon compte" et "Abonnement"
   - ✅ Onglet "Mon compte" :
     - Prénom, Nom, Email, Rôle
     - Nom entreprise, Email entreprise
   - ✅ Onglet "Abonnement" :
     - Plan actuel (nom, prix, statut)
     - Limites (véhicules/users/drivers max)
     - Bouton "Gérer l'abonnement"
     - Liste des factures (si disponibles)

### Screenshot attendu
```
┌─────────────────────────────────────┐
│ Paramètres                          │
├─────────────────────────────────────┤
│ [Mon compte] [Abonnement]           │
├─────────────────────────────────────┤
│ Prénom: Wissem                      │
│ Nom: Admin                          │
│ Email: wissem@flotteq.com          │
│ Rôle: Administrateur                │
└─────────────────────────────────────┘
```

---



