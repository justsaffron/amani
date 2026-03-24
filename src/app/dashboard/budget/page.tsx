'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  DollarSign, Plus, Trash2, CheckCircle2, Circle, Upload,
  Receipt, TrendingUp, AlertCircle, ChevronDown, ChevronRight, Pencil
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const BUDGET_CATEGORIES = [
  { value: 'venue',         label: 'Venue',          emoji: '🏛️' },
  { value: 'catering',      label: 'Catering',       emoji: '🍽️' },
  { value: 'photography',   label: 'Photography',    emoji: '📸' },
  { value: 'decoration',    label: 'Decoration',     emoji: '💐' },
  { value: 'attire',        label: 'Attire',         emoji: '👗' },
  { value: 'music',         label: 'Music & DJ',     emoji: '🎵' },
  { value: 'beauty',        label: 'Hair & Beauty',  emoji: '💄' },
  { value: 'transport',     label: 'Transport',      emoji: '🚗' },
  { value: 'stationery',    label: 'Stationery',     emoji: '✉️' },
  { value: 'cake',          label: 'Cake & Desserts',emoji: '🎂' },
  { value: 'honeymoon',     label: 'Honeymoon',      emoji: '✈️' },
  { value: 'rings',         label: 'Rings & Jewellery', emoji: '💍' },
  { value: 'gifts',         label: 'Guest Favours',  emoji: '🎁' },
  { value: 'other',         label: 'Other',          emoji: '📋' },
]

const PAID_BY_OPTIONS = [
  { value: 'joint',    label: 'Joint / Both' },
  { value: 'partner1', label: 'Partner 1' },
  { value: 'partner2', label: 'Partner 2' },
  { value: 'family',   label: 'Family' },
  { value: 'other',    label: 'Other' },
]

