#!/usr/bin/env node
// Verificador de fatos do site: falha quando um fato proibido aparece no conteúdo.
// Sem dependências — roda em qualquer Node recente.

import { readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { basename, dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

export const RULES = [
  {
    id: 'whatsapp-antigo',
    patterns: ['99713-0824', '997130824', '5518997130824'],
    message: 'Número antigo do WhatsApp. O oficial é (18) 99612-8381 (5518996128381).',
  },
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
    patterns: ['pequenos produtores', 'certificado de qualidade', 'selo de qualidade', 'selo verde', 'orgânico'],
    message: 'Claim de terceiro sem fonte nomeada. Remova ou nomeie quem certifica/produz.',
  },
]

const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
  '.json', '.md', '.mdx', '.html', '.css', '.txt', '.svg',
])

const SKIP_DIRECTORIES = new Set(['node_modules', '.next', '.vercel', '.git'])

export const DEFAULT_ROOTS = [
  ...['components', 'pages', 'content', 'public', 'data'].map((dir) => join(REPO_ROOT, dir)),
  ...rootLevelTextFiles(),
]

// Arquivos soltos na raiz também são publicados/podem orientar o build
// (README, vercel.json, configurações e o template de variáveis).
function rootLevelTextFiles() {
  const out = []
  let entries = []
  try {
    entries = readdirSync(REPO_ROOT, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const name = entry.name
    if (name.startsWith('.env') && name !== '.env.example') continue // .env.local e afins não vão para o repo
    if (name === '.env.example' || TEXT_EXTENSIONS.has(extname(name).toLowerCase())) {
      out.push(join(REPO_ROOT, name))
    }
  }
  return out
}

function collectFiles(dir, out) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue
      collectFiles(abs, out)
    } else if (entry.isFile()) {
      out.push(abs)
    }
  }
  return out
}

function ruleRegex(rule) {
  const escaped = rule.patterns.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(escaped.join('|'), 'i')
}

// Devolve [{ file, line, text, rule }] para cada linha que contenha um padrão proibido.
export function findViolations({ roots = DEFAULT_ROOTS, rules = RULES } = {}) {
  const files = []
  for (const root of roots) {
    let stats
    try {
      stats = statSync(root)
    } catch {
      continue // raiz inexistente não é erro: o projeto pode não ter esse diretório
    }
    if (stats.isDirectory()) collectFiles(root, files)
    else if (stats.isFile()) files.push(root)
  }

  const violations = []
  for (const file of files) {
    const ext = extname(file).toLowerCase()
    const envTemplate = basename(file) === '.env.example'
    if (!TEXT_EXTENSIONS.has(ext) && !envTemplate) continue

    let content
    try {
      content = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    if (content.includes('\u0000')) continue // binário disfarçado de texto

    const lines = content.split('\n')
    for (const rule of rules) {
      const regex = ruleRegex(rule)
      lines.forEach((text, index) => {
        if (regex.test(text)) {
          violations.push({ file, line: index + 1, text: text.trim(), rule: rule.id, message: rule.message })
        }
      })
    }
  }
  return violations
}

// Compara os caminhos reais: se o script for chamado por symlink (hook, PATH, wrapper),
// resolve(process.argv[1]) !== import.meta.url e a CLI seria ignorada em silêncio.
function invokedDirectly() {
  if (!process.argv[1]) return false
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}

if (invokedDirectly()) {
  const args = process.argv.slice(2)
  const roots = args.length > 0 ? args.map((arg) => resolve(arg)) : DEFAULT_ROOTS
  const violations = findViolations({ roots })

  if (violations.length === 0) {
    console.log('✔ nenhuma ocorrência de fato proibido')
  } else {
    console.log(`✖ ${violations.length} ocorrência(s) de fato proibido:`)
    for (const v of violations) {
      console.log(`  ${relative(process.cwd(), v.file)}:${v.line} — "${v.text}"`)
    }
    const messages = [...new Set(violations.map((v) => v.message))]
    for (const message of messages) console.log(`  → ${message}`)
    process.exitCode = 1
  }
}
