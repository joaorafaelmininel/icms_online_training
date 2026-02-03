# 🚀 ICMS 3.0 Platform - INSARAG Training

Plataforma de treinamento online para o INSARAG Coordination and Management System 3.0

## 📋 **O QUE ESTÁ INCLUÍDO**

Este é um projeto **Next.js completo** com:

- ✅ **Next.js 16.1.1** + React 19 + TypeScript
- ✅ **Tailwind CSS** para estilização
- ✅ **Supabase** para autenticação e banco de dados
- ✅ **Sistema de idiomas** (Inglês/Espanhol) completo
- ✅ **Componentes prontos** (Header, Footer, LanguageSwitcher)
- ✅ **Types TypeScript** completos do schema v6.0.0
- ✅ **Middleware** de autenticação configurado
- ✅ **Estrutura de pastas** organizada

---

## 🎯 **STATUS DO PROJETO**

### ✅ **FASE 1 - COMPLETA** (Fundação)
- [x] Configuração do projeto
- [x] Sistema de idiomas (EN/ES)
- [x] Types do banco de dados
- [x] Header com LanguageSwitcher
- [x] Footer
- [x] Landing page
- [x] Supabase configurado

### ⏳ **FASE 2 - PRÓXIMA** (Auth & Profile)
- [ ] AuthClient completo
- [ ] Validação de username
- [ ] Formulários de registro
- [ ] Profile page

### ⏳ **FASE 3+** (Desenvolvimento futuro)
- [ ] Dashboard completo
- [ ] Sistema de cursos
- [ ] Módulos e quizzes
- [ ] Certificados

---

## 🚀 **INSTALAÇÃO**

