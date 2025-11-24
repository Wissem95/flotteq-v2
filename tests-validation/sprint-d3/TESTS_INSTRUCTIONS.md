# 🧪 TESTS STACK PRODUCTION COMPLET - Sprint D3

## Tests à exécuter (30-40 min)

### 1. Build images
```bash
cd /Users/wissem/Flotteq-v2
docker compose -f docker-compose.production.yml build
docker images | grep flotteq > tests-validation/sprint-d3/docker-images.txt
```

### 2. Démarrer stack
```bash
docker compose -f docker-compose.production.yml up -d
sleep 30
docker compose -f docker-compose.production.yml ps > tests-validation/sprint-d3/containers-status.txt
```

### 3. Healthchecks
```bash
curl http://localhost/api/health > tests-validation/sprint-d3/api-health.json
curl -I http://localhost:5174 > tests-validation/sprint-d3/frontend-client.txt
curl -I http://localhost:5175 > tests-validation/sprint-d3/frontend-partner.txt
```

### 4. Vérifier logs
```bash
docker compose -f docker-compose.production.yml logs backend | tail -100 > tests-validation/sprint-d3/backend-logs.txt
```

### 5. Arrêter
```bash
docker compose -f docker-compose.production.yml down
```
