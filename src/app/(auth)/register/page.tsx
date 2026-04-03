'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

function HennaDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-6">
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
      <svg width="60" height="16" viewBox="0 0 60 16" fill="none">
        <path d="M30 2L33 8L30 14L27 8Z" fill="#C9A84C" fillOpacity="0.7"/>
        <path d="M20 5L23 8L20 11L17 8Z" fill="#C9A84C" fillOpacity="0.4"/>
        <path d="M40 5L43 8L40 11L37 8Z" fill="#C9A84C" fillOpacity="0.4"/>
        <circle cx="6" cy="8" r="2" fill="#C9A84C" fillOpacity="0.3"/>
        <circle cx="54" cy="8" r="2" fill="#C9A84C" fillOpacity="0.3"/>
      </svg>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '', coupleName: '', slug: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'coupleName') {
        next.slug = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
    } else {
      const { signIn } = await import('next-auth/react')
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FDF8F0' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-serif text-4xl font-light" style={{ color: '#C9A84C' }}>Amani</span>
          </Link>
          <HennaDivider />
          <h1 className="font-serif text-3xl font-light mt-4" style={{ color: '#2C1810' }}>Begin your journey</h1>
          <p className="text-sm mt-1" style={{ color: '#6B4226' }}>Set up your wedding in under a minute</p>
        </div>

        <div className="rounded-2xl p-8" style={{ backgroundColor: '#FFFDF7', border: '1px solid #E8D5B0', boxShadow: '0 4px 24px rgba(139, 69, 20, 0.08)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm px-4 py-3 rounded-xl" style={{ backgroundColor: '#FFF0EC', border: '1px solid #FFA880', color: '#8B2500' }}>
                {error}
              </div>
            )}

            <div>
              <label className="label">Couple&apos;s names</label>
              <input type="text" name="coupleName" className="input" placeholder="e.g. Saf & Aisha"
                value={form.coupleName} onChange={handleChange} required />
            </div>

            <div>
              <label className="label">
                Your URL slug <span className="font-normal text-xs" style={{ color: '#B8825A' }}>(auto-generated)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap" style={{ color: '#B8825A' }}>amani.wedding/invite/</span>
                <input type="text" name="slug" className="input" placeholder="saf-aisha"
                  value={form.slug} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input type="email" name="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} required />
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" name="password" className="input" placeholder="At least 8 characters"
                value={form.password} onChange={handleChange} required minLength={8} />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <HennaDivider />

          <p className="text-center text-sm" style={{ color: '#6B4226' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline" style={{ color: '#8B6914' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
