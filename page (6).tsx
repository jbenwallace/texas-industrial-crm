'use client'
import { useState } from 'react'
import { formatCurrency, formatSf, formatWalt } from '@/lib/walt'
import type { RentRollRow } from '@/types'
import { clsx } from 'clsx'
import { format, differenceInMonths } from 'date-fns'

interface RentRollProps {
  rows: RentRollRow[]
  propertyId: number
  onAddLease?: () => void
}

const PHASE_COLORS: Record<string, string> = {
  LEASED:            'badge-leased',
  VACANT:            'badge-vacant',
  UNDER_NEGOTIATION: 'badge-working',
  UNKNOWN:           'badge-tracking',
}

function leaseStatus(row: RentRollRow): string {
  if (!row.isActive) return 'Expired'
  if (!row.expirationDate) return 'Active'
  const remaining = differenceInMonths(row.expirationDate, new Date())
  if (remaining < 0) return 'Expired'
  if (remaining <= 6) return `Exp. soon (${remaining}mo)`
  return 'Active'
}

export default function RentRoll({ rows, onAddLease }: RentRollProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggle = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeRows = rows.filter((r) => r.isActive)
  const expiredRows = rows.filter((r) => !r.isActive)

  const totalLeasedSf = activeRows.reduce((s, r) => s + (r.leasedSf ?? 0), 0)
  const totalAnnualRent = activeRows.reduce((s, r) => s + (r.annualRent ?? 0), 0)

  if (rows.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-400 mb-3">No leases on this property yet.</p>
        {onAddLease && (
          <button onClick={onAddLease} className="btn-inline-create mx-auto">
            <span className="text-base font-bold">+</span> Add Lease
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
        <span><strong className="text-gray-700">{activeRows.length}</strong> active leases</span>
        <span><strong className="text-gray-700">{formatSf(totalLeasedSf)}</strong> leased</span>
        <span><strong className="text-gray-700">{formatCurrency(totalAnnualRent, true)}</strong> annual rent</span>
        <div className="flex-1" />
        {onAddLease && (
          <button onClick={onAddLease} className="btn-inline-create">
            <span>+</span> Add Lease
          </button>
        )}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left px-4 py-2 w-6" />
            <th className="text-left px-4 py-2">Tenant</th>
            <th className="text-left px-4 py-2">Suite</th>
            <th className="text-right px-4 py-2">SF</th>
            <th className="text-right px-4 py-2">Rate PSF</th>
            <th className="text-right px-4 py-2">Annual Rent</th>
            <th className="text-right px-4 py-2">Monthly</th>
            <th className="text-left px-4 py-2">Commence</th>
            <th className="text-left px-4 py-2">Expiration</th>
            <th className="text-left px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {[...activeRows, ...expiredRows].map((row) => {
            const expanded = expandedIds.has(row.leaseId)
            const status = leaseStatus(row)
            const expiringSoon =
              row.expirationDate &&
              differenceInMonths(row.expirationDate, new Date()) <= 6 &&
              row.isActive

            return (
              <>
                {/* Main row */}
                <tr
                  key={row.leaseId}
                  className={clsx(
                    'rent-roll-row border-b border-gray-100',
                    expanded && 'expanded',
                    !row.isActive && 'opacity-50',
                    expiringSoon && 'bg-amber-50'
                  )}
                  onClick={() => row.rentSteps.length > 0 && toggle(row.leaseId)}
                >
                  {/* Expand toggle */}
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {row.rentSteps.length > 0 && (
                      <span className="font-mono">{expanded ? '▼' : '▶'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {row.tenantName ?? <span className="text-gray-400 italic">Unknown tenant</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.spaceName}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {row.leasedSf ? row.leasedSf.toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {row.currentRatePsf ? `$${row.currentRatePsf.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(row.annualRent, true)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {formatCurrency(row.monthlyRent, true)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.commencementDate ? format(row.commencementDate, 'MM/dd/yy') : '—'}
                  </td>
                  <td className={clsx('px-4 py-3', expiringSoon && 'text-amber-700 font-medium')}>
                    {row.expirationDate ? format(row.expirationDate, 'MM/dd/yy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'badge',
                      status.includes('Exp') ? 'badge-vacant' :
                      status === 'Active' ? 'badge-leased' : 'bg-amber-100 text-amber-800'
                    )}>
                      {status}
                    </span>
                  </td>
                </tr>

                {/* Expanded rent schedule */}
                {expanded && row.rentSteps.length > 0 && (
                  <tr key={`${row.leaseId}-steps`}>
                    <td colSpan={10} className="rent-steps-table">
                      <div className="px-10 py-3">
                        <p className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
                          Rent Schedule — {row.rentSteps.length} step{row.rentSteps.length !== 1 ? 's' : ''}
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-blue-100">
                              <th className="text-left pb-1 pr-6">Label</th>
                              <th className="text-left pb-1 pr-6">Effective Date</th>
                              <th className="text-right pb-1 pr-6">Rate PSF</th>
                              <th className="text-right pb-1 pr-6">Annual Rent</th>
                              <th className="text-right pb-1 pr-6">Monthly Rent</th>
                              <th className="text-right pb-1">Escalation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.rentSteps.map((step, i) => {
                              const isCurrent =
                                step.effectiveDate <= new Date() &&
                                (i === row.rentSteps.length - 1 ||
                                  row.rentSteps[i + 1].effectiveDate > new Date())
                              return (
                                <tr
                                  key={step.id}
                                  className={clsx(
                                    'border-b border-blue-50',
                                    isCurrent && 'bg-blue-50 font-medium'
                                  )}
                                >
                                  <td className="py-1.5 pr-6">
                                    {step.label ?? `Step ${i + 1}`}
                                    {isCurrent && (
                                      <span className="ml-2 text-blue-600 text-xs">(current)</span>
                                    )}
                                  </td>
                                  <td className="py-1.5 pr-6">
                                    {format(step.effectiveDate, 'MM/dd/yyyy')}
                                  </td>
                                  <td className="py-1.5 pr-6 text-right">
                                    ${step.ratePsf.toFixed(2)}
                                  </td>
                                  <td className="py-1.5 pr-6 text-right">
                                    {step.annualRent ? `$${step.annualRent.toLocaleString()}` : '—'}
                                  </td>
                                  <td className="py-1.5 pr-6 text-right">
                                    {step.monthlyRent ? `$${step.monthlyRent.toLocaleString()}` : '—'}
                                  </td>
                                  <td className="py-1.5 text-right text-gray-500">
                                    {step.escalationPercent ? `${step.escalationPercent}%` : '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
