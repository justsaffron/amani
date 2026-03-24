export interface TaskTemplate {
  title: string
  description: string
  category: string
  weeksBeforeWedding: number
  sortOrder: number
}

export const DEFAULT_PLANNING_TASKS: TaskTemplate[] = [
  // ── 12+ months before ──────────────────────────────────────────
  { title: 'Set your wedding date', description: 'Agree on a date and check for conflicts with family and key guests.', category: 'legal', weeksBeforeWedding: 52, sortOrder: 1 },
  { title: 'Set your overall budget', description: 'Decide on a total budget and how costs will be split between families.', category: 'budget', weeksBeforeWedding: 52, sortOrder: 2 },
  { title: 'Decide on guest list size', description: 'Settle on rough numbers for each event to guide venue and catering choices.', category: 'venue', weeksBeforeWedding: 52, sortOrder: 3 },
  { title: 'Research and book your main venue', description: 'Start early — popular venues book 12–18 months ahead.', category: 'venue', weeksBeforeWedding: 52, sortOrder: 4 },
  { title: 'Start researching photographers', description: 'Good photographers book very far in advance.', category: 'photography', weeksBeforeWedding: 48, sortOrder: 5 },
  { title: 'Discuss honeymoon destinations', description: 'Consider whether you need to book early (popular resorts fill up).', category: 'honeymoon', weeksBeforeWedding: 52, sortOrder: 6 },

  // ── 9–12 months ────────────────────────────────────────────────
  { title: 'Book your photographer', description: 'Review portfolios, read reviews, and sign a contract.', category: 'photography', weeksBeforeWedding: 40, sortOrder: 10 },
  { title: 'Research and book caterers', description: 'Request menus and pricing. Arrange tastings for shortlisted options.', category: 'catering', weeksBeforeWedding: 40, sortOrder: 11 },
  { title: 'Book videographer (if wanted)', description: 'Often books alongside the photographer.', category: 'photography', weeksBeforeWedding: 40, sortOrder: 12 },
  { title: 'Book music / DJ / band', description: 'Live music and popular DJs book out fast.', category: 'music', weeksBeforeWedding: 40, sortOrder: 13 },
  { title: 'Start bridal outfit shopping', description: 'Dresses take 4–6 months to order and alter.', category: 'attire', weeksBeforeWedding: 40, sortOrder: 14 },
  { title: "Start groom's outfit planning", description: 'Custom suits take 8–12 weeks minimum.', category: 'attire', weeksBeforeWedding: 40, sortOrder: 15 },
  { title: 'Book honeymoon', description: 'Book flights and hotels especially for peak season travel.', category: 'honeymoon', weeksBeforeWedding: 40, sortOrder: 16 },

  // ── 6–9 months ─────────────────────────────────────────────────
  { title: 'Send save-the-dates', description: 'Especially important for overseas or destination guests.', category: 'invitations', weeksBeforeWedding: 32, sortOrder: 20 },
  { title: 'Book florist / decorator', description: 'Discuss themes, centrepieces, bouquets and ceremony decorations.', category: 'decoration', weeksBeforeWedding: 32, sortOrder: 21 },
  { title: 'Book hair and make-up artist', description: 'Do a trial run well before the wedding day.', category: 'beauty', weeksBeforeWedding: 32, sortOrder: 22 },
  { title: 'Book wedding cake / desserts', description: 'Schedule tastings and discuss design.', category: 'catering', weeksBeforeWedding: 32, sortOrder: 23 },
  { title: 'Book transport for wedding day', description: 'Cars for bridal party, guests from venue to reception, etc.', category: 'transport', weeksBeforeWedding: 28, sortOrder: 24 },
  { title: 'Set up gift registry', description: 'Add items to your Amani registry or link to external registries.', category: 'registry', weeksBeforeWedding: 28, sortOrder: 25 },
  { title: 'Plan ceremony details', description: 'Decide on readings, vows, rituals, and order of service.', category: 'legal', weeksBeforeWedding: 28, sortOrder: 26 },

  // ── 3–6 months ─────────────────────────────────────────────────
  { title: 'Send invitations', description: 'Use Amani to send personalised email/SMS invites with RSVP links.', category: 'invitations', weeksBeforeWedding: 20, sortOrder: 30 },
  { title: 'Confirm catering final numbers', description: 'Give your caterer an estimate of confirmed guests.', category: 'catering', weeksBeforeWedding: 16, sortOrder: 31 },
  { title: 'Plan and book rehearsal dinner (if applicable)', description: 'Organise dinner for close family and bridal party.', category: 'other', weeksBeforeWedding: 20, sortOrder: 32 },
  { title: 'Sort marriage registration / Nikkah paperwork', description: 'Check legal requirements, book officiant, organise witnesses.', category: 'legal', weeksBeforeWedding: 20, sortOrder: 33 },
  { title: 'Book accommodation for out-of-town guests', description: 'Negotiate block rates with nearby hotels.', category: 'accommodation', weeksBeforeWedding: 16, sortOrder: 34 },
  { title: 'Finalise decoration details', description: 'Confirm colour scheme, centrepieces, lighting and layout with decorator.', category: 'decoration', weeksBeforeWedding: 16, sortOrder: 35 },
  { title: 'Order wedding favours', description: 'Allow time for custom printing or overseas shipping.', category: 'other', weeksBeforeWedding: 16, sortOrder: 36 },

  // ── 6–12 weeks ─────────────────────────────────────────────────
  { title: 'Finalise seating plan', description: 'Once RSVPs are confirmed, work out table arrangements.', category: 'other', weeksBeforeWedding: 8, sortOrder: 40 },
  { title: 'Hair & make-up trial run', description: 'Do a full trial with your chosen artist.', category: 'beauty', weeksBeforeWedding: 8, sortOrder: 41 },
  { title: 'Final dress fitting', description: 'Ensure any last alterations are done.', category: 'attire', weeksBeforeWedding: 6, sortOrder: 42 },
  { title: 'Confirm all vendors for the day', description: "Send confirmed timelines to photographer, caterer, decorator, and all vendors.", category: 'other', weeksBeforeWedding: 6, sortOrder: 43 },
  { title: 'Plan wedding day timeline', description: 'Create a minute-by-minute schedule and share with bridal party.', category: 'other', weeksBeforeWedding: 6, sortOrder: 44 },
  { title: 'Prepare payments / envelopes for vendors', description: 'Many vendors expect cash on the day. Prepare in advance.', category: 'budget', weeksBeforeWedding: 4, sortOrder: 45 },
  { title: 'Delegate day-of coordinator', description: 'Assign a trusted person or hire a coordinator so you can relax.', category: 'other', weeksBeforeWedding: 4, sortOrder: 46 },

  // ── Final week ─────────────────────────────────────────────────
  { title: 'Confirm final guest numbers with venue/caterer', description: 'Give final headcount to all food-related vendors.', category: 'catering', weeksBeforeWedding: 1, sortOrder: 50 },
  { title: 'Prepare an emergency kit', description: 'Safety pins, pain relief, stain remover, breath mints, phone chargers.', category: 'other', weeksBeforeWedding: 1, sortOrder: 51 },
  { title: 'Relax and enjoy!', description: "You've planned everything — trust the process and enjoy your day.", category: 'other', weeksBeforeWedding: 0, sortOrder: 52 },
]

