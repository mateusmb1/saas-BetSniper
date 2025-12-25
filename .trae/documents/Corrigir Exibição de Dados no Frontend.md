Vou aplicar correções no backend para garantir que os dados sejam enviados corretamente para o frontend.

### 🛠️ O que será feito:

1.  **Corrigir `TeamLogoService.js`:**
    *   Atualmente, ele sobrescreve os logos oficiais da ESPN com logos genéricos gerados.
    *   Vou alterar para: `homeLogo: match.homeLogo || this.getTeamLogo(match.homeTeam)`. Assim, se já tivermos a bandeira oficial, ela será usada.

2.  **Debug e Ajuste no `server.js`:**
    *   O frontend pode estar recebendo uma lista vazia porque a query de data (`WHERE date = CURRENT_DATE`) pode estar excluindo jogos por questões de fuso horário.
    *   Vou adicionar logs (`console.log`) dentro da rota `/api/matches` para vermos exatamente quantos jogos estão sendo retornados pelo banco.
    *   Vou remover temporariamente o filtro estrito de data na query SQL para garantir que *algum* dado apareça na tela (depois podemos refinar).

Com isso, o frontend deverá mostrar os jogos que já confirmamos que estão no banco de dados.
