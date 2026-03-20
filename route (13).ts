import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const [dealCount, occupierCount, pursuitCount, pendingTasks, recentDeals] = await Promise.all([
    prisma.deal.count(),
    prisma.occupier.count({ where: { isDeleted: false } }),
    prisma.pursuit.count(),
    prisma.task.count({ where: { status: 'PENDING', isVisible: true } }),
    prisma.deal.findMany({ take: 6, orderBy: { updatedAt: 'desc' }, include: { occupier: true } }),
  ])

  const PHASE_LABELS: Record<string,string> = { LEASES_CONTRACTS:'Leases/Contracts', WORKING_DEALS:'Working Deals', TRACKING_DEALS:'Tracking Deals', COLD:'Cold' }
  const PHASE_COLORS: Record<string,string> = { LEASES_CONTRACTS:'#1e7a4a', WORKING_DEALS:'#7a6e52', TRACKING_DEALS:'#4a6080', COLD:'#8aa0b8' }

  return (
    <div style={{padding:'24px 28px',overflowY:'auto',height:'100%'}}>
      <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'26px',fontWeight:600,color:'#1e2d3d',marginBottom:'4px'}}>Dashboard</div>
      <div style={{fontSize:'12px',color:'#8aa0b8',marginBottom:'24px'}}>Texas Industrial CRM · Live Oak CRE</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
        {[
          {label:'Active Deals',value:dealCount,icon:'📋',href:'/deals',color:'#7a6e52'},
          {label:'Occupiers',value:occupierCount,icon:'🏢',href:'/contacts',color:'#4a6080'},
          {label:'Pursuits',value:pursuitCount,icon:'🎯',href:'/pursuits',color:'#1e7a4a'},
          {label:'Pending Tasks',value:pendingTasks,icon:'✓',href:'/tasks',color:'#b83030'},
        ].map(s => (
          <Link key={s.href} href={s.href} style={{textDecoration:'none'}}>
            <div style={{background:'#fffcf6',border:'1px solid rgba(26,47,72,0.12)',borderRadius:'6px',padding:'16px 18px'}}>
              <div style={{fontSize:'20px',marginBottom:'6px'}}>{s.icon}</div>
              <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'28px',fontWeight:600,color:s.color}}>{s.value}</div>
              <div style={{fontSize:'11px',color:'#8aa0b8',marginTop:'2px'}}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
        <div style={{background:'#fffcf6',border:'1px solid rgba(26,47,72,0.12)',borderRadius:'6px',overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(26,47,72,0.09)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:'15px',fontWeight:600,color:'#1e2d3d'}}>Recent Deals</span>
            <Link href="/deals" style={{fontSize:'11px',color:'#7a6e52',textDecoration:'none'}}>View all →</Link>
          </div>
          {recentDeals.map(d => (
            <div key={d.id} style={{padding:'10px 16px',borderBottom:'1px solid rgba(26,47,72,0.07)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:'12px',fontWeight:500,color:'#1e2d3d'}}>{d.name}</div>
                <div style={{fontSize:'10px',color:'#8aa0b8',marginTop:'1px'}}>{d.occupier?.companyName || 'No occupier'}{d.sf ? ` · ${d.sf.toLocaleString()} SF` : ''}</div>
              </div>
              <span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:'rgba(122,110,82,0.1)',color:PHASE_COLORS[d.phase]||'#8aa0b8',border:'1px solid rgba(122,110,82,0.2)',whiteSpace:'nowrap'}}>{PHASE_LABELS[d.phase]||d.phase}</span>
            </div>
          ))}
          {recentDeals.length===0 && <div style={{padding:'20px 16px',color:'#8aa0b8',fontSize:'12px'}}>No deals yet — run the seed to import your data</div>}
        </div>
        <div style={{background:'#fffcf6',border:'1px solid rgba(26,47,72,0.12)',borderRadius:'6px',overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(26,47,72,0.09)'}}>
            <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:'15px',fontWeight:600,color:'#1e2d3d'}}>Quick Access</span>
          </div>
          {[
            {label:'All deals',sub:`${dealCount} total`,href:'/deals',icon:'📋'},
            {label:'Pursuits pipeline',sub:`${pursuitCount} active`,href:'/pursuits',icon:'🎯'},
            {label:'Contacts & Occupiers',sub:`${occupierCount} companies`,href:'/contacts',icon:'🏢'},
            {label:'Properties',sub:'Northgate Demo',href:'/properties',icon:'🏭'},
          ].map(item => (
            <Link key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:'10px',padding:'11px 16px',borderBottom:'1px solid rgba(26,47,72,0.07)',textDecoration:'none',color:'#1e2d3d'}}>
              <span style={{fontSize:'16px'}}>{item.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:'12px',fontWeight:500}}>{item.label}</div>
                <div style={{fontSize:'10px',color:'#8aa0b8'}}>{item.sub}</div>
              </div>
              <span style={{color:'#9e8f64',fontSize:'11px'}}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
