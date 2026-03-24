'use client'
import { useEffect, useState } from 'react'
import { Loader2, Copy } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({
    coupleName: '', websiteTitle: '', heroMessage: '', accentColor: '#e05c60',
    weddingDate: '', weddingCity: '', estimatedGuests: '', totalBudget: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((data) => {
      setForm({
        coupleName: data.coupleName || '',
        websiteTitle: data.websiteTitle || '',
        heroMessage: data.heroMessage || '',
        accentColor: data.accentColor || '#e05c60',
        weddingDate: data.weddingDate ? format(new Date(data.weddingDate), 'yyyy-MM-dd') : '',
        weddingCity: data.weddingCity || '',
        estimatedGuests: data.estimatedGuests?.toString() || '',
        totalBudget: data.totalBudget ? (data.totalBudget / 100).toFixed(0) : '',
      })
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        estimatedGuests: form.estimatedGuests ? parseInt(form.estimatedGuests) : null,
        totalBudget: form.totalBudget ? Math.round(parseFloat(form.totalBudget) * 100) : null,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const slug = session?.user?.slug || ''
  const guestPortalExample = `${baseUrl}/invite/${slug}/[guest-token]`

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Your wedding details and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            ✓ Settings saved
          </div>
        )}

        {/* Wedding details */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Wedding Details</h2>
          <p className="text-sm text-gray-500 -mt-2">Used by planning, vendor search, and budget tools</p>

          <div>
            <label className="label">Couple's names</label>
            <input type="text" className="input" value={form.coupleName}
              onChange={(e) => setForm(p => ({ ...p, coupleName: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Wedding date</label>
              <input type="date" className="input" value={form.weddingDate}
                onChange={(e) => setForm(p => ({ ...p, weddingDate: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">Shows countdown in Planning</p>
            </div>
            <div>
              <label className="label">Wedding city</label>
              <input type="text" className="input" placeholder="e.g. London" value={form.weddingCity}
                onChange={(e) => setForm(p => ({ ...p, weddingCity: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">Pre-fills vendor search</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Estimated guest count</label>
              <input type="number" className="input" min={1} placeholder="e.g. 200" value={form.estimatedGuests}
                onChange={(e) => setForm(p => ({ ...p, estimatedGuests: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">Used in vendor cost estimates</p>
            </div>
            <div>
              <label className="label">Total budget ($)</label>
              <input type="number" className="input" min={0} step="100" placeholder="e.g. 25000" value={form.totalBudget}
                onChange={(e) => setForm(p => ({ ...p, totalBudget: e.target.value }))} />
              <p className="text-xs text-gray-400 mt-1">Shows in budget tracker</p>
            </div>
          </div>
        </div>

        {/* Invitation website */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Invitation Website</h2>

          <div>
            <label className="label">Page title <span className="text-gray-400 font-normal text-xs">(browser tab)</span></label>
            <input type="text" className="input" placeholder="e.g. Saf & Aisha's Wedding" value={form.websiteTitle}
              onChange={(e) => setForm(p => ({ ...p, websiteTitle: e.target.value }))} />
          </div>

          <div>
            <label className="label">Hero message</label>
            <textarea className="input resize-none" rows={2}
              placeholder="e.g. Join us as we celebrate our love"
              value={form.heroMessage}
              onChange={(e) => setForm(p => ({ ...p, heroMessage: e.target.value }))} />
          </div>

          <div>
            <label className="label">Accent colour</label>
            <div className="flex items-center gap-3">
              <input type="color" className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                value={form.accentColor}
                onChange={(e) => setForm(p => ({ ...p, accentColor: e.target.value }))} />
              <input type="text" className="input max-w-[120px]" value={form.accentColor}
                onChange={(e) => setForm(p => ({ ...p, accentColor: e.target.value }))} />
              <div className="flex gap-2">
                {['#e05c60','#51825c','#bd8b4c','#7c6bbd','#5b8fc9'].map(c => (
                  <button key={c} type="button" title={c}
                    onClick={() => setForm(p => ({ ...p, accentColor: c }))}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>

          {/* Invite link */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Your guest invite link format</p>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-200">
              <code className="text-xs text-gray-600 flex-1 truncate">{guestPortalExample}</code>
              <button type="button" onClick={() => navigator.clipboard.writeText(guestPortalExample)} className="text-blue-600 hover:text-blue-700 flex-shrink-0">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving…' : 'Save all settings'}
        </button>
      </form>

      {/* Account info */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">URL slug</span>
            <code className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">{slug}</code>
          </div>
        </div>
      </div>
    </div>
  )
}
