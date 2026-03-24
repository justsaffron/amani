import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const eventIds = (formData.get('eventIds') as string || '').split(',').filter(Boolean)

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const text = await file.text()
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>

    const results = { created: 0, skipped: 0, errors: [] as string[] }

    for (const row of records) {
      const name = row.name || row.Name || row.full_name || row['Full Name']
      const email = row.email || row.Email || row.email_address || ''
      const phone = row.phone || row.Phone || row.mobile || row.Mobile || ''

      if (!name) {
        results.skipped++
        continue
      }

      try {
        await prisma.guest.create({
          data: {
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            userId: session.user.id,
            ...(eventIds.length > 0 && {
              guestEvents: {
                create: eventIds.map((eventId) => ({ eventId })),
              },
            }),
          },
        })
        results.created++
      } catch {
        results.errors.push(`Skipped "${name}" — may already exist`)
        results.skipped++
      }
    }

    return NextResponse.json(results, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to parse CSV' }, { status: 400 })
  }
}
