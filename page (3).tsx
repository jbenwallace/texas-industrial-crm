'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { section: 'Workspace', items: [
    { label: 'Dashboard', icon: '⌂', href: '/' },
    { label: 'Tasks', icon: '✓', href: '/tasks' },
    { label: 'Activity', icon: '📝', href: '/activity' },
  ]},
  { section: 'Pipeline', items: [
    { label: 'Deals', icon: '📋', href: '/deals' },
    { label: 'Pursuits', icon: '🎯', href: '/pursuits' },
  ]},
  { section: 'Directory', items: [
    { label: 'Contacts', icon: '🏢', href: '/contacts' },
    { label: 'Companies', icon: '🏦', href: '/companies' },
  ]},
  { section: 'Portfolio', items: [
    { label: 'Properties', icon: '🏭', href: '/properties' },
    { label: 'Lease Comps', icon: '📊', href: '/comps' },
  ]},
]

export default function Sidebar() {
  const path = usePathname()
  const isActive = (href: string) => href === '/' ? path === '/' : path.startsWith(href)
  return (
    <div className="sidebar-left">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">Texas Industrial CRM</div>
        <div className="sidebar-brand-sub">Live Oak CRE</div>
      </div>
      {nav.map(group => (
        <div key={group.section}>
          <div className="nav-section-label">{group.section}</div>
          {group.items.map(item => (
            <Link key={item.href} href={item.href} className={`nav-item${isActive(item.href) ? ' active' : ''}`}>
              <span style={{fontSize:'13px'}}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}
