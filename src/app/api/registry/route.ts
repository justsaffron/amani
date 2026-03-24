import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().min(100), // min $1 in cents
  imageUrl: z.string().url().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const session = await getServerSession(authOptions)

  // Guests can view by userId, admins see their own
  const targetUserId = userId || session?.user.id
  if (!targetUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.registryItem.findMany({
    where: { userId: targetUserId },
    include: {
      gifts: {
        where: { status: 'COMPLETED' },
        select: { amount: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const item = await prisma.registryItem.create({
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        externalUrl: data.externalUrl || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await prisma.registryItem.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
