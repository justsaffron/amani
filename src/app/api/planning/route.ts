import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tasks = await prisma.planningTask.findMany({
    where: { userId: session.user.id },
    orderBy: [{ weeksBeforeWedding: 'desc' }, { sortOrder: 'asc' }],
  })

  return NextResponse.json(tasks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()

    // Seeding default tasks
    if (body._seed) {
      const { DEFAULT_PLANNING_TASKS } = await import('@/lib/planningTasks')
      const existing = await prisma.planningTask.count({ where: { userId: session.user.id } })
      if (existing > 0) return NextResponse.json({ message: 'Already seeded' })

      await prisma.planningTask.createMany({
        data: DEFAULT_PLANNING_TASKS.map((t) => ({
          ...t,
          userId: session.user.id,
          isCustom: false,
        })),
      })
      const tasks = await prisma.planningTask.findMany({ where: { userId: session.user.id } })
      return NextResponse.json(tasks, { status: 201 })
    }

    const data = schema.parse(body)
    const count = await prisma.planningTask.count({ where: { userId: session.user.id } })

    const task = await prisma.planningTask.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: session.user.id,
        isCustom: true,
        sortOrder: count + 1,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
