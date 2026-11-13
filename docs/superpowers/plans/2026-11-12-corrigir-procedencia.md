# Corrigir afirmações de procedência do site — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remover do site toda afirmação de que o produto vem de apiário próprio ou de produção própria, substituindo pela formulação autorizada ("origem rastreada e inspecionada"), e impedir a reintrodução por verificação automática.

**Architecture:** Duas camadas. Primeiro a copy — 12 pontos em páginas/componentes e 17 em JSONs de produto (9 descrições/selos + 8 campos `origin`) —, verificada por contagem de ocorrências proibidas. Depois a trava: três regras novas no verificador existente e a comparação case-insensitive que faltava.

**Tech Stack:** Next.js 14.2.5, Node 26 (`node:test` nativo), npm 12.

**Spec:** `docs/superpowers/specs/2026-11-12-corrigir-procedencia-design.md`

## Global Constraints

- Formulação permitida: **"origem rastreada e inspecionada"**. Proibido: "apiário próprio", "nosso próprio apiário", "nossa colmeia", "colhemos", "produzimos".
- Não alterar preços, layout, estrutura de páginas ou modelo de venda.
- Preservar `pages/contato.js:122` (biologia: resina que protege a colmeia) e `content/products/mel-de-jatai.json` ("produzido pela **abelha** nativa") — ambos factualmente corretos.
- Manter a atribuição a terceiro nomeado: "pela marca Iraê em Itapetininga, SP".
- Remover "pequenos produtores" e "certificado de qualidade" (claims de terceiros sem fonte).
- A marca é **Mel, Própolis & Cia**. "Apiários & Cia" não existe: é nome antigo em arquivos internos.
- Números oficiais do WhatsApp: `(18) 99612-8381` / `5518996128381`. Não tocar.
- Preservar o travessão en dash (–, U+2013) nos campos `origin`.
- Sem dependências npm novas.

## Review Focus

- **Regressão em capitalização.** "Direto do Apiário" no badge escaparia de um padrão em minúsculas. Teste: a regra detecta a forma capitalizada.
- **Acentuação.** "Apiario" sem acento é erro de digitação provável. Teste: a regra pega com e sem acento.
- **Nome antigo nos arquivos internos.** `.env.example` e três `.md` da raiz dizem "Apiários & Cia"; como a regra acusa a palavra inteira (inclusive plural), esses 6 pontos precisam sair antes de a regra entrar, senão o build quebra. Teste: `grep` limpo nos arquivos da raiz.
- **Falso positivo em biologia.** "Coletada pelas abelhas para proteger a colmeia" e "produzido pela abelha nativa" são verdadeiros. Teste: texto biológico passa limpo.
- **Integridade dos JSONs.** As 8 trocas de `origin` mexem em strings com acento e en dash; um erro quebra o `getStaticProps`. Teste: build prerenderiza 17/17.

---

### Task 1: Copy em páginas e componentes (12 pontos)

**Files:**
- Modify: `components/footer.js:19-20`
- Modify: `pages/produtos/[slug].js:220`
- Modify: `pages/index.js:27,28,40,99-100`
- Modify: `pages/captura.js:10,25`
- Modify: `pages/sobre.js:9,20,31,41`

**Interfaces:**
- Consumes: nada.
- Produces: nenhuma página menciona "apiário" como procedência nem afirma extração/produção em primeira pessoa. Base para a Task 3.

- [ ] **Step 1: Registrar o estado atual (deve acusar)**

Run: `grep -rniE "api[aá]rio|extra[ií]do e embalado|dedicamo-nos a produzir" components pages | wc -l`
Expected: `13` (footer 1, captura 2, index 5, produtos/[slug] 1, sobre 4).

- [ ] **Step 2: Substituir cada ocorrência pelo texto exato abaixo**

`components/footer.js` — substituir as duas linhas do parágrafo:

```jsx
              Produtos apícolas 100% naturais, direto do apiário para você. 
              Própolis verde, mel puro e derivados com qualidade premium.
```
por (atenção: o original tem espaço no fim da primeira linha; o novo não):

