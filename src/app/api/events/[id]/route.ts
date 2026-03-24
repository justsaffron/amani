import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      guestEvents: {
        include: { guest: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const event = await prisma.event.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      ...body,
      ...(body.date && { date: new Date(body.date) }),
    },
  })

  return NextResponse.json(event)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.event.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
