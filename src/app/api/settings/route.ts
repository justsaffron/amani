import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, email: true, coupleName: true, slug: true,
      websiteTitle: true, heroMessage: true, photoUrl: true, accentColor: true,
      weddingDate: true, weddingCity: true, estimatedGuests: true, totalBudget: true,
    },
  })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const allowed = [
    'coupleName', 'websiteTitle', 'heroMessage', 'photoUrl', 'accentColor',
    'weddingDate', 'weddingCity', 'estimatedGuests', 'totalBudget',
  ]
  const data: Record<string, any> = {}

  for (const key of allowed) {
    if (key in body) {
      if (key === 'weddingDate') data[key] = body[key] ? new Date(body[key]) : null
      else if (key === 'estimatedGuests' || key === 'totalBudget') data[key] = body[key] ? Number(body[key]) : null
      else data[key] = body[key]
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true, email: true, coupleName: true, slug: true,
      websiteTitle: true, heroMessage: true, photoUrl: true, accentColor: true,
      weddingDate: true, weddingCity: true, estimatedGuests: true, totalBudget: true,
    },
  })

  return NextResponse.json(user)
}
