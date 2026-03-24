'use client'
import { useEffect, useState } from 'react'
import {
  Search, MapPin, Star, Phone, Globe, Plus, BookmarkPlus, CheckCircle2,
  Archive, Trash2, MessageSquare, Mail, Calendar, Loader2,
  ExternalLink, ChevronDown, Trophy, MoreVertical
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const SEARCH_CATEGORIES = [
  { value: 'venue',       label: 'Venues',      emoji: '🏛️', maxResults: 10 },
  { value: 'catering',    label: 'Catering',    emoji: '🍽️', maxResults: 5 },
  { value: 'photography', label: 'Photography', emoji: '📸', maxResults: 5 },
  { value: 'decoration',  label: 'Decoration',  emoji: '💐', maxResults: 5 },
  { value: 'music',       label: 'Music & DJ',  emoji: '🎵', maxResults: 5 },
  { value: 'cake',        label: 'Cake',        emoji: '🎂', maxResults: 5 },
]

const STATUS_CONFIG = {
  CONSIDERING:        { label: 'Considering',        color: 'bg-gray-100 text-gray-600' },
  CONTACTED:          { label: 'Contacted',          color: 'bg-blue-100 text-blue-700' },
  QUOTE_RECEIVED:     { label: 'Quote received',     color: 'bg-yellow-100 text-yellow-700' },
  MEETING_SCHEDULED:  { label: 'Meeting scheduled',  color: 'bg-orange-100 text-orange-700' },
  BOOKED:             { label: 'Booked ✓',           color: 'bg-green-100 text-green-700' },
  DECLINED:           { label: 'Declined',           color: 'bg-red-100 text-red-600' },
}

const COMM_ICONS: Record<string, any> = {
  email: Mail, call: Phone, meeting: Calendar, note: MessageSquare
}

interface SearchResult {
  googlePlaceId: string
  name: string
  address: string
  phone?: string
  website?: string
  rating?: number
  reviewCount: number
  estimatedCostLow: number
  estimatedCostHigh: number
  estimatedCostLabel: string
  photoUrl?: string
}

interface SavedVendor {
  id: string
  category: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  estimatedCost?: number
  notes?: string
  status: string
  isSelected: boolean
  isArchived: boolean
  communications: Array<{ id: string; type: string; summary: string; date: string }>
}

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'saved'>('search')
  const [searchForm, setSearchForm] = useState({ location: '', guestCount: 100, category: 'venue' })
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState('')
  const [savedVendors, setSavedVendors] = useState<SavedVendor[]>([])
  const [savedLoading, setSavedLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<SavedVendor | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSaved()
    // Pre-fill location from wedding settings
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.weddingCity) setSearchForm(p => ({ ...p, location: d.weddingCity }))
      if (d.estimatedGuests) setSearchForm(p => ({ ...p, guestCount: d.estimatedGuests }))
    })
  }, [])

  async function loadSaved() {
    const data = await fetch(`/api/vendors/saved?archived=${showArchived}`).then(r => r.json())
    setSavedVendors(Array.isArray(data) ? data : [])
    setSavedLoading(false)
    setSavedIds(new Set((data as SavedVendor[]).map(v => v.googlePlaceId).filter(Boolean) as string[]))
  }

  async function doSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearching(true)
    setSearchError('')
    setSearchResults([])

    const res = await fetch('/api/vendors/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchForm),
    })
    const data = await res.json()

    if (!res.ok) {
      setSearchError(data.error || 'Search failed')
    } else {
      setSearchResults(data.results || [])
    }
    setSearching(false)
  }

  async function saveVendor(result: SearchResult) {
    const catMap: Record<string, string> = {
      venue: 'VENUE', catering: 'CATERING', photography: 'PHOTOGRAPHY',
      decoration: 'DECORATION', music: 'MUSIC', cake: 'CAKE',
    }
    const res = await fetch('/api/vendors/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: catMap[searchForm.category] || 'OTHER',
        name: result.name,
        address: result.address,
        phone: result.phone,
        website: result.website,
        googlePlaceId: result.googlePlaceId,
        rating: result.rating,
        estimatedCost: result.estimatedCostMid,
      }),
    })
    if (res.ok) {
      const vendor = await res.json()
      setSavedVendors(prev => [vendor, ...prev])
      setSavedIds(prev => new Set([...prev, result.googlePlaceId]))
    }
  }

  async function updateVendor(id: string, updates: any) {
    const res = await fetch(`/api/vendors/saved/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      const updated = await res.json()
      setSavedVendors(prev => prev.map(v => v.id === id ? updated : v.id !== id && updated.category === v.category && updates.isSelected ? { ...v, isSelected: false } : v))
      if (selectedVendor?.id === id) setSelectedVendor(updated)
    }
  }

  async function deleteVendor(id: string) {
    if (!confirm('Remove this vendor?')) return
    await fetch(`/api/vendors/saved/${id}`, { method: 'DELETE' })
    setSavedVendors(prev => prev.filter(v => v.id !== id))
    if (selectedVendor?.id === id) setSelectedVendor(null)
  }

  async function addComm(vendorId: string, type: string, summary: string) {
    const res = await fetch(`/api/vendors/saved/${vendorId}/comms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, summary }),
    })
    if (res.ok) {
      const comm = await res.json()
      setSavedVendors(prev => prev.map(v =>
        v.id === vendorId ? { ...v, communications: [comm, ...v.communications] } : v
      ))
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor(prev => prev ? { ...prev, communications: [comm, ...prev.communications] } : prev)
      }
    }
  }

  const filteredSaved = savedVendors.filter(v => {
    if (!showArchived && v.isArchived) return false
    if (filterCategory && v.category !== filterCategory) return false
    return true
  })

  const groupedSaved = filteredSaved.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = []
    acc[v.category].push(v)
    return acc
  }, {} as Record<string, SavedVendor[]>)

  const bookedCount = savedVendors.filter(v => v.status === 'BOOKED').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">Search, compare, and book the perfect team for your day</p>
        </div>
        {bookedCount > 0 && (
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-2 rounded-xl text-sm font-medium">
            <Trophy className="w-4 h-4" />
            {bookedCount} vendor{bookedCount > 1 ? 's' : ''} booked
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(['search', 'saved'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize',
              activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}>
            {t === 'search' ? '🔍 Find Vendors' : `📋 Saved (${savedVendors.filter(v => !v.isArchived).length})`}
          </button>
        ))}
      </div>

      {/* ── SEARCH TAB ── */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search form */}
          <form onSubmit={doSearch} className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Find vendors in your area</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="label">Location *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" className="input pl-9" placeholder="City or area" required
                    value={searchForm.location} onChange={e => setSearchForm(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Guest count</label>
                <input type="number" className="input" min={10} max={2000} value={searchForm.guestCount}
                  onChange={e => setSearchForm(p => ({ ...p, guestCount: parseInt(e.target.value) || 100 }))} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={searchForm.category} onChange={e => setSearchForm(p => ({ ...p, category: e.target.value }))}>
                  {SEARCH_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label} (top {c.maxResults})</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? 'Searching…' : 'Search vendors'}
            </button>
          </form>

          {searchError && (
            <div className="card border-amber-200 bg-amber-50">
              <p className="text-amber-700 font-medium mb-1">Search unavailable</p>
              <p className="text-amber-600 text-sm">{searchError}</p>
              {searchError.includes('API key') && (
                <p className="text-amber-600 text-sm mt-2">
                  Add <code className="bg-amber-100 px-1 rounded">GOOGLE_PLACES_API_KEY</code> to your environment variables.
                  Get a key at <a href="https://console.cloud.google.com" target="_blank" className="underline">Google Cloud Console</a>.
                </p>
              )}
            </div>
          )}

          {searchResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">
                  {searchResults.length} results for {SEARCH_CATEGORIES.find(c => c.value === searchForm.category)?.label} in {searchForm.location}
                </h2>
                <p className="text-xs text-gray-400">Quotes are rough estimates — contact vendors for actual pricing</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((result) => {
                  const alreadySaved = savedIds.has(result.googlePlaceId)
                  return (
                    <div key={result.googlePlaceId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      {result.photoUrl && (
                        <div className="h-36 bg-gray-100 overflow-hidden">
                          <img src={result.photoUrl} alt={result.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 leading-tight">{result.name}</h3>
                          {result.rating && (
                            <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="text-sm font-medium">{result.rating}</span>
                              <span className="text-xs text-gray-400">({result.reviewCount})</span>
                            </div>
                          )}
                        </div>

                        {result.address && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />{result.address}
                          </p>
                        )}

                        <div className="bg-blush-50 rounded-lg px-3 py-2 mb-3">
                          <p className="text-xs text-gray-500">Rough estimate ({result.estimatedCostLabel})</p>
                          <p className="font-semibold text-blush-700">
                            {formatCurrency(result.estimatedCostLow)} – {formatCurrency(result.estimatedCostHigh)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-2">
                            {result.phone && (
                              <a href={`tel:${result.phone}`} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                            {result.website && (
                              <a href={result.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                                <Globe className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => saveVendor(result)}
                            disabled={alreadySaved}
                            className={cn('flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all',
                              alreadySaved
                                ? 'bg-green-50 text-green-600 cursor-default'
                                : 'bg-blush-50 text-blush-600 hover:bg-blush-100'
                            )}
                          >
                            {alreadySaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                            {alreadySaved ? 'Saved' : 'Save vendor'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SAVED TAB ── */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-center">
            <select className="input py-1.5 text-sm max-w-[180px]" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All categories</option>
              {SEARCH_CATEGORIES.map(c => <option key={c.value} value={c.value.toUpperCase()}>{c.emoji} {c.label}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="rounded" checked={showArchived} onChange={e => { setShowArchived(e.target.checked); loadSaved() }} />
              Show archived
            </label>
            <button onClick={() => { setSavedVendors([]); setSavedLoading(true); loadSaved() }} className="btn-ghost text-sm flex items-center gap-1">
              <Search className="w-3.5 h-3.5" />Add manually
            </button>
          </div>

          {savedLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>
          ) : filteredSaved.length === 0 ? (
            <div className="card text-center py-16">
              <BookmarkPlus className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No saved vendors yet</h3>
              <p className="text-gray-500 text-sm mb-4">Search for vendors and save the ones you're interested in</p>
              <button onClick={() => setActiveTab('search')} className="btn-primary">Find vendors</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSaved.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  isSelected={selectedVendor?.id === vendor.id}
                  onSelect={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                  onUpdate={(updates) => updateVendor(vendor.id, updates)}
                  onDelete={() => deleteVendor(vendor.id)}
                  onAddComm={(type, summary) => addComm(vendor.id, type, summary)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VendorCard({ vendor, isSelected, onSelect, onUpdate, onDelete, onAddComm }: {
  vendor: SavedVendor
  isSelected: boolean
  onSelect: () => void
  onUpdate: (u: any) => void
  onDelete: () => void
  onAddComm: (type: string, summary: string) => void
}) {
  const [showCommForm, setShowCommForm] = useState(false)
  const [commType, setCommType] = useState('note')
  const [commSummary, setCommSummary] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(vendor.notes || '')

  const status = STATUS_CONFIG[vendor.status as keyof typeof STATUS_CONFIG]

  async function submitComm(e: React.FormEvent) {
    e.preventDefault()
    if (!commSummary.trim()) return
    await onAddComm(commType, commSummary)
    setCommSummary('')
    setShowCommForm(false)
  }

  async function saveNotes() {
    onUpdate({ notes })
    setShowNotes(false)
  }

  return (
    <div className={cn('bg-white rounded-2xl border-2 overflow-hidden transition-all',
      vendor.isSelected ? 'border-green-400 shadow-md' :
      vendor.isArchived ? 'border-gray-100 opacity-60' : 'border-gray-100 hover:border-gray-200'
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 truncate">{vendor.name}</h3>
              {vendor.isSelected && (
                <span className="badge bg-green-50 text-green-700 flex items-center gap-1 text-xs">
                  <Trophy className="w-3 h-3" />Chosen
                </span>
              )}
              {vendor.isArchived && (
                <span className="badge bg-gray-100 text-gray-500 text-xs">Archived</span>
              )}
            </div>
            {vendor.address && (
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />{vendor.address}
              </p>
            )}
          </div>
          <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {vendor.rating && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-current" />{vendor.rating}
            </span>
          )}
          {vendor.estimatedCost && (
            <span className="text-xs text-gray-500 bg-blush-50 px-2 py-0.5 rounded-full">
              ~{formatCurrency(vendor.estimatedCost)}
            </span>
          )}
          <select
            value={vendor.status}
            onChange={e => onUpdate({ status: e.target.value })}
            onClick={e => e.stopPropagation()}
            className={cn('text-xs rounded-full px-2 py-0.5 border-0 font-medium focus:outline-none cursor-pointer', status?.color)}
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Contact links */}
        <div className="flex gap-2 mt-3">
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {vendor.email && (
            <a href={`mailto:${vendor.email}`} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="flex-1" />

          {/* Actions */}
          {!vendor.isSelected && !vendor.isArchived && (
            <button
              onClick={() => onUpdate({ isSelected: true, archiveOthers: true })}
              className="flex items-center gap-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1.5 rounded-lg transition-colors"
            >
              <Trophy className="w-3 h-3" />Lock in
            </button>
          )}
          {!vendor.isArchived && (
            <button onClick={() => onUpdate({ isArchived: true })} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Archive className="w-3 h-3" />Archive
            </button>
          )}
        </div>
      </div>

      {/* Communication log */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Communications</p>
          <button onClick={() => setShowCommForm(!showCommForm)} className="text-xs text-blush-600 hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" />Log
          </button>
        </div>

        {showCommForm && (
          <form onSubmit={submitComm} className="space-y-2 mb-3 bg-gray-50 rounded-xl p-3">
            <div className="flex gap-2">
              <select className="input text-xs py-1.5 flex-shrink-0 w-28" value={commType} onChange={e => setCommType(e.target.value)}>
                <option value="note">📝 Note</option>
                <option value="email">✉️ Email</option>
                <option value="call">📞 Call</option>
                <option value="meeting">📅 Meeting</option>
              </select>
              <input type="text" className="input text-xs py-1.5 flex-1" placeholder="Brief summary…" required
                value={commSummary} onChange={e => setCommSummary(e.target.value)} />
              <button type="submit" className="bg-blush-500 text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
            </div>
          </form>
        )}

        {vendor.communications.length === 0 ? (
          <p className="text-xs text-gray-400">No communications logged yet</p>
        ) : (
          <div className="space-y-1.5">
            {vendor.communications.slice(0, 3).map(comm => {
              const Icon = COMM_ICONS[comm.type] || MessageSquare
              return (
                <div key={comm.id} className="flex items-start gap-2 text-xs">
                  <Icon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 flex-1 truncate">{comm.summary}</span>
                  <span className="text-gray-400 flex-shrink-0">{format(new Date(comm.date), 'MMM d')}</span>
                </div>
              )
            })}
            {vendor.communications.length > 3 && (
              <p className="text-xs text-gray-400">+{vendor.communications.length - 3} more</p>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="border-t border-gray-100 px-4 py-2">
        {showNotes ? (
          <div className="flex gap-2">
            <input type="text" className="input text-xs py-1.5 flex-1" placeholder="Add notes…"
              value={notes} onChange={e => setNotes(e.target.value)} />
            <button onClick={saveNotes} className="text-xs text-blush-600 hover:underline">Save</button>
          </div>
        ) : (
          <button onClick={() => setShowNotes(true)} className="text-xs text-gray-400 hover:text-gray-600 w-full text-left">
            {vendor.notes || '+ Add notes'}
          </button>
        )}
      </div>
    </div>
  )
}
