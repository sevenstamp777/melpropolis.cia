# Sincronizar o repositório com produção e travar o número do WhatsApp

**Data:** 2026-11-12
**Tamanho:** mudança pequena
**Decisão tomada:** abordagem B (sincronizar + trava de regressão)

## Intenção e por quê

O site em produção (`melpropolis.com.br`) já exibe o número novo do WhatsApp,
**(18) 99612-8381**, desde 15/10. Mas essa alteração foi publicada direto com
`vercel --prod`, sem commit. O repositório continua com o número antigo
**(18) 99713-0824**.

Consequência: um deploy futuro a partir do repositório desfaz silenciosamente a
troca — e o site volta a anunciar um número que não é mais o oficial. O projeto
não tem integração Git na Vercel, então nada detecta a divergência.

Objetivo: **o repositório passa a refletir produção** e uma verificação
automática impede que o número antigo volte.

## Objetivos

- Fazer o conteúdo do repositório ser idêntico ao que está publicado.
- Impedir a reintrodução do número antigo por verificação, não por memória.

## Não-objetivos

- Não alterar o fluxo de deploy (continua `vercel --prod`).
- Não conectar a Vercel ao GitHub.
- Não refatorar o número para variável de ambiente / fonte única.
- Não alterar copy, layout ou qualquer página.

## Restrições

- O diff atual é exatamente a troca do número: 14 ocorrências em 6 arquivos
  (11 links + 3 textos). Nenhuma outra alteração pendente.
- `master` está sincronizado com `origin/master`; o push é fast-forward.
- `.env*` está no `.gitignore`; nada sensível entra no commit.
- Node v26 e npm 12: `node:test` nativo, sem dependência nova.

## Abordagens consideradas

**A) Só commit + push.** Fecha a divergência em minutos. Não protege contra
reintrodução futura — e o número aparece em 14 pontos, o que torna o erro fácil.

**B) Commit + push + trava de regressão.** O commit corrige o passado; um script
falha se o número antigo reaparecer. Custo baixo, sem dependências, verificável
por qualquer pessoa.

**C) B + deploy contínuo na Vercel.** Elimina o deploy manual esquecido, mas todo
push em `master` iria ao ar sem revisão. É decisão de fluxo, não correção.

**Escolhida: B.** Resolve o risco presente e o futuro sem mudar como o site é
publicado.

## Como foi decidido construir

**1. Sincronização**
- Commit dos 6 arquivos com mensagem que declare o que houve: a troca do chip de
  15/10 ficou quase um mês publicada mas fora do Git.
- Push para `origin/master`.
- Verificação: `git status` limpo e `git diff origin/master` vazio.

**2. Trava de regressão**
- `scripts/check-fatos.mjs` — script sem dependências que varre os arquivos de
  conteúdo do site (`components/`, `pages/`, `data/`, `public/`) e falha quando
  encontra um padrão proibido, informando arquivo e linha.
- Catálogo inicial de regras: número antigo em qualquer formato
  (`99713-0824`, `997130824`, `5518997130824`).
- `npm run check:facts` executável a qualquer momento.
- Ligado em `prebuild`, para que `npm run build` e qualquer deploy a partir do
  repositório falhem antes de publicar o número errado.
- Saída legível: uma linha de sucesso quando nada é encontrado; lista de
  violações com caminho e linha quando encontra.

**3. Registro**
- Atualizar a decisão `deploy_vercel_cli` na memória do projeto para refletir que
  o repositório agora acompanha produção e há verificação ativa.

## Achado fora de escopo (decisão sua)

A varredura do projeto encontrou **10 ocorrências** de "direto do apiário" e
similares no site (`components/footer.js`, `pages/produtos/[slug].js`,
`pages/index.js`, `pages/sobre.js`, `pages/captura.js`), incluindo "nosso
fundador... dedicamo-nos a produzir produtos apícolas".

Isso contraria a decisão `procedencia_produtos` — os produtos vêm de entreposto
parceiro; a afirmação permitida é "origem rastreada e inspecionada". Não faz
parte desta mudança. Fica a opção de, numa próxima, incluir essas frases como
regras do mesmo verificador (começando como alerta, não bloqueio) e revisar a
copy.

## O que fica a cargo de quem implementar

- Redação final da mensagem de commit.
- Formato exato da saída do script (desde que legível).
- Se vale acrescentar o hook `pre-push` além do `prebuild` — previsto como
  opcional; se entrar, usar `core.hooksPath` com hooks versionados, sem husky.
