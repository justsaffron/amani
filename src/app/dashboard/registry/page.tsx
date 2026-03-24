'use client'
import { useEffect, useState } from 'react'
import { Gift, Plus, Trash2, ExternalLink, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RegistryItem {
  id: string
  name: string
  description?: string
  amount: number
  imageUrl?: string
  externalUrl?: string
  isFunded: boolean
  gifts: Array<{ amount: number }>
}

export default function RegistryPage() {
  const [items, setItems] = useState<RegistryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/registry').then((r) => r.json()).then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  async function deleteItem(id: string) {
    if (!confirm('Remove this registry item?')) return
    await fetch(`/api/registry?id=${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const totalTarget = items.reduce((sum, i) => sum + i.amount, 0)
  const totalRaised = items.reduce((sum, i) => sum + i.gifts.reduce((s, g) => s + g.amount, 0), 0)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Gift Registry</h1>
          <p className="text-gray-500 mt-1">Manage your wedding gift wishlist</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add item
        </button>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="card bg-gradient-to-r from-blush-50 to-champagne-50 border-blush-100">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Total raised</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalRaised)}</p>
            </div>
            <div className="text-gray-300">·</div>
            <div>
              <p className="text-sm text-gray-500">Registry total</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalTarget)}</p>
            </div>
            <div className="flex-1 ml-4">
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div
                  className="h-full bg-blush-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalRaised / totalTarget) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0}% funded
              </p>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card text-center py-16">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 text-lg mb-2">No registry items yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add items for guests to contribute to</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Add first item</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const raised = item.gifts.reduce((sum, g) => sum + g.amount, 0)
            const pct = Math.min(100, Math.round((raised / item.amount) * 100))

            return (
              <div key={item.id} className={`card relative group ${item.isFunded ? 'opacity-75' : ''}`}>
                {item.isFunded && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Funded!
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                  {!item.isFunded && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                )}

                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{formatCurrency(raised)} raised</span>
                    <span>Goal: {formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blush-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% funded</p>
                </div>

                {item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blush-600 hover:underline mt-3"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View product
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <AddItemModal
          onClose={() => setShowModal(false)}
          onAdded={(item: RegistryItem) => {
            setItems((prev) => [...prev, { ...item, gifts: [] }])
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

function AddItemModal({ onClose, onAdded }: any) {
  const [form, setForm] = useState({ name: '', description: '', amount: '', imageUrl: '', externalUrl: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/registry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: Math.round(parseFloat(form.amount) * 100) }),
    })

    if (res.ok) {
      const item = await res.json()
      onAdded(item)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to add item')
      setLoading(false)
    }
  }

  const suggestions = [
    { name: 'Honeymoon Fund', amount: '500' },
    { name: 'Home Appliance Fund', amount: '300' },
    { name: 'New Home Fund', amount: '1000' },
    { name: 'Experience Gift', amount: '150' },
  ]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-xl text-gray-900 mb-4">Add Registry Item</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <button key={s.name} type="button"
              onClick={() => setForm(p => ({ ...p, name: s.name, amount: s.amount }))}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-blush-300 hover:bg-blush-50 hover:text-blush-600 transition-colors"
            >
              {s.name}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div>
            <label className="label">Item name *</label>
            <input type="text" className="input" required value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Target amount ($) *</label>
            <input type="number" step="0.01" min="1" className="input" required value={form.amount}
              onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} />
          </div>
          <div>
            <label className="label">Product link (optional)</label>
            <input type="url" className="input" placeholder="https://amazon.com/…" value={form.externalUrl}
              onChange={(e) => setForm(p => ({ ...p, externalUrl: e.target.value }))} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding…' : 'Add item'}
            </button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
