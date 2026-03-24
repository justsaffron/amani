import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function createGiftCheckoutSession({
  userId,
  guestToken,
  registryItemId,
  registryItemName,
  amount,
  guestName,
  guestEmail,
  successUrl,
  cancelUrl,
}: {
  userId: string
  guestToken: string
  registryItemId?: string
  registryItemName: string
  amount: number // in cents
  guestName?: string
  guestEmail?: string
  successUrl: string
  cancelUrl: string
}) {
  // ACH bank transfer (us_bank_account) is capped at 0.8% with a $5 max —
  // much cheaper than card (2.9% + 30¢) for larger gift amounts.
  // Both options are shown to the guest at checkout; they choose.
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'us_bank_account'],
    payment_method_options: {
      us_bank_account: {
        // Instant verification via Plaid where available; fallback to micro-deposits
        financial_connections: {
          permissions: ['payment_method'],
        },
      },
    },
    mode: 'payment',
    customer_email: guestEmail || undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: registryItemName,
            description: 'Wedding gift contribution',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      guestToken,
      registryItemId: registryItemId || '',
      guestName: guestName || '',
    },
    // Show a fee comparison note in the checkout — Stripe renders this natively
    custom_text: {
      submit: {
        message: 'Pay by bank transfer to save on fees (0.8%, max $5). Card payments are also accepted.',
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}
