import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20',
  })
}

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
  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ['card', 'us_bank_account'],
    payment_method_options: {
      us_bank_account: {
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
