import { promises as fsp } from 'node:fs'
import { resolve, dirname } from 'node:path'

const DATA_DIR = resolve(process.cwd(), 'server', 'data')

async function ensureDir(path: string) {
  try { await fsp.mkdir(path, { recursive: true }) } catch {}
}

export async function readJson<T>(file: string): Promise<T> {
  const full = resolve(DATA_DIR, file)
  const buf = await fsp.readFile(full, 'utf8')
  return JSON.parse(buf) as T
}

export async function writeJson<T>(file: string, data: T): Promise<void> {
  const full = resolve(DATA_DIR, file)
  await ensureDir(dirname(full))
  const tmp = full + '.tmp'
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await fsp.rename(tmp, full)
}
