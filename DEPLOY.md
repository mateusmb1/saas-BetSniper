# 🚀 BETSNIPER - GUIA DE DEPLOY

## Status do Sistema

### ✅ Admin Criado
- **Email:** admin@betsniper.com
- **Senha:** BetSniper2024!@#
- **Banco:** 28 jogos de ligas reais inseridos

## 📋 Deploy no Vercel (2 minutos)

### Passo 1: Acesse o Vercel
👉 **https://vercel.com/new/github**

### Passo 2: Conecte o Repositório
1. Clique em **"Add GitHub Account"**
2. Autorize o Vercel
3. Selecione o repositório: **mateusmb1/saas-BetSniper**

### Passo 3: Configure as Variáveis
No campo "Environment Variables", adicione:

```
VITE_SUPABASE_URL=https://nnbvmbjqlmuwlovlqgzh.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_E01-WuLl9XuKe16iHMlPLA_tkEbH5kd
```

### Passo 4: Deploy!
1. Clique em **"Deploy"**
2. Aguarde ~1 minuto
3. Copie a URL do seu app!

## 🔐 Login no Sistema

Após o deploy, acesse sua URL e faça login com:
- **Email:** admin@betsniper.com
- **Senha:** BetSniper2024!@#

## 🛠️ Problemas Comuns

### "User not found" no Supabase?
O admin já está criado! Use as credenciais acima.

### Dados não aparecem?
1. Verifique as variáveis de ambiente no Vercel
2. Execute o schema no Supabase: `supabase/schema_corrigido.sql`

### Erro de build?
Execute localmente: `npm run build`

## 📞 Suporte

- **GitHub:** https://github.com/mateusmb1/saas-BetSniper
- **Supabase:** https://supabase.com/dashboard/project/nnbvmbjqlmuwlovlqgzh
