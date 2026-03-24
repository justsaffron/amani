import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  category: z.enum(['VENUE', 'CATERING', 'PHOTOGRAPHY', 'DECORATION', 'MUSIC', 'FLORIST', 'CAKE', 'TRANSPORT', 'BEAUTY', 'OTHER']),
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  googlePlaceId: z.string().optional(),
  rating: z.number().optional(),
  estimatedCost: z.number().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const includeArchived = searchParams.get('archived') === 'true'

  const vendors = await prisma.savedVendor.findMany({
    where: {
      userId: session.user.id,
      ...(category && { category: category as any }),
      ...(!includeArchived && { isArchived: false }),
    },
    include: {
      communications: { orderBy: { date: 'desc' }, take: 3 },
    },
    orderBy: [{ isSelected: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(vendors)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const vendor = await prisma.savedVendor.create({
      data: {
        ...data,
        userId: session.user.id,
      },
      include: { communications: true },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
