import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/invite-image?userId=xxx
 * Serves the couple's stored invitation card image as binary so email clients
 * can load it via a real URL (data: URIs are blocked by Gmail/Outlook).
 * This endpoint is intentionally unauthenticated — it is only useful if you
 * already know the userId, and the image contains no sensitive data.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return new NextResponse('Missing userId', { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { invitationCardUrl: true },
  })

  if (!user?.invitationCardUrl) {
    return new NextResponse('Not found', { status: 404 })
  }

  const stored = user.invitationCardUrl

  // If stored as a data: URI, decode and stream as binary
  if (stored.startsWith('data:')) {
    const match = stored.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      return new NextResponse('Invalid image data', { status: 400 })
    }
    const [, mimeType, base64Data] = match
    const imageBuffer = Buffer.from(base64Data, 'base64')
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': imageBuffer.length.toString(),
      },
    })
  }

  // If stored as an external HTTPS URL, redirect
  return NextResponse.redirect(stored)
}
