import { crc32, deflateRawSync } from 'node:zlib'

// HFP uses a small ZIP with ASCII filenames and no data descriptors.
export function zip(entries) {
  const files = []
  const directory = []
  let offset = 0

  for (const [name, data] of entries) {
    const filename = Buffer.from(name, 'ascii')
    const compressed = deflateRawSync(data)
    const crc = crc32(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(33, 12) // 1980-01-01 in DOS date format.
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(filename.length, 26)
    files.push(local, filename, compressed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    local.copy(central, 6, 4, 28)
    central.writeUInt32LE(offset, 42)
    directory.push(central, filename)
    offset += local.length + filename.length + compressed.length
  }

  const footer = Buffer.alloc(22)
  footer.writeUInt32LE(0x06054b50, 0)
  footer.writeUInt16LE(entries.length, 8)
  footer.writeUInt16LE(entries.length, 10)
  footer.writeUInt32LE(directory.reduce((size, part) => size + part.length, 0), 12)
  footer.writeUInt32LE(offset, 16)
  return Buffer.concat([...files, ...directory, footer])
}
