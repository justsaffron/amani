import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createGiftCheckoutSession } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  token: z.string(), // guest token
  registryItemId: z.string().optional(),
  customAmount: z.number().min(100).optional(), // for open contributions
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  message: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, registryItemId, customAmount, guestName, guestEmail, message } = schema.parse(body)

    const guest = await prisma.guest.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!guest) return NextResponse.json({ error: 'Invalid invite' }, { status: 404 })

    let itemName = 'Wedding Gift Contribution'
    let amount = customAmount || 5000 // default $50

    if (registryItemId) {
      const item = await prisma.registryItem.findFirst({
        where: { id: registryItemId, userId: guest.userId },
      })
      if (item) {
        itemName = item.name
        amount = customAmount || item.amount
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const session = await createGiftCheckoutSession({
      userId: guest.userId,
      guestToken: token,
      registryItemId,
      registryItemName: itemName,
      amount,
      guestName: guestName || guest.name,
      guestEmail: guestEmail || guest.email || undefined,
      successUrl: `${baseUrl}/invite/${guest.user.slug}/${token}?gift=success`,
      cancelUrl: `${baseUrl}/invite/${guest.user.slug}/${token}?gift=cancelled`,
    })

    // Pre-create gift record in PENDING state
    await prisma.gift.create({
      data: {
        guestId: guest.id,
        registryItemId: registryItemId || null,
        userId: guest.userId,
        guestName: guestName || guest.name,
        guestEmail: guestEmail || guest.email || null,
        amount,
        message: message || null,
        stripeSessionId: session.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
