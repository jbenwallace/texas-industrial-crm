'use client'
import { useState } from 'react'
import { formatCurrency, formatSf, formatWalt, calculatePropertyValue } from '@/lib/walt'
import RentRoll from '@/components/properties/RentRoll'
import { clsx } from 'clsx'
import { format, differenceInMonths } from 'date-fns'

// This component receives the fully-hydrated property object from the server
// (fetched via GET /api/properties/[id])

interface PropertyPageProps {
  property: any // full property with all relations
}

const TABS = ['Rent Roll', 'Vacancies', 'Deals', 'Activity', 'Documents', 'Details'] as const
type Tab = typeof TABS[number]

export default function PropertyPage({ property }: PropertyPageProps) {
  const [tab, setTab] = useState<Tab>('Rent Roll')

  const computedValue = calculatePropertyValue(property.noi, property.capRate)
  const tags: string[] = property.tags ?? []
  const isListing = tags.includes('listing') || property.isListing

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Property Header ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">

          {/* Breadcrumb */}
          <div className="pt-3 pb-1 text-xs text-gray-400">
            <a href="/properties" className="hover:text-blue-600">Properties</a>
            <span className="mx-1">›</span>
            <span className="text-gray-600">{property.name}</span>
          </div>

          {/* Main header row */}
          <div className="pb-3 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {property.name}
                </h1>

                {/* Tags / status badges */}
                {isListing && <span className="badge badge-listing">Listing</span>}
                {property.pursuits?.length > 0 && (
                  <span className="badge badge-pursuit">Pursuit</span>
                )}
                {property.forSale && (
                  <span className="badge bg-red-100 text-red-700">For Sale</span>
                )}
                {property.inCda && (
                  <span className="badge bg-indigo-100 text-indigo-700">CDA</span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-0.5">
                {[property.propertyAddress, property.city, property.state]
                  .filter(Boolean)
                  .join(', ')}
                {property.submarket && (
                  <span className="ml-2 text-gray-400">· {property.submarket}</span>
                )}
              </p>
            </div>

            {/* Key metrics strip */}
            <div className="flex items-center gap-5 shrink-0">
              <Metric label="Size" value={property.buildingSize ? `${(property.buildingSize / 1000).toFixed(0)}K SF` : '—'} />
              <Metric label="WALT" value={formatWalt(property.walt)} highlight={property.walt !== null} />
              <Metric label="% Leased" value={property.percentLeased ? `${property.percentLeased.toFixed(0)}%` : '—'} />
              {property.cdaScore !== null && (
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-0.5">CDA Score</div>
                  <div className={clsx(
                    'text-lg font-bold',
                    property.cdaScore >= 70 ? 'text-green-600' :
                    property.cdaScore >= 40 ? 'text-amber-600' : 'text-red-600'
                  )}>
                    {property.cdaScore.toFixed(0)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 -mb-px">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  tab === t
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {t}
                {t === 'Rent Roll' && property.rentRoll?.length > 0 && (
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                    {property.rentRoll.length}
                  </span>
                )}
                {t === 'Deals' && property.deals?.length > 0 && (
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
                    {property.deals.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {tab === 'Rent Roll' && (
              <RentRollTab property={property} />
            )}
            {tab === 'Vacancies' && (
              <VacanciesTab property={property} />
            )}
            {tab === 'Deals' && (
              <DealsTab property={property} />
            )}
            {tab === 'Activity' && (
              <ActivityTab property={property} />
            )}
            {tab === 'Documents' && (
              <DocumentsTab property={property} />
            )}
            {tab === 'Details' && (
              <DetailsTab property={property} />
            )}
          </div>

          {/* Right sidebar — investment snapshot + expirations */}
          <div className="w-72 shrink-0 space-y-4">
            <InvestmentSnapshot property={property} computedValue={computedValue} />
            <UpcomingExpirations expirations={property.upcomingExpirations ?? []} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className={clsx('text-sm font-semibold', highlight ? 'text-gray-900' : 'text-gray-400')}>
        {value}
      </div>
    </div>
  )
}

function RentRollTab({ property }: { property: any }) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header">
        <h2 className="font-semibold text-gray-900">Rent Roll</h2>
        <p className="text-xs text-gray-400">Click any row to expand the rent schedule</p>
      </div>
      <RentRoll
        rows={property.rentRoll ?? []}
        propertyId={property.id}
        onAddLease={() => alert('TODO: open add lease modal')}
      />
    </div>
  )
}

function VacanciesTab({ property }: { property: any }) {
  const vacancies = property.vacancies ?? []
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold text-gray-900">Available Spaces</h2>
        <button className="btn-inline-create">
          <span>+</span> Add Vacancy
        </button>
      </div>
      <div className="card-body">
        {vacancies.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No vacancies recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left pb-2">Suite</th>
                <th className="text-right pb-2">SF</th>
                <th className="text-right pb-2">Asking Rent</th>
                <th className="text-left pb-2 pl-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {vacancies.map((v: any) => (
                <tr key={v.id} className="border-b border-gray-50">
                  <td className="py-2">{v.spaceName ?? v.name ?? '—'}</td>
                  <td className="py-2 text-right">{v.availableSf?.toLocaleString() ?? '—'}</td>
                  <td className="py-2 text-right">{v.askingRent ? `$${v.askingRent.toFixed(2)}` : '—'}</td>
                  <td className="py-2 pl-4 text-gray-500 text-xs">{v.notes ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function DealsTab({ property }: { property: any }) {
  const deals = property.deals ?? []
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold text-gray-900">Deals</h2>
        <button className="btn-inline-create">
          <span>+</span> Add Deal
        </button>
      </div>
      <div>
        {deals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 px-5">No deals linked to this property.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-2">Deal</th>
                <th className="text-left px-4 py-2">Tenant</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Phase</th>
                <th className="text-right px-4 py-2">SF</th>
                <th className="text-right px-5 py-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d: any) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">
                    <a href={`/deals/${d.id}`} className="text-blue-600 hover:underline">{d.name}</a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.company?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {d.type && <span className="badge badge-tracking">{d.type}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <PhaseBadge phase={d.phase} />
                  </td>
                  <td className="px-4 py-3 text-right">{d.sf?.toLocaleString() ?? '—'}</td>
                  <td className="px-5 py-3 text-right">{d.rate ? `$${d.rate.toFixed(2)}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ActivityTab({ property }: { property: any }) {
  const activities = property.activities ?? []
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold text-gray-900">Activity</h2>
        <button className="btn-inline-create">
          <span>+</span> Add Note
        </button>
      </div>
      <div className="card-body space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No activity yet.</p>
        ) : (
          activities.map((a: any) => (
            <div key={a.id} className="flex gap-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
                {a.user?.name?.[0] ?? '?'}
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{a.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {a.user?.name ?? 'Unknown'} · {format(new Date(a.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DocumentsTab({ property }: { property: any }) {
  const docs = property.documents ?? []
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold text-gray-900">Documents</h2>
        <button className="btn-inline-create">
          <span>+</span> Upload
        </button>
      </div>
      <div className="card-body">
        {docs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((doc: any) => (
              <li key={doc.id} className="flex items-center gap-3 text-sm">
                <span className="text-gray-400">📄</span>
                <a href={doc.url} target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:underline flex-1 truncate">{doc.name}</a>
                <span className="text-xs text-gray-400">{doc.format?.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function DetailsTab({ property }: { property: any }) {
  const fields = [
    ['CoStar ID', property.costarId],
    ['Building Class', property.buildingClass],
    ['Year Built', property.yearBuilt],
    ['Clear Height', property.clearHeight ? `${property.clearHeight}'` : null],
    ['Dock Doors', property.dockDoors],
    ['Drive-Ins', property.driveIns],
    ['Truck Court', property.truckCourt ? `${property.truckCourt}'` : null],
    ['Trailer Parking', property.trailerParks],
    ['Parking Spaces', property.numberOfParkingSpaces],
    ['Parking Ratio', property.parkingRatio],
    ['Land Area', property.landAreaAc ? `${property.landAreaAc} ac` : null],
    ['Power', property.power],
    ['Sprinkler', property.sprinklerType],
    ['Zoning', property.zoning],
    ['Rail', property.rail ? 'Yes' : 'No'],
    ['Freezer/Cooler', property.freezerCooler ? 'Yes' : null],
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="font-semibold text-gray-900">Property Details</h2>
      </div>
      <div className="card-body grid grid-cols-2 gap-x-8 gap-y-3">
        {fields.map(([label, val]) => (
          val != null && (
            <div key={label as string}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="text-sm font-medium text-gray-900 mt-0.5">{val}</dd>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

function InvestmentSnapshot({ property, computedValue }: { property: any; computedValue: number | null }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-sm font-semibold text-gray-700">Investment Snapshot</h3>
      </div>
      <div className="card-body space-y-3 text-sm">
        <InvRow label="NOI" value={property.noi ? formatCurrency(property.noi, true) : null} />
        <InvRow
          label="Cap Rate"
          value={property.capRate ? `${property.capRate.toFixed(2)}%` : null}
          hint="Manual input"
        />
        <InvRow
          label="Value"
          value={computedValue ? formatCurrency(computedValue, true) : null}
          hint={!property.noi || !property.capRate ? 'Needs NOI + Cap Rate' : undefined}
        />
        <InvRow label="WALT" value={formatWalt(property.walt)} />
      </div>
    </div>
  )
}

function InvRow({ label, value, hint }: { label: string; value: string | null; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      {value ? (
        <span className="font-medium text-gray-900">{value}</span>
      ) : (
        <span className="text-gray-300 text-xs italic">{hint ?? '—'}</span>
      )}
    </div>
  )
}

function UpcomingExpirations({ expirations }: { expirations: any[] }) {
  if (expirations.length === 0) return null
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-sm font-semibold text-gray-700">Upcoming Expirations</h3>
        <span className="text-xs text-gray-400">Next 24 months</span>
      </div>
      <div className="divide-y divide-gray-50">
        {expirations.slice(0, 8).map((r: any) => {
          const months = r.expirationDate
            ? differenceInMonths(new Date(r.expirationDate), new Date())
            : null
          return (
            <div key={r.leaseId} className="px-4 py-2.5">
              <p className="text-sm font-medium text-gray-900 truncate">
                {r.tenantName ?? 'Unknown tenant'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {r.spaceName} · {r.leasedSf?.toLocaleString() ?? '?'} SF
              </p>
              <p className={clsx(
                'text-xs mt-0.5 font-medium',
                months !== null && months <= 3 ? 'text-red-600' :
                months !== null && months <= 6 ? 'text-amber-600' : 'text-gray-500'
              )}>
                {r.expirationDate ? format(new Date(r.expirationDate), 'MMM yyyy') : '—'}
                {months !== null && ` · ${months}mo`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PhaseBadge({ phase }: { phase: string }) {
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
  return <span className={clsx('badge', map[phase] ?? 'badge-tracking')}>{labels[phase] ?? phase}</span>
}
