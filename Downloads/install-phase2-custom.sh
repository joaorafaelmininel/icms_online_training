#!/bin/bash
# ICMS Learning Platform - PHASE 2 INSTALLATION SCRIPT (Customizado)
# Instala sistema completo de autenticação no projeto existente

echo "🚀 ICMS Learning - Phase 2 Installation (Customizado)"
echo "======================================================"
echo ""
echo "Este script vai instalar:"
echo "  ✅ Sistema de Sign In / Sign Up completo (17 campos)"
echo "  ✅ Forgot Password / Reset Password"
echo "  ✅ Email Verification"
echo "  ✅ Profile Edit"
echo "  ✅ UserMenu (dropdown no header)"
echo "  ✅ Terms of Use / Privacy Policy"
echo ""
read -p "Continuar? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Cancelado."
    exit 1
fi

echo ""
echo "📁 Criando estrutura de pastas..."

# Criar estrutura de pastas para auth
mkdir -p src/components/auth
mkdir -p src/components/profile
mkdir -p src/app/auth/forgot-password
mkdir -p src/app/auth/reset-password
mkdir -p src/app/verify-email
mkdir -p src/app/profile
mkdir -p src/app/terms
mkdir -p src/app/privacy
mkdir -p src/app/login

echo "✅ Pastas criadas!"
echo ""
echo "📦 Verificando dependências..."

# Verificar se @supabase/ssr está instalado
if grep -q "@supabase/ssr" package.json; then
    echo "✅ @supabase/ssr já instalado"
else
    echo "📦 Instalando @supabase/ssr..."
    npm install @supabase/ssr
fi

# Verificar se @supabase/supabase-js está instalado
if grep -q "@supabase/supabase-js" package.json; then
    echo "✅ @supabase/supabase-js já instalado"
else
    echo "📦 Instalando @supabase/supabase-js..."
    npm install @supabase/supabase-js
fi

echo ""
echo "✅ Setup inicial completo!"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Copie os arquivos do pacote phase2-complete/ usando os comandos:"
echo ""
echo "   # Componentes de Auth"
echo "   cp phase2-complete/AuthClient.tsx src/components/auth/"
echo "   cp phase2-complete/ForgotPasswordClient.tsx src/components/auth/"
echo "   cp phase2-complete/ResetPasswordClient.tsx src/components/auth/"
echo "   cp phase2-complete/EmailVerificationClient.tsx src/components/auth/"
echo ""
echo "   # Componente de Profile"
echo "   cp phase2-complete/ProfileEditClient.tsx src/components/profile/"
echo ""
echo "   # UserMenu no Layout"
echo "   cp phase2-complete/UserMenu.tsx src/components/layout/"
echo ""
echo "   # Páginas de Auth"
echo "   cp phase2-complete/auth-page.tsx src/app/auth/page.tsx"
echo "   cp phase2-complete/forgot-password-page.tsx src/app/auth/forgot-password/page.tsx"
echo "   cp phase2-complete/reset-password-page.tsx src/app/auth/reset-password/page.tsx"
echo ""
echo "   # Outras páginas"
echo "   cp phase2-complete/email-verification-page.tsx src/app/verify-email/page.tsx"
echo "   cp phase2-complete/profile-page.tsx src/app/profile/page.tsx"
echo "   cp phase2-complete/terms-page.tsx src/app/terms/page.tsx"
echo "   cp phase2-complete/privacy-page.tsx src/app/privacy/page.tsx"
echo "   cp phase2-complete/login-page.tsx src/app/login/page.tsx"
echo ""
echo "2. Siga o INSTALLATION_GUIDE.md para:"
echo "   - Configurar Supabase (URLs de redirect)"
echo "   - Integrar UserMenu no Header"
echo "   - Testar todas as funcionalidades"
echo ""
echo "✅ Estrutura pronta para receber os componentes!"
