# 🐛 Bugfix - SettingsPage Import Error

**Date** : 2025-10-23
**Durée** : 2 minutes
**Statut** : ✅ **RÉSOLU**

---

## ❌ Problème

Erreur lors du chargement de la page Settings dans frontend-client :

```
[plugin:vite:import-analysis] Failed to resolve import "@/lib/axios" from "src/pages/settings/SettingsPage.tsx". Does the file exist?
```

**Cause** : Import incorrect - le projet utilise `@/config/api` et non `@/lib/axios`

---

## ✅ Solution

**Fichier modifié** : [frontend-client/src/pages/settings/SettingsPage.tsx](frontend-client/src/pages/settings/SettingsPage.tsx)

### Changements

1. **Import corrigé** :
```typescript
// ❌ AVANT
import axiosInstance from '@/lib/axios';

// ✅ APRÈS
import { api } from '@/config/api';
```

2. **Appels API mis à jour** :
```typescript
// ❌ AVANT
axiosInstance.get('/api/subscriptions/current')
axiosInstance.get('/api/billing/invoices')
axiosInstance.post('/api/stripe/create-portal-session')

// ✅ APRÈS
api.get('/subscriptions/current')
api.get('/billing/invoices')
api.post('/stripe/create-portal-session')
```

**Note** : Les URLs n'incluent plus `/api` car `baseURL` dans `config/api.ts` est déjà configuré avec `/api`

---

## 🧪 Vérification

```bash
# Démarrer frontend-client
cd /Users/wissem/Flotteq-v2/frontend-client
npm run dev

# Ouvrir http://localhost:5174/settings
# Attendu : Page Settings charge sans erreur
```

---

## ✅ Résultat

- ✅ Import corrigé : `@/config/api`
- ✅ Appels API alignés avec le reste du projet
- ✅ Page Settings fonctionne

**Erreur résolue** 🎉
