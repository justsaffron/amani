import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { GuestPortal } from '@/components/guest/GuestPortal'
import type { Metadata } from 'next'

interface Props {
  params: { token: string }
  searchParams: { gift?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guest = await prisma.guest.findUnique({
    where: { token: params.token },
    include: { user: true },
  })
  if (!guest) return { title: 'Invitation' }
  return {
    title: guest.user.websiteTitle || `${guest.user.coupleName}'s Wedding`,
    description: guest.user.heroMessage || `You're invited to celebrate with ${guest.user.coupleName}`,
  }
}

async function getData(token: string) {
  const guest = await prisma.guest.findUnique({
    where: { token },
    include: {
      user: true,
      guestEvents: {
        include: { event: true },
        orderBy: { event: { date: 'asc' } },
      },
    },
  })

  if (!guest) return null

  const { user } = guest

  const registryItems = await prisma.registryItem.findMany({
    where: { userId: user.id },
    include: {
      gifts: { where: { status: 'COMPLETED' }, select: { amount: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return {
    user: {
      id: user.id,
      coupleName: user.coupleName,
      heroMessage: user.heroMessage,
      accentColor: user.accentColor,
      photoUrl: user.photoUrl,
      slug: user.slug,
    },
    guest: {
      id: guest.id,
      name: guest.name,
      token: guest.token,
    },
    events: guest.guestEvents.map((ge) => ({
      id: ge.event.id,
      name: ge.event.name,
      description: ge.event.description,
      date: ge.event.date.toISOString(),
      venue: ge.event.venue,
      address: ge.event.address,
      city: ge.event.city,
      dressCode: ge.event.dressCode,
      notes: ge.event.notes,
      rsvpStatus: ge.rsvpStatus,
      plusOne: ge.plusOne,
      plusOneName: ge.plusOneName,
      dietaryNotes: ge.dietaryNotes,
    })),
    registryItems: registryItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      amount: item.amount,
      imageUrl: item.imageUrl,
      externalUrl: item.externalUrl,
      isFunded: item.isFunded,
      raised: item.gifts.reduce((sum, g) => sum + g.amount, 0),
    })),
  }
}

export default async function RsvpPage({ params, searchParams }: Props) {
  const data = await getData(params.token)
  if (!data) notFound()
  return <GuestPortal data={data} giftStatus={searchParams.gift} />
}