```jsx
              Produtos apícolas 100% naturais, com origem rastreada e inspecionada.
              Própolis verde, mel puro e derivados com qualidade premium.
```

`pages/produtos/[slug].js:220` — de
`Qualidade assegurada direto do apiário. Fale conosco pelo WhatsApp e receba orientação personalizada.`
para
`Qualidade assegurada em cada lote, com origem rastreada e inspecionada. Fale conosco pelo WhatsApp e receba orientação personalizada.`

`pages/index.js:27` — de `title="Mel Puro, Própolis e Produtos Naturais do Apiário"` para `title="Mel Puro, Própolis e Produtos Naturais Selecionados"`.

`pages/index.js:28` — de
`Mel de abelha puro, própolis, geleia real e produtos naturais direto do apiário em São Paulo. Qualidade premium, 100% natural e rastreável. Compra pela WhatsApp com entrega em todo o Brasil.`
para
`Mel de abelha puro, própolis, geleia real e produtos naturais com origem rastreada e inspecionada. Qualidade premium, 100% natural e rastreável. Compra pelo WhatsApp com entrega em todo o Brasil.`

`pages/index.js:40` — de `🐝 100% Natural · Direto do Apiário` para `🐝 100% Natural · Origem Rastreada`.

`pages/index.js:99-100` — as duas linhas (a primeira termina com espaço após "todas"):

```
              Cada produto é cuidadosamente extraído e embalado para preservar todas 
              as propriedades naturais que só o apiário oferece.
```
passam a ser uma única linha:

```
              Cada produto é selecionado e inspecionado para preservar as propriedades naturais de cada florada.
```

`pages/captura.js:10` e `:25` — trocar **as duas ocorrências** de `novidades do apiário` por `novidades dos nossos produtos`.

`pages/sobre.js:9` — de
`Conheça a Mel, Própolis & Cia: mel e produtos apícolas 100% naturais, direto do apiário para sua casa, com qualidade premium, rastreabilidade total e respeito às abelhas.`
para
`Conheça a Mel, Própolis & Cia: mel e produtos apícolas 100% naturais, com origem rastreada e inspecionada, qualidade premium e respeito às abelhas.`

`pages/sobre.js:20` — de
`Na Mel, Própolis & Cia, temos orgulho de trabalhar diretamente com a natureza. Fundada em 2023 por entusiastas da apicultura, nossa missão é trazer para você os benefícios puros dos produtos da colmeia e do apiário, com qualidade excepcional e procedência transparente.`
para
`Na Mel, Própolis & Cia, fundada em 2023 por entusiastas da apicultura, selecionamos produtos apícolas de entreposto parceiro, com origem rastreada e inspecionada, para levar até você os benefícios puros dos produtos das abelhas.`

`pages/sobre.js:31` — de
`Tudo começou quando nosso fundador, Erick Garcia, descobriu os benefícios da própolis verde 30% para a saúde respiratória. Desde então, dedicamo-nos a produzir produtos apícolas de alta qualidade, conectando apiários locais com consumidores conscientes.`
para
`Tudo começou quando nosso fundador, Erick Garcia, descobriu os benefícios da própolis verde 30% para a saúde respiratória. Desde então, selecionamos produtos apícolas de origem rastreada e inspecionada para consumidores que valorizam procedência.`

`pages/sobre.js:41` — de
`Fornecer produtos apícolas 100% naturais, direto do apiário para a sua casa, com qualidade premium, rastreabilidade total e respeito ao meio ambiente e às abelhas.`
para
`Fornecer produtos apícolas 100% naturais, com origem rastreada e inspecionada, qualidade premium e respeito ao meio ambiente e às abelhas.`

- [ ] **Step 3: Verificar que as páginas estão limpas**

Run: `grep -rniE "api[aá]rio|extra[ií]do e embalado|dedicamo-nos a produzir|direto do produtor" components pages`
Expected: nenhuma saída (exit 1).

