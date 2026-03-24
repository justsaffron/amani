import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { GuestPortal } from '@/components/guest/GuestPortal'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string; token: string }
  searchParams: { gift?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({ where: { slug: params.slug } })
  if (!user) return { title: 'Invitation' }
  return {
    title: user.websiteTitle || `${user.coupleName}'s Wedding`,
    description: user.heroMessage || `You're invited to celebrate with ${user.coupleName}`,
  }
}

async function getData(slug: string, token: string) {
  const user = await prisma.user.findUnique({ where: { slug } })
  if (!user) return null

  const guest = await prisma.guest.findUnique({
    where: { token },
    include: {
      guestEvents: {
        where: { event: { userId: user.id } },
        include: { event: true },
      },
    },
  })

  if (!guest || guest.userId !== user.id) return null

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

export default async function InvitePage({ params, searchParams }: Props) {
  const data = await getData(params.slug, params.token)
  if (!data) notFound()

  return <GuestPortal data={data} giftStatus={searchParams.gift} />
}
