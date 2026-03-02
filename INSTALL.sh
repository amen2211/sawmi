#!/bin/bash

# ========================================
# Swmi - صومي | Installation Script
# Plateforme Islamique Complète & Dynamique
# ========================================

echo "🌙 Swmi - صومي"
echo "منصة الصيام والارتقاء الروحي"
echo ""
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if all files exist
echo -e "${BLUE}✓ Vérification des fichiers...${NC}"
echo ""

files_required=(
    "index.html"
    "profile.html"
    "dashboard.html"
    "styles.css"
    "script.js"
    "api.js"
    "auth.js"
    "data.json"
    "README.md"
)

all_files_exist=true
for file in "${files_required[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${YELLOW}⚠️  Manquant: $file${NC}"
        all_files_exist=false
    fi
done

echo ""
echo "=================================================="
echo ""

if [ "$all_files_exist" = true ]; then
    echo -e "${GREEN}✅ Tous les fichiers sont présents!${NC}"
    echo ""
    echo "🚀 Prêt à démarrer!"
    echo ""
    echo "📝 Instructions de démarrage:"
    echo ""
    echo "1. Option 1: Ouvrir directement"
    echo "   - Double-cliquez sur 'index.html' pour ouvrir le navigateur"
    echo ""
    echo "2. Option 2: Utiliser un serveur local (recommandé)"
    echo ""
    echo "   Sur Windows (PowerShell):"
    echo "   python -m http.server 8000"
    echo "   ou"
    echo "   npx http-server"
    echo ""
    echo "   Puis ouvrir: http://localhost:8000"
    echo ""
    echo "3. Option 3: Utiliser VS Code Live Server"
    echo "   - Clic droit sur index.html"
    echo "   - Sélectionner 'Open with Live Server'"
    echo ""
else
    echo -e "${YELLOW}⚠️  Certains fichiers sont manquants!${NC}"
    echo "Assurez-vous que tous les fichiers énumérés ci-dessous sont présents:"
    echo ""
    for file in "${files_required[@]}"; do
        echo "  - $file"
    done
fi

echo ""
echo "=================================================="
echo ""
echo "📚 Documentation:"
echo "Consultez README.md pour plus de détails sur:"
echo "- L'architecture du projet"
echo "- L'utilisation de l'API"
echo "- Le système de stockage"
echo "- Les fonctionnalités disponibles"
echo ""
echo "=================================================="
echo ""
echo "🌟 Merci d'utiliser Swmi - صومي!"
echo "© 2026 | Tous droits réservés"
echo ""
