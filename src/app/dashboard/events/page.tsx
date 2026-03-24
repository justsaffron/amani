'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Plus, Trash2 } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface Event {
  id: string
  name: string
  date: string
  venue?: string
  city?: string
  dressCode?: string
  _count: { guestEvents: number }
  guestEvents: Array<{ rsvpStatus: string }>
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events').then((r) => r.json()).then((data) => {
      setEvents(data)
      setLoading(false)
    })
  }, [])

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event? This will also remove all guest assignments.')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">Manage your wedding events</p>
        </div>
        <Link href="/dashboard/events/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 text-lg mb-2">No events yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your Nikah, Walima, Mehndi, or other wedding events</p>
          <Link href="/dashboard/events/new" className="btn-primary">Add your first event</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const attending = event.guestEvents.filter((ge) => ge.rsvpStatus === 'ATTENDING').length
            const pending = event.guestEvents.filter((ge) => ge.rsvpStatus === 'PENDING').length

            return (
              <div key={event.id} className="card hover:shadow-md transition-shadow group relative">
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/dashboard/events/${event.id}`} className="block">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blush-50 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-blush-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blush-600 transition-colors">
                        {event.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(event.date)} · {formatTime(event.date)}
                      </p>
                      {(event.venue || event.city) && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}{event.city ? `, ${event.city}` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{event._count.guestEvents}</span>
                      <span className="text-gray-500">guests</span>
                    </div>
                    <span className="badge bg-sage-50 text-sage-700">{attending} attending</span>
                    {pending > 0 && <span className="badge bg-amber-50 text-amber-700">{pending} pending</span>}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
