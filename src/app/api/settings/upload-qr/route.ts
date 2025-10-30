import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('qrCode')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // @ts-ignore
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `qr-code-${Date.now()}.png`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, filename)
  await fs.writeFile(filePath, buffer)

  // Save the path to a config file (for demo, use a JSON file)
  const configPath = path.join(process.cwd(), 'public', 'uploads', 'qr-config.json')
  await fs.writeFile(configPath, JSON.stringify({ qrCodePath: `/uploads/${filename}` }, null, 2))

  return NextResponse.json({ success: true, path: `/uploads/${filename}` })
}
