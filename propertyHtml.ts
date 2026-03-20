import prisma from '@/lib/prisma'

export default async function CompsPage({ searchParams }: { searchParams: { search?: string } }) {
  const comps = await prisma.deal.findMany({
    where: {
      phase: 'LEASES_CONTRACTS',
      ...(searchParams.search ? { name: { contains: searchParams.search, mode: 'insensitive' } } : {}),
    },
    include: { occupier: true, capital: true, leadBroker: true },
    orderBy: { projectedDate: 'desc' },
  })
  const TL: Record<string,string> = { TREP:'TREP', LAND:'Land', LISTING:'Listing', INVESTMENT_SALES:'Inv. Sales' }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 20px 12px',background:'#fffcf6',borderBottom:'1px solid rgba(26,47,72,0.12)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d'}}>Lease Comps</div>
            <div style={{fontSize:'11px',color:'#8aa0b8',marginTop:'2px'}}>{comps.length} executed transactions</div>
          </div>
          <form method="GET">
            <input name="search" defaultValue={searchParams.search} placeholder="Search comps…" style={{padding:'5px 10px',border:'1px solid rgba(122,110,82,0.3)',borderRadius:'4px',fontSize:'12px',fontFamily:'inherit',outline:'none',background:'#fffcf6',width:'180px'}} />
          </form>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead><tr>{['Deal / Property','Tenant','Type','SF','Rate PSF','Term','Free Rent','TI','Close Date','Broker'].map(h=>(
            <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8aa0b8',background:'#fdf8f0',borderBottom:'1px solid rgba(26,47,72,0.09)',whiteSpace:'nowrap'}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {comps.map(d => (
              <tr key={d.id} style={{borderBottom:'1px solid rgba(26,47,72,0.07)'}}>
                <td style={{padding:'10px 12px',fontWeight:500,color:'#1e2d3d'}}>{d.name}{d.capital&&<div style={{fontSize:'10px',color:'#8aa0b8',fontWeight:400}}>{d.capital.companyName}</div>}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.occupier?.companyName||'—'}</td>
                <td style={{padding:'10px 12px'}}>{d.type&&<span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:'rgba(26,72,140,0.08)',color:'#1a4880',border:'1px solid rgba(26,72,140,0.18)'}}>{TL[d.type]||d.type}</span>}</td>
                <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.sf?d.sf.toLocaleString():'—'}</td>
                <td style={{padding:'10px 12px',textAlign:'right',color:'#7a6e52',fontWeight:500}}>{d.rate?`$${d.rate.toFixed(2)}`:'—'}</td>
                <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.term?`${d.term} mo`:'—'}</td>
                <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.freeRent?`${d.freeRent} mo`:'—'}</td>
                <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{d.ti?`$${d.ti.toFixed(2)}`:'—'}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.projectedDate?new Date(d.projectedDate).toLocaleDateString('en-US',{month:'short',year:'numeric'}):'—'}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{d.leadBroker?.name||'—'}</td>
              </tr>
            ))}
            {comps.length===0&&<tr><td colSpan={10} style={{padding:'32px',textAlign:'center',color:'#8aa0b8'}}>No comps yet — closed deals will appear here</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
