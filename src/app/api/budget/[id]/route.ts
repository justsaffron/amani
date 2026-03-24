import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  await prisma.budgetItem.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: {
      ...body,
      ...(body.isPaid === true && !body.paidAt && { paidAt: new Date() }),
      ...(body.isPaid === false && { paidAt: null }),
    },
  })

  const item = await prisma.budgetItem.findFirst({ where: { id: params.id } })
  return NextResponse.json(item)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.budgetItem.deleteMany({ where: { id: params.id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
