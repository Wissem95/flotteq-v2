# 🔐 Secrets Production FlotteQ

Ce dossier contient les secrets sensibles pour Docker Compose production.

## ⚠️ SÉCURITÉ

**NE JAMAIS commiter ces fichiers dans Git!**

Le `.gitignore` doit contenir:
```
secrets/*.txt
!secrets/README.md
```

## 📋 Fichiers Requis

### 1. db_password.txt
Mot de passe PostgreSQL production.

**Générer:**
```bash
openssl rand -base64 32 > secrets/db_password.txt
```

### 2. jwt_access_secret.txt
Secret JWT pour access tokens (15min).

**Générer:**
```bash
openssl rand -base64 64 > secrets/jwt_access_secret.txt
```

### 3. jwt_refresh_secret.txt
Secret JWT pour refresh tokens (7 jours).

**Générer:**
```bash
openssl rand -base64 64 > secrets/jwt_refresh_secret.txt
```

### 4. jwt_partner_secret.txt
Secret JWT pour partner tokens (7 jours).

**Générer:**
```bash
openssl rand -base64 64 > secrets/jwt_partner_secret.txt
```

### 5. redis_password.txt
Mot de passe Redis.

**Générer:**
```bash
openssl rand -base64 32 > secrets/redis_password.txt
```

### 6. stripe_secret_key.txt
Clé secrète Stripe LIVE (sk_live_...).

**Copier depuis:** https://dashboard.stripe.com/apikeys (mode LIVE)
```bash
echo "sk_live_xxxxx" > secrets/stripe_secret_key.txt
```

### 7. smtp_password.txt
Mot de passe SMTP pour envoi emails.

```bash
echo "your_smtp_password" > secrets/smtp_password.txt
```

## 🚀 Génération Automatique

Utiliser le script de génération:
```bash
./scripts/generate-secrets.sh
```

Ce script génère automatiquement les secrets 1-5.
Les secrets 6-7 doivent être ajoutés manuellement.

## 🔒 Permissions

Protéger les secrets (lecture seule par le propriétaire):
```bash
chmod 600 secrets/*.txt
```

## 📖 Utilisation dans Docker Compose

Les secrets sont montés automatiquement dans les containers via:
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

Accès dans le container:
```bash
cat /run/secrets/db_password
```

## ✅ Checklist Déploiement

Avant de déployer en production, vérifier:
- [ ] Tous les 7 fichiers `.txt` sont créés
- [ ] Permissions 600 appliquées
- [ ] Secrets Stripe LIVE (pas test)
- [ ] Mot de passe DB >= 32 caractères
- [ ] Secrets JWT >= 64 caractères
- [ ] Fichiers `.txt` dans `.gitignore`
- [ ] Backup des secrets dans un vault sécurisé (1Password, HashiCorp Vault, etc.)

## 🔄 Rotation des Secrets

Recommandations:
- **DB password**: Rotation tous les 90 jours
- **JWT secrets**: Rotation tous les 6 mois (invalide tous les tokens existants)
- **Redis password**: Rotation tous les 90 jours
- **Stripe keys**: Rotation si compromises
- **SMTP password**: Rotation tous les 90 jours

## 📞 Support

En cas de secret compromis:
1. Générer immédiatement un nouveau secret
2. Mettre à jour le fichier correspondant
3. Redéployer avec `docker-compose up -d`
4. Invalider l'ancien secret (DB, Stripe, etc.)
