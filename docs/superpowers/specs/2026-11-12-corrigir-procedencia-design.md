# Corrigir afirmações de procedência do site (entreposto, não apiário próprio)

**Data:** 2026-11-12
**Tamanho:** mudança pequena, mas de conteúdo sensível (afirmação de origem)
**Decisão tomada:** estrito + atribuição a terceiros

## Intenção e por quê

O site afirma em **29 pontos** que o produto vem "direto do apiário" — e em dois
deles, "do **nosso próprio** apiário". O modelo real é outro: os produtos vêm de
**entreposto parceiro** (relação de parceria/representação), e a única afirmação
de procedência autorizada é **"origem rastreada e inspecionada"**.

Além de contrariar a decisão de marca, isso é afirmação de origem não
verdadeira em material comercial — o tipo de texto que gera problema com
consumidor, e não só com posicionamento.

## Objetivos

- Eliminar toda afirmação em primeira pessoa de produção, colheita, extração ou
  apiário próprio.
- Substituir por formulação verificável, ancorada em "origem rastreada e
  inspecionada".
- Impedir a reintrodução por verificação automática, junto com a trava do
  WhatsApp já existente.

## Não-objetivos

- Não mudar preços, layout, estrutura de páginas ou o modelo de venda.
- Não criar claims novos sobre fornecedores que não estejam no catálogo.
- Não alterar textos factualmente corretos sobre biologia das abelhas
  (`contato.js:122`) nem "produzido pela abelha nativa" (`mel-de-jatai.json`).

## Restrições

- A decisão `procedencia_produtos` fixa a formulação permitida: **origem
  rastreada e inspecionada**. Nada de "apiário próprio", "nossa colmeia",
  "colhemos", "produzimos".