interface BudgetItem {
  id: string
  category: string
  description: string
  estimatedCost: number
  actualCost?: number | null
  paidBy?: string | null
  isPaid: boolean
  paidAt?: string | null
  vendorName?: string | null
  receiptUrl?: string | null
  notes?: string | null
}

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBudget, setTotalBudget] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(BUDGET_CATEGORIES.map(c => c.value)))

  useEffect(() => {
    fetch('/api/budget').then(r => r.json()).then(data => {
      setItems(Array.isArray(data) ? data : [])
      setLoading(false)
    })
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.totalBudget) setTotalBudget(d.totalBudget)
    })
  }, [])

  const stats = useMemo(() => {
    const totalEstimated = items.reduce((s, i) => s + i.estimatedCost, 0)
    const totalActual = items.reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0)
    const totalPaid = items.filter(i => i.isPaid).reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0)
    const remaining = totalBudget > 0 ? totalBudget - totalActual : null

    const byPayer: Record<string, number> = {}
    for (const item of items) {
      const payer = item.paidBy || 'Unassigned'
      byPayer[payer] = (byPayer[payer] || 0) + (item.actualCost ?? item.estimatedCost)
    }

    return { totalEstimated, totalActual, totalPaid, remaining, byPayer }
  }, [items, totalBudget])

  const grouped = useMemo(() => {
    const g: Record<string, BudgetItem[]> = {}
    for (const item of items) {
      if (!g[item.category]) g[item.category] = []
      g[item.category].push(item)
    }
    return g
  }, [items])

  async function togglePaid(item: BudgetItem) {
    const updated = { ...item, isPaid: !item.isPaid }
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
    await fetch(`/api/budget/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid: !item.isPaid }),
    })
  }

  async function deleteItem(id: string) {
    if (!confirm('Remove this budget item?')) return
    setItems(prev => prev.filter(i => i.id !== id))
    await fetch(`/api/budget/${id}`, { method: 'DELETE' })
  }

  async function uploadReceipt(itemId: string, file: File) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('budgetItemId', itemId)
    const res = await fetch('/api/budget/upload-receipt', { method: 'POST', body: fd })
    if (res.ok) {
      const { receiptUrl } = await res.json()
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, receiptUrl } : i))
    }
  }

  function toggleCat(cat: string) {
    setExpandedCats(prev => { const n = new Set(prev); if (n.has(cat)) n.delete(cat); else n.add(cat); return n })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  const overBudget = totalBudget > 0 && stats.totalActual > totalBudget

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Budget</h1>
          <p className="text-gray-500 mt-1">Track every penny, see who owes what</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" />
          Add expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total budget', value: totalBudget > 0 ? formatCurrency(totalBudget) : 'Not set', sub: 'Set in Settings', icon: DollarSign, color: 'text-blush-500 bg-blush-50' },
          { label: 'Estimated total', value: formatCurrency(stats.totalEstimated), sub: `${items.length} items`, icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
          { label: stats.remaining !== null && stats.remaining < 0 ? 'Over budget' : 'Remaining', value: stats.remaining !== null ? formatCurrency(Math.abs(stats.remaining)) : '—', sub: stats.remaining !== null && stats.remaining < 0 ? '⚠️ Reduce costs' : '', icon: stats.remaining !== null && stats.remaining < 0 ? AlertCircle : CheckCircle2, color: overBudget ? 'text-red-500 bg-red-50' : 'text-green-500 bg-green-50' },
          { label: 'Paid so far', value: formatCurrency(stats.totalPaid), sub: `${items.filter(i => i.isPaid).length} of ${items.length} paid`, icon: Receipt, color: 'text-sage-500 bg-sage-50' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
              </div>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget progress bar */}
      {totalBudget > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Budget used</span>
            <span className={cn('font-medium', overBudget ? 'text-red-600' : 'text-gray-900')}>
              {formatCurrency(stats.totalActual)} / {formatCurrency(totalBudget)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', overBudget ? 'bg-red-500' : 'bg-blush-500')}
              style={{ width: `${Math.min(100, (stats.totalActual / totalBudget) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Who's paying breakdown */}
      {Object.keys(stats.byPayer).length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Who's paying what</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.byPayer).map(([payer, amount]) => {
              const pct = stats.totalActual > 0 ? Math.round((amount / stats.totalActual) * 100) : 0
              const label = PAID_BY_OPTIONS.find(p => p.value === payer)?.label || payer
              return (
                <div key={payer} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
                  <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blush-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% of total</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="card text-center py-16">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No expenses yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start adding wedding expenses to track your budget</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">Add first expense</button>
        </div>
      )}

      {/* Grouped by category */}
      {items.length > 0 && (
        <div className="space-y-3">
          {BUDGET_CATEGORIES.filter(c => grouped[c.value]?.length > 0).map(cat => {
            const catItems = grouped[cat.value] || []
            const isExpanded = expandedCats.has(cat.value)
            const catTotal = catItems.reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0)
            const catPaid = catItems.filter(i => i.isPaid).length

            return (
              <div key={cat.value} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleCat(cat.value)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="font-medium text-gray-900">{cat.label}</span>
                    <span className="text-sm text-gray-500">{catPaid}/{catItems.length} paid</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(catTotal)}</span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-gray-50 border-t border-gray-100">
                    {catItems.map(item => (
                      <BudgetRow
                        key={item.id}
                        item={item}
                        onTogglePaid={() => togglePaid(item)}
                        onDelete={() => deleteItem(item.id)}
                        onEdit={() => setEditingItem(item)}
                        onUploadReceipt={(file) => uploadReceipt(item.id, file)}
                        onUpdate={(updates) => {
                          setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...updates } : i))
                          fetch(`/api/budget/${item.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updates),
                          })
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAddModal && (
        <BudgetModal
          onClose={() => setShowAddModal(false)}
          onSaved={(item) => { setItems(prev => [...prev, item]); setShowAddModal(false) }}
        />
      )}
      {editingItem && (
        <BudgetModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(item) => { setItems(prev => prev.map(i => i.id === item.id ? item : i)); setEditingItem(null) }}
        />
      )}
    </div>
  )
}

function BudgetRow({ item, onTogglePaid, onDelete, onEdit, onUploadReceipt, onUpdate }: {
  item: BudgetItem
  onTogglePaid: () => void
  onDelete: () => void
  onEdit: () => void
  onUploadReceipt: (f: File) => void
  onUpdate: (u: any) => void
}) {
  const fileRef = useState<HTMLInputElement | null>(null)
  const displayCost = item.actualCost ?? item.estimatedCost
  const paidByLabel = PAID_BY_OPTIONS.find(p => p.value === item.paidBy)?.label

  return (
    <div className={cn('flex items-center gap-3 px-5 py-3 group hover:bg-gray-50 transition-colors', item.isPaid && 'opacity-70')}>
      <button onClick={onTogglePaid} className="flex-shrink-0">
        {item.isPaid
          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
          : <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-sm font-medium', item.isPaid && 'line-through text-gray-400')}>
            {item.description}
          </span>
          {item.vendorName && (
            <span className="text-xs text-gray-400">{item.vendorName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {paidByLabel && (
            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{paidByLabel}</span>
          )}
          {item.actualCost && item.actualCost !== item.estimatedCost && (
            <span className="text-xs text-gray-400">
              Est: {formatCurrency(item.estimatedCost)}
            </span>
          )}
          {item.receiptUrl && (
            <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blush-600 flex items-center gap-0.5 hover:underline">
              <Receipt className="w-3 h-3" />Receipt
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn('font-semibold text-sm', item.isPaid ? 'text-green-600' : 'text-gray-900')}>
          {formatCurrency(displayCost)}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!item.receiptUrl && (
            <label className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-lg hover:bg-gray-100">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/*,.pdf" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) onUploadReceipt(f) }} />
            </label>
          )}
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function BudgetModal({ item, onClose, onSaved }: {
  item?: BudgetItem
  onClose: () => void
  onSaved: (item: BudgetItem) => void
}) {
  const isEditing = !!item
  const [form, setForm] = useState({
    category: item?.category || 'venue',
    description: item?.description || '',
    estimatedCost: item ? (item.estimatedCost / 100).toFixed(0) : '',
    actualCost: item?.actualCost ? (item.actualCost / 100).toFixed(0) : '',
    paidBy: item?.paidBy || '',
    isPaid: item?.isPaid || false,
    vendorName: item?.vendorName || '',
    notes: item?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      category: form.category,
      description: form.description,
      estimatedCost: Math.round(parseFloat(form.estimatedCost) * 100),
      actualCost: form.actualCost ? Math.round(parseFloat(form.actualCost) * 100) : undefined,
      paidBy: form.paidBy || null,
      isPaid: form.isPaid,
      vendorName: form.vendorName || null,
      notes: form.notes || null,
    }

    const url = isEditing ? `/api/budget/${item!.id}` : '/api/budget'
    const method = isEditing ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      const saved = await res.json()
      onSaved(saved)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-serif text-xl text-gray-900 mb-4">{isEditing ? 'Edit expense' : 'Add expense'}</h2>

        <form onSubmit={submit} className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {BUDGET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Paid by</label>
              <select className="input" value={form.paidBy} onChange={e => setForm(p => ({ ...p, paidBy: e.target.value }))}>
                <option value="">Select…</option>
                {PAID_BY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <input type="text" className="input" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Venue deposit" />
          </div>

          <div>
            <label className="label">Vendor / Supplier</label>
            <input type="text" className="input" value={form.vendorName} onChange={e => setForm(p => ({ ...p, vendorName: e.target.value }))} placeholder="e.g. The Grand Ballroom" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Estimated cost ($) *</label>
              <input type="number" step="0.01" min="0" className="input" required value={form.estimatedCost}
                onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))} />
            </div>
            <div>
              <label className="label">Actual cost ($)</label>
              <input type="number" step="0.01" min="0" className="input" placeholder="When confirmed"
                value={form.actualCost} onChange={e => setForm(p => ({ ...p, actualCost: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Payment terms, deposit info, etc." />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" checked={form.isPaid} onChange={e => setForm(p => ({ ...p, isPaid: e.target.checked }))} />
            <span className="text-sm text-gray-700">Mark as paid</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Saving…' : isEditing ? 'Save changes' : 'Add expense'}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
