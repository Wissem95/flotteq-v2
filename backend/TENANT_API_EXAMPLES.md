# API Tenants - Exemples d'utilisation

Guide pratique pour utiliser les endpoints de gestion des tenants dans FlotteQ.

---

## 🔑 Authentification

Tous les endpoints nécessitent un token JWT valide.

**Obtenir un token :**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@flotteq.com",
    "password": "votre_mot_de_passe"
  }'
```

**Réponse :**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Utilisez ce token dans le header `Authorization: Bearer <token>` pour tous les appels suivants.

---

## 📝 Exemples d'utilisation

### 1. Créer un nouveau tenant

```bash
curl -X POST http://localhost:8000/tenants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Transport Express",
    "email": "contact@transport-express.com",
    "phone": "+33 1 23 45 67 89",
    "address": "10 Rue de la Logistique",
    "city": "Lyon",
    "postalCode": "69001",
    "country": "France"
  }'
```

**Réponse (201 Created) :**
```json
{
  "id": 2,
  "name": "Transport Express",
  "email": "contact@transport-express.com",
  "phone": "+33 1 23 45 67 89",
  "address": "10 Rue de la Logistique",
  "city": "Lyon",
  "postalCode": "69001",
  "country": "France",
  "status": "trial",
  "subscriptionId": null,
  "trialEndsAt": "2025-10-14T00:00:00.000Z",
  "createdAt": "2025-09-30T17:00:00.000Z",
  "updatedAt": "2025-09-30T17:00:00.000Z"
}
```

**Erreurs possibles :**
- **409 Conflict** : Un tenant avec cet email ou ce nom existe déjà
- **400 Bad Request** : Données invalides (email invalide, nom trop court, etc.)
- **401 Unauthorized** : Token JWT manquant ou invalide

---

### 2. Lister tous les tenants

```bash
curl http://localhost:8000/tenants \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse (200 OK) :**
```json
[
  {
    "id": 1,
    "name": "FlotteQ",
    "email": "contact@flotteq.com",
    "status": "active",
    "city": "Paris",
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-09-01T10:00:00.000Z",
    "users": [
      { "id": "uuid-1", "email": "admin@flotteq.com" },
      { "id": "uuid-2", "email": "user@flotteq.com" }
    ]
  },
  {
    "id": 2,
    "name": "Transport Express",
    "email": "contact@transport-express.com",
    "status": "trial",
    "city": "Lyon",
    "createdAt": "2025-09-30T17:00:00.000Z",
    "updatedAt": "2025-09-30T17:00:00.000Z",
    "users": []
  }
]
```

---

### 3. Obtenir les détails d'un tenant

```bash
curl http://localhost:8000/tenants/2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse (200 OK) :**
```json
{
  "id": 2,
  "name": "Transport Express",
  "email": "contact@transport-express.com",
  "phone": "+33 1 23 45 67 89",
  "address": "10 Rue de la Logistique",
  "city": "Lyon",
  "postalCode": "69001",
  "country": "France",
  "status": "trial",
  "subscriptionId": null,
  "trialEndsAt": "2025-10-14T00:00:00.000Z",
  "createdAt": "2025-09-30T17:00:00.000Z",
  "updatedAt": "2025-09-30T17:00:00.000Z",
  "users": [],
  "vehicles": [],
  "drivers": []
}
```

**Erreur possible :**
- **404 Not Found** : Tenant inexistant

---

### 4. Obtenir les statistiques d'un tenant

```bash
curl http://localhost:8000/tenants/2/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse (200 OK) :**
```json
{
  "usersCount": 3,
  "vehiclesCount": 12,
  "driversCount": 8,
  "status": "active",
  "trialEndsAt": null,
  "createdAt": "2025-09-30T17:00:00.000Z"
}
```

---

### 5. Mettre à jour un tenant

**Mise à jour partielle (PATCH) :**
```bash
curl -X PATCH http://localhost:8000/tenants/2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+33 1 99 88 77 66",
    "city": "Villeurbanne"
  }'
```

