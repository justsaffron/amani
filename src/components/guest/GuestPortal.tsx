'use client'
import { useState } from 'react'
import { MapPin, Clock, Tag, Heart, Gift, CheckCircle2, ExternalLink, Loader2, ChevronDown, Star } from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type RsvpStatus = 'PENDING' | 'ATTENDING' | 'DECLINED' | 'MAYBE'

interface EventData {
  id: string
  name: string
  description?: string | null
  date: string
  venue?: string | null
  address?: string | null
  city?: string | null
  dressCode?: string | null
  notes?: string | null
  rsvpStatus: RsvpStatus
  plusOne: boolean
  plusOneName?: string | null
  dietaryNotes?: string | null
}

interface RegistryItemData {
  id: string
  name: string
  description?: string | null
  amount: number
  imageUrl?: string | null
  externalUrl?: string | null
  isFunded: boolean
  raised: number
}

interface PortalData {
  user: { id: string; coupleName: string; heroMessage?: string | null; accentColor: string; photoUrl?: string | null; slug: string }
  guest: { id: string; name: string; token: string }
  events: EventData[]
  registryItems: RegistryItemData[]
}

export function GuestPortal({ data, giftStatus }: { data: PortalData; giftStatus?: string }) {
  const [tab, setTab] = useState<'events' | 'registry'>('events')
  const [rsvpStates, setRsvpStates] = useState<Record<string, { status: RsvpStatus; plusOne: boolean; plusOneName: string; dietaryNotes: string }>>(
    Object.fromEntries(data.events.map((e) => [e.id, {
      status: e.rsvpStatus,
      plusOne: e.plusOne,
      plusOneName: e.plusOneName || '',
      dietaryNotes: e.dietaryNotes || '',
    }]))
  )
  const [rsvpSaving, setRsvpSaving] = useState(false)
  const [rsvpSaved, setRsvpSaved] = useState(false)

  async function saveRsvp() {
    setRsvpSaving(true)
    const rsvps = data.events.map((e) => ({
      eventId: e.id,
      ...rsvpStates[e.id],
    }))

    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: data.guest.token, rsvps }),
    })

    setRsvpSaving(false)
    setRsvpSaved(true)
  }

  async function sendGift(registryItemId: string | null, amount: number, customGuestName?: string, message?: string) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: data.guest.token,
        registryItemId,
        customAmount: amount,
        guestName: customGuestName || data.guest.name,
        message,
      }),
    })
    const json = await res.json()
    if (json.url) window.location.href = json.url
  }

  const color = data.user.accentColor || '#e05c60'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="relative py-20 px-4 text-center text-white overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5" />
        </div>

        <div className="relative">
          <p className="text-sm font-medium tracking-widest uppercase opacity-80 mb-3">You're invited</p>
          <h1 className="font-serif text-5xl md:text-6xl font-light mb-3">{data.user.coupleName}</h1>
          {data.user.heroMessage && (
            <p className="text-lg opacity-90 italic max-w-md mx-auto">{data.user.heroMessage}</p>
          )}
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm">
            <Heart className="w-4 h-4 fill-current" />
            <span>Dear {data.guest.name}</span>
          </div>
        </div>
      </div>

      {/* Gift success banner */}
      {giftStatus === 'success' && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-3 text-center">
          <p className="text-green-700 font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Thank you for your gift! The couple will be so touched.
          </p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Tabs */}
        {data.registryItems.length > 0 && (
          <div className="flex gap-2 bg-gray-200 p-1 rounded-xl mb-6">
            {(['events', 'registry'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                  tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t === 'events' ? '💒 My Events' : '🎁 Gift Registry'}
              </button>
            ))}
          </div>
        )}

        {/* Events tab */}
        {tab === 'events' && (
          <div className="space-y-6">
            {data.events.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">No events assigned yet.</p>
              </div>
            ) : (
              <>
                {data.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    accentColor={color}
                    rsvpState={rsvpStates[event.id]}
                    onRsvpChange={(updates) =>
                      setRsvpStates((prev) => ({ ...prev, [event.id]: { ...prev[event.id], ...updates } }))
                    }
                  />
                ))}

                {/* RSVP submit */}
                <div className="card text-center">
                  {rsvpSaved ? (
                    <div className="flex flex-col items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-10 h-10" />
                      <p className="font-semibold text-lg">RSVP saved!</p>
                      <p className="text-sm text-gray-500">Thank you — we'll see you soon 💕</p>
                      <button onClick={() => setRsvpSaved(false)} className="text-sm text-gray-400 hover:underline mt-1">
                        Update RSVP
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-500 text-sm mb-4">
                        Please let us know if you'll be joining us
                      </p>
                      <button
                        onClick={saveRsvp}
                        disabled={rsvpSaving}
                        className="btn-primary flex items-center gap-2 mx-auto"
                        style={{ background: color }}
                      >
                        {rsvpSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {rsvpSaving ? 'Saving…' : 'Submit RSVP'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Registry tab */}
        {tab === 'registry' && (
          <RegistryTab
            items={data.registryItems}
            guestToken={data.guest.token}
            guestName={data.guest.name}
            accentColor={color}
            onGift={sendGift}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-blush-400 fill-current" /> by Amani
        </p>
      </footer>
    </div>
  )
}

function EventCard({ event, accentColor, rsvpState, onRsvpChange }: {
  event: EventData
  accentColor: string
  rsvpState: { status: RsvpStatus; plusOne: boolean; plusOneName: string; dietaryNotes: string }
  onRsvpChange: (updates: Partial<typeof rsvpState>) => void
}) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Event header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl text-gray-900">{event.name}</h2>
            {event.description && <p className="text-gray-500 text-sm mt-1">{event.description}</p>}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400">
            <ChevronDown className={cn('w-5 h-5 transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {formatDate(event.date)} · {formatTime(event.date)}
          </span>
          {(event.venue || event.city) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gray-400" />
              {event.venue}{event.city ? `, ${event.city}` : ''}
            </span>
          )}
          {event.dressCode && (
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gray-400" />
              {event.dressCode}
            </span>
          )}
        </div>

        {event.address && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue || ''} ${event.address} ${event.city || ''}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm flex items-center gap-1 hover:underline"
            style={{ color: accentColor }}
          >
            <MapPin className="w-3.5 h-3.5" />
            {event.address}{event.city ? `, ${event.city}` : ''}
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}
      </div>

      {/* RSVP section */}
      {expanded && (
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Will you be attending?</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'ATTENDING', label: '✓ Attending', activeClass: 'bg-green-500 text-white border-green-500' },
                { value: 'MAYBE', label: '? Maybe', activeClass: 'bg-yellow-400 text-white border-yellow-400' },
                { value: 'DECLINED', label: '✕ Decline', activeClass: 'bg-red-500 text-white border-red-500' },
              ] as const).map(({ value, label, activeClass }) => (
                <button
                  key={value}
                  onClick={() => onRsvpChange({ status: value })}
                  className={cn(
                    'py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                    rsvpState.status === value
                      ? activeClass
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {rsvpState.status === 'ATTENDING' && (
            <>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={rsvpState.plusOne}
                    onChange={(e) => onRsvpChange({ plusOne: e.target.checked })}
                  />
                  <span className="text-gray-700">Bringing a +1</span>
                </label>
                {rsvpState.plusOne && (
                  <input
                    type="text"
                    className="input mt-2 text-sm"
                    placeholder="+1 guest name (optional)"
                    value={rsvpState.plusOneName}
                    onChange={(e) => onRsvpChange({ plusOneName: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="label text-xs">Dietary requirements (optional)</label>
                <input
                  type="text"
                  className="input text-sm"
                  placeholder="e.g. Halal, vegetarian, nut allergy"
                  value={rsvpState.dietaryNotes}
                  onChange={(e) => onRsvpChange({ dietaryNotes: e.target.value })}
                />
              </div>
            </>
          )}

          {event.notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800">
              <p className="font-medium mb-0.5">Notes from the couple</p>
              <p>{event.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegistryTab({ items, guestToken, guestName, accentColor, onGift }: {
  items: RegistryItemData[]
  guestToken: string
  guestName: string
  accentColor: string
  onGift: (itemId: string | null, amount: number, name?: string, msg?: string) => void
}) {
  const [selectedItem, setSelectedItem] = useState<RegistryItemData | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [gifterName, setGifterName] = useState(guestName)
  const [paying, setPaying] = useState(false)

  async function handleGift() {
    const amount = Math.round(parseFloat(customAmount) * 100)
    if (!amount || amount < 100) return
    setPaying(true)
    await onGift(selectedItem?.id || null, amount, gifterName, message)
  }

  if (items.length === 0) {
    return (
      <div className="card text-center py-16">
        <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-400">Registry coming soon</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm">
        Choose a gift to contribute to, or send a gift of your choice.
        Contributions go directly to the couple.
      </p>

      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.raised / item.amount) * 100))
        const isSelected = selectedItem?.id === item.id

        return (
          <div
            key={item.id}
            onClick={() => {
              setSelectedItem(isSelected ? null : item)
              if (!isSelected) setCustomAmount((item.amount / 100).toFixed(0))
            }}
            className={cn(
              'bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all',
              isSelected ? 'border-blush-400 shadow-md' : 'border-gray-100 hover:border-gray-200',
              item.isFunded && 'opacity-70'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.isFunded && (
                    <span className="badge bg-green-50 text-green-600 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />Funded
                    </span>
                  )}
                </div>
                {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{formatCurrency(item.raised)} raised</span>
                    <span>Goal: {formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accentColor }} />
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all',
                  isSelected ? 'border-blush-500 bg-blush-500' : 'border-gray-300'
                )}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
            </div>
          </div>
        )
      })}

      {/* Open contribution option */}
      <div
        onClick={() => { setSelectedItem(null); setCustomAmount('') }}
        className={cn(
          'bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all',
          selectedItem === null && customAmount ? 'border-blush-400 shadow-md' : 'border-dashed border-gray-200 hover:border-gray-300'
        )}
      >
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-champagne-500" />
          <div>
            <p className="font-semibold text-gray-900">Send a gift of your choice</p>
            <p className="text-sm text-gray-500">Any amount, with love</p>
          </div>
        </div>
      </div>

      {/* Gift form */}
      {(selectedItem !== null || (selectedItem === null)) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">
            {selectedItem ? `Contribute to "${selectedItem.name}"` : 'Send a gift'}
          </h3>

          <div>
            <label className="label">Amount (USD) *</label>
            <div className="flex gap-2 mb-2">
              {[25, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCustomAmount(amt.toString())}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm transition-all',
                    customAmount === amt.toString()
                      ? 'border-blush-400 bg-blush-50 text-blush-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  ${amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              step="1"
              className="input"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Your name</label>
            <input type="text" className="input" value={gifterName} onChange={(e) => setGifterName(e.target.value)} />
          </div>

          <div>
            <label className="label">Leave a message (optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Congratulations and best wishes!"
              value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <button
            onClick={handleGift}
            disabled={!customAmount || parseFloat(customAmount) < 1 || paying}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ background: accentColor }}
          >
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            {paying ? 'Redirecting to payment…' : `Send $${customAmount || '—'} gift`}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Secured by Stripe · Your payment info is never stored
          </p>
        </div>
      )}
    </div>
  )
}
