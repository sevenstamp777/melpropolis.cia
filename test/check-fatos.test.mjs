import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
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
    'node_modules/x/i.js': '997130824',
  })
  assert.deepEqual(findViolations({ roots: [dir] }), [])
})

test('raizes padrao incluem components e pages', () => {
  assert.ok(DEFAULT_ROOTS.some((r) => r.endsWith('/components')))
  assert.ok(DEFAULT_ROOTS.some((r) => r.endsWith('/pages')))
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