**Changement de statut :**
```bash
curl -X PATCH http://localhost:8000/tenants/2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

**Réponse (200 OK) :**
```json
{
  "id": 2,
  "name": "Transport Express",
  "email": "contact@transport-express.com",
  "phone": "+33 1 99 88 77 66",
  "city": "Villeurbanne",
  "status": "active",
  ...
}
```

**Statuts possibles :**
- `trial` : Période d'essai (14 jours par défaut)
- `active` : Abonnement actif
- `suspended` : Compte suspendu (non-paiement, etc.)
- `cancelled` : Compte annulé

---

### 6. Supprimer un tenant

```bash
curl -X DELETE http://localhost:8000/tenants/2 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Réponse (204 No Content)** : Pas de corps de réponse

**Erreur possible :**
- **404 Not Found** : Tenant inexistant

⚠️ **Attention :** La suppression d'un tenant supprimera toutes les données associées (users, vehicles, drivers) en raison des Foreign Keys. Utilisez plutôt le statut `cancelled` pour désactiver un compte.

---

## 🧪 Tests avec variables

### Script complet pour tester l'API

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:8000"
EMAIL="admin@flotteq.com"
PASSWORD="votre_mot_de_passe"

# 1. Login et récupération du token
echo "🔐 Authentification..."
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.access_token')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Échec de l'authentification"
  exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:20}..."

# 2. Créer un tenant
echo -e "\n📝 Création d'un tenant..."
TENANT_ID=$(curl -s -X POST $BASE_URL/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tenant",
    "email": "test-'$(date +%s)'@example.com",
    "city": "Paris"
  }' | jq -r '.id')

echo "✅ Tenant créé avec l'ID: $TENANT_ID"

# 3. Récupérer les détails
echo -e "\n📊 Récupération des détails..."
curl -s $BASE_URL/tenants/$TENANT_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Obtenir les stats
echo -e "\n📈 Statistiques du tenant..."
curl -s $BASE_URL/tenants/$TENANT_ID/stats \
  -H "Authorization: Bearer $TOKEN" | jq

# 5. Mettre à jour
echo -e "\n✏️  Mise à jour du tenant..."
curl -s -X PATCH $BASE_URL/tenants/$TENANT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' | jq

# 6. Lister tous les tenants
echo -e "\n📋 Liste de tous les tenants..."
curl -s $BASE_URL/tenants \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

echo -e "\n✅ Tous les tests sont terminés"
```

**Usage :**
```bash
chmod +x test-tenants-api.sh
./test-tenants-api.sh
```

---

## 🔍 Validation des données

### Champs obligatoires (POST)
- `name` : string, minimum 2 caractères
- `email` : email valide

### Champs optionnels
- `phone` : string
- `address` : string
- `city` : string
- `postalCode` : string
- `country` : string

### Validation automatique
- Email : format validé par `class-validator`
- Name : unicité vérifiée en base de données
- Status : doit être une valeur de l'enum `TenantStatus`

---

## 🔒 Sécurité

### Headers requis
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Permissions
Actuellement, tous les endpoints sont protégés par `JwtAuthGuard` uniquement. Dans une version future, les actions suivantes pourraient nécessiter des rôles spécifiques :

| Endpoint | Rôle suggéré |
|----------|--------------|
| POST /tenants | super_admin |
| GET /tenants | super_admin, support |
| GET /tenants/:id | super_admin, support, tenant_admin (propre tenant) |
| PATCH /tenants/:id | super_admin |
| DELETE /tenants/:id | super_admin |
| GET /tenants/:id/stats | super_admin, support, tenant_admin (propre tenant) |

---

## 📚 Ressources

- **Documentation technique :** [TENANT_IMPLEMENTATION.md](./TENANT_IMPLEMENTATION.md)
- **Code source :** [src/modules/tenants/](./src/modules/tenants/)
- **Tests :** [src/modules/tenants/tenants.service.spec.ts](./src/modules/tenants/tenants.service.spec.ts)

---

## 🐛 Résolution de problèmes

### Erreur 401 Unauthorized
```
Vérifiez que :
1. Le token JWT est valide et non expiré
2. Le header Authorization est correctement formaté
3. L'utilisateur est authentifié
```

### Erreur 409 Conflict
```
Un tenant avec cet email ou ce nom existe déjà.
Utilisez un email/nom différent ou récupérez le tenant existant.
```

### Erreur 404 Not Found
```
Le tenant demandé n'existe pas.
Vérifiez l'ID du tenant avec GET /tenants
```

---

**Documentation générée le 2025-09-30**
