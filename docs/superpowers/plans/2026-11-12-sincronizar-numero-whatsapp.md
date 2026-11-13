# Sincronizar repositório e travar o número do WhatsApp — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o repositório refletir o que está publicado no site e impedir que o número antigo do WhatsApp volte a ser publicado.

**Architecture:** Duas entregas independentes. Primeiro o commit que alinha repositório e produção (sem código novo). Depois um verificador de fatos em Node puro, sem dependências, ligado ao `prebuild` do Next para falhar o build antes de publicar conteúdo proibido.

**Tech Stack:** Next.js 14.2.5, Node 26 (`node:test` nativo), npm 12.

**Spec:** `docs/superpowers/specs/2026-11-12-sincronizar-numero-whatsapp-design.md`

## Global Constraints

- Sem dependências npm novas — Node 26 e `node:test` nativos.
- Não alterar páginas, componentes, copy ou layout.
- Não alterar o fluxo de deploy (`vercel --prod` continua).
- Número oficial: `(18) 99612-8381` / `5518996128381`.
- Números proibidos: `99713-0824`, `997130824`, `5518997130824`.
- Não commitar `.env*` (já coberto pelo `.gitignore`).

## Review Focus

- **Raiz de varredura incompleta:** se a varredura não incluir `components/` e `pages/`, onde estão as 14 ocorrências, ela aprova um repositório que ainda publica o número errado. Teste: as raízes padrão incluem ambos os diretórios.
- **Diretório de trabalho:** rodar de outro cwd (a Vercel roda o build do root do repo) não pode alterar o resultado. Teste: invocar a CLI a partir de um cwd diferente.
- **Arquivos binários em `public/`:** imagens não podem quebrar nem travar a varredura. Teste: fixture binária ignorada.
- **Código de saída:** com violação a CLI precisa sair diferente de zero, senão o `prebuild` não falha o build. Teste: exit code.
- **Cobertura do `prebuild` na Vercel:** o `buildCommand` é `next build`, que não dispara `prebuild`. O plano não pode prometer proteção no build remoto — a proteção real é local (CLI).

---

### Task 1: Alinhar o repositório com produção

**Files:**
- Modify: `components/footer.js`, `components/header.js`, `pages/contato.js`, `pages/index.js`, `pages/privacidade.js`, `pages/produtos/[slug].js` (já modificados no working tree)

**Interfaces:**
- Consumes: nada.
- Produces: `master` idêntico a `origin/master` e ao conteúdo publicado.

- [ ] **Step 1: Confirmar que o diff é só a troca do número**

Run: `git diff --stat && git diff | grep -c "99713"`
Expected: 6 arquivos, 14 inserções e 14 remoções; o grep conta as linhas removidas com o número antigo.

- [ ] **Step 2: Confirmar que nenhuma ocorrência do número antigo sobrou**

Run: `grep -rn "99713" components pages data public`
Expected: nenhuma saída (exit 1 do grep).

- [ ] **Step 3: Commitar**

```bash
git add components/footer.js components/header.js pages/contato.js pages/index.js pages/privacidade.js "pages/produtos/[slug].js"
git commit -m "fix: sincronizar numero do WhatsApp (18) 99612-8381 com producao" -m "A troca do chip foi publicada com 'vercel --prod' em 15/10/2026 e ficou quase um mes fora do Git: o repositorio ainda carregava o numero antigo (18) 99713-0824 e um deploy a partir dele reverteria o site. 14 ocorrencias em 6 arquivos (11 links e 3 textos)."
```

- [ ] **Step 4: Enviar e verificar sincronia**

Run: `git push origin master && git status -sb && git diff origin/master --stat`
Expected: push fast-forward; `## master...origin/master` sem `ahead`/`behind`; diff vazio.

### Task 2: Verificador de fatos + `prebuild`

**Files:**
- Create: `scripts/check-fatos.mjs`
- Create: `test/check-fatos.test.mjs`
- Modify: `package.json` (scripts `test`, `check:facts`, `prebuild`)

**Interfaces:**
- Consumes: nada.
- Produces: `findViolations({ roots, rules })` → `Array<{ file: string, line: number, text: string, rule: string }>`; `DEFAULT_ROOTS` (array de caminhos absolutos); `RULES` (array de `{ id, patterns, message }`); CLI que imprime e define `process.exitCode = 1` quando há violações.

- [ ] **Step 1: Escrever o teste que falha**

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findViolations, DEFAULT_ROOTS, RULES } from '../scripts/check-fatos.mjs'

function fixture(files) {
  const dir = mkdtempSync(join(tmpdir(), 'check-fatos-'))
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(dir, rel)
    mkdirSync(join(abs, '..'), { recursive: true })
    writeFileSync(abs, content)
  }
  return dir
}

