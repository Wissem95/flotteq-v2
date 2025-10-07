# Module Notifications - FlotteQ

## Description

Module de notifications par email pour envoyer des emails transactionnels (bienvenue, rappels, alertes). Utilise **Nodemailer** pour l'envoi d'emails et **Bull** (Redis) pour la gestion asynchrone des files d'attente.

## Configuration

### Variables d'environnement

Ajouter au fichier `.env` :

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@flotteq.com

# Application URL
APP_URL=http://localhost:5173

# Redis Configuration for Bull Queue
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Configuration Gmail (exemple)

1. Activer l'authentification à 2 facteurs sur votre compte Gmail
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `SMTP_PASSWORD`

### Configuration SendGrid (alternative)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

## Utilisation

### Envoyer un email de bienvenue

```typescript
import { EmailQueueService } from './modules/notifications/email-queue.service';

// Dans votre service
await this.emailQueueService.queueWelcomeEmail(
  'user@example.com',
  'John',
  'Acme Corp'
);
```

### Envoyer un rappel de maintenance

```typescript
await this.emailQueueService.queueMaintenanceReminder(
  'user@example.com',
  'John',
  {
    vehicleBrand: 'Renault',
    vehicleModel: 'Clio',
    vehiclePlate: 'AB-123-CD',
    maintenanceType: 'Vidange',
    maintenanceDate: '2025-10-15',
    garageName: 'Garage Central',
    estimatedCost: 150,
    maintenanceId: '123',
  },
  7 // Nombre de jours avant la maintenance
);
```

### Envoyer une alerte d'expiration de document

```typescript
await this.emailQueueService.queueDocumentExpiringAlert(
  'user@example.com',
  'John',
  {
    documentName: 'Carte grise',
    documentType: 'REGISTRATION',
    expirationDate: '2025-11-05',
    entityType: 'Vehicle',
    entityName: 'Renault Clio AB-123-CD',
    documentId: '456',
  },
  30 // Nombre de jours avant expiration
);
```

## Templates disponibles

Les templates sont situés dans `src/modules/notifications/templates/` :

1. **layout.hbs** - Layout de base pour tous les emails
2. **welcome.hbs** - Email de bienvenue pour nouveaux utilisateurs
3. **maintenance-reminder.hbs** - Rappel de maintenance programmée
4. **document-expiring.hbs** - Alerte d'expiration de document

### Créer un nouveau template

1. Créer un fichier `.hbs` dans le dossier `templates/`
2. Utiliser la syntaxe Handlebars pour les variables dynamiques
3. Ajouter le template dans `EmailService.loadTemplates()`
4. Créer une méthode helper dans `EmailService`
5. Ajouter un processor dans `EmailProcessor`

Exemple :
```handlebars
<h2>Nouveau message</h2>
<p>Bonjour {{firstName}},</p>
<p>{{message}}</p>
```

## Architecture

### EmailService
Service principal qui gère :
- Configuration du transporteur Nodemailer
- Chargement des templates Handlebars
- Envoi d'emails avec mise en forme HTML

### EmailQueueService
Gère la file d'attente Bull pour l'envoi asynchrone :
- Ajoute les jobs d'email dans la queue Redis
- Configure les tentatives de renvoi (3 tentatives)
- Exponentielle backoff en cas d'échec

### EmailProcessor
Traite les jobs de la queue :
- Process les différents types d'emails (welcome, reminder, alert)
- Gère les erreurs et retries automatiques

## Queue Bull

Les emails sont envoyés de manière asynchrone via une queue Bull/Redis. Configuration :

- **Tentatives** : 3 tentatives en cas d'échec
- **Backoff** : Exponentiel avec délai initial de 2 secondes
- **Nettoyage** : Jobs complétés supprimés automatiquement
- **Échecs** : Jobs échoués conservés pour debug

## Tests

Lancer les tests unitaires :

```bash
npm test -- email.service.spec.ts
```

Tests couvrant :
- Chargement des templates
- Configuration SMTP
- Envoi d'emails avec contexte correct
- Gestion des erreurs

## Prérequis

### Redis

Redis est requis pour la queue Bull :

```bash
# macOS
brew install redis
brew services start redis

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server
sudo systemctl start redis

# Vérifier que Redis fonctionne
redis-cli ping
# Devrait retourner: PONG
```

## Déploiement en production

### Recommandations

1. **Utiliser un service SMTP professionnel** :
   - SendGrid
   - Mailgun
   - Amazon SES
   - Postmark

2. **Redis en production** :
   - Utiliser Redis Cloud ou service géré
   - Configurer la persistance
   - Sauvegardes automatiques

3. **Monitoring** :
   - Surveiller la queue Bull (jobs failed)
   - Logger les erreurs d'envoi
   - Alertes en cas de problème SMTP

4. **Sécurité** :
   - Ne jamais commiter les credentials SMTP
   - Utiliser des variables d'environnement
   - Activer TLS/SSL pour SMTP

## Troubleshooting

### Redis connection failed
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution** : Vérifier que Redis est démarré avec `redis-cli ping`

### SMTP Authentication failed
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution** :
- Vérifier SMTP_USER et SMTP_PASSWORD
- Pour Gmail, utiliser un mot de passe d'application

### Templates not found
```
Error: Template "welcome" not found
```
**Solution** : Vérifier que les fichiers `.hbs` existent dans `templates/`

## Roadmap

- [ ] Support des pièces jointes
- [ ] Templates personnalisables par tenant
- [ ] Webhooks pour tracking des emails (ouvertures, clics)
- [ ] Support multi-langues
- [ ] UI pour gérer les templates
- [ ] Préférences utilisateur (opt-out)

## License

Propriétaire - FlotteQ © 2025
