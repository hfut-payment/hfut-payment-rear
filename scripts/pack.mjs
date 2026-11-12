#!/usr/bin/env node
import { createHash, createPrivateKey, sign, X509Certificate } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'
import { zip } from './zip.mjs'

const sha256 = value => createHash('sha256').update(value).digest('hex')
const readCert = path => new X509Certificate(readFileSync(path))

export function pack({ source, key, cert, version, revision, dependencies = [] }) {
  const manifest = JSON.parse(readFileSync(join(source, 'manifest.json'), 'utf8'))
  const script = readFileSync(join(source, 'main.js'))
  if (version !== undefined) manifest.version = version
  if (revision !== undefined) manifest.revision = Number(revision)
  if (typeof manifest.id !== 'string' || !/^[a-z][a-z0-9.-]{2,63}$/.test(manifest.id)) throw new Error('Invalid plugin ID')
  if (typeof manifest.version !== 'string' || manifest.version.length > 40 ||
      !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(manifest.version)) throw new Error('Invalid version')
  if (!Number.isInteger(manifest.revision) || manifest.revision < 1 || manifest.revision > 2147483647) {
    throw new Error('Revision must be a positive 32-bit integer')
  }
  if (![1, 2].includes(manifest.api) ||
      !['page', 'payment.text', 'payment.qr', 'payment.text+qr'].includes(manifest.capability) ||
      (manifest.api === 2 && (!manifest.community || typeof manifest.community !== 'object' || Array.isArray(manifest.community))) ||
      ['nativeApi', 'entryClass', 'contentAuthority', 'dexSha256'].some(field => Object.hasOwn(manifest, field))) {
    throw new Error('Only script HFP manifests are supported')
  }

  const pins = manifest.community?.dependencies ?? {}
  for (const value of dependencies) {
    const separator = value.indexOf('=')
    const id = value.slice(0, separator)
    if (separator < 1 || !Object.hasOwn(pins, id)) throw new Error('Use --dependency ID=CERT for a declared dependency')
    pins[id].signer = sha256(readCert(value.slice(separator + 1)).raw)
  }
  if (Object.values(pins).some(pin => typeof pin.signer !== 'string' || !/^[0-9a-f]{64}$/.test(pin.signer))) {
    throw new Error('Every dependency needs a publisher fingerprint')
  }

  const certificate = readCert(cert)
  const privateKey = createPrivateKey(readFileSync(key))
  if (certificate.publicKey.asymmetricKeyType !== 'rsa' || !certificate.checkPrivateKey(privateKey)) {
    throw new Error('An RSA certificate and its matching private key are required')
  }
  const now = Date.now()
  if (now < Date.parse(certificate.validFrom) || now > Date.parse(certificate.validTo)) throw new Error('Certificate is not currently valid')
  manifest.scriptSha256 = sha256(script)
  const metadata = Buffer.from(JSON.stringify(manifest))
  const signature = sign('RSA-SHA256', metadata, privateKey)
  if (metadata.length > 4096 || script.length > 65536 || certificate.raw.length > 4096 || signature.length > 1024) {
    throw new Error('An HFP member exceeds its size limit')
  }
  const archive = zip([
    ['manifest.json', metadata], ['main.js', script],
    ['signer.der', certificate.raw], ['signature.bin', signature],
  ])
  if (archive.length > 256 * 1024) throw new Error('HFP exceeds 256 KiB')
  return { archive, manifest, publisher: sha256(certificate.raw) }
}

function main() {
  const { values } = parseArgs({ options: {
    source: { type: 'string', default: '.' },
    key: { type: 'string' },
    cert: { type: 'string' },
    output: { type: 'string' },
    version: { type: 'string' },
    revision: { type: 'string' },
    dependency: { type: 'string', multiple: true },
    help: { type: 'boolean' },
  } })
  if (values.help) {
    console.log('node pack.mjs --source DIR --key PRIVATE.pem --cert CERT.pem [--output PACKAGE.hfp] [--dependency ID=CERT]')
    return
  }
  const signingDir = process.env.HFP_SIGN_DIR
  const key = values.key ?? (signingDir && join(signingDir, 'private.pem'))
  const cert = values.cert ?? (signingDir && join(signingDir, 'certificate.pem'))
  if (!key || !cert) throw new Error('Pass --key and --cert, or set HFP_SIGN_DIR')
  const { archive, manifest, publisher } = pack({ ...values, key, cert, dependencies: values.dependency })
  const output = values.output ?? join('dist', `${manifest.id}-${manifest.version}.hfp`)
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, archive)
  console.log(`${output} (${archive.length} bytes)\nSHA-256: ${sha256(archive)}\nPublisher SHA-256: ${publisher}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main() } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
