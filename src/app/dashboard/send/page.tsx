'use client'
import { useEffect, useState } from 'react'
import { Send, Mail, MessageSquare, CheckCircle2, Loader2, Users } from 'lucide-react'

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  guestEvents: Array<{ inviteSent: boolean; event: { id: string; name: string } }>
}

interface Event {
  id: string
  name: string
}

export default function SendPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEvent, setFilterEvent] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unsent' | 'sent'>('unsent')
  const [method, setMethod] = useState<'email' | 'sms' | 'both'>('email')
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; errors: string[] } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/guests').then((r) => r.json()),
      fetch('/api/events').then((r) => r.json()),
    ]).then(([g, e]) => {
      setGuests(g)
      setEvents(e)
      setLoading(false)
    })
  }, [])

  const filtered = guests.filter((g) => {
    const matchesEvent = !filterEvent || g.guestEvents.some((ge) => ge.event.id === filterEvent)
    const isSent = g.guestEvents.some((ge) => ge.inviteSent)
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'sent' ? isSent : !isSent)
    const hasContact = method === 'email' ? !!g.email : method === 'sms' ? !!g.phone : !!(g.email || g.phone)
    return matchesEvent && matchesStatus && hasContact
  })

  function toggleAll() {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map((g) => g.id))
    }
  }

  async function sendInvites() {
    if (selected.length === 0) return
    if (!confirm(`Send ${method} invitations to ${selected.length} guests?`)) return
    setSending(true)
    setResult(null)

    const res = await fetch('/api/guests/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestIds: selected, method }),
    })
    const data = await res.json()
    setResult(data)
    setSending(false)
    setSelected([])

    // Refresh guests
    const refreshed = await fetch('/api/guests').then((r) => r.json())
    setGuests(refreshed)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Send Invitations</h1>
        <p className="text-gray-500 mt-1">Send personalised invites by email and/or SMS</p>
      </div>

      {result && (
        <div className={`card border-l-4 ${result.failed === 0 ? 'border-green-500 bg-green-50' : 'border-amber-500 bg-amber-50'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="font-medium text-gray-900">
              {result.sent} invitations sent successfully
              {result.failed > 0 && `, ${result.failed} failed`}
            </p>
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-sm text-amber-700 space-y-1">
              {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Send options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Method */}
          <div>
            <label className="label">Delivery method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['email', 'sms', 'both'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm transition-all ${
                    method === m
                      ? 'border-blush-500 bg-blush-50 text-blush-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {m === 'email' && <Mail className="w-4 h-4" />}
                  {m === 'sms' && <MessageSquare className="w-4 h-4" />}
                  {m === 'both' && <Send className="w-4 h-4" />}
                  {m === 'email' ? 'Email' : m === 'sms' ? 'SMS' : 'Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by event */}
          <div>
            <label className="label">Filter by event</label>
            <select className="input" value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
              <option value="">All events</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {/* Filter by status */}
          <div>
            <label className="label">Show guests</label>
            <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
              <option value="unsent">Not yet invited</option>
              <option value="sent">Already invited</option>
              <option value="all">All guests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guest selection */}
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.length === filtered.length && filtered.length > 0}
              onChange={toggleAll}
              className="rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              {selected.length === 0
                ? `${filtered.length} eligible guests`
                : `${selected.length} selected`}
            </span>
          </label>
          <button
            onClick={sendInvites}
            disabled={selected.length === 0 || sending}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sending ? 'Sending…' : `Send to ${selected.length}`}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No guests match these filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((guest) => {
              const isSent = guest.guestEvents.some((ge) => ge.inviteSent)

              return (
                <label key={guest.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.includes(guest.id)}
                    onChange={() => setSelected((prev) =>
                      prev.includes(guest.id) ? prev.filter((id) => id !== guest.id) : [...prev, guest.id]
                    )}
                  />
                  <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 text-sm font-medium flex-shrink-0">
                    {guest.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{guest.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {guest.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{guest.email}</span>}
                      {guest.phone && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{guest.phone}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 hidden md:flex">
                    {guest.guestEvents.map((ge) => (
                      <span key={ge.event.id} className="badge bg-blush-50 text-blush-600 text-xs">{ge.event.name}</span>
                    ))}
                  </div>
                  {isSent && (
                    <span className="badge bg-blue-50 text-blue-600 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Sent
                    </span>
                  )}
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
