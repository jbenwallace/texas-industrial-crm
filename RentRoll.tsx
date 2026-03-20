'use client'
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface Option {
  id: number
  label: string
  sublabel?: string
}

interface InlineCreateProps {
  label: string                          // e.g. "Property", "Company", "Space"
  value: number | null
  onChange: (id: number, label: string) => void
  fetchOptions: (search: string) => Promise<Option[]>
  onCreate: (name: string) => Promise<Option>  // creates and returns the new record
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

/**
 * InlineCreate — a smart searchable dropdown that supports:
 *   1. Search existing records
 *   2. Select existing record
 *   3. Create new record inline without leaving the current form
 *
 * This is the critical UX component that prevents the "leave form to create dependency" problem.
 */
export default function InlineCreate({
  label,
  value,
  onChange,
  fetchOptions,
  onCreate,
  placeholder,
  disabled,
  required,
}: InlineCreateProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const [createMode, setCreateMode] = useState(false)
  const [newName, setNewName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load options on search change
  useEffect(() => {
    if (!open) return
    setLoading(true)
    const timer = setTimeout(async () => {
      const results = await fetchOptions(search)
      setOptions(results)
      setLoading(false)
    }, 200)
    return () => clearTimeout(timer)
  }, [search, open, fetchOptions])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setOpen(false)
        setCreateMode(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (opt: Option) => {
    onChange(opt.id, opt.label)
    setDisplayValue(opt.label)
    setSearch('')
    setOpen(false)
    setCreateMode(false)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const created = await onCreate(newName.trim())
      handleSelect(created)
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  const handleClear = () => {
    onChange(0, '')
    setDisplayValue('')
    setSearch('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Trigger */}
      <div
        className={clsx(
          'flex items-center border rounded-md bg-white cursor-text',
          'focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500',
          disabled ? 'bg-gray-50 cursor-not-allowed' : 'border-gray-300',
          open ? 'border-blue-500 ring-1 ring-blue-500' : ''
        )}
        onClick={() => { if (!disabled) { setOpen(true); inputRef.current?.focus() } }}
      >
        <input
          ref={inputRef}
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none placeholder-gray-400"
          placeholder={value ? displayValue : (placeholder || `Search ${label}...`)}
          value={open ? search : (value ? displayValue : '')}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          readOnly={!open}
        />
        {value && !open && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear() }}
            className="px-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
        <span className="px-2 text-gray-400 text-xs">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Options list */}
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-400">Searching...</div>
          ) : options.length > 0 ? (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex flex-col"
                onClick={() => handleSelect(opt)}
              >
                <span className="font-medium text-gray-900">{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-xs text-gray-500">{opt.sublabel}</span>
                )}
              </button>
            ))
          ) : !createMode ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              {search ? `No results for "${search}"` : `No ${label.toLowerCase()}s found`}
            </div>
          ) : null}

          {/* Divider + Create inline */}
          {!createMode ? (
            <div className="border-t border-gray-100">
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                onClick={() => {
                  setCreateMode(true)
                  setNewName(search)
                }}
              >
                <span className="text-base font-bold">+</span>
                Add new {label.toLowerCase()}
                {search && <span className="text-gray-400">"{search}"</span>}
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 p-2 bg-blue-50">
              <p className="text-xs text-blue-700 mb-1.5 font-medium">
                Create new {label.toLowerCase()}
              </p>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 px-2 py-1.5 text-sm border border-blue-300 rounded outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`${label} name...`}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setCreateMode(false)
                  }}
                />
                <button
                  type="button"
                  disabled={creating || !newName.trim()}
                  onClick={handleCreate}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? '...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode(false)}
                  className="px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
