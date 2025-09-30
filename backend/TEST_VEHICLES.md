# Test du Module Vehicles - Guide CURL

## Prérequis

1. Le serveur NestJS doit être démarré : `npm run start:dev`
2. La base de données PostgreSQL doit être accessible
3. Un utilisateur de test doit exister (email: test@example.com, password: Test123!)

## Étape 1 : Authentification

Obtenir un token JWT :

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

Réponse attendue :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Copier le token pour les commandes suivantes**

## Étape 2 : Créer un véhicule

```bash
# Remplacer YOUR_TOKEN par le token obtenu
export TOKEN="YOUR_TOKEN"
export TENANT_ID="1"

curl -X POST http://localhost:3000/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "registration": "AB-123-CD",
    "brand": "Renault",
    "model": "Kangoo",
    "year": 2023,
    "vin": "VF1234567890ABCDE",
    "mileage": 5000,
    "color": "Blanc"
  }'
```

Réponse attendue (201 Created) :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "registration": "AB-123-CD",
  "brand": "Renault",
  "model": "Kangoo",
  "year": 2023,
  "vin": "VF1234567890ABCDE",
  "mileage": 5000,
  "status": "available",
  "color": "Blanc",
  "tenantId": 1,
  "createdAt": "2025-09-30T11:00:00.000Z",
  "updatedAt": "2025-09-30T11:00:00.000Z"
}
```

**Copier l'ID pour les commandes suivantes**

## Étape 3 : Lister les véhicules

### Liste de base
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     http://localhost:3000/vehicles
```

### Avec pagination
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     "http://localhost:3000/vehicles?page=1&limit=10"
```

### Filtrer par statut
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     "http://localhost:3000/vehicles?status=available"
```

### Filtrer par marque
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     "http://localhost:3000/vehicles?brand=Renault"
```

### Recherche par plaque
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     "http://localhost:3000/vehicles?registration=AB-123"
```

Réponse attendue :
```json
{
  "data": [ ... ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

## Étape 4 : Récupérer un véhicule par ID

```bash
export VEHICLE_ID="550e8400-e29b-41d4-a716-446655440000"

curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     http://localhost:3000/vehicles/$VEHICLE_ID
```

## Étape 5 : Mettre à jour un véhicule

```bash
curl -X PATCH http://localhost:3000/vehicles/$VEHICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "mileage": 6000,
    "status": "in_use"
  }'
```

Réponse attendue (200 OK) :
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "mileage": 6000,
  "status": "in_use",
  ...
}
```

## Étape 6 : Obtenir les statistiques de la flotte

```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     http://localhost:3000/vehicles/stats
```

Réponse attendue :
```json
{
  "total": 10,
  "byStatus": [
    { "status": "available", "count": 5 },
    { "status": "in_use", "count": 3 },
    { "status": "maintenance", "count": 2 }
  ],
  "averageMileage": 45000,
  "needingMaintenance": 3
}
```

## Étape 7 : Supprimer un véhicule

```bash
curl -X DELETE http://localhost:3000/vehicles/$VEHICLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID"
```

Réponse attendue (200 OK)

## Vérification de la suppression

```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: $TENANT_ID" \
     http://localhost:3000/vehicles/$VEHICLE_ID
```

Réponse attendue (404 Not Found) :
```json
{
  "statusCode": 404,
  "message": "Vehicle with ID 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

## Tests d'erreur

### 1. Créer un véhicule avec une plaque existante
```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "registration": "AB-123-CD",
    "brand": "Peugeot",
    "model": "Partner",
    "year": 2022,
    "vin": "VF9876543210ZYXWV",
    "mileage": 3000
  }'
```

Réponse attendue (409 Conflict) :
```json
{
  "statusCode": 409,
  "message": "Vehicle with registration AB-123-CD already exists"
}
```

### 2. Requête sans token
```bash
curl -X GET http://localhost:3000/vehicles \
  -H "X-Tenant-ID: $TENANT_ID"
```

Réponse attendue (401 Unauthorized)

### 3. Validation échouée
```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "registration": "INVALID",
    "brand": "Test",
    "year": 1800
  }'
```

Réponse attendue (400 Bad Request) avec détails de validation

## Tests multitenant

### Créer un véhicule pour le tenant 1
```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "registration": "TENANT1-01",
    "brand": "Renault",
    "model": "Clio",
    "year": 2023,
    "vin": "VFTENANT1000000001"
  }'
```

### Vérifier isolation tenant 2
```bash
curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Tenant-ID: 2" \
     http://localhost:3000/vehicles
```

Le véhicule TENANT1-01 ne doit PAS apparaître dans cette liste.

## Documentation Swagger

Une fois le serveur démarré, accédez à :
```
http://localhost:3000/api
```

Pour tester interactivement tous les endpoints avec l'interface Swagger UI.