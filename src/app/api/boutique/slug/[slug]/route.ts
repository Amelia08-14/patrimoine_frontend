import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'data', 'boutique-configs.json')

function readConfigs(): Record<string, any> {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {}
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const configs = readConfigs()

  const entry = Object.values(configs).find((c: any) => c.slug === slug)
  if (!entry) return NextResponse.json(null, { status: 404 })

  return NextResponse.json(entry)
}
