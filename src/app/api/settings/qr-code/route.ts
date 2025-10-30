import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

export async function GET() {
  const configPath = path.join(process.cwd(), 'public', 'uploads', 'qr-config.json');
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    return NextResponse.json({ qrCodePath: config.qrCodePath || null });
  } catch {
    return NextResponse.json({ qrCodePath: null });
  }
}
