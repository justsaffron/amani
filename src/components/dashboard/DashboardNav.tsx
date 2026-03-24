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
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blush-500 fill-current" />
              <span className="font-serif text-lg font-semibold hidden sm:block">{coupleName}</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
                    pathname === href
                      ? 'bg-blush-50 text-blush-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
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
                className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>

              <button
                className="lg:hidden p-2"
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
          <div className="bg-white w-72 h-full shadow-xl p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6 px-2">
              <Heart className="w-5 h-5 text-blush-500 fill-current" />
              <span className="font-serif text-lg">{coupleName}</span>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mb-1">Wedding Planning</p>
              {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    pathname === href ? 'bg-blush-50 text-blush-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  )}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2 mb-1">Invitations</p>
              {navItems.slice(4, 8).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    pathname === href ? 'bg-blush-50 text-blush-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  )}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
            </div>

            <div>
              {navItems.slice(8).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                  className={cn('flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    pathname === href ? 'bg-blush-50 text-blush-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  )}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              ))}
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full mt-1">
                <LogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