- [ ] **Step 4: Verificar que a copy autorizada está presente**

Run: `grep -rn "origem rastreada e inspecionada" components pages | wc -l`
Expected: `6` (footer 1, produtos/[slug] 1, index 1, sobre 3).

- [ ] **Step 5: Commit**

```bash
git add components/footer.js "pages/produtos/[slug].js" pages/index.js pages/captura.js pages/sobre.js
git commit -m "fix(copy): remover afirmacao de apiario proprio em paginas e componentes"
```

### Task 2: Copy nos JSONs de produto (9 descrições/selos + 8 origins)

**Files:**
- Modify: `content/products/mel-puro-silvestre.json`
- Modify: `content/products/geleia-real.json`
- Modify: `content/products/balde-mel-5kg-silvestre.json`
- Modify: `content/products/mel-gourmet-silvestre.json`
- Modify: `content/products/mel-cremoso-capixingui.json`
- Modify: `content/products/mel-composto-mel-pimenta.json`
- Modify: `content/products/mel-cacau-avela-irae.json`
- Modify: `content/products/propolis-verde-30.json`

**Interfaces:**
- Consumes: nada.
- Produces: 8 JSONs válidos, sem "Apiário"/"nosso próprio apiário"/"direto do produtor"; `mel-de-jatai.json` intocado.

- [ ] **Step 1: Registrar o estado atual (deve acusar)**

Run: `grep -rliE "api[aá]rio|direto do produtor|colhida diretamente|nosso próprio apiário" content/products | wc -l`
Expected: `8`

- [ ] **Step 2: Substituir os campos exatos**

| Arquivo | Campo | De | Para |
|---|---|---|---|
| `mel-puro-silvestre.json` | `description` | termina em `Direto do produtor, produzido artesanalmente com certificado de qualidade.` | termina em `Origem rastreada e inspecionada.` |
| `geleia-real.json` | `description` | `Geleia real fresca, colhida diretamente das colmeias. Rico em` | `Geleia real fresca, com origem rastreada e inspecionada. Rica em` |
| `balde-mel-5kg-silvestre.json` | `subtitle` | `Mel puro em balde, direto do produtor` | `Mel puro em balde de 5kg` |
| `balde-mel-5kg-silvestre.json` | `description` | `Mel 100% puro, direto do apiário, produzido de forma artesanal por pequenos produtores com certificado de qualidade.` | `Mel 100% puro, com origem rastreada e inspecionada.` |
| `balde-mel-5kg-silvestre.json` | `certifications` | `["Puro", "Artesanal", "Direto do produtor"]` | `["Puro", "Artesanal", "Origem rastreada"]` |
| `mel-gourmet-silvestre.json` | `description` | `Direto do apiário, embalado em pote de vidro gourmet.` | `Em pote de vidro gourmet.` |
| `mel-cremoso-capixingui.json` | `description` | `Produzido artesanalmente pela marca Iraê, direto do apiário em Itapetininga, SP.` | `Produzido artesanalmente pela marca Iraê, em Itapetininga, SP.` |
| `mel-composto-mel-pimenta.json` | `subtitle` | `Blend Terroir do nosso próprio apiário` | `Blend Terroir` |
| `mel-composto-mel-pimenta.json` | `description` | `Microlotes de floradas especiais do nosso próprio apiário, que trazem` | `Microlotes de floradas especiais selecionadas, que trazem` |

Não alterar `mel-cremoso-capixingui.json` → `benefits` (`"Produzido artesanalmente"`): é passivo e a descrição atribui à marca Iraê.

- [ ] **Step 3: Substituir os 8 campos `origin`**

