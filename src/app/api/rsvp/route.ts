import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendRsvpConfirmationEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  token: z.string(),
  rsvps: z.array(
    z.object({
      eventId: z.string(),
      status: z.enum(['ATTENDING', 'DECLINED', 'MAYBE']),
      plusOne: z.boolean().optional(),
      plusOneName: z.string().optional(),
      dietaryNotes: z.string().optional(),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, rsvps } = schema.parse(body)

    const guest = await prisma.guest.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!guest) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })

    for (const rsvp of rsvps) {
      await prisma.guestEvent.updateMany({
        where: { guestId: guest.id, eventId: rsvp.eventId },
        data: {
          rsvpStatus: rsvp.status,
          plusOne: rsvp.plusOne ?? false,
          plusOneName: rsvp.plusOneName || null,
          dietaryNotes: rsvp.dietaryNotes || null,
        },
      })
    }

    // Send confirmation email
    if (guest.email && rsvps.length > 0) {
      const primaryStatus = rsvps[0].status
      await sendRsvpConfirmationEmail({
        to: guest.email,
        guestName: guest.name,
        coupleName: guest.user.coupleName,
        status: primaryStatus,
      }).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
