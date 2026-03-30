import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    await prisma.gift.updateMany({
      where: { stripeSessionId: session.id },
      data: {
        status: 'COMPLETED',
        stripePaymentId: session.payment_intent as string,
      },
    })

    // Check if registry item is now fully funded
    const gift = await prisma.gift.findFirst({ where: { stripeSessionId: session.id } })
    if (gift?.registryItemId) {
      const item = await prisma.registryItem.findUnique({
        where: { id: gift.registryItemId },
        include: {
          gifts: { where: { status: 'COMPLETED' }, select: { amount: true } },
        },
      })
      if (item) {
        const totalRaised = item.gifts.reduce((sum, g) => sum + g.amount, 0)
        if (totalRaised >= item.amount) {
          await prisma.registryItem.update({
            where: { id: item.id },
            data: { isFunded: true },
          })
        }
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    await prisma.gift.updateMany({
      where: { stripeSessionId: session.id, status: 'PENDING' },
      data: { status: 'FAILED' },
    })
  }

  return NextResponse.json({ received: true })
}
