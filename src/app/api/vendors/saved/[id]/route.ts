import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // If marking as selected, deselect others in same category
  if (body.isSelected === true) {
    const vendor = await prisma.savedVendor.findFirst({ where: { id: params.id, userId: session.user.id } })
    if (vendor) {
      await prisma.savedVendor.updateMany({
        where: { userId: session.user.id, category: vendor.category, id: { not: params.id } },
        data: { isSelected: false },
      })
    }
  }

  // If locking in (isSelected=true), archive non-selected same category
  if (body.archiveOthers) {
    const vendor = await prisma.savedVendor.findFirst({ where: { id: params.id, userId: session.user.id } })
    if (vendor) {
      await prisma.savedVendor.updateMany({
        where: { userId: session.user.id, category: vendor.category, id: { not: params.id }, isSelected: false },
        data: { isArchived: true },
      })
    }
  }

  await prisma.savedVendor.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: { ...body, archiveOthers: undefined },
  })

  const updated = await prisma.savedVendor.findFirst({
    where: { id: params.id },
    include: { communications: { orderBy: { date: 'desc' } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.savedVendor.deleteMany({ where: { id: params.id, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
