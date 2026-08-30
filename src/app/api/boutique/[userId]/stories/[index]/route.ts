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

function writeConfigs(configs: Record<string, any>) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2))
}

// Incrémente/décrémente les compteurs vues/likes d'une story précise, sans repasser par la
// sauvegarde complète de la config (évite d'écraser d'autres modifications concurrentes).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string; index: string }> }) {
  const { userId, index } = await params
  const idx = Number(index)
  const body = await req.json().catch(() => ({}))
  const action = body?.action as 'view' | 'like' | 'unlike' | undefined

  const configs = readConfigs()
  const config = configs[userId]
  if (!config || !Array.isArray(config.stories) || !config.stories[idx]) {
    return NextResponse.json({ error: 'Story introuvable' }, { status: 404 })
  }

  const story = config.stories[idx]
  if (action === 'view') {
    story.views = (story.views || 0) + 1
  } else if (action === 'like') {
    story.likes = (story.likes || 0) + 1
  } else if (action === 'unlike') {
    story.likes = Math.max(0, (story.likes || 0) - 1)
  } else {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  }

  configs[userId] = config
  writeConfigs(configs)

  return NextResponse.json({ views: story.views || 0, likes: story.likes || 0 })
}
