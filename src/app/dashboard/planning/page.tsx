'use client'
import { useEffect, useState, useMemo } from 'react'
import {
  CheckSquare, Square, Plus, Trash2, ChevronDown, ChevronRight,
  Sparkles, Filter, User, Users, Calendar, RefreshCw
} from 'lucide-react'
import { PLANNING_CATEGORIES, getCategoryStyle, getCategoryLabel } from '@/lib/planningTasks'
import { cn } from '@/lib/utils'
import { format, differenceInWeeks } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string | null
  category: string
  weeksBeforeWedding?: number | null
  dueDate?: string | null
  completed: boolean
  completedAt?: string | null
  assignedTo?: string | null
  notes?: string | null
  isCustom: boolean
}

type FilterType = 'all' | 'pending' | 'done'
type AssignFilter = 'all' | 'partner1' | 'partner2' | 'both'

export default function PlanningPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterType>('all')
  const [filterAssign, setFilterAssign] = useState<AssignFilter>('all')
  const [filterCategory, setFilterCategory] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(PLANNING_CATEGORIES.map(c => c.value)))
  const [weddingDate, setWeddingDate] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/planning').then(r => r.json()).then(data => {
      setTasks(Array.isArray(data) ? data : [])
      setLoading(false)
    })
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.weddingDate) setWeddingDate(new Date(d.weddingDate))
    })
  }, [])

  async function seedTasks() {
    setSeeding(true)
    const res = await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _seed: true }),
    })
    const data = await res.json()
    if (Array.isArray(data)) setTasks(data)
    setSeeding(false)
  }

  async function toggleTask(id: string, completed: boolean) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
    await fetch(`/api/planning/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    })
  }

  async function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/planning/${id}`, { method: 'DELETE' })
  }

  async function updateAssignment(id: string, assignedTo: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, assignedTo } : t))
    await fetch(`/api/planning/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo }),
    })
  }

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterStatus === 'pending' && t.completed) return false
    if (filterStatus === 'done' && !t.completed) return false
    if (filterAssign !== 'all' && t.assignedTo !== filterAssign) return false
    if (filterCategory && t.category !== filterCategory) return false
    return true
  }), [tasks, filterStatus, filterAssign, filterCategory])

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {}
    for (const task of filtered) {
      if (!groups[task.category]) groups[task.category] = []
      groups[task.category].push(task)
    }
    return groups
  }, [filtered])

  const totalDone = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const pct = totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100)

  const weeksUntilWedding = weddingDate ? differenceInWeeks(weddingDate, new Date()) : null

  function toggleCategory(cat: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blush-200 border-t-blush-500 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Wedding Planning</h1>
          <p className="text-gray-500 mt-1">Track every step towards your big day</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>

      {/* Progress + countdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Overall progress</p>
            <span className="text-2xl font-bold text-blush-500">{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blush-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{totalDone} of {totalTasks} tasks complete</p>
        </div>

        <div className="card">
          {weeksUntilWedding !== null ? (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Time until your wedding</p>
              <p className="font-serif text-4xl font-light text-blush-500">{weeksUntilWedding}</p>
              <p className="text-gray-500">weeks to go</p>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-2">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Set your wedding date in Settings to see countdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty state — no tasks */}
      {tasks.length === 0 && (
        <div className="card text-center py-16">
          <Sparkles className="w-12 h-12 text-blush-300 mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-gray-900 mb-2">Start your planning checklist</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Load a comprehensive timeline of everything you'll need to plan — from 12 months out to the final week. You can customise it fully.
          </p>
          <button onClick={seedTasks} disabled={seeding} className="btn-primary flex items-center gap-2 mx-auto">
            {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {seeding ? 'Loading…' : 'Load planning checklist'}
          </button>
        </div>
      )}

      {tasks.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(['all', 'pending', 'done'] as FilterType[]).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={cn('px-3 py-1.5 rounded-md text-sm capitalize transition-all',
                    filterStatus === s ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                  )}>
                  {s}
                </button>
              ))}
            </div>

            <select className="input py-1.5 text-sm max-w-[160px]" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All categories</option>
              {PLANNING_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <select className="input py-1.5 text-sm max-w-[160px]" value={filterAssign} onChange={e => setFilterAssign(e.target.value as AssignFilter)}>
              <option value="all">Everyone</option>
              <option value="partner1">Partner 1</option>
              <option value="partner2">Partner 2</option>
              <option value="both">Both</option>
            </select>

            <span className="text-sm text-gray-400 ml-auto">{filtered.length} tasks</span>
          </div>

          {/* Grouped tasks */}
          <div className="space-y-3">
            {PLANNING_CATEGORIES.filter(c => grouped[c.value]?.length > 0).map(cat => {
              const catTasks = grouped[cat.value] || []
              const isExpanded = expandedCategories.has(cat.value)
              const catDone = catTasks.filter(t => t.completed).length

              return (
                <div key={cat.value} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.value)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className={cn('badge text-xs', cat.color)}>{cat.label}</span>
                      <span className="text-sm text-gray-500">{catDone}/{catTasks.length} done</span>
                    </div>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blush-400 rounded-full" style={{ width: `${catTasks.length ? (catDone / catTasks.length) * 100 : 0}%` }} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-gray-50 border-t border-gray-100">
                      {catTasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggle={() => toggleTask(task.id, task.completed)}
                          onDelete={() => deleteTask(task.id)}
                          onAssign={(a) => updateAssignment(task.id, a)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdded={task => { setTasks(prev => [...prev, task]); setShowAddModal(false) }}
        />
      )}
    </div>
  )
}

function TaskRow({ task, onToggle, onDelete, onAssign }: {
  task: Task
  onToggle: () => void
  onDelete: () => void
  onAssign: (a: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn('group px-5 py-3 hover:bg-gray-50 transition-colors', task.completed && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 flex-shrink-0">
          {task.completed
            ? <CheckSquare className="w-5 h-5 text-blush-500" />
            : <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-sm font-medium', task.completed && 'line-through text-gray-400')}>
              {task.title}
            </span>
            {task.dueDate && (
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Due {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>
          {task.description && !expanded && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
          )}
          {expanded && task.description && (
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{task.description}</p>
          )}
          {expanded && task.notes && (
            <p className="text-sm text-blush-600 mt-1 italic">"{task.notes}"</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Assign to */}
          <select
            value={task.assignedTo || ''}
            onChange={e => onAssign(e.target.value)}
            onClick={e => e.stopPropagation()}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 bg-white focus:outline-none"
          >
            <option value="">Assign…</option>
            <option value="partner1">Partner 1</option>
            <option value="partner2">Partner 2</option>
            <option value="both">Both</option>
          </select>

          {task.description && (
            <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-600">
              <ChevronDown className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')} />
            </button>
          )}

          {task.isCustom && (
            <button onClick={onDelete} className="p-1 text-gray-300 hover:text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {task.assignedTo && (
          <div className={cn('flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0',
            task.assignedTo === 'partner1' ? 'bg-blue-50 text-blue-600' :
            task.assignedTo === 'partner2' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
          )}>
            {task.assignedTo === 'both' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
            {task.assignedTo === 'partner1' ? 'P1' : task.assignedTo === 'partner2' ? 'P2' : 'Both'}
          </div>
        )}
      </div>
    </div>
  )
}

function AddTaskModal({ onClose, onAdded }: { onClose: () => void; onAdded: (t: Task) => void }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'other', dueDate: '', assignedTo: '', notes: '' })
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const task = await res.json()
      onAdded(task)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="font-serif text-xl text-gray-900 mb-4">Add Custom Task</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Task title *</label>
            <input type="text" className="input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {PLANNING_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due date</label>
              <input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Assign to</label>
            <select className="input" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              <option value="partner1">Partner 1</option>
              <option value="partner2">Partner 2</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Adding…' : 'Add task'}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
