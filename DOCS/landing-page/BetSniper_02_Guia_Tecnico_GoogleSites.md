# 🛠️ BetSniper: Guia Técnico para Google Sites

**Plataforma:** Google Sites
**Domínio:** www.betsniper.app (sugestão)
**Estrutura:** Multi-Landing Page (Roteamento Manual)

---

## 1. Estrutura de Páginas e Navegação

O Google Sites não possui sistema de roteamento dinâmico complexo, então simularemos uma estrutura de site profissional usando páginas estáticas interligadas.

### Sitemap
1.  **Home (`/`)**: Página "Splash".
    *   Objetivo: Seleção de Região.
    *   Design: Logo centralizado, fundo preto minimalista.
    *   Botões: [ 🇧🇷 BRASIL ] [ 🇪🇺 EUROPA ]
2.  **Landing Page BR (`/br`)**:
    *   Foco: Conversão em R$ (Real).
    *   Checkout: Linkado para Stripe BRL ou Hotmart/Eduzz.
3.  **Landing Page EU (`/eu`)**:
    *   Foco: Conversão em € (Euro).
    *   Checkout: Linkado para Stripe EUR.
4.  **Obrigado (`/obrigado`)**:
    *   Pós-compra. Instruções de acesso ao app.

---

## 2. Layout e Wireframe (Responsivo)

### Seção 1: Header (Fixo)
*   **Desktop:** Logo à esquerda | Links: "Recursos", "Planos", "Login" | Botão CTA: "Começar".
*   **Mobile:** Logo centralizado | Menu Hambúrguer | Botão CTA fixo no rodapé da tela (Sticky Bottom).

### Seção 2: Hero Section
*   **Fundo:** Imagem dark mode com sobreposição de gradiente verde neon (identidade "Sniper/Matrix").
*   **Coluna Esq (Desktop) / Topo (Mobile):** Headline H1 + Subheadline + Botão CTA Grande.
*   **Coluna Dir (Desktop) / Baixo (Mobile):** Mockup do iPhone mostrando o alerta de gol do BetSniper.

### Seção 3: Features (Grid)
*   **Layout:** 3 Colunas (Desktop) / Carrossel ou Pilha Vertical (Mobile).
*   **Cards:** Ícone (Mira, Raio, Gráfico) + Título Curto + Descrição de 2 linhas.

### Seção 4: Pricing (Tabela)
*   **Implementação:** Widget HTML Embed (Recomendado para toggle) ou 3 Cards lado a lado.
*   **Destaque:** O plano "Trimestral" ou "Anual" deve ter uma tag "Recomendado" ou "Melhor Mira".

---

## 3. Requisitos de Integração

### A. Analytics e Rastreamento
Como o Google Sites é limitado, usaremos "Embeds" para pixels de rastreamento se o ID nativo não for suficiente.
*   **Google Analytics 4:** Inserir ID nas configurações do site.
*   **Meta Pixel (Facebook Ads):**
    *   *Workaround:* Criar um container GTM (Google Tag Manager) e inserir o código do GTM no `<head>` (via Configurações > Código Personalizado - *disponível em algumas versões enterprise, senão usar Embed invisível no topo da página*).

### B. Formulários e Captura
*   **Newsletter:** Usar Embed do **Tally.so** ou **Typeform** (esteticamente melhores que Google Forms).
*   **Botão de WhatsApp:** Widget flutuante no canto inferior direito.
    *   *Código:* `<a href="https://wa.me/..." style="position:fixed;bottom:20px;right:20px;z-index:999;"><img src="whatsapp-icon.png"></a>`

### C. Domínio e SSL
*   Configurar CNAME no registrador de domínio (Godaddy/Namecheap) apontando para `ghs.googlehosted.com`.
*   O SSL é automático pelo Google.

---

## 4. Checklist de Elementos Obrigatórios (Legal & Trust)
1.  **Rodapé:**
    *   Links: Termos de Uso, Política de Privacidade, Política de Jogo Responsável (+18).
    *   Aviso Legal: "O BetSniper é uma ferramenta de análise estatística. Não somos uma casa de apostas e não recebemos dinheiro de apostas."
2.  **Cabeçalho:**
    *   Logo BetSniper nítido (SVG ou PNG alta resolução).
3.  **Botões:**
    *   Contraste alto (Verde Neon sobre Fundo Preto).

---

## 5. Guia de Implementação Rápida
1.  Acesse `sites.google.com/new`.
2.  Escolha o tema "Vision" ou crie um tema personalizado (Fundo: #0a0a0a, Primária: #00ff88).
3.  Crie as páginas `/` (Home), `/br`, `/eu`.
4.  No menu de navegação, oculte as páginas `/br` e `/eu` para que não apareçam no topo, forçando o usuário a escolher na Home.
5.  Use a ferramenta "Inserir > Incorporar Código" para os widgets de preço e botões personalizados.
