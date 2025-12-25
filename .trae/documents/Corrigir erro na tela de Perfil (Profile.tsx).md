O problema é que o botão "Gerenciar Assinatura" na tela de perfil tenta chamar uma função `onUpgrade` que não foi definida, causando um erro que quebra a tela (tela branca).

Vou corrigir o arquivo `screens/Profile.tsx`:
1.  Adicionar `onUpgrade` na interface de propriedades (`ProfileProps`).
2.  Receber essa propriedade no componente.
3.  Torná-la opcional para não quebrar o `App.tsx` que ainda não passa essa função.

Isso fará a tela de perfil voltar a funcionar imediatamente.