| Arquivo | De | Para |
|---|---|---|
| `mel-puro-silvestre.json` | `Apiário em Itu, São Paulo, SP – Brasil` | `Itu, São Paulo, SP – Brasil` |
| `balde-mel-5kg-silvestre.json` | `Apiário em Itu, São Paulo, SP – Brasil` | `Itu, São Paulo, SP – Brasil` |
| `mel-gourmet-silvestre.json` | `Apiário em Itu, São Paulo, SP – Brasil` | `Itu, São Paulo, SP – Brasil` |
| `mel-composto-mel-pimenta.json` | `Apiário em Itu, São Paulo, SP – Brasil` | `Itu, São Paulo, SP – Brasil` |
| `mel-cremoso-capixingui.json` | `Apiário em Itapetininga, São Paulo, SP – Brasil` | `Itapetininga, São Paulo, SP – Brasil` |
| `mel-cacau-avela-irae.json` | `Apiário em Itapetininga, SP – Cacau do Maranhão` | `Itapetininga, SP – Cacau do Maranhão` |
| `geleia-real.json` | `Apiário próprio, cerrado brasileiro` | `Cerrado brasileiro` |
| `propolis-verde-30.json` | `Apiário próprio, cerrado cerrado brasileiro` | `Cerrado brasileiro` |

Recriar as strings com o travessão en dash (`–`), não com hífen.

- [ ] **Step 4: Verificar conteúdo**

Run: `grep -rniE "api[aá]rio|direto do produtor|colhida diretamente|nosso próprio apiário|pequenos produtores|certificado de qualidade" content/products`
Expected: nenhuma saída (exit 1).

- [ ] **Step 5: Verificar que os 11 JSONs continuam válidos e com o en dash**

Run: `node -e "const fs=require('fs'),p='content/products/';for(const f of fs.readdirSync(p)){JSON.parse(fs.readFileSync(p+f));}console.log('11 JSONs validos')"`
Expected: `11 JSONs validos`

Run: `grep -c "–" content/products/*.json | grep -v ":0" | wc -l`
Expected: `6` (balde, cacau, composto, cremoso, gourmet, puro — um en dash cada).

- [ ] **Step 6: Verificar que o build continua prerenderizando tudo**

Run: `npm run build`
Expected: exit 0; `✓ Generating static pages (17/17)`.

- [ ] **Step 7: Commit**

```bash
git add content/products
git commit -m "fix(copy): remover procedencia de apiario proprio nas descricoes de produto"
```

### Task 3: Nome antigo nos arquivos internos + trava com três regras

**Files:**
- Modify: `.env.example:8`
- Modify: `DOCUMENTATION.md:1,222`
- Modify: `GOOGLE_APPS_SCRIPT_SETUP.md:17`
- Modify: `GOOGLE_SHEETS_INTEGRATION.md:12,128`
- Modify: `scripts/check-fatos.mjs:12-18` (`RULES`), `:47-51` (`ruleRegex`)
- Test: `test/check-fatos.test.mjs`

**Interfaces:**
- Consumes: `findViolations({ roots, rules })`, `RULES`, `DEFAULT_ROOTS` — já existentes e cobertos por 10 testes.
- Produces: `RULES` com 4 entradas (`whatsapp-antigo`, `procedencia-apiario`, `producao-propria`, `claim-sem-fonte`); `ruleRegex` compila sempre com a flag `i`.

- [ ] **Step 1: Remover o nome antigo dos arquivos que a trava varre**

| Arquivo:linha | De | Para |
|---|---|---|
| `.env.example:8` | `NEXT_PUBLIC_SITE_NAME=Apiários & Cia` | `NEXT_PUBLIC_SITE_NAME=Mel, Própolis & Cia` |
| `DOCUMENTATION.md:1` | `# Documentação Técnica - Site de Produtos Apiários & Cia` | `# Documentação Técnica - Site de Produtos Mel, Própolis & Cia` |
| `DOCUMENTATION.md:222` | `- Logo + nome "Apiários & Cia"` | `- Logo + nome "Mel, Própolis & Cia"` |
| `GOOGLE_APPS_SCRIPT_SETUP.md:17` | `Nomeie: "Webhook Leads Apiários"` | `Nomeie: "Webhook Leads"` |
| `GOOGLE_SHEETS_INTEGRATION.md:12` | `Nomeie: **"Leads - Apiários & Cia"**` | `Nomeie: **"Leads - Mel, Própolis & Cia"**` |
| `GOOGLE_SHEETS_INTEGRATION.md:128` | `Nomeie: "Webhook Leads Apiários"` | `Nomeie: "Webhook Leads"` |

