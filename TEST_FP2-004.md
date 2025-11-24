# 🧪 TEST FP2-004 - Module Planning

## 🌐 URLs de test

- **Frontend Partner**: http://localhost:5175
- **Backend API**: http://localhost:3000
- **Swagger Doc**: http://localhost:3000/api/docs
- **Page Planning**: http://localhost:5175/planning

## 🔑 Identifiants de test

```
Email    : Norautok@gmail.com
Password : Wissem2002.@
```

## ✅ Checklist de test

### Onglet 1 : Horaires d'ouverture

- [ ] Naviguer vers http://localhost:5175/planning
- [ ] Vérifier que l'onglet "Horaires d'ouverture" est actif par défaut
- [ ] **Test 1**: Définir horaires Lundi-Vendredi
  - Cocher les jours Lundi à Vendredi
  - Sélectionner 09:00 pour l'ouverture
  - Sélectionner 18:00 pour la fermeture
  - Sélectionner 30 minutes pour la durée des créneaux
- [ ] **Test 2**: Définir horaires Samedi
  - Cocher Samedi
  - Sélectionner 09:00 - 12:00, créneaux 30min
- [ ] Laisser Dimanche décoché (fermé)
- [ ] Cliquer sur "Enregistrer les horaires"
- [ ] **Vérification**: Toast de succès apparaît en haut à droite
- [ ] **Vérification**: Rafraîchir la page (F5)
- [ ] **Vérification**: Les horaires sont toujours là (persistés en DB)

### Onglet 2 : Jours fermés

- [ ] Cliquer sur l'onglet "Jours fermés"
- [ ] **Test 1**: Ajouter fermeture journée complète
  - Date: 25/12/2025
  - Raison: "Noël"
  - Cocher "Journée complète"
  - Cliquer "Ajouter"
  - Vérifier qu'une card apparaît dans la liste
- [ ] **Test 2**: Ajouter fermeture partielle
  - Date: Demain
  - Raison: "Rendez-vous médical"
  - Décocher "Journée complète"
  - Horaires: 14:00 → 16:00
  - Cliquer "Ajouter"
  - Vérifier l'affichage "14:00 - 16:00" dans la card
- [ ] **Test 3**: Supprimer une unavailability
  - Cliquer sur l'icône Poubelle (rouge)
  - Confirmer la suppression
  - Vérifier que la card disparaît
- [ ] **Test 4**: Validation date passée
  - Essayer de sélectionner une date passée
  - Vérifier le message d'erreur

### Onglet 3 : Services

- [ ] Cliquer sur l'onglet "Services"
- [ ] **Vérification**: La liste des services s'affiche (si des services existent)
- [ ] **Test 1**: Modifier un service
  - Cliquer sur l'icône Edit (crayon)
  - Modifier le prix (ex: 99.99)
  - Modifier la durée (ex: 90 minutes → affichage "1h30")
  - Cliquer "Enregistrer"
  - Vérifier le toast de succès
  - Vérifier l'affichage formaté (99.99 €, 1h30)
- [ ] **Test 2**: Désactiver un service
  - Cliquer sur l'icône PowerOff (rouge)
  - Vérifier que le service passe en gris
  - Vérifier le badge "Désactivé"
- [ ] **Test 3**: Réactiver un service
  - Cliquer sur l'icône Power (vert)
  - Vérifier que le service redevient normal
  - Badge "Désactivé" disparaît
- [ ] **Test 4**: Annuler édition
  - Entrer en mode édition
  - Modifier plusieurs champs
  - Cliquer "Annuler"
  - Vérifier que les modifications sont annulées

## 🐛 Tests d'erreurs

### Validation horaires
- [ ] Tenter de définir heure de fin AVANT heure de début (ex: 18:00 → 09:00)
- [ ] Vérifier le message d'erreur rouge sous le jour

### Validation dates
- [ ] Tenter d'ajouter une unavailability avec date passée
- [ ] Vérifier le message "La date doit être dans le futur"

### Validation horaires partiels
- [ ] Mode unavailability partiel
- [ ] Mettre heure de fin avant heure de début
- [ ] Vérifier le message d'erreur

## 🔍 Tests d'intégration

### Test workflow complet
1. [ ] Définir horaires hebdomadaires complets
2. [ ] Ajouter 2-3 jours fermés (férié + congés)
3. [ ] Modifier prix/durée de 2 services
4. [ ] Désactiver 1 service
5. [ ] Rafraîchir la page
6. [ ] **Vérification**: Toutes les données sont persistées

### Test persistance
- [ ] Effectuer plusieurs modifications
- [ ] Fermer l'onglet
- [ ] Rouvrir http://localhost:5175/planning
- [ ] Se reconnecter si nécessaire
- [ ] **Vérification**: Toutes les données sont là

## 📊 Tests de performance/UX

### Loading states
- [ ] Vérifier les skeletons de chargement au premier affichage
- [ ] Vérifier le texte "Enregistrement..." sur les boutons pendant l'envoi

### Responsive design
- [ ] Réduire la largeur du navigateur (mode mobile)
- [ ] Vérifier que les formulaires restent utilisables
- [ ] Vérifier que les tabs restent accessibles

### Toast notifications
- [ ] Vérifier l'apparition des toasts verts (succès)
- [ ] Vérifier l'apparition des toasts rouges (erreur)
- [ ] Vérifier que les toasts disparaissent après quelques secondes

## 🛠️ Tests techniques

### Backend API (avec Swagger)
- [ ] Ouvrir http://localhost:3000/api/docs
- [ ] Tester POST /api/availabilities/bulk
- [ ] Tester GET /api/availabilities/me
- [ ] Tester POST /api/availabilities/unavailability
- [ ] Tester GET /api/availabilities/unavailability/list
- [ ] Tester PATCH /api/partners/me/services/:id

### DevTools Console
- [ ] Ouvrir F12 (DevTools)
- [ ] Aller sur l'onglet Console
- [ ] **Vérification**: Pas d'erreurs rouges
- [ ] **Vérification**: Pas de warnings importants

### Network Tab
- [ ] Onglet Network dans DevTools
- [ ] Effectuer une action (ex: enregistrer horaires)
- [ ] **Vérification**: Status 200 ou 201
- [ ] **Vérification**: Payload correct dans Response

## ✅ Résultat attendu

Tous les tests doivent passer. Si un test échoue:
1. Noter le test qui échoue
2. Vérifier les logs dans la console (F12)
3. Vérifier les logs du backend (terminal)
4. Rapporter le bug avec les détails

## 📝 Notes

- Les tests peuvent être effectués dans n'importe quel ordre
- Certains tests nécessitent des données existantes (services)
- En cas de problème, vérifier que backend et frontend sont bien démarrés
- Token d'authentification valable 7 jours

## 🎯 Critères de succès

- [ ] ✅ Tous les onglets fonctionnent
- [ ] ✅ Aucune erreur dans la console
- [ ] ✅ Toast notifications apparaissent
- [ ] ✅ Données persistées en DB
- [ ] ✅ Responsive fonctionne
- [ ] ✅ Validations fonctionnent
- [ ] ✅ UI/UX fluide et agréable

---

**Date des tests**: _________________
**Testeur**: _________________
**Résultat global**: ☐ PASS  ☐ FAIL
**Commentaires**: _________________________________________________
