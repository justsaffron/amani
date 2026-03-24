import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  coupleName: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, coupleName, slug } = schema.parse(body)

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { slug }] },
    })

    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'URL slug'
      return NextResponse.json({ error: `${field} already taken` }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        coupleName,
        slug,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
