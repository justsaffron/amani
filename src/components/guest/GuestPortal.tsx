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

function HennaDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-8">
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
      <svg width="80" height="20" viewBox="0 0 80 20" fill="none">
        <path d="M40 2L44 10L40 18L36 10Z" fill="#C9A84C" fillOpacity="0.8"/>
        <path d="M26 7L29 10L26 13L23 10Z" fill="#C9A84C" fillOpacity="0.5"/>
        <path d="M54 7L57 10L54 13L51 10Z" fill="#C9A84C" fillOpacity="0.5"/>
        <circle cx="10" cy="10" r="2" fill="#C9A84C" fillOpacity="0.3"/>
        <circle cx="70" cy="10" r="2" fill="#C9A84C" fillOpacity="0.3"/>
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
    </div>
  )
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
    const rsvps = data.events.map((e) => ({ eventId: e.id, ...rsvpStates[e.id] }))
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
      body: JSON.stringify({ token: data.guest.token, registryItemId, customAmount: amount, guestName: customGuestName || data.guest.name, message }),
    })
    const json = await res.json()
    if (json.url) window.location.href = json.url
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FDF8F0' }}>
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #2C1810 0%, #6B4226 60%, #8B2500 100%)', paddingTop: '5rem', paddingBottom: '5rem' }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }} />
        {/* Top gold border */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        <div className="relative text-center px-4">
          <p className="text-xs font-medium tracking-[0.25em] uppercase mb-4" style={{ color: '#EDCF6E', opacity: 0.9 }}>
            You are cordially invited
          </p>
          <h1 className="font-serif font-light mb-4" style={{ color: '#F7EDD8', fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.1 }}>
            {data.user.coupleName}
          </h1>
          {data.user.heroMessage && (
            <p className="font-serif italic text-lg max-w-md mx-auto mb-6" style={{ color: '#EDCF6E', opacity: 0.9 }}>
              {data.user.heroMessage}
            </p>
          )}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm" style={{ backgroundColor: 'rgba(201, 168, 76, 0.2)', border: '1px solid rgba(201, 168, 76, 0.5)', color: '#F7EDD8' }}>
            <Heart className="w-3.5 h-3.5 fill-current" style={{ color: '#C9A84C' }} />
            Dear {data.guest.name}
          </div>
        </div>
      </div>

      {/* Gift success banner */}
      {giftStatus === 'success' && (
        <div className="px-4 py-3 text-center" style={{ backgroundColor: '#FBF5E0', borderBottom: '1px solid #E8D5B0' }}>
          <p className="font-medium flex items-center justify-center gap-2" style={{ color: '#8B6914' }}>
            <CheckCircle2 className="w-5 h-5" />
            Thank you for your beautiful gift! The couple will be so touched. 💛
          </p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <HennaDivider />

        {/* Tabs */}
        {data.registryItems.length > 0 && (
          <div className="flex gap-2 p-1 rounded-xl mb-8" style={{ backgroundColor: '#F7EDD8' }}>
            {(['events', 'registry'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={
                  tab === t
                    ? { backgroundColor: '#FFFDF7', color: '#2C1810', boxShadow: '0 1px 4px rgba(139, 69, 20, 0.12)' }
                    : { color: '#6B4226' }
                }
              >
                {t === 'events' ? '🕌 My Events' : '🎁 Gift Registry'}
              </button>
            ))}
          </div>
        )}

        {/* Events tab */}
        {tab === 'events' && (
          <div className="space-y-6">
            {data.events.length === 0 ? (
              <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFDF7', border: '1px solid #E8D5B0' }}>
                <p style={{ color: '#B8825A' }}>No events assigned yet.</p>
              </div>
            ) : (
              <>
                {data.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    rsvpState={rsvpStates[event.id]}
                    onRsvpChange={(updates) =>
                      setRsvpStates((prev) => ({ ...prev, [event.id]: { ...prev[event.id], ...updates } }))
                    }
                  />
                ))}

                {/* RSVP submit */}
                <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: '#FFFDF7', border: '1px solid #E8D5B0', boxShadow: '0 4px 24px rgba(139, 69, 20, 0.08)' }}>
                  {rsvpSaved ? (
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-10 h-10" style={{ color: '#C9A84C' }} />
                      <p className="font-serif text-xl font-light" style={{ color: '#2C1810' }}>RSVP Received</p>
                      <p className="text-sm" style={{ color: '#6B4226' }}>Thank you — we can&apos;t wait to celebrate with you 💛</p>
                      <button onClick={() => setRsvpSaved(false)} className="text-sm hover:underline mt-1" style={{ color: '#B8825A' }}>
                        Update RSVP
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mb-5" style={{ color: '#6B4226' }}>
                        Please let us know if you&apos;ll be joining us
                      </p>
                      <button
                        onClick={saveRsvp}
                        disabled={rsvpSaving}
                        className="btn-primary mx-auto"
                      >
                        {rsvpSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {rsvpSaving ? 'Saving…' : 'Confirm my RSVP'}
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
            onGift={sendGift}
          />
        )}

        <HennaDivider />
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm" style={{ color: '#B8825A', borderTop: '1px solid #E8D5B0' }}>
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 fill-current mx-1" style={{ color: '#C9A84C' }} /> by Amani
        </p>
      </footer>
    </div>
  )
}

function EventCard({ event, rsvpState, onRsvpChange }: {
  event: EventData
  rsvpState: { status: RsvpStatus; plusOne: boolean; plusOneName: string; dietaryNotes: string }
  onRsvpChange: (updates: Partial<typeof rsvpState>) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const mapsQuery = encodeURIComponent([event.venue, event.address, event.city].filter(Boolean).join(' '))

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFDF7', border: '1.5px solid #E8D5B0', boxShadow: '0 4px 24px rgba(139, 69, 20, 0.08)' }}>
      {/* Gold top accent */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #C9A84C, #8B6914)' }} />

      {/* Event header */}
      <div className="p-5" style={{ borderBottom: expanded ? '1px solid #E8D5B0' : 'none' }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-2xl font-light" style={{ color: '#2C1810' }}>{event.name}</h2>
            {event.description && <p className="text-sm mt-1" style={{ color: '#6B4226' }}>{event.description}</p>}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="p-1" style={{ color: '#B8825A' }}>
            <ChevronDown className={cn('w-5 h-5 transition-transform', expanded && 'rotate-180')} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-sm" style={{ color: '#6B4226' }}>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" style={{ color: '#C9A84C' }} />
            {formatDate(event.date)} · {formatTime(event.date)}
          </span>
          {(event.venue || event.city) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" style={{ color: '#C9A84C' }} />
              {event.venue}{event.city ? `, ${event.city}` : ''}
            </span>
          )}
          {event.dressCode && (
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" style={{ color: '#C9A84C' }} />
              {event.dressCode}
            </span>
          )}
        </div>

        {event.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm flex items-center gap-1 hover:underline"
            style={{ color: '#8B6914' }}
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
            <p className="text-sm font-medium mb-2" style={{ color: '#6B4226' }}>Will you be attending?</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'ATTENDING', label: '✓ Attending', activeStyle: { backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' } },
                { value: 'MAYBE',     label: '? Maybe',     activeStyle: { backgroundColor: '#f59e0b', color: 'white', borderColor: '#f59e0b' } },
                { value: 'DECLINED',  label: '✕ Decline',   activeStyle: { backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' } },
              ] as const).map(({ value, label, activeStyle }) => (
                <button
                  key={value}
                  onClick={() => onRsvpChange({ status: value })}
                  className="py-2.5 rounded-xl border-2 text-sm font-medium transition-all"
                  style={rsvpState.status === value ? activeStyle : { borderColor: '#E8D5B0', color: '#6B4226' }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {rsvpState.status === 'ATTENDING' && (
            <>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#6B4226' }}>
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={rsvpState.plusOne}
                    onChange={(e) => onRsvpChange({ plusOne: e.target.checked })}
                  />
                  <span>Bringing a +1</span>
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
            <div className="rounded-xl p-3 text-sm" style={{ backgroundColor: '#FBF5E0', border: '1px solid #E8D5B0' }}>
              <p className="font-medium mb-0.5" style={{ color: '#8B6914' }}>Notes from the couple</p>
              <p style={{ color: '#6B4226' }}>{event.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RegistryTab({ items, guestToken: _guestToken, guestName, onGift }: {
  items: RegistryItemData[]
  guestToken: string
  guestName: string
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
      <div className="rounded-2xl p-16 text-center" style={{ backgroundColor: '#FFFDF7', border: '1px solid #E8D5B0' }}>
        <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: '#E8D5B0' }} />
        <p style={{ color: '#B8825A' }}>Registry coming soon</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: '#6B4226' }}>
        Choose a gift to contribute to, or send a gift of your choice. Contributions go directly to the couple.
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
            className="rounded-2xl p-5 cursor-pointer transition-all"
            style={{
              backgroundColor: '#FFFDF7',
              border: isSelected ? '2px solid #C9A84C' : '1.5px solid #E8D5B0',
              boxShadow: isSelected ? '0 4px 20px rgba(201, 168, 76, 0.2)' : '0 2px 8px rgba(139, 69, 20, 0.05)',
              opacity: item.isFunded ? 0.7 : 1,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold" style={{ color: '#2C1810' }}>{item.name}</h3>
                  {item.isFunded && (
                    <span className="badge text-xs flex items-center gap-1" style={{ backgroundColor: '#FBF5E0', color: '#8B6914' }}>
                      <CheckCircle2 className="w-3 h-3" />Funded
                    </span>
                  )}
                </div>
                {item.description && <p className="text-sm mt-0.5" style={{ color: '#6B4226' }}>{item.description}</p>}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#B8825A' }}>
                    <span>{formatCurrency(item.raised)} raised</span>
                    <span>Goal: {formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#F7EDD8' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C9A84C, #8B6914)' }} />
                  </div>
                </div>
              </div>
              <div
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all"
                style={isSelected ? { borderColor: '#C9A84C', backgroundColor: '#C9A84C' } : { borderColor: '#E8D5B0' }}
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
        className="rounded-2xl p-5 cursor-pointer transition-all"
        style={{
          backgroundColor: '#FFFDF7',
          border: (selectedItem === null && customAmount) ? '2px solid #C9A84C' : '1.5px dashed #E8D5B0',
        }}
      >
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5" style={{ color: '#C9A84C' }} />
          <div>
            <p className="font-semibold" style={{ color: '#2C1810' }}>Send a gift of your choice</p>
            <p className="text-sm" style={{ color: '#6B4226' }}>Any amount, with love</p>
          </div>
        </div>
      </div>

      {/* Gift form */}
      <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: '#FFFDF7', border: '1px solid #E8D5B0' }}>
        <h3 className="font-serif text-lg font-light" style={{ color: '#2C1810' }}>
          {selectedItem ? `Contribute to "${selectedItem.name}"` : 'Send a gift'}
        </h3>

        <div>
          <label className="label">Amount (USD) *</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {[25, 50, 100, 200].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCustomAmount(amt.toString())}
                className="px-3 py-1.5 rounded-lg border text-sm transition-all"
                style={
                  customAmount === amt.toString()
                    ? { borderColor: '#C9A84C', backgroundColor: '#FBF5E0', color: '#8B6914', fontWeight: 500 }
                    : { borderColor: '#E8D5B0', color: '#6B4226' }
                }
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
          className="btn-primary w-full"
        >
          {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
          {paying ? 'Redirecting to payment…' : `Send $${customAmount || '—'} gift`}
        </button>

        <p className="text-xs text-center" style={{ color: '#B8825A' }}>
          Secured by Stripe · Your payment info is never stored
        </p>
      </div>
    </div>
  )
}

