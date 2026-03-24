import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  date: z.string(), // ISO string
  endTime: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  dressCode: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { guestEvents: true } },
      guestEvents: {
        select: { rsvpStatus: true },
      },
    },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(events)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const event = await prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: session.user.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
