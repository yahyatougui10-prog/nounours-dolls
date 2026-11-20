import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const API_PORT = process.env.PORT || '3001'

const children = [
  {
    name: 'api',
    command: process.execPath,
    args: ['server/index.mjs'],
    env: { ...process.env, PORT: API_PORT },
  },
  {
    name: 'web',
    command: process.execPath,
    args: ['node_modules/vite/bin/vite.js'],
    env: process.env,
  },
].map((config) => ({
  ...config,
  process: spawn(config.command, config.args, {
    cwd: ROOT,
    env: config.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  }),
}))

const prefixLines = (stream, prefix) => {
  let pending = ''
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => {
    pending += chunk
    const lines = pending.split('\n')
    pending = lines.pop() ?? ''
    for (const line of lines) process.stdout.write(`[${prefix}] ${line}\n`)
  })
  stream.on('end', () => {
    if (pending) process.stdout.write(`[${prefix}] ${pending}\n`)
  })
}

for (const child of children) {
  prefixLines(child.process.stdout, child.name)
  prefixLines(child.process.stderr, child.name)
}

let shuttingDown = false
const stopAll = (code = 0) => {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.process.killed && child.process.exitCode === null) {
      child.process.kill('SIGTERM')
    }
  }
  setTimeout(() => process.exit(code), 250).unref()
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => stopAll(0))
}
process.on('exit', () => {
  for (const child of children) {
    if (!child.process.killed && child.process.exitCode === null) child.process.kill('SIGTERM')
  }
})

for (const child of children) {
  child.process.on('exit', (code, signal) => {
    if (!shuttingDown) {
      process.stdout.write(`[${child.name}] stopped (${signal ?? code ?? 'unknown'}).\n`)
      stopAll(code ?? 1)
    }
  })
}
