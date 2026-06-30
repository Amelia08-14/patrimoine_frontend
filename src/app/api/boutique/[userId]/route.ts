import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'data', 'boutique-configs.json')

function readConfigs(): Record<string, any> {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
      fs.writeFileSync(CONFIG_FILE, '{}')
      return {}
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

function writeConfigs(configs: Record<string, any>) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2))
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const configs = readConfigs()
  const config = configs[userId] ?? null
  return NextResponse.json(config)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params
    const body = await req.json()
    const configs = readConfigs()
    configs[userId] = {
      ...body,
      userId,
      updatedAt: new Date().toISOString(),
    }
    writeConfigs(configs)
    return NextResponse.json(configs[userId])
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
