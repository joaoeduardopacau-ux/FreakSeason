# FreakSeason

Site para montar, executar e acompanhar treinos de musculação, pensado para uso no celular durante o treino.

## Abas

- **Treinos** (`/treinos`, página inicial): mostra o treino de hoje. Setas e calendário para navegar entre datas (dias com treino ficam marcados). Cada data tem seu próprio registro.
  - **Adicionar exercícios**: busca por nome, filtro por grupo muscular, seleção múltipla e cadastro de exercícios próprios.
  - Uma linha por série com carga (kg), repetições e botão de "feita". Adicionar/remover séries, reordenar/remover exercícios e observações por exercício.
  - **Concluir treino**: séries não marcadas ficam registradas como planejadas, mas não feitas.
  - **Copiar treino para outra data**: copia exercícios, séries e cargas com tudo desmarcado; pede confirmação se o dia de destino já tiver treino.
- **Histórico** (`/historico`): treinos do mais recente para o mais antigo, com status e séries feitas; ao abrir, mostra cargas, repetições e observações.

## Armazenamento

Tudo é salvo automaticamente no `localStorage` do navegador (chave `freakseason_treinos_v1`). Os treinos ficam **apenas naquele aparelho e navegador**; limpar os dados do navegador apaga o histórico.

## Rodar

```bash
npm install
npm run dev     # desenvolvimento em http://localhost:3000
npm run build && npm start   # produção
```