### **Pré-requisitos**

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **npm** (vem com Node.js)
- Conta no **Supabase** ([Criar conta](https://supabase.com))

### **Passo 1: Baixar e descompactar**

Se você baixou um arquivo ZIP, descompacte-o:

```bash
unzip icms-platform.zip
cd icms-platform
```

Se você clonou do repositório:

```bash
cd icms-platform
```

### **Passo 2: Configurar variáveis de ambiente**

1. Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

2. Abra `.env.local` no seu editor e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

**Como pegar as credenciais:**

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Menu lateral: **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Passo 3: Instalar dependências**

```bash
npm install
```

Aguarde 1-2 minutos para instalar todas as dependências.

### **Passo 4: Rodar o projeto**

```bash
npm run dev
```

O projeto estará rodando em: **http://localhost:3000**

---

## 🎨 **FUNCIONALIDADES ATUAIS**

### **1. Sistema de Idiomas (EN/ES)**

- Botões 🇬🇧 EN e 🇪🇸 ES no header
- Troca instantânea de idioma
- Salva preferência em cookie
- Todo conteúdo traduzido

**Testar:**
1. Abra http://localhost:3000
2. Clique nos botões de bandeira
3. Veja o conteúdo mudar de idioma

### **2. Landing Page**

- Hero section com gradiente azul
- Seção "About the Training"
- Estatísticas do INSARAG
- Footer completo

### **3. Autenticação (Básica)**

- Página de auth em `/auth`
- Middleware de proteção de rotas
- Redirect automático

### **4. Dashboard (Placeholder)**

- Página protegida em `/dashboard`
- Requer login (via middleware)
- Layout básico pronto

---

## 📂 **ESTRUTURA DO PROJETO**

```
icms-platform/
├── public/                      # Assets estáticos
│   ├── flag-gb.svg             # Bandeira UK
│   ├── flag-es.svg             # Bandeira Espanha
│   ├── insarag-logo-blue.svg   # Logo
│   └── images/                 # Outras imagens
│
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Estilos globais
│   │   ├── auth/               # Autenticação
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── dashboard/          # Dashboard
│   │       └── page.tsx
│   │
│   ├── components/             # Componentes React
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Header com idiomas
│   │   │   ├── Footer.tsx      # Footer
│   │   │   └── LanguageSwitcher.tsx
│   │   ├── ui/                 # Componentes UI
│   │   └── auth/               # Componentes auth
│   │
│   ├── lib/                    # Utilitários
│   │   ├── types/
│   │   │   └── database.ts     # Types do Supabase
│   │   ├── i18n/
│   │   │   ├── language.ts     # Helpers de idioma
│   │   │   └── translations.ts # Traduções
│   │   └── supabase/
│   │       ├── client.ts       # Client browser
│   │       └── server.ts       # Client server
│   │
│   ├── hooks/                  # Custom hooks
│   │   └── useLanguage.ts
│   │
│   └── middleware.ts           # Middleware auth
│
├── .env.local.example          # Exemplo de env
├── .env.local                  # Suas credenciais
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md                   # Este arquivo
```

---

## 🔧 **SCRIPTS DISPONÍVEIS**

```bash
# Rodar em desenvolvimento (com Turbopack)
npm run dev

# Build para produção
npm run build

# Rodar em produção
npm start

# Lint
npm run lint
```

---

## 🌐 **PÁGINAS DISPONÍVEIS**

| Rota | Status | Descrição |
|------|--------|-----------|
| `/` | ✅ Pronta | Landing page |
| `/auth` | ✅ Pronta | Sign in / Sign up |
| `/dashboard` | 🚧 Placeholder | Dashboard do usuário |
| `/training` | ⏳ Futura | Área de treinamento |
| `/courses` | ⏳ Futura | Lista de cursos |
| `/certificates` | ⏳ Futura | Certificados |
| `/profile` | ⏳ Futura | Perfil do usuário |

---

## 🧪 **TESTES**

### **Testar sistema de idiomas:**

1. Acesse http://localhost:3000
2. Clique em 🇪🇸 ES no header
3. Página recarrega em espanhol
4. Clique em 🇬🇧 EN
5. Volta para inglês

### **Testar middleware de auth:**

1. Acesse http://localhost:3000/dashboard diretamente
2. Deve redirecionar para `/auth`
3. (Login será implementado na Fase 2)

---

## 📦 **DEPENDÊNCIAS PRINCIPAIS**

- **next**: Framework React
- **react**: Biblioteca UI
- **typescript**: Tipagem estática
- **tailwindcss**: Estilização CSS
- **@supabase/ssr**: Supabase para Next.js
- **@supabase/supabase-js**: Cliente Supabase

---

## 🔐 **CONFIGURAÇÃO DO SUPABASE**

O projeto está configurado para trabalhar com o schema v6.0.0 do Supabase.

**Tabelas principais:**
- `profiles` - Perfis de usuários
- `courses` - Cursos
- `course_modules` - Módulos dos cursos
- `course_enrollments` - Matrículas
- `quiz_questions` - Questões de quiz
- `quiz_attempts` - Tentativas de quiz
- `certificates` - Certificados

**SQL para criar tabelas:** Será fornecido na Fase 2.

---

## 🐛 **TROUBLESHOOTING**

### **Erro: Cannot find module '@/...'**

Verifique que `tsconfig.json` contém:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### **Erro: Invalid environment variables**

1. Verifique se `.env.local` existe
2. Verifique se as credenciais estão corretas
3. Reinicie o servidor (`npm run dev`)

### **Erro: Port 3000 already in use**

```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou usar outra porta
npm run dev -- -p 3001
```

### **Bandeiras não aparecem**

1. Verifique se os arquivos existem em `/public`
2. Limpe o cache do Next.js: `rm -rf .next`
3. Reinicie o servidor

---

## 🚀 **PRÓXIMOS PASSOS**

Agora que o projeto está rodando, você pode:

1. ✅ **Testar** o sistema de idiomas
2. ✅ **Verificar** as páginas disponíveis
3. ✅ **Personalizar** logos e imagens
4. ⏳ **Aguardar** FASE 2 (Auth completo)
5. ⏳ **Desenvolver** novos componentes

---

## 📚 **DOCUMENTAÇÃO ADICIONAL**

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 💬 **SUPORTE**

Se você encontrar problemas:

1. Verifique a seção de **Troubleshooting** acima
2. Consulte os documentos de **FASE-1-COMPLETADA.md**
3. Revise os logs no terminal

---

## ✅ **CHECKLIST DE VALIDAÇÃO**

Antes de considerar a instalação completa, verifique:

- [ ] `npm run dev` funciona sem erros
- [ ] http://localhost:3000 carrega a landing page
- [ ] Botões 🇬🇧 🇪🇸 funcionam
- [ ] Header aparece corretamente
- [ ] Footer aparece corretamente
- [ ] `/auth` é acessível
- [ ] `/dashboard` redireciona para `/auth`

---

## 🎉 **PARABÉNS!**

Se tudo está funcionando, você tem um projeto Next.js profissional rodando com:
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Supabase
- ✅ Sistema de idiomas completo
- ✅ Autenticação (middleware)
- ✅ Estrutura escalável

**Pronto para a FASE 2! 🚀**

---

© 2026 INSARAG - International Search and Rescue Advisory Group
