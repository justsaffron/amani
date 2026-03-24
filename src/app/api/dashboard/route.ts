import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [events, guests, gifts] = await Promise.all([
    prisma.event.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { guestEvents: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.guest.findMany({
      where: { userId: session.user.id },
      include: { guestEvents: { select: { rsvpStatus: true, inviteSent: true } } },
    }),
    prisma.gift.findMany({
      where: { userId: session.user.id, status: 'COMPLETED' },
      select: { amount: true, guestName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalGuests = guests.length
  const invitedGuests = guests.filter((g) => g.guestEvents.some((ge) => ge.inviteSent)).length
  const attendingGuests = guests.filter((g) =>
    g.guestEvents.some((ge) => ge.rsvpStatus === 'ATTENDING')
  ).length
  const pendingRsvp = guests.filter((g) =>
    g.guestEvents.some((ge) => ge.inviteSent && ge.rsvpStatus === 'PENDING')
  ).length
  const totalGiftAmount = gifts.reduce((sum, g) => sum + g.amount, 0)

  return NextResponse.json({
    stats: {
      totalGuests,
      invitedGuests,
      attendingGuests,
      pendingRsvp,
      totalGiftAmount,
      eventCount: events.length,
    },
    events,
    recentGifts: gifts,
  })
}