export const PLANNING_CATEGORIES = [
  { value: 'venue',         label: 'Venue',          color: 'bg-blush-100 text-blush-700' },
  { value: 'catering',      label: 'Catering',       color: 'bg-orange-100 text-orange-700' },
  { value: 'photography',   label: 'Photography',    color: 'bg-purple-100 text-purple-700' },
  { value: 'decoration',    label: 'Decoration',     color: 'bg-pink-100 text-pink-700' },
  { value: 'attire',        label: 'Attire',         color: 'bg-blue-100 text-blue-700' },
  { value: 'music',         label: 'Music',          color: 'bg-green-100 text-green-700' },
  { value: 'beauty',        label: 'Hair & Beauty',  color: 'bg-fuchsia-100 text-fuchsia-700' },
  { value: 'legal',         label: 'Legal & Admin',  color: 'bg-red-100 text-red-700' },
  { value: 'invitations',   label: 'Invitations',    color: 'bg-indigo-100 text-indigo-700' },
  { value: 'budget',        label: 'Budget',         color: 'bg-yellow-100 text-yellow-700' },
  { value: 'honeymoon',     label: 'Honeymoon',      color: 'bg-teal-100 text-teal-700' },
  { value: 'transport',     label: 'Transport',      color: 'bg-slate-100 text-slate-700' },
  { value: 'accommodation', label: 'Accommodation',  color: 'bg-amber-100 text-amber-700' },
  { value: 'registry',      label: 'Registry',       color: 'bg-rose-100 text-rose-700' },
  { value: 'other',         label: 'Other',          color: 'bg-gray-100 text-gray-600' },
]

export function getCategoryStyle(category: string) {
  return PLANNING_CATEGORIES.find((c) => c.value === category)?.color ?? 'bg-gray-100 text-gray-600'
}

export function getCategoryLabel(category: string) {
  return PLANNING_CATEGORIES.find((c) => c.value === category)?.label ?? category
}
