import Link from 'next/link'
import { Heart, Mail, Users, Gift, Calendar, Smartphone } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-blush-500 fill-current" />
          <span className="font-serif text-xl font-semibold">Amani</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <span className="inline-block bg-blush-50 text-blush-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Beautiful wedding invitations, all in one place
        </span>
        <h1 className="font-serif text-6xl font-light text-gray-900 leading-tight mb-6">
          Your wedding,<br />
          <span className="text-blush-500 italic">beautifully organised</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create personalised online invitations for multiple events, manage different guest lists,
          send invites by email & text, collect RSVPs, and receive gifts — all from one dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-8 py-4">
            Create your wedding site
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8 py-4">
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Free to get started · No credit card required</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-center text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            From nikah to walima, manage every event and every guest with ease.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Multiple Events',
                desc: 'Set up Nikah, Walima, Mehndi, or any combination of events — each with their own details and guest list.',
              },
              {
                icon: Users,
                title: 'Smart Guest Lists',
                desc: 'Upload guests via CSV, assign them to specific events, and track who\'s been invited.',
              },
              {
                icon: Mail,
                title: 'Email & SMS Invites',
                desc: 'Send beautiful personalised email invitations and SMS reminders. Each guest gets a unique private link.',
              },
              {
                icon: Heart,
                title: 'Private Guest Portals',
                desc: 'Guests only see the events they\'re invited to. No spoilers, no confusion.',
              },
              {
                icon: Gift,
                title: 'Gift Registry',
                desc: 'Add registry items and accept contributions directly through Stripe. Track every gift received.',
              },
              {
                icon: Smartphone,
                title: 'Beautiful & Mobile-First',
                desc: 'Your invitation looks stunning on every device — from desktop to phone.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-blush-50 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blush-500" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-12 text-sm text-gray-400">
        <p>Made with <Heart className="w-3 h-3 inline text-blush-400 fill-current" /> for celebrating love</p>
      </footer>
    </div>
  )
}
