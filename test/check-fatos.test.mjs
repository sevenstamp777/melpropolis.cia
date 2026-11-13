import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { findViolations, DEFAULT_ROOTS } from '../scripts/check-fatos.mjs'

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
  const dir = fixture({
    'public/foto.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xff, 0xfe]),
    'public/dump.svg': Buffer.from('99713-0824\u0000resto', 'utf8'),
    'node_modules/x/i.js': '997130824',
  })
  assert.deepEqual(findViolations({ roots: [dir] }), [])
})

test('raizes padrao incluem components e pages', () => {
  assert.ok(DEFAULT_ROOTS.some((r) => r.endsWith('/components')))
  assert.ok(DEFAULT_ROOTS.some((r) => r.endsWith('/pages')))
})

test('raizes padrao cobrem content e o .env.example', () => {
  assert.ok(DEFAULT_ROOTS.some((r) => r.endsWith('/content')))
  assert.ok(DEFAULT_ROOTS.some((r) => r.endsWith('.env.example')))
})

test('le o template .env.example mesmo com extensao .example', () => {
  const dir = fixture({ '.env.example': 'NEXT_PUBLIC_WHATSAPP=18997130824\n' })
  const v = findViolations({ roots: [dir] })
  assert.equal(v.length, 1)
  assert.ok(v[0].file.endsWith('.env.example'))
})

test('CLI funciona quando invocada por symlink', () => {
  const dir = fixture({ 'pages/a.js': '99713-0824' })
  const link = join(mkdtempSync(join(tmpdir(), 'check-fatos-link-')), 'link.mjs')
  symlinkSync(fileURLToPath(new URL('../scripts/check-fatos.mjs', import.meta.url)), link)
  const r = spawnSync(process.execPath, [link, dir], { encoding: 'utf8' })
  assert.equal(r.status, 1)
  assert.match(r.stdout, /99713-0824/)
})

test('CLI limpa sai com 0 e independe do cwd', () => {
  const dir = fixture({ 'pages/a.js': 'conteudo limpo' })
  const cli = fileURLToPath(new URL('../scripts/check-fatos.mjs', import.meta.url))
  const r = spawnSync(process.execPath, [cli, dir], { cwd: tmpdir(), encoding: 'utf8' })
  assert.equal(r.status, 0)
  assert.match(r.stdout, /nenhuma/)
})

test('raiz inexistente nao quebra a varredura', () => {
  const dir = fixture({ 'pages/a.js': '99713-0824' })
  const v = findViolations({ roots: [join(dir, 'nao-existe'), join(dir, 'pages')] })
  assert.equal(v.length, 1)
})

test('CLI sai com codigo 1 quando encontra violacao', () => {
  const dir = fixture({ 'pages/a.js': '99713-0824' })
  const cli = fileURLToPath(new URL('../scripts/check-fatos.mjs', import.meta.url))
  const r = spawnSync(process.execPath, [cli, dir], { encoding: 'utf8' })
  assert.equal(r.status, 1)
  assert.match(r.stdout, /99713-0824/)
})

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
