#!/usr/bin/env node
// Verificador de fatos do site: falha quando um fato proibido aparece no conteúdo.
// Sem dependências — roda em qualquer Node recente.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

export const RULES = [
  {
    id: 'whatsapp-antigo',
    patterns: ['99713-0824', '997130824', '5518997130824'],
    message: 'Número antigo do WhatsApp. O oficial é (18) 99612-8381 (5518996128381).',
  },
]

export const DEFAULT_ROOTS = ['components', 'pages', 'data', 'public'].map((dir) => join(REPO_ROOT, dir))

const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
  '.json', '.md', '.mdx', '.html', '.css', '.txt', '.svg',
])

const SKIP_DIRECTORIES = new Set(['node_modules', '.next', '.vercel', '.git'])

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
  return new RegExp(escaped.join('|'))
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
    if (!TEXT_EXTENSIONS.has(extname(file).toLowerCase())) continue

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

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
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
