import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { zip } from './zip.mjs'

const manifest = readFileSync(new URL('../theme/manifest.xml', import.meta.url))
const archive = zip([['manifest.xml', manifest]])
const destination = new URL('../dist/', import.meta.url)
mkdirSync(destination, { recursive: true })
writeFileSync(new URL('HFUT-Campus-Rear-OLED.zip', destination), archive)
console.log('dist/HFUT-Campus-Rear-OLED.zip')
console.log('SHA-256:', createHash('sha256').update(archive).digest('hex'))
