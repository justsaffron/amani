'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Users, CheckCircle2, XCircle, HelpCircle, Mail } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const statusConfig = {
  ATTENDING: { label: 'Attending', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  DECLINED: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  MAYBE: { label: 'Maybe', color: 'bg-yellow-100 text-yellow-700', icon: HelpCircle },
  PENDING: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
}

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/events/${id}`).then((r) => r.json()).then((data) => {
      setEvent(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>
  if (!event) return <p>Event not found</p>

  const attending = event.guestEvents.filter((ge: any) => ge.rsvpStatus === 'ATTENDING').length
  const declined = event.guestEvents.filter((ge: any) => ge.rsvpStatus === 'DECLINED').length
  const maybe = event.guestEvents.filter((ge: any) => ge.rsvpStatus === 'MAYBE').length
  const pending = event.guestEvents.filter((ge: any) => ge.rsvpStatus === 'PENDING').length

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/events" className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-gray-900">{event.name}</h1>
          <p className="text-gray-500">{formatDate(event.date)} · {formatTime(event.date)}</p>
        </div>
      </div>

      {/* Event info */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {event.venue && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Venue</p>
              <p className="text-sm text-gray-900 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blush-500 flex-shrink-0" />
                {event.venue}
              </p>
            </div>
          )}
          {event.address && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Address</p>
              <p className="text-sm text-gray-900">{event.address}{event.city ? `, ${event.city}` : ''}</p>
            </div>
          )}
          {event.dressCode && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Dress code</p>
              <p className="text-sm text-gray-900">{event.dressCode}</p>
            </div>
          )}
          {event.notes && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-900">{event.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* RSVP stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Attending', count: attending, color: 'bg-green-50 text-green-700 border-green-100' },
          { label: 'Maybe', count: maybe, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
          { label: 'Declined', count: declined, color: 'bg-red-50 text-red-700 border-red-100' },
          { label: 'Pending', count: pending, color: 'bg-gray-50 text-gray-700 border-gray-100' },
        ].map(({ label, count, color }) => (
          <div key={label} className={cn('rounded-xl border p-4 text-center', color)}>
            <p className="text-2xl font-semibold">{count}</p>
            <p className="text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Guest list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Guest List ({event.guestEvents.length})
          </h2>
          <Link href="/dashboard/send" className="text-sm text-blush-600 hover:underline flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            Send invites
          </Link>
        </div>

        {event.guestEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No guests assigned to this event yet.</p>
            <Link href="/dashboard/guests" className="text-blush-600 hover:underline text-sm mt-1 inline-block">
              Add guests →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {event.guestEvents.map((ge: any) => {
              const status = statusConfig[ge.rsvpStatus as keyof typeof statusConfig]
              const Icon = status.icon
              return (
                <div key={ge.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 text-sm font-medium">
                      {ge.guest.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{ge.guest.name}</p>
                      <p className="text-xs text-gray-400">{ge.guest.email || ge.guest.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {ge.inviteSent && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Sent
                      </span>
                    )}
                    {ge.plusOne && (
                      <span className="text-xs text-gray-500">+1{ge.plusOneName ? ` (${ge.plusOneName})` : ''}</span>
                    )}
                    <span className={cn('badge flex items-center gap-1', status.color)}>
                      <Icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
