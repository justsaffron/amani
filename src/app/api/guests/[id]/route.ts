import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const guest = await prisma.guest.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { guestEvents: { include: { event: true } } },
  })

  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(guest)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { eventIds, ...data } = body

  await prisma.guest.updateMany({
    where: { id: params.id, userId: session.user.id },
    data,
  })

  // Update event assignments if provided
  if (eventIds !== undefined) {
    await prisma.guestEvent.deleteMany({ where: { guestId: params.id } })
    if (eventIds.length > 0) {
      await prisma.guestEvent.createMany({
        data: eventIds.map((eventId: string) => ({ guestId: params.id, eventId })),
        skipDuplicates: true,
      })
    }
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.guest.deleteMany({
    where: { id: params.id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
