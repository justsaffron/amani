import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInviteEmail } from '@/lib/email'
import { sendInviteSms } from '@/lib/sms'
import { getInviteUrl, formatDate, formatTime } from '@/lib/utils'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { guestIds, method, invitationImageUrl } = await req.json()
  // method: 'email' | 'sms' | 'both'

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const results = { sent: 0, failed: 0, errors: [] as string[] }

  for (const guestId of guestIds) {
    const guest = await prisma.guest.findFirst({
      where: { id: guestId, userId: session.user.id },
      include: {
        guestEvents: {
          include: { event: true },
        },
      },
    })

    if (!guest) continue

    const inviteUrl = getInviteUrl(user.slug, guest.token)
    const events = guest.guestEvents.map((ge) => ({
      name: ge.event.name,
      date: `${formatDate(ge.event.date)} at ${formatTime(ge.event.date)}`,
      venue: ge.event.venue || undefined,
      address: ge.event.address || undefined,
      city: ge.event.city || undefined,
      dressCode: ge.event.dressCode || undefined,
    }))

    try {
      if ((method === 'email' || method === 'both') && guest.email) {
        await sendInviteEmail({
          to: guest.email,
          guestName: guest.name,
          coupleName: user.coupleName,
          events,
          inviteUrl,
          heroMessage: user.heroMessage || undefined,
          invitationImageUrl: invitationImageUrl || undefined,
        })
      }

      if ((method === 'sms' || method === 'both') && guest.phone) {
        await sendInviteSms({
          to: guest.phone,
          guestName: guest.name,
          coupleName: user.coupleName,
          inviteUrl,
        })
      }

      // Mark as sent
      await prisma.guestEvent.updateMany({
        where: { guestId: guest.id },
        data: {
          inviteSent: true,
          inviteSentAt: new Date(),
          inviteMethod: method,
        },
      })

      results.sent++
    } catch (err: any) {
      results.failed++
      results.errors.push(`Failed for ${guest.name}: ${err.message}`)
    }
  }

  return NextResponse.json(results)
}
