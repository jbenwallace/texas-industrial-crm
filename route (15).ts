import prisma from '@/lib/prisma'
import Link from 'next/link'

const PL: Record<string,string> = { LEASES_CONTRACTS:'Leases/Contracts', WORKING_DEALS:'Working Deals', TRACKING_DEALS:'Tracking Deals', COLD:'Cold' }
const PC: Record<string,{bg:string;color:string;border:string}> = {
  LEASES_CONTRACTS:{bg:'rgba(30,122,74,0.1)',color:'#1e6a3a',border:'rgba(30,122,74,0.22)'},
  WORKING_DEALS:{bg:'rgba(122,110,82,0.1)',color:'#5a4e32',border:'rgba(122,110,82,0.28)'},
  TRACKING_DEALS:{bg:'rgba(26,47,72,0.07)',color:'#4a6080',border:'rgba(26,47,72,0.15)'},
  COLD:{bg:'rgba(26,47,72,0.04)',color:'#8aa0b8',border:'rgba(26,47,72,0.1)'},
}
const TL: Record<string,string> = { TREP:'TREP', LAND:'Land', LISTING:'Listing', INVESTMENT_SALES:'Inv. Sales' }

export default async function DealsPage({ searchParams }: { searchParams: { phase?: string; search?: string } }) {
  const deals = await prisma.deal.findMany({
    where: {
      ...(searchParams.phase ? { phase: searchParams.phase as any } : {}),
      ...(searchParams.search ? { name: { contains: searchParams.search, mode: 'insensitive' } } : {}),
    },
    include: { occupier: true, capital: true, leadBroker: true, broker: true },
    orderBy: [{ phase: 'asc' }, { updatedAt: 'desc' }],
  })
  const counts = await prisma.deal.groupBy({ by: ['phase'], _count: true })
  const cm: Record<string,number> = {}
  counts.forEach(p => { cm[p.phase] = p._count })

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 20px 0',background:'#fffcf6',borderBottom:'1px solid rgba(26,47,72,0.12)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d'}}>Deals</div>
          <form method="GET">
            <input name="search" defaultValue={searchParams.search} placeholder="Search deals…" style={{padding:'5px 10px',border:'1px solid rgba(122,110,82,0.3)',borderRadius:'4px',fontSize:'12px',fontFamily:'inherit',outline:'none',background:'#fffcf6',width:'180px'}} />
          </form>
        </div>
        <div style={{display:'flex'}}>
          {[{key:'',label:'All',count:deals.length},...Object.entries(PL).map(([k,l])=>({key:k,label:l,count:cm[k]||0}))].map(t => (
            <Link key={t.key} href={`/deals${t.key?`?phase=${t.key}`:''}`} style={{padding:'8px 14px',fontSize:'12px',textDecoration:'none',whiteSpace:'nowrap',
              color:searchParams.phase===t.key||(!searchParams.phase&&!t.key)?'#7a6e52':'#8aa0b8',
              borderBottom:searchParams.phase===t.key||(!searchParams.phase&&!t.key)?'2px solid #7a6e52':'2px solid transparent'}}>
              {t.label} <span style={{marginLeft:'4px',fontSize:'9px',padding:'1px 5px',borderRadius:'9px',background:'rgba(122,110,82,0.1)',color:'#7a6e52'}}>{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead><tr>{['Deal Name','Occupier','Phase','Type','SF','Rate','Term','Proj. Close','Broker'].map(h=>(
            <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8aa0b8',background:'#fdf8f0',borderBottom:'1px solid rgba(26,47,72,0.09)',whiteSpace:'nowrap'}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {deals.map(d => {
              const pc = PC[d.phase]||PC.COLD
              return (
                <tr key={d.id} style={{borderBottom:'1px solid rgba(26,47,72,0.07)'}}>
                  <td style={{padding:'10px 12px',fontWeight:500,color:'#1e2d3d'}}>{d.name}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.occupier?.companyName||'—'}</td>
                  <td style={{padding:'10px 12px'}}><span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:pc.bg,color:pc.color,border:`1px solid ${pc.border}`}}>{PL[d.phase]}</span></td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.type?TL[d.type]||d.type:'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.sf?d.sf.toLocaleString():'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.rate?`$${d.rate.toFixed(2)}`:'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.term?`${d.term}mo`:'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.projectedDate?new Date(d.projectedDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.leadBroker?.name||d.broker?.name||'—'}</td>
                </tr>
              )
            })}
            {deals.length===0&&<tr><td colSpan={9} style={{padding:'32px',textAlign:'center',color:'#8aa0b8'}}>No deals — run seed to import data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
