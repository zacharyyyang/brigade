// Writes src/generated/screenshot.ts: modern-screenshot's browser module, as text. A tool page
// loads it from the sandbox host when a person picks an element in it, to draw that element
// (contracts' element-select.ts); the API runs on Workers too, which have no files.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = readFileSync(fileURLToPath(import.meta.resolve('modern-screenshot')), 'utf8')
mkdirSync(join(root, 'src/generated'), { recursive: true })
writeFileSync(
  join(root, 'src/generated/screenshot.ts'),
  '// Written by scripts/screenshot.mjs from modern-screenshot: do not edit.\n' +
    `export const SCREENSHOT_MODULE = ${JSON.stringify(source)}\n`,
)
