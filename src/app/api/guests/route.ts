import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
  eventIds: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')

  const guests = await prisma.guest.findMany({
    where: {
      userId: session.user.id,
      ...(eventId && { guestEvents: { some: { eventId } } }),
    },
    include: {
      guestEvents: {
        include: { event: { select: { id: true, name: true, date: true } } },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(guests)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { eventIds, ...guestData } = schema.parse(body)

    const guest = await prisma.guest.create({
      data: {
        ...guestData,
        email: guestData.email || null,
        userId: session.user.id,
        ...(eventIds && eventIds.length > 0 && {
          guestEvents: {
            create: eventIds.map((eventId) => ({ eventId })),
          },
        }),
      },
      include: { guestEvents: true },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
