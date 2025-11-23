#!/bin/bash

echo "🔍 Test Dashboard Partner - Vérification partnerId"
echo "=================================================="

# 1. Vérifier que le backend est lancé
echo ""
echo "1️⃣ Vérification backend..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Backend lancé (port 3000)"
else
  echo "❌ Backend non disponible - Lancez: cd backend && npm run start:dev"
  exit 1
fi

# 2. Vérifier que le frontend est lancé
echo ""
echo "2️⃣ Vérification frontend partner..."
if curl -s http://localhost:5175 > /dev/null 2>&1; then
  echo "✅ Frontend Partner lancé (port 5175)"
else
  echo "⚠️  Frontend Partner non disponible - Lancez: cd frontend-partner && npm run dev"
fi

# 3. Instructions de test
echo ""
echo "📋 INSTRUCTIONS DE TEST"
echo "===================="
echo ""
echo "1. Ouvrir http://localhost:5175 dans le navigateur"
echo "2. Se connecter avec un compte partner existant"
echo "3. Ouvrir la Console DevTools (F12)"
echo "4. Aller dans Application > Local Storage > http://localhost:5175"
echo "5. Vérifier que 'partner_user' contient bien 'partnerId'"
echo ""
echo "6. Naviguer vers le Dashboard"
echo "7. Vérifier que les KPIs affichent des valeurs > 0"
echo ""
echo "🔧 Si toujours à 0 :"
echo "  - Vider localStorage et se reconnecter"
echo "  - Vérifier la console pour les erreurs API"
echo "  - Exécuter ce test: ./test-partner-login-api.sh"
echo ""

# 4. Test API login (si email fourni)
if [ -n "$1" ]; then
  echo "🧪 Test API Login avec: $1"
  echo "========================"
  
  RESPONSE=$(curl -s -X POST http://localhost:3000/api/partners/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}")
  
  echo "$RESPONSE" | jq -r '.partnerUser.partnerId // "❌ partnerId manquant"'
  echo ""
  echo "Réponse complète :"
  echo "$RESPONSE" | jq .
fi

echo ""
echo "✅ Script terminé"