test('encontra o numero antigo e informa arquivo e linha', () => {
  const dir = fixture({ 'pages/a.js': 'ok\n<a href="https://wa.me/5518997130824">x</a>\n' })
  const v = findViolations({ roots: [dir] })
  assert.equal(v.length, 1)
  assert.equal(v[0].line, 2)
  assert.ok(v[0].file.endsWith('pages/a.js'))
})

test('aceita o numero novo', () => {
  const dir = fixture({ 'pages/a.js': 'wa.me/5518996128381 (18) 99612-8381\n' })
  assert.deepEqual(findViolations({ roots: [dir] }), [])
})

test('ignora binarios e node_modules', () => {
  const dir = fixture({ 'public/foto.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xff, 0xfe]), 'node_modules/x/i.js': '997130824' })
  assert.deepEqual(findViolations({ roots: [dir] }), [])
})

test('raizes padrao incluem components e pages', () => {
  assert.ok(DEFAULT_ROOTS.some(r => r.endsWith('/components')))
  assert.ok(DEFAULT_ROOTS.some(r => r.endsWith('/pages')))
})

test('CLI sai com codigo 1 quando encontra violacao', async () => {
  const dir = fixture({ 'pages/a.js': '99713-0824' })
  const { spawnSync } = await import('node:child_process')
  const r = spawnSync(process.execPath, [new URL('../scripts/check-fatos.mjs', import.meta.url).pathname, dir], { encoding: 'utf8' })
  assert.equal(r.status, 1)
  assert.match(r.stdout, /99713-0824/)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test test/`
Expected: FAIL — `Cannot find module '../scripts/check-fatos.mjs'`.

- [ ] **Step 3: Implementar `scripts/check-fatos.mjs`**

Exportar `RULES` com `id: 'whatsapp-antigo'` e os três padrões; `DEFAULT_ROOTS` calculados a partir de `import.meta.url` (não do cwd) para `components`, `pages`, `data`, `public`; `findViolations` varre recursivamente apenas extensões de texto (`.js .jsx .mjs .cjs .json .md .html .css .txt .svg`) pulando `node_modules`, `.next`, `.vercel`, `.git` e lendo como `utf8`; a CLI aceita raízes por argumento ou usa `DEFAULT_ROOTS`, imprime `✔ nenhuma ocorrência` quando limpo e a lista `arquivo:linha — texto` quando há violação, definindo `process.exitCode = 1`.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test test/`
Expected: PASS nos 5 testes.

- [ ] **Step 5: Ligar no `package.json`**

Adicionar `"test": "node --test test/"`, `"check:facts": "node scripts/check-fatos.mjs"` e `"prebuild": "npm run check:facts"`.

- [ ] **Step 6: Verificar a proteção de ponta a ponta**

Run: `npm run check:facts`
Expected: `✔ nenhuma ocorrência` e exit 0.
Run: `printf '99713-0824\n' > /tmp/cf-test.js && node scripts/check-fatos.mjs /tmp/cf-test.js; echo "exit=$?"`
Expected: exit=1 com a linha apontada.
Run: `cd /tmp && node "/home/erick/.openclaw/workspace/products-site/scripts/check-fatos.mjs"; echo "exit=$?"`
Expected: mesmo resultado de rodar da raiz do repo (prova que as raízes não dependem do cwd).

- [ ] **Step 7: Commitar**

```bash
git add scripts/check-fatos.mjs test/check-fatos.test.mjs package.json
git commit -m "feat: verificador de fatos no prebuild (bloqueia numero antigo do WhatsApp)"
```

### Task 3: Atualizar a memória do projeto

**Files:**
- Modify: `~/.config/opencode/memory/MEL/decisoes.json`, `~/.config/opencode/memory/MEL/historico.json`

**Interfaces:**
- Consumes: resultado das Tasks 1 e 2.
- Produces: decisão `deploy_vercel_cli` atualizada e registro no histórico.

- [ ] **Step 1: Fazer backup e atualizar a decisão**

Copiar `decisoes.json` para `decisoes.json.backup.<epoch>`; em `deploy_vercel_cli`, acrescentar ao `valor`/`contexto` que, desde 12/11/2026, o repositório acompanha produção (commit `fix: sincronizar numero...`) e que `npm run check:facts` roda no `prebuild`, bloqueando o número antigo; notar que `prebuild` não roda no build remoto da Vercel (`buildCommand: next build`).

- [ ] **Step 2: Registrar no histórico e validar o JSON**

Acrescentar entrada `2026-11-12 <hora>` com ação "Sincronização do repo + trava de fatos" e detalhes objetivos; validar com `python3 -c "import json;json.load(open(...))"` em cada arquivo alterado.
