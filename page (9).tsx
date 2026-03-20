import prisma from '@/lib/prisma'

export default async function ActivityPage() {
  const [notes, recentDeals, recentOccupiers] = await Promise.all([
    prisma.note.findMany({ orderBy: { updatedAt: 'desc' }, take: 50 }),
    prisma.deal.findMany({ orderBy: { updatedAt: 'desc' }, take: 20, include: { occupier: true } }),
    prisma.occupier.findMany({ where: { isDeleted: false }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ])

  type FeedItem = { id: string; type: string; title: string; subtitle: string; date: Date }
  const feed: FeedItem[] = [
    ...notes.map(n => ({ id:`note-${n.id}`, type:'Note', title:n.text.length>80?n.text.slice(0,80)+'…':n.text, subtitle:n.entityType?`on ${n.entityType}`:'General note', date:n.updatedAt })),
    ...recentDeals.map(d => ({ id:`deal-${d.id}`, type:'Deal', title:d.name, subtitle:`${d.phase.replace(/_/g,' ')}${d.occupier?` · ${d.occupier.companyName}`:''}`, date:d.updatedAt })),
    ...recentOccupiers.map(o => ({ id:`occ-${o.id}`, type:'Occupier', title:o.companyName, subtitle:`${o.occupierStatus.replace(/_/g,' ')} · ${o.priority}`, date:o.createdAt })),
  ].sort((a,b) => b.date.getTime()-a.date.getTime()).slice(0,80)

  const ICONS: Record<string,string> = { Note:'📝', Deal:'📋', Occupier:'🏢' }
  const COLORS: Record<string,{bg:string;color:string}> = {
    Note:{bg:'rgba(26,72,140,0.08)',color:'#1a4880'},
    Deal:{bg:'rgba(122,110,82,0.1)',color:'#5a4e32'},
    Occupier:{bg:'rgba(30,122,74,0.1)',color:'#1e6a3a'},
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 20px 12px',background:'#fffcf6',borderBottom:'1px solid rgba(26,47,72,0.12)',flexShrink:0}}>
        <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d'}}>Activity</div>
        <div style={{fontSize:'11px',color:'#8aa0b8',marginTop:'2px'}}>{feed.length} recent events</div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        {feed.map(item => {
          const ac = COLORS[item.type]||COLORS.Deal
          return (
            <div key={item.id} style={{display:'flex',gap:'12px',padding:'12px 20px',borderBottom:'1px solid rgba(26,47,72,0.07)',alignItems:'flex-start'}}>
              <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'rgba(122,110,82,0.1)',color:'#7a6e52',fontSize:'14px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {ICONS[item.type]||'•'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px',flexWrap:'wrap'}}>
                  <span style={{fontSize:'12px',fontWeight:500,color:'#1e2d3d'}}>{item.title}</span>
                  <span style={{fontSize:'9px',padding:'1px 6px',borderRadius:'3px',fontWeight:500,background:ac.bg,color:ac.color}}>{item.type}</span>
                </div>
                <div style={{fontSize:'11px',color:'#8aa0b8'}}>{item.subtitle}</div>
              </div>
              <div style={{fontSize:'10px',color:'#8aa0b8',flexShrink:0,marginTop:'2px'}}>{item.date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
            </div>
          )
        })}
        {feed.length===0&&<div style={{padding:'40px',textAlign:'center',color:'#8aa0b8'}}>No activity yet</div>}
      </div>
    </div>
  )
}
