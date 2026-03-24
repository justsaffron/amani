'use client'
import { useEffect, useState } from 'react'
import { Calendar, Users, Gift, Send, TrendingUp, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface DashboardData {
  stats: {
    totalGuests: number
    invitedGuests: number
    attendingGuests: number
    pendingRsvp: number
    totalGiftAmount: number
    eventCount: number
  }
  events: Array<{ id: string; name: string; date: string; _count: { guestEvents: number } }>
  recentGifts: Array<{ amount: number; guestName: string | null; createdAt: string }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then(setData)
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
      </div>
    )
  }

  const { stats, events, recentGifts } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">Everything at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Guests', value: stats.totalGuests, icon: Users, color: 'blush' },
          { label: 'Attending', value: stats.attendingGuests, icon: TrendingUp, color: 'sage' },
          { label: 'Pending RSVP', value: stats.pendingRsvp, icon: Clock, color: 'champagne' },
          { label: 'Gifts Received', value: formatCurrency(stats.totalGiftAmount), icon: Gift, color: 'blush' },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blush-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blush-500" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your Events</h2>
            <Link href="/dashboard/events" className="text-sm text-blush-600 hover:underline">
              Manage →
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No events yet</p>
              <Link href="/dashboard/events/new" className="btn-primary mt-4 text-sm inline-block">
                Add your first event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blush-600 transition-colors">
                      {event.name}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge bg-blush-50 text-blush-700">
                      {event._count.guestEvents} guests
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Gifts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Gifts</h2>
            <Link href="/dashboard/registry" className="text-sm text-blush-600 hover:underline">
              Registry →
            </Link>
          </div>
          {recentGifts.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No gifts yet</p>
              <Link href="/dashboard/registry" className="btn-primary mt-4 text-sm inline-block">
                Set up your registry
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGifts.map((gift, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 text-sm font-medium">
                      {(gift.guestName || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{gift.guestName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{formatDate(gift.createdAt)}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sage-600">{formatCurrency(gift.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/events/new" className="btn-secondary text-sm">
            + Add event
          </Link>
          <Link href="/dashboard/guests" className="btn-secondary text-sm">
            + Add guests
          </Link>
          <Link href="/dashboard/send" className="btn-primary text-sm">
            <Send className="w-4 h-4 inline mr-1" />
            Send invites
          </Link>
        </div>
      </div>
    </div>
  )
}
