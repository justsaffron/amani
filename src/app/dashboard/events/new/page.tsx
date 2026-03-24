'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', description: '', date: '', endTime: '',
    venue: '', address: '', city: '', dressCode: '', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, date: new Date(form.date).toISOString() }),
    })

    if (res.ok) {
      router.push('/dashboard/events')
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
    }
  }

  const presets = ['Nikah Ceremony', 'Walima Reception', 'Mehndi Night', 'Haldi Ceremony', 'Engagement Party', 'Rehearsal Dinner']

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/events" className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-gray-900">New Event</h1>
          <p className="text-gray-500 mt-0.5">Add a wedding event for your guests</p>
        </div>
      </div>

      {/* Quick presets */}
      <div className="card mb-6">
        <p className="text-sm text-gray-500 mb-3">Quick fill:</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, name: p }))}
              className="text-sm px-3 py-1.5 rounded-full border border-gray-200 hover:border-blush-300 hover:bg-blush-50 hover:text-blush-600 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <div>
          <label className="label">Event name *</label>
          <input name="name" type="text" className="input" placeholder="e.g. Walima Reception" value={form.name} onChange={handleChange} required />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea name="description" className="input resize-none" rows={2} placeholder="Optional details for guests" value={form.description} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date & time *</label>
            <input name="date" type="datetime-local" className="input" value={form.date} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">End time (optional)</label>
            <input name="endTime" type="time" className="input" value={form.endTime} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="label">Venue name</label>
          <input name="venue" type="text" className="input" placeholder="e.g. The Grand Ballroom" value={form.venue} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Address</label>
            <input name="address" type="text" className="input" placeholder="123 Main St" value={form.address} onChange={handleChange} />
          </div>
          <div>
            <label className="label">City</label>
            <input name="city" type="text" className="input" placeholder="London" value={form.city} onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="label">Dress code</label>
          <input name="dressCode" type="text" className="input" placeholder="e.g. Black tie, Smart casual" value={form.dressCode} onChange={handleChange} />
        </div>

        <div>
          <label className="label">Notes for guests</label>
          <textarea name="notes" className="input resize-none" rows={2} placeholder="Parking info, entrance details, etc." value={form.notes} onChange={handleChange} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Saving…' : 'Create event'}
          </button>
          <Link href="/dashboard/events" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
