# Configuration GitHub Secrets

Pour que les workflows fonctionnent, configurer les secrets suivants dans GitHub.

## Accès GitHub Secrets

1. Aller sur le repo: https://github.com/YOUR_USERNAME/flotteq-v2
2. Cliquer sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquer **New repository secret**

## Secrets requis

### VPS_SSH_KEY (CRITIQUE)

**Description**: Clé privée SSH pour connexion au VPS

**Génération**:
```bash
# Sur votre machine locale
ssh-keygen -t ed25519 -C "github-actions@flotteq.com" -f ~/.ssh/flotteq_deploy

# Afficher la clé privée (à copier dans GitHub Secret)
cat ~/.ssh/flotteq_deploy

# Copier la clé publique sur le VPS
ssh-copy-id -i ~/.ssh/flotteq_deploy.pub root@flotteq.com
```

**Valeur dans GitHub Secret**:
Copier TOUT le contenu de `~/.ssh/flotteq_deploy` (y compris `-----BEGIN OPENSSH PRIVATE KEY-----`)

### VPS_HOST

**Description**: Adresse IP ou domaine du VPS

**Valeur**: `flotteq.com` ou `1.2.3.4`

### VPS_USER

**Description**: Utilisateur SSH sur le VPS

**Valeur**: `root` ou `flotteq`

### SLACK_WEBHOOK_URL (Optionnel)

**Description**: Webhook Slack pour notifications de déploiement

**Configuration Slack**:
1. Aller sur https://api.slack.com/apps
2. Créer une app → Activer "Incoming Webhooks"
3. Créer un webhook pour votre channel (ex: #deployments)
4. Copier l'URL (format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX`)

**Valeur**: L'URL du webhook

## Vérification

### Tester la connexion SSH (sur votre machine)

```bash
ssh -i ~/.ssh/flotteq_deploy root@flotteq.com "echo 'SSH OK'"
```

### Tester le workflow manuellement

1. Aller dans **Actions** → **CD - Deploy to Production**
2. Cliquer **Run workflow**
3. Vérifier les logs

## Sécurité

⚠️ **JAMAIS commiter les clés privées dans le repo!**

Les secrets GitHub sont chiffrés et accessibles uniquement:
- Lors de l'exécution des workflows
- Par les admins du repo
