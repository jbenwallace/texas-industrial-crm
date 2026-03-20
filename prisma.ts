import prisma from '@/lib/prisma'
import Link from 'next/link'

const PSTYLES: Record<string,{bg:string;color:string;border:string}> = {
  CRITICAL:{bg:'rgba(180,40,40,0.08)',color:'#8a2828',border:'rgba(180,40,40,0.2)'},
  HIGH:{bg:'rgba(122,110,82,0.12)',color:'#5a4e32',border:'rgba(122,110,82,0.28)'},
  MEDIUM:{bg:'rgba(26,72,140,0.08)',color:'#1a4880',border:'rgba(26,72,140,0.18)'},
  LOW:{bg:'rgba(26,47,72,0.05)',color:'#8aa0b8',border:'rgba(26,47,72,0.12)'},
}
const SL: Record<string,string> = { IN_PROGRESS:'In Progress', WON:'Won', LOST:'Lost' }
const SC: Record<string,string> = { IN_PROGRESS:'#4a6080', WON:'#1e7a4a', LOST:'#b83030' }

export default async function ContactsPage({ searchParams }: { searchParams: { search?: string; status?: string } }) {
  const occupiers = await prisma.occupier.findMany({
    where: {
      isDeleted: false,
      ...(searchParams.search ? { companyName: { contains: searchParams.search, mode: 'insensitive' } } : {}),
      ...(searchParams.status ? { occupierStatus: searchParams.status as any } : {}),
    },
    include: { contacts: true, primaryBroker: true },
    orderBy: [{ priority: 'asc' }, { companyName: 'asc' }],
  })
  const counts = await prisma.occupier.groupBy({ by: ['occupierStatus'], where: { isDeleted: false }, _count: true })
  const cm: Record<string,number> = {}
  counts.forEach(s => { cm[s.occupierStatus] = s._count })

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 20px 0',background:'#fffcf6',borderBottom:'1px solid rgba(26,47,72,0.12)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d'}}>Contacts</div>
          <form method="GET">
            {searchParams.status&&<input type="hidden" name="status" value={searchParams.status}/>}
            <input name="search" defaultValue={searchParams.search} placeholder="Search occupiers…" style={{padding:'5px 10px',border:'1px solid rgba(122,110,82,0.3)',borderRadius:'4px',fontSize:'12px',fontFamily:'inherit',outline:'none',background:'#fffcf6',width:'180px'}} />
          </form>
        </div>
        <div style={{display:'flex'}}>
          {[{key:'',label:'All Occupiers',count:occupiers.length},...Object.entries(SL).map(([k,l])=>({key:k,label:l,count:cm[k]||0}))].map(t => (
            <Link key={t.key} href={`/contacts${t.key?`?status=${t.key}`:''}`} style={{padding:'8px 14px',fontSize:'12px',textDecoration:'none',whiteSpace:'nowrap',
              color:searchParams.status===t.key||(!searchParams.status&&!t.key)?'#7a6e52':'#8aa0b8',
              borderBottom:searchParams.status===t.key||(!searchParams.status&&!t.key)?'2px solid #7a6e52':'2px solid transparent'}}>
              {t.label} <span style={{marginLeft:'4px',fontSize:'9px',padding:'1px 5px',borderRadius:'9px',background:'rgba(122,110,82,0.1)',color:'#7a6e52'}}>{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead><tr>{['Company','Priority','Status','Deal Stage','Space SF','Lease Exp.','Next Contact','Broker','Contacts'].map(h=>(
            <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8aa0b8',background:'#fdf8f0',borderBottom:'1px solid rgba(26,47,72,0.09)',whiteSpace:'nowrap'}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {occupiers.map(o => {
              const ps = PSTYLES[o.priority]||PSTYLES.LOW
              return (
                <tr key={o.id} style={{borderBottom:'1px solid rgba(26,47,72,0.07)'}}>
                  <td style={{padding:'10px 12px',fontWeight:500,color:'#1e2d3d'}}>{o.companyName}</td>
                  <td style={{padding:'10px 12px'}}><span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:ps.bg,color:ps.color,border:`1px solid ${ps.border}`}}>{o.priority}</span></td>
                  <td style={{padding:'10px 12px',color:SC[o.occupierStatus]||'#4a6080',fontWeight:500,fontSize:'11px'}}>{SL[o.occupierStatus]||o.occupierStatus}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{o.dealStage.replace(/_/g,' ')}</td>
                  <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{o.sizeOfSpace?o.sizeOfSpace.toLocaleString():'—'}</td>
                  <td style={{padding:'10px 12px',color:o.leaseExpiration&&new Date(o.leaseExpiration)<new Date()?'#b83030':'#4a6080'}}>{o.leaseExpiration?new Date(o.leaseExpiration).toLocaleDateString('en-US',{month:'short',year:'numeric'}):'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{o.nextContact?new Date(o.nextContact).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{o.primaryBroker?.name||'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'center',color:'#4a6080'}}>{o.contacts.length||'—'}</td>
                </tr>
              )
            })}
            {occupiers.length===0&&<tr><td colSpan={9} style={{padding:'32px',textAlign:'center',color:'#8aa0b8'}}>No contacts — run seed to import data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
