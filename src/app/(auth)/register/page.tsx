'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', coupleName: '', slug: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      // Auto-generate slug from couple name
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
      // Auto sign in after registration
      const { signIn } = await import('next-auth/react')
      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-6 h-6 text-blush-500 fill-current" />
            <span className="font-serif text-xl font-semibold">Amani</span>
          </Link>
          <h1 className="font-serif text-3xl text-gray-900 mb-2">Create your wedding</h1>
          <p className="text-gray-500">Set up your account in under a minute</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="label">Couple's names</label>
              <input
                type="text"
                name="coupleName"
                className="input"
                placeholder="e.g. Saf & Aisha"
                value={form.coupleName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">
                Your URL slug
                <span className="text-gray-400 font-normal ml-1 text-xs">(auto-generated)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 whitespace-nowrap">amani.wedding/invite/</span>
                <input
                  type="text"
                  name="slug"
                  className="input"
                  placeholder="saf-aisha"
                  value={form.slug}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                className="input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating your account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blush-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
