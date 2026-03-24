import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.number().min(0),
  actualCost: z.number().optional(),
  paidBy: z.string().optional(),
  isPaid: z.boolean().optional(),
  vendorName: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.budgetItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ category: 'asc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const item = await prisma.budgetItem.create({
      data: {
        ...data,
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
