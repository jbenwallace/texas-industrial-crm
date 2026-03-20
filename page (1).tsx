'use client'
import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/walt'
import type { DealRow, PipelineSummary } from '@/types'

interface DealSheetProps {
  deals: DealRow[]
  pipeline: PipelineSummary
  currentUserId: number
  users: { id: number; name: string }[]
  teamView: boolean
  onToggleTeamView: () => void
}

const PHASES = [
  { key: 'LEASES_CONTRACTS', label: 'Leases / Contracts', color: 'bg-emerald-500' },
  { key: 'WORKING_DEALS',    label: 'Working Deals',       color: 'bg-blue-500' },
  { key: 'TRACKING_DEALS',   label: 'Tracking',            color: 'bg-gray-400' },
  { key: 'COLD',             label: 'Cold',                color: 'bg-slate-300' },
] as const

type Phase = typeof PHASES[number]['key']

const EDITABLE_FIELDS = ['comments', 'nextStep', 'probPercentage'] as const

export default function DealSheet({
  deals,
  pipeline,
  teamView,
  onToggleTeamView,
  users,
}: DealSheetProps) {
  const [activePhase, setActivePhase] = useState<Phase | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [editingCell, setEditingCell] = useState<{ dealId: number; field: string } | null>(null)
  const [cellValues, setCellValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const filtered = useMemo(() => {
    let list = deals
    if (activePhase !== 'ALL') list = list.filter((d) => d.phase === activePhase)
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(s) ||
          (d.propertyName ?? '').toLowerCase().includes(s) ||
          (d.tenantName ?? '').toLowerCase().includes(s)
      )
    }
    return list
  }, [deals, activePhase, search])

  // Inline cell edit — saves on blur / Enter
  const startEdit = (dealId: number, field: string, currentValue: string) => {
    setEditingCell({ dealId, field })
    setCellValues({ [`${dealId}:${field}`]: currentValue ?? '' })
  }

  const saveEdit = async (dealId: number, field: string) => {
    const key = `${dealId}:${field}`
    const value = cellValues[key]
    setSaving(dealId)
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: field === 'probPercentage' ? Number(value) : value }),
      })
    } finally {
      setSaving(null)
      setEditingCell(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-full flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Deal Sheet</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {teamView ? 'All brokers' : 'My deals'} · {filtered.length} deals
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Team view toggle */}
            <button
              onClick={onToggleTeamView}
              className={clsx(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                teamView
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {teamView ? '👥 Team View' : '👤 My Deals'}
            </button>

            {/* Search */}
            <input
              className="px-3 py-1.5 border border-gray-300 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <a
              href="/deals/new"
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
            >
              + New Deal
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-full px-6 py-6 space-y-6">
        {/* Pipeline summary cards */}
        <div className="grid grid-cols-5 gap-4">
          <SummaryCard
            label="Active Pipeline"
            value={formatCurrency(pipeline.totalConsideration, true)}
            sub={`${pipeline.workingDeals + pipeline.trackingDeals} deals`}
          />
          <SummaryCard
            label="Weighted Value"
            value={formatCurrency(pipeline.totalWeightedValue, true)}
            sub="probability-adjusted"
            highlight
          />
          <SummaryCard label="Contracts" value={String(pipeline.leasesContracts)} sub="executed" color="text-emerald-600" />
          <SummaryCard label="Working" value={String(pipeline.workingDeals)} sub="under negotiation" color="text-blue-600" />
          <SummaryCard label="Tracking" value={String(pipeline.trackingDeals)} sub="being tracked" color="text-gray-600" />
        </div>

        {/* Phase filter pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePhase('ALL')}
            className={clsx(
              'px-3 py-1 rounded-full text-sm transition-colors',
              activePhase === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          {PHASES.map((p) => {
            const count = deals.filter((d) => d.phase === p.key).length
            return (
              <button
                key={p.key}
                onClick={() => setActivePhase(p.key)}
                className={clsx(
                  'px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1.5',
                  activePhase === p.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <span className={clsx('w-1.5 h-1.5 rounded-full', p.color)} />
                {p.label}
                <span className="opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Deal table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 w-48">Deal</th>
                  <th className="text-left px-4 py-3">Property</th>
                  <th className="text-left px-4 py-3">Tenant</th>
                  <th className="text-left px-4 py-3">Phase</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-right px-4 py-3">SF</th>
                  <th className="text-right px-4 py-3">Rate</th>
                  <th className="text-right px-4 py-3 w-16">Prob %</th>
                  <th className="text-right px-4 py-3">Wtd Value</th>
                  <th className="text-left px-4 py-3 w-52">Comments</th>
                  <th className="text-left px-4 py-3 w-48">Next Step</th>
                  <th className="text-left px-4 py-3">Broker</th>
                  <th className="text-right px-4 py-3">Proj. Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-gray-400 text-sm">
                      No deals found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((deal) => (
                    <tr
                      key={deal.id}
                      className={clsx(
                        'hover:bg-gray-50 transition-colors',
                        saving === deal.id && 'opacity-60'
                      )}
                    >
                      {/* Deal name */}
                      <td className="px-4 py-3">
                        <a href={`/deals/${deal.id}`} className="font-medium text-blue-600 hover:underline">
                          {deal.name}
                        </a>
                      </td>

                      {/* Property — clickable back to property */}
                      <td className="px-4 py-3">
                        {deal.propertyId ? (
                          <a
                            href={`/properties/${deal.propertyId}`}
                            className="text-gray-700 hover:text-blue-600 hover:underline"
                          >
                            {deal.propertyName ?? '—'}
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">No property</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-600">{deal.tenantName ?? '—'}</td>

                      <td className="px-4 py-3">
                        <PhasePill phase={deal.phase} />
                      </td>

                      <td className="px-4 py-3">
                        {deal.type && (
                          <span className="badge badge-tracking">{deal.type}</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-700">
                        {deal.sf?.toLocaleString() ?? '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-700">
                        {deal.rate ? `$${deal.rate.toFixed(2)}` : '—'}
                      </td>

                      {/* Editable: prob % */}
                      <td className="px-4 py-3 text-right">
                        <EditableCell
                          dealId={deal.id}
                          field="probPercentage"
                          value={deal.probPercentage ? `${deal.probPercentage}` : ''}
                          display={deal.probPercentage ? `${deal.probPercentage}%` : '—'}
                          editing={editingCell?.dealId === deal.id && editingCell.field === 'probPercentage'}
                          cellValues={cellValues}
                          onStart={startEdit}
                          onSave={saveEdit}
                          onChange={(k, v) => setCellValues((p) => ({ ...p, [k]: v }))}
                        />
                      </td>

                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {deal.weightedAverage ? formatCurrency(deal.weightedAverage, true) : '—'}
                      </td>

                      {/* Editable: comments */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <EditableCell
                          dealId={deal.id}
                          field="comments"
                          value={deal.comments ?? ''}
                          display={deal.comments ? (
                            <span className="truncate block text-xs text-gray-600 max-w-[180px]">
                              {deal.comments}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs italic">Add comment</span>
                          )}
                          editing={editingCell?.dealId === deal.id && editingCell.field === 'comments'}
                          cellValues={cellValues}
                          onStart={startEdit}
                          onSave={saveEdit}
                          onChange={(k, v) => setCellValues((p) => ({ ...p, [k]: v }))}
                          multiline
                        />
                      </td>

                      {/* Editable: next step */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <EditableCell
                          dealId={deal.id}
                          field="nextStep"
                          value={deal.nextStep ?? ''}
                          display={deal.nextStep ? (
                            <span className="truncate block text-xs text-gray-600 max-w-[160px]">
                              {deal.nextStep}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs italic">Add next step</span>
                          )}
                          editing={editingCell?.dealId === deal.id && editingCell.field === 'nextStep'}
                          cellValues={cellValues}
                          onStart={startEdit}
                          onSave={saveEdit}
                          onChange={(k, v) => setCellValues((p) => ({ ...p, [k]: v }))}
                        />
                      </td>

                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {deal.leadBrokerName ?? deal.brokerName ?? '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-500 text-xs whitespace-nowrap">
                        {deal.projectedDate ? format(new Date(deal.projectedDate), 'MM/dd/yy') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, highlight, color,
}: {
  label: string; value: string; sub: string; highlight?: boolean; color?: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={clsx('stat-value', color)}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

function PhasePill({ phase }: { phase: string }) {
  const map: Record<string, string> = {
    LEASES_CONTRACTS: 'badge-contract',
    WORKING_DEALS:    'badge-working',
    TRACKING_DEALS:   'badge-tracking',
    COLD:             'badge-cold',
  }
  const labels: Record<string, string> = {
    LEASES_CONTRACTS: 'Contract',
    WORKING_DEALS:    'Working',
    TRACKING_DEALS:   'Tracking',
    COLD:             'Cold',
  }
  return (
    <span className={clsx('badge', map[phase] ?? 'badge-tracking')}>
      {labels[phase] ?? phase}
    </span>
  )
}

interface EditableCellProps {
  dealId: number
  field: string
  value: string
  display: React.ReactNode
  editing: boolean
  cellValues: Record<string, string>
  onStart: (id: number, field: string, val: string) => void
  onSave: (id: number, field: string) => void
  onChange: (key: string, val: string) => void
  multiline?: boolean
}

function EditableCell({
  dealId, field, value, display, editing, cellValues, onStart, onSave, onChange, multiline,
}: EditableCellProps) {
  const key = `${dealId}:${field}`

  if (!editing) {
    return (
      <div
        className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 min-h-[24px]"
        onClick={() => onStart(dealId, field, value)}
        title="Click to edit"
      >
        {display}
      </div>
    )
  }

  const inputClass = 'w-full px-1.5 py-0.5 text-sm border border-blue-400 rounded outline-none focus:ring-1 focus:ring-blue-500'

  return multiline ? (
    <textarea
      autoFocus
      className={clsx(inputClass, 'text-xs resize-none min-h-[48px]')}
      value={cellValues[key] ?? ''}
      onChange={(e) => onChange(key, e.target.value)}
      onBlur={() => onSave(dealId, field)}
      onKeyDown={(e) => { if (e.key === 'Escape') onSave(dealId, field) }}
    />
  ) : (
    <input
      autoFocus
      className={inputClass}
      value={cellValues[key] ?? ''}
      onChange={(e) => onChange(key, e.target.value)}
      onBlur={() => onSave(dealId, field)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Tab') onSave(dealId, field)
        if (e.key === 'Escape') onSave(dealId, field)
      }}
    />
  )
}
