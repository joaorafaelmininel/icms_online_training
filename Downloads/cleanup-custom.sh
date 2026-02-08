#!/bin/bash
# ICMS Learning Platform - CLEANUP SCRIPT (Customizado)
# Remove código de autenticação bagunçado do GPT

echo "🧹 ICMS Learning - Cleanup Script (Customizado)"
echo "================================================"
echo ""
echo "ESTRUTURA ATUAL DETECTADA:"
echo "  ❌ src/app/auth/ (bagunçado - GPT)"
echo "  ❌ src/components/auth/ (bagunçado - GPT)"
echo "  ❌ AuthCard.tsx, AuthLayout.tsx, AuthShell.tsx"
echo "  ❌ src/lib/styles/auth.css"
echo ""
echo "SERÁ PRESERVADO:"
echo "  ✅ Landing page (src/app/page.tsx)"
echo "  ✅ Supabase config (src/lib/supabase/)"
echo "  ✅ i18n (src/lib/i18n/)"
echo "  ✅ Layout components (src/components/layout/)"
echo "  ✅ Dashboard, Courses, Training estruturas"
echo ""
read -p "Continuar com a limpeza? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cancelado."
    exit 1
fi

echo ""
echo "🗑️  Removendo código de auth bagunçado..."

# Remover TODA a pasta src/app/auth/ (tem signin, signup, Authtabs.tsx, etc.)
echo "  → Removendo src/app/auth/"
rm -rf src/app/auth

# Remover pasta src/app/profile/ (vamos recriar)
echo "  → Removendo src/app/profile/"
rm -rf src/app/profile

# Remover TODA a pasta src/components/auth/
echo "  → Removendo src/components/auth/"
rm -rf src/components/auth

# Remover componentes de auth soltos em src/components/
echo "  → Removendo AuthCard.tsx, AuthLayout.tsx, AuthShell.tsx"
rm -f src/components/AuthCard.tsx
rm -f src/components/AuthLayout.tsx
rm -f src/components/AuthShell.tsx

# Remover CSS de auth
echo "  → Removendo src/lib/styles/auth.css"
rm -f src/lib/styles/auth.css

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 Estrutura limpa:"
echo "  ✅ src/app/page.tsx (landing page preservada)"
echo "  ✅ src/app/dashboard/ (preservado)"
echo "  ✅ src/app/courses/ (preservado)"
echo "  ✅ src/app/training/ (preservado)"
echo "  ✅ src/app/certificates/ (preservado)"
echo "  ✅ src/components/layout/ (preservado)"
echo "  ✅ src/lib/supabase/ (preservado)"
echo "  ✅ src/lib/i18n/ (preservado)"
echo ""
echo "🚀 Próximo passo: Executar install-phase2-custom.sh"
