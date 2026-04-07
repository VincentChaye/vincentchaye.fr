#!/bin/bash
# Mise à jour manuelle du cache Root-Me depuis .env
# Usage : bash scripts/fetch-rootme.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$ROOT_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Erreur : fichier .env introuvable ($ENV_FILE)"
  exit 1
fi

# Charger les variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

if [ -z "$ROOTME_USER_ID" ] || [ -z "$ROOTME_API_KEY" ]; then
  echo "Erreur : ROOTME_USER_ID ou ROOTME_API_KEY manquant dans .env"
  exit 1
fi

CACHE_FILE="$ROOT_DIR/public/data/rootme-cache.json"

echo "Récupération des données Root-Me (user: $ROOTME_USER_ID)..."

RESPONSE=$(curl -s \
  -H "Accept: application/json" \
  -H "Cookie: api_key=$ROOTME_API_KEY" \
  "https://api.www.root-me.org/auteurs/$ROOTME_USER_ID?lang=fr")

if echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if d.get('score') is not None else 1)" 2>/dev/null; then
  echo "$RESPONSE" > "$CACHE_FILE"
  SCORE=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('score','?'))")
  SOLVED=$(echo "$RESPONSE" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('validations',[])))")
  echo "Cache mis à jour — Score: $SCORE pts | Challenges: $SOLVED"
else
  echo "Erreur : réponse API invalide"
  echo "$RESPONSE"
  exit 1
fi
