'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Heart, LayoutDashboard, Calendar, Users, Gift,
  Send, Settings, LogOut, Menu, X, ClipboardList,
  Store, DollarSign
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',           label: 'Overview',    icon: LayoutDashboard },
  { href: '/dashboard/planning',  label: 'Planning',    icon: ClipboardList },
  { href: '/dashboard/vendors',   label: 'Vendors',     icon: Store },
  { href: '/dashboard/budget',    label: 'Budget',      icon: DollarSign },
  { href: '/dashboard/events',    label: 'Events',      icon: Calendar },
  { href: '/dashboard/guests',    label: 'Guests',      icon: Users },
  { href: '/dashboard/registry',  label: 'Registry',    icon: Gift },
  { href: '/dashboard/send',      label: 'Invites',     icon: Send },
  { href: '/dashboard/settings',  label: 'Settings',    icon: Settings },
]

export function DashboardNav({ coupleName }: { coupleName: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav
        className="sticky top-0 z-30"
        style={{ backgroundColor: '#FFFDF7', borderBottom: '1px solid #E8D5B0' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-current" style={{ color: '#C9A84C' }} />
              <span className="font-serif text-lg font-semibold hidden sm:block" style={{ color: '#2C1810' }}>
                {coupleName}
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                  )}
                  style={
                    pathname === href
                      ? { backgroundColor: '#FBF5E0', color: '#8B6914', fontWeight: 500 }
                      : { color: '#6B4226' }
                  }
                  onMouseEnter={(e) => {
                    if (pathname !== href) {
                      e.currentTarget.style.backgroundColor = '#F7EDD8'
                      e.currentTarget.style.color = '#2C1810'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== href) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#6B4226'
                    }
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="hidden lg:flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors"
                style={{ color: '#6B4226' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F7EDD8'
                  e.currentTarget.style.color = '#2C1810'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6B4226'
                }}
              >
                <LogOut className="w-4 h-4" />
              </button>

              <button
                className="lg:hidden p-2"
                style={{ color: '#6B4226' }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-black/20" onClick={() => setMobileOpen(false)}>
          <div
            className="w-72 h-full shadow-xl p-4 overflow-y-auto"
            style={{ backgroundColor: '#FFFDF7' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-6 px-2">
              <Heart className="w-5 h-5 fill-current" style={{ color: '#C9A84C' }} />
              <span className="font-serif text-lg" style={{ color: '#2C1810' }}>{coupleName}</span>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-wide px-2 mb-1" style={{ color: '#B8825A' }}>
                Wedding Planning
              </p>
              {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={pathname === href ? { backgroundColor: '#FBF5E0', color: '#8B6914', fontWeight: 500 } : { color: '#6B4226' }}
                >
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-wide px-2 mb-1" style={{ color: '#B8825A' }}>
                Invitations
              </p>
              {navItems.slice(4, 8).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={pathname === href ? { backgroundColor: '#FBF5E0', color: '#8B6914', fontWeight: 500 } : { color: '#6B4226' }}
                >
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>

            <div>
              {navItems.slice(8).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
                  style={pathname === href ? { backgroundColor: '#FBF5E0', color: '#8B6914', fontWeight: 500 } : { color: '#6B4226' }}
                >
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm w-full mt-1 transition-colors"
                style={{ color: '#6B4226' }}
              >
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
