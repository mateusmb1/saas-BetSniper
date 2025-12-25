# Plano de Implementação: Sistema de Login, Planos e Precificação Regional

## 1. Análise de Mercado e Precificação (Brasil vs. Europa)

Baseado na análise de paridade de poder de compra (PPP) e concorrentes de apostas esportivas, a estratégia ideal é **não converter diretamente a moeda**, mas sim ajustar ao "valor percebido" em cada região.

### 🇧🇷 Brasil (Foco: Volume e Acessibilidade)
O mercado brasileiro é sensível a preço. Valores psicológicos terminados em "9,90" funcionam melhor.
*   **Free:** 3 sugestões/dia (Isca para cadastro).
*   **Pro (R$ 29,90/mês):** Acesso ilimitado a sugestões + Simulador. (Equivalente a ~€5).
*   **Elite (R$ 59,90/mês):** IA Avançada + Alertas Telegram + Suporte Prioritário. (Equivalente a ~€10).

### 🇪🇺 Portugal e Espanha (Foco: Ticket Médio Maior)
O poder de compra é 3x a 4x maior. Cobrar €5 (R$ 30) seria muito barato e passaria imagem de produto inferior.
*   **Free:** 3 sugestões/dia.
*   **Pro (€ 9,90/mês):** Equivalente a ~R$ 60. Preço padrão de serviços de entrada na Europa.
*   **Elite (€ 19,90/mês):** Equivalente a ~R$ 120. Preço competitivo para ferramentas profissionais.

---

## 2. Estratégia de Segurança e Geo-Localização

Para evitar que um usuário europeu pague o preço do Brasil (fraude de região), implementaremos um sistema de **Travamento de Região (Region Lock)** no Backend.

### Lógica de Segurança "Trust No One" (Não confiar no Frontend):
1.  **Detecção no Backend:** O Frontend nunca diz "Estou no Brasil". O Backend descobre isso analisando o IP da requisição.
2.  **Vínculo Eterno (First Bind):**
    *   No primeiro login ou tentativa de compra, o Backend verifica o IP.
    *   Grava no banco de dados (`profiles.region`) a região detectada (BR ou EU).
    *   **Uma vez gravado, não muda mais**, mesmo que o usuário viaje ou use VPN depois.
3.  **Fallback de VPN:** Se detectarmos IP de Datacenter/VPN na criação da conta, bloqueamos ou forçamos o preço mais alto (Europa).

---

## 3. Plano Técnico de Implementação

### Fase 1: Backend & Banco de Dados (Node.js + Supabase)
1.  **Instalar Dependências:**
    *   `npm install geoip-lite` (Para detecção de país via IP).
2.  **Atualizar Banco de Dados (SQL):**
    *   Criar tabela `profiles` (se não existir) vinculada ao `auth.users`.
    *   Adicionar colunas: `region` (VARCHAR), `currency` (VARCHAR), `subscription_status` (VARCHAR).
    *   Configurar **Trigger** do Supabase para criar perfil automaticamente ao cadastrar.
3.  **Criar API de Configuração do Usuário:**
    *   Endpoint `GET /api/user/config`:
        *   Verifica Token JWT.
        *   Lê `region` do banco. Se NULL, detecta via IP e grava (Travamento).
        *   Retorna a tabela de preços correta para o Frontend exibir.

### Fase 2: Segurança (RLS - Row Level Security)
1.  **Policies no Supabase:**
    *   Garantir que usuários só possam ler seus próprios dados.
    *   Garantir que **apenas o Backend** (via Service Role) possa alterar o campo `region` ou `plano` (usuário não pode editar isso via API Client).

### Fase 3: Frontend (React)
1.  **Supabase Auth UI:**
    *   Implementar tela de Login/Cadastro usando o cliente Supabase.
2.  **Página de Planos Dinâmica:**
    *   Ao carregar, consulta `GET /api/user/config`.
    *   Se a API retornar `currency: 'BRL'`, exibe componentes com preços em Reais.
    *   Se `currency: 'EUR'`, exibe em Euro.

---

## 4. Próximos Passos (Execução)

1.  **Backend:** Instalar `geoip-lite` e criar a rota de detecção de região.
2.  **Database:** Executar o script SQL para criar tabelas e triggers.
3.  **Frontend:** Criar a tela de Login e integrar com a nova lógica de planos.

Podemos começar pela configuração do **Banco de Dados e Backend** para garantir a segurança da operação?