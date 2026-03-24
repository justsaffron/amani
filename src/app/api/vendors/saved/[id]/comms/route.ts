import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  type: z.enum(['email', 'call', 'meeting', 'note']),
  summary: z.string().min(1),
  date: z.string().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const vendor = await prisma.savedVendor.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const comms = await prisma.vendorComm.findMany({
    where: { vendorId: params.id },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(comms)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.savedVendor.findFirst({ where: { id: params.id, userId: session.user.id } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const comm = await prisma.vendorComm.create({
      data: {
        vendorId: params.id,
        type: data.type,
        summary: data.summary,
        date: data.date ? new Date(data.date) : new Date(),
      },
    })

    return NextResponse.json(comm, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