- [ ] **Step 2: Confirmar que os arquivos da raiz estão limpos**

Run: `grep -niE "api[aá]rio" *.md *.json *.js .env.example`
Expected: nenhuma saída (exit 1).

- [ ] **Step 3: Escrever os testes que falham**

Acrescentar ao fim de `test/check-fatos.test.mjs`:

```js
test('detecta direto do apiario em qualquer caixa', () => {
  const dir = fixture({ 'pages/a.js': '🐝 100% Natural · Direto do Apiário\n' })
  const v = findViolations({ roots: [dir] })
  assert.equal(v.length, 1)
  assert.equal(v[0].rule, 'procedencia-apiario')
})

test('detecta apiario sem acento e em maiusculas', () => {
  const dir = fixture({ 'content/p.json': '{"origin":"APIARIO em Itu"}\n' })
  const v = findViolations({ roots: [dir] })
  assert.equal(v.length, 1)
  assert.equal(v[0].rule, 'procedencia-apiario')
})

test('detecta o nome antigo Apiarios', () => {
  const dir = fixture({ 'DOCUMENTATION.md': '# Site de Produtos Apiários & Cia\n' })
  const v = findViolations({ roots: [dir] })
  assert.equal(v.length, 1)
  assert.equal(v[0].rule, 'procedencia-apiario')
})

test('nao acusa texto de biologia sobre abelhas', () => {
  const dir = fixture({
    'pages/b.js': 'Própolis é uma resina coletada pelas abelhas para proteger a colmeia.\n',
    'content/j.json': '{"description":"produzido pela abelha nativa brasileira sem ferrão"}\n',
  })
  assert.deepEqual(findViolations({ roots: [dir] }), [])
})

test('detecta afirmacoes em primeira pessoa de producao', () => {
  const casos = [
    'Desde então, dedicamo-nos a produzir produtos apícolas.',
    'Cada produto é cuidadosamente extraído e embalado.',
    'Mel puro em balde, direto do produtor',
    'Geleia real fresca, colhida diretamente das colmeias.',
    'Nós produzimos mel.',
  ]
  for (const texto of casos) {
    const dir = fixture({ 'pages/a.js': `${texto}\n` })
    const v = findViolations({ roots: [dir] })
    assert.equal(v.length, 1, `deveria acusar: ${texto}`)
    assert.equal(v[0].rule, 'producao-propria')
  }
})

test('detecta claims de terceiros sem fonte', () => {
  const dir = fixture({ 'content/p.json': '{"description":"por pequenos produtores com certificado de qualidade"}\n' })
  const v = findViolations({ roots: [dir] })
  assert.equal(v.length, 1)
  assert.equal(v[0].rule, 'claim-sem-fonte')
})

test('aceita a formulacao aprovada', () => {
  const dir = fixture({ 'pages/a.js': 'Produtos apícolas 100% naturais, com origem rastreada e inspecionada.\n' })
  assert.deepEqual(findViolations({ roots: [dir] }), [])
})
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `npm test`
Expected: FAIL nos 7 testes novos (as regras não existem); os 10 antigos continuam passando.

- [ ] **Step 5: Implementar as três regras**

Em `RULES`, acrescentar após `whatsapp-antigo`:

```js
  {
    id: 'procedencia-apiario',
    patterns: ['apiário', 'apiario'],
    message: 'Menção a apiário como procedência (ou nome antigo do site). Use "origem rastreada e inspecionada" e a marca "Mel, Própolis & Cia".',
  },
  {
    id: 'producao-propria',
    patterns: [
      'direto do produtor',
      'colhida diretamente',
      'colhido diretamente',
      'extraído e embalado',
      'dedicamo-nos a produzir',
      'produzimos',
    ],
    message: 'Afirmação de produção/colheita própria. Use "origem rastreada e inspecionada".',
  },
  {
    id: 'claim-sem-fonte',
    patterns: ['pequenos produtores', 'certificado de qualidade'],
    message: 'Claim de terceiro sem fonte nomeada. Remova ou nomeie quem certifica/produz.',
  },
