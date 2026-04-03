'use client'
import { useEffect, useState, useRef } from 'react'
import { Users, Upload, Plus, Search, Trash2, Check, ChevronDown, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  token: string
  guestEvents: Array<{
    rsvpStatus: string
    inviteSent: boolean
    event: { id: string; name: string }
  }>
}

interface Event {
  id: string
  name: string
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterEvent, setFilterEvent] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

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
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) || false
    const matchesEvent = !filterEvent || g.guestEvents.some((ge) => ge.event.id === filterEvent)
    return matchesSearch && matchesEvent
  })

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  async function deleteGuest(id: string) {
    if (!confirm('Remove this guest?')) return
    await fetch(`/api/guests/${id}`, { method: 'DELETE' })
    setGuests((prev) => prev.filter((g) => g.id !== id))
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Guests</h1>
          <p className="text-gray-500 mt-1">{guests.length} total guests across all events</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUploadModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Add guest
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 py-2"
            placeholder="Search guests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input py-2 max-w-[180px]"
          value={filterEvent}
          onChange={(e) => setFilterEvent(e.target.value)}
        >
          <option value="">All events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* Guest table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Guest</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Events</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">RSVP</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Invite</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((guest) => {
              const hasAttending = guest.guestEvents.some((ge) => ge.rsvpStatus === 'ATTENDING')
              const hasPending = guest.guestEvents.some((ge) => ge.rsvpStatus === 'PENDING')
              const hasSent = guest.guestEvents.some((ge) => ge.inviteSent)

              return (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 text-sm font-medium flex-shrink-0">
                        {guest.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-gray-900">{guest.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {guest.email && (
                        <p className="text-gray-500 flex items-center gap-1 text-xs">
                          <Mail className="w-3 h-3" />{guest.email}
                        </p>
                      )}
                      {guest.phone && (
                        <p className="text-gray-500 flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3" />{guest.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {guest.guestEvents.filter((ge) => ge.event).map((ge) => (
                        <span key={ge.event.id} className="badge bg-blush-50 text-blush-700 text-xs">
                          {ge.event.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {hasAttending ? (
                      <span className="badge bg-green-50 text-green-700">Attending</span>
                    ) : hasPending ? (
                      <span className="badge bg-gray-100 text-gray-500">Pending</span>
                    ) : (
                      <span className="badge bg-red-50 text-red-600">Declined</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {hasSent ? (
                      <span className="badge bg-blue-50 text-blue-700 flex items-center gap-1">
                        <Check className="w-3 h-3" />Sent
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Not sent</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteGuest(guest.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>{search ? 'No guests match your search' : 'No guests yet'}</p>
          </div>
        )}
      </div>

      {showAddModal && <AddGuestModal events={events} onClose={() => setShowAddModal(false)} onAdded={(g: Guest) => { setGuests((prev) => [g, ...prev]); setShowAddModal(false) }} />}
      {showUploadModal && <UploadCSVModal events={events} onClose={() => setShowUploadModal(false)} onUploaded={(newGuests: Guest[]) => { setGuests((prev) => [...newGuests, ...prev]); setShowUploadModal(false) }} />}
    </div>
  )
}

function AddGuestModal({ events, onClose, onAdded }: any) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventIds: [] as string[] })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const guest = await res.json()
      onAdded(guest)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-serif text-xl text-gray-900 mb-4">Add Guest</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Full name *</label>
            <input type="text" className="input" placeholder="Guest name" required
              value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="guest@email.com"
              value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone <span className="text-gray-400 font-normal">(for SMS)</span></label>
            <input type="tel" className="input" placeholder="+1 555 000 0000"
              value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          {events.length > 0 && (
            <div>
              <label className="label">Invite to events</label>
              <div className="space-y-2">
                {events.map((ev: Event) => (
                  <label key={ev.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded"
                      checked={form.eventIds.includes(ev.id)}
                      onChange={(e) => setForm(p => ({
                        ...p,
                        eventIds: e.target.checked ? [...p.eventIds, ev.id] : p.eventIds.filter(id => id !== ev.id)
                      }))} />
                    <span className="text-sm text-gray-700">{ev.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding…' : 'Add guest'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UploadCSVModal({ events, onClose, onUploaded }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [eventIds, setEventIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('eventIds', eventIds.join(','))

    const res = await fetch('/api/guests/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setResult(data)
    setLoading(false)

    if (res.ok) {
      const refreshed = await fetch('/api/guests').then(r => r.json())
      onUploaded(refreshed)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-serif text-xl text-gray-900 mb-1">Upload Guest List</h2>
        <p className="text-sm text-gray-500 mb-4">
          CSV must have a <code className="bg-gray-100 px-1 rounded">name</code> column. Optional: <code className="bg-gray-100 px-1 rounded">email</code>, <code className="bg-gray-100 px-1 rounded">phone</code>
        </p>

        {result ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-700 font-medium">✓ {result.created} guests imported</p>
              {result.skipped > 0 && <p className="text-green-600 text-sm">{result.skipped} skipped</p>}
            </div>
            <button className="btn-primary w-full" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">CSV file *</label>
              <input type="file" accept=".csv" required className="input py-2"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            {events.length > 0 && (
              <div>
                <label className="label">Assign to events</label>
                <div className="space-y-2">
                  {events.map((ev: Event) => (
                    <label key={ev.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded"
                        checked={eventIds.includes(ev.id)}
                        onChange={(e) => setEventIds(p => e.target.checked ? [...p, ev.id] : p.filter(id => id !== ev.id))} />
                      <span className="text-sm text-gray-700">{ev.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Importing…' : 'Import guests'}
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
