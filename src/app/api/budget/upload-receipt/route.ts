import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const budgetItemId = formData.get('budgetItemId') as string

    if (!file || !budgetItemId) {
      return NextResponse.json({ error: 'Missing file or budgetItemId' }, { status: 400 })
    }

    // Verify ownership
    const item = await prisma.budgetItem.findFirst({
      where: { id: budgetItemId, userId: session.user.id },
    })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Save file to public/receipts
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'pdf'
    const filename = `receipt-${budgetItemId}-${Date.now()}.${ext}`

    const uploadDir = join(process.cwd(), 'public', 'receipts')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    const receiptUrl = `/receipts/${filename}`

    await prisma.budgetItem.update({
      where: { id: budgetItemId },
      data: { receiptUrl },
    })

    return NextResponse.json({ receiptUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