```

Em `ruleRegex`, acrescentar a flag `i` — é a única mudança necessária:

```js
  return new RegExp(escaped.join('|'), 'i')
```

Manter intactos `findViolations`, `rootLevelTextFiles`, a CLI e o `process.exitCode = 1`.

- [ ] **Step 6: Rodar e ver passar**

Run: `npm test`
Expected: PASS — 17 testes, 0 falhas.

- [ ] **Step 7: Provar que a trava pega o texto real de antes**

```bash
mkdir -p /tmp/procedencia-probe && cd /home/erick/.openclaw/workspace/products-site && \
git show 36de2e7:pages/index.js > /tmp/procedencia-probe/index.js && \
git show 36de2e7:content/products/mel-composto-mel-pimenta.json > /tmp/procedencia-probe/composto.json && \
node scripts/check-fatos.mjs /tmp/procedencia-probe; echo "exit=$?"
```
Expected: exit=1, listando `index.js` (title, description, badge, "extraído e embalado") e `composto.json` ("nosso próprio apiário").

- [ ] **Step 8: Confirmar que o repositório passa limpo**

Run: `npm run check:facts`
Expected: `✔ nenhuma ocorrência de fato proibido`, exit 0.

- [ ] **Step 9: Commit**

```bash
git add .env.example DOCUMENTATION.md GOOGLE_APPS_SCRIPT_SETUP.md GOOGLE_SHEETS_INTEGRATION.md scripts/check-fatos.mjs test/check-fatos.test.mjs
git commit -m "feat(check-fatos): travar apiario, producao propria e claims sem fonte"
```

### Task 4: Registrar na memória do projeto e atualizar o design

**Files:**
- Modify: `~/.config/opencode/memory/MEL/decisoes.json`, `historico.json`
- Modify: `docs/superpowers/specs/2026-11-12-corrigir-procedencia-design.md`

**Interfaces:**
- Consumes: as Tasks 1-3 concluídas (hashes dos commits).
- Produces: decisão `procedencia_produtos` atualizada com o estado verificado; design com a seção de desvios.

- [ ] **Step 1: Fazer backup antes de escrever**

Run: `cd ~/.config/opencode/memory/MEL && cp decisoes.json decisoes.json.backup.$(date +%s) && cp historico.json historico.json.backup.$(date +%s)`

- [ ] **Step 2: Atualizar a decisão `procedencia_produtos` e o histórico**

Acrescentar ao `contexto` da decisão: as 29 correções, a formulação usada, e que a proteção é automática (`check-fatos` com 3 regras novas, 17 testes). Nova entrada em `historico.json` com data, ação, hashes e resultado.

- [ ] **Step 3: Validar os JSONs**

Run: `cd ~/.config/opencode/memory/MEL && for f in decisoes.json historico.json; do python3 -c "import json;print('$f',len(json.load(open('$f'))))"; done`
Expected: os dois abrem sem exceção.

- [ ] **Step 4: Registrar os desvios no design**

Acrescentar ao design a seção "Atualização pós-aprovação" com: (a) a descoberta de que "Apiários & Cia" não é marca, e os 6 arquivos internos corrigidos; (b) a terceira regra `claim-sem-fonte`; (c) as correções gramaticais feitas nas linhas reescritas ("pela WhatsApp" → "pelo WhatsApp", "Rico" → "Rica").

- [ ] **Step 5: Commit**

```bash
cd /home/erick/.openclaw/workspace/products-site && git add docs/superpowers/specs && git commit -m "docs: registrar desvios do design da correcao de procedencia"
```