- Atribuição explícita a terceiro nomeado (ex.: "pela marca Iraê em
  Itapetininga, SP") é mantida — descreve quem fabrica, não nós.
- "Pequenos produtores" e "certificado de qualidade" sem nome de quem certifica
  saem: são claims de terceiros não verificáveis.
- O campo `origin` continua exibindo região (é informação útil), sem "Apiário".

## Mapa das 29 alterações

### Páginas e componentes (12)

| Arquivo:linha | Hoje | Novo |
|---|---|---|
| `components/footer.js:19` | "…direto do apiário para você." | "…com origem rastreada e inspecionada." |
| `pages/produtos/[slug].js:220` | "Qualidade assegurada direto do apiário." | "Qualidade assegurada em cada lote, com origem rastreada e inspecionada." |
| `pages/index.js:27` (title) | "…Produtos Naturais do Apiário" | "…Produtos Naturais Selecionados" |
| `pages/index.js:28` (description) | "…direto do apiário em São Paulo…" | "…com origem rastreada e inspecionada…" |
| `pages/index.js:40` (badge) | "🐝 100% Natural · Direto do Apiário" | "🐝 100% Natural · Origem Rastreada" |
| `pages/index.js:99-100` | "cuidadosamente extraído e embalado… que só o apiário oferece" | "selecionado e inspecionado para preservar as propriedades naturais" |
| `pages/captura.js:10` | "novidades do apiário" | "novidades dos nossos produtos" |
| `pages/captura.js:25` | "novidades do apiário" | "novidades dos nossos produtos" |
| `pages/sobre.js:9` | "…direto do apiário para sua casa…" | "…com origem rastreada e inspecionada…" |
| `pages/sobre.js:20` | "trabalhar diretamente com a natureza… produtos da colmeia e do apiário" | "selecionamos produtos apícolas de entreposto parceiro, com origem rastreada e inspecionada" |
| `pages/sobre.js:31` | "dedicamo-nos a produzir… conectando apiários locais" | "selecionamos produtos apícolas de origem rastreada e inspecionada para consumidores que valorizam procedência" |
| `pages/sobre.js:41` | "…direto do apiário para a sua casa…" | "…com origem rastreada e inspecionada…" |

### Descrições e selos de produto (9)

| Arquivo | Campo | Novo |
|---|---|---|
| `mel-puro-silvestre.json` | description | sai "Direto do produtor" e "com certificado de qualidade" |
| `geleia-real.json` | description | "colhida diretamente das colmeias" → "com origem rastreada e inspecionada" |
| `balde-mel-5kg-silvestre.json` | subtitle | "Mel puro em balde de 5kg" |
| `balde-mel-5kg-silvestre.json` | description | sai "direto do apiário", "pequenos produtores", "certificado de qualidade" |
| `balde-mel-5kg-silvestre.json` | certifications | "Direto do produtor" → "Origem rastreada" |
| `mel-gourmet-silvestre.json` | description | sai "Direto do apiário" |
| `mel-cremoso-capixingui.json` | description | "direto do apiário em Itapetininga" → "em Itapetininga" (mantém a marca Iraê) |
| `mel-composto-mel-pimenta.json` | subtitle | "Blend Terroir do nosso próprio apiário" → "Blend Terroir" |
| `mel-composto-mel-pimenta.json` | description | "floradas especiais do nosso próprio apiário" → "floradas especiais selecionadas" |

### Campo `origin` (8)

`"Apiário em Itu, São Paulo, SP – Brasil"` → `"Itu, São Paulo, SP – Brasil"`;
`"Apiário em Itapetininga…"` → `"Itapetininga…"`;
`"Apiário próprio, cerrado brasileiro"` → `"Cerrado brasileiro"`;
`"Apiário próprio, cerrado cerrado brasileiro"` → `"Cerrado brasileiro"` (corrige
também a palavra duplicada).

## Nome antigo nos arquivos internos (6)

Não existe marca "Apiários & Cia" — a marca é **Mel, Própolis & Cia**. O nome
antigo sobrou em arquivos que a trava varre, e precisa sair antes de a regra
entrar, senão o build quebra:

| Arquivo:linha | Hoje | Novo |
|---|---|---|
| `.env.example:8` | `NEXT_PUBLIC_SITE_NAME=Apiários & Cia` | `NEXT_PUBLIC_SITE_NAME=Mel, Própolis & Cia` |
| `DOCUMENTATION.md:1` | "# Documentação Técnica - Site de Produtos Apiários & Cia" | "…Site de Produtos Mel, Própolis & Cia" |
| `DOCUMENTATION.md:222` | `Logo + nome "Apiários & Cia"` | `Logo + nome "Mel, Própolis & Cia"` |
| `GOOGLE_APPS_SCRIPT_SETUP.md:17` | `Nomeie: "Webhook Leads Apiários"` | `Nomeie: "Webhook Leads"` |
| `GOOGLE_SHEETS_INTEGRATION.md:12` | `Nomeie: **"Leads - Apiários & Cia"**` | `Nomeie: **"Leads - Mel, Própolis & Cia"**` |
| `GOOGLE_SHEETS_INTEGRATION.md:128` | `Nomeie: "Webhook Leads Apiários"` | `Nomeie: "Webhook Leads"` |

`NEXT_PUBLIC_SITE_NAME` não é lido pelo código (o nome vem de `components/SEO.js`),
mas o template entregaria o nome errado a quem copiasse o `.env.example`.

## Como a trava entra

Três regras novas em `RULES`, bloqueantes como a do telefone:

- `procedencia-apiario`: a palavra **"apiário"/"apiario"**, em qualquer caixa.
  Como não existe a marca "Apiários", não há exceção a preservar — e a forma
  plural também é acusada.
- `producao-propria`: "direto do produtor", "colhida diretamente"/"colhido
  diretamente", "extraído e embalado", "dedicamo-nos a produzir", "produzimos".
- `claim-sem-fonte`: "pequenos produtores", "certificado de qualidade".

A comparação passa a ser **sem diferenciar maiúsculas** — hoje "do Apiário" no
título da home escaparia de um padrão em minúsculas.

## O que fica a cargo de quem implementar

- Ajuste fino de concordância e pontuação nas frases reescritas.
- Se `nossos produtos` em `captura.js` é o melhor termo (alternativa: "novidades
  da casa").

## Atualização pós-aprovação (12/11/2026)

Três decisões tomadas durante a execução, todas registradas:

1. **Correções gramaticais nas linhas reescritas.** "Compra pela WhatsApp" →
   "Compra pelo WhatsApp" (`index.js`) e "Rico em vitaminas" → "Rica em
   vitaminas" (`geleia-real.json`), já que as duas frases estavam sendo
   tocadas. Nada além disso foi alterado.
2. **`benefits: "Produzido artesanalmente"` mantido** em
   `mel-cremoso-capixingui.json`: é voz passiva e a mesma descrição nomeia a
   marca Iraê.
3. **Sem exceção de marca na regra.** Como "Apiários & Cia" não existe, a regra
   acusa a palavra inteira. A consequência é que os 6 pontos de arquivos
   internos tiveram de ser corrigidos antes de a regra entrar — o que está
   documentado na seção anterior.

Resultado verificado: 29 pontos corrigidos, 17 testes passando, probe contra o
conteúdo anterior (`git show 36de2e7`) acusa 8 violações com exit 1, e
`npm run build` fecha em 17/17 páginas.

## Pós-revisão (12/11/2026)

A revisão final não encontrou Critical. Dois achados Important eram da mesma
classe do que já estava sendo removido — selos sem emissor nomeado:

- `pages/index.js:78` — badge "Selo de Qualidade" → "Qualidade Premium".
- `content/products/propolis-verde-30.json:20` — `["Orgânico", "Selo Verde",
  "Rastreável"]` → `["Puro", "Artesanal", "Rastreável"]`. "Orgânico" é claim
  regulado no Brasil e exige certificador nomeado.

Para que não voltem, `claim-sem-fonte` passou a cobrir também "selo de
qualidade", "selo verde" e "orgânico" (20 testes). O teste dessa regra foi
dividido por padrão, e entraram coberturas de "colhido diretamente" e dos
falsos positivos "apicultura"/"meliponicultura".
