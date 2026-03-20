import prisma from '@/lib/prisma'
import Link from 'next/link'

const PS: Record<string,{bg:string;color:string;border:string}> = {
  NOT_STARTED:{bg:'rgba(26,47,72,0.06)',color:'#8aa0b8',border:'rgba(26,47,72,0.12)'},
  IN_PROGRESS:{bg:'rgba(122,110,82,0.1)',color:'#5a4e32',border:'rgba(122,110,82,0.25)'},
  COMPLETED:{bg:'rgba(30,122,74,0.1)',color:'#1e6a3a',border:'rgba(30,122,74,0.22)'},
}
const PL: Record<string,string> = { NOT_STARTED:'Not Started', IN_PROGRESS:'In Progress', COMPLETED:'Completed' }
const TL: Record<string,string> = { TREP:'TREP', LAND:'Land', LISTING:'Listing', INVESTMENT_SALES:'Inv. Sales', ACQUISITION:'Acquisition' }

export default async function PursuitsPage({ searchParams }: { searchParams: { phase?: string; search?: string } }) {
  const pursuits = await prisma.pursuit.findMany({
    where: {
      ...(searchParams.phase ? { assetAnalysisPhase: searchParams.phase as any } : {}),
      ...(searchParams.search ? { name: { contains: searchParams.search, mode: 'insensitive' } } : {}),
    },
    include: { broker: true, capital: true, deals: true },
    orderBy: { createdAt: 'desc' },
  })
  const counts = await prisma.pursuit.groupBy({ by: ['assetAnalysisPhase'], _count: true })
  const cm: Record<string,number> = {}
  counts.forEach(p => { cm[p.assetAnalysisPhase] = p._count })

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 20px 0',background:'#fffcf6',borderBottom:'1px solid rgba(26,47,72,0.12)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d'}}>Pursuits</div>
          <form method="GET">
            <input name="search" defaultValue={searchParams.search} placeholder="Search pursuits…" style={{padding:'5px 10px',border:'1px solid rgba(122,110,82,0.3)',borderRadius:'4px',fontSize:'12px',fontFamily:'inherit',outline:'none',background:'#fffcf6',width:'180px'}} />
          </form>
        </div>
        <div style={{display:'flex'}}>
          {[{key:'',label:'All',count:pursuits.length},...Object.entries(PL).map(([k,l])=>({key:k,label:l,count:cm[k]||0}))].map(t => (
            <Link key={t.key} href={`/pursuits${t.key?`?phase=${t.key}`:''}`} style={{padding:'8px 14px',fontSize:'12px',textDecoration:'none',whiteSpace:'nowrap',
              color:searchParams.phase===t.key||(!searchParams.phase&&!t.key)?'#7a6e52':'#8aa0b8',
              borderBottom:searchParams.phase===t.key||(!searchParams.phase&&!t.key)?'2px solid #7a6e52':'2px solid transparent'}}>
              {t.label} <span style={{marginLeft:'4px',fontSize:'9px',padding:'1px 5px',borderRadius:'9px',background:'rgba(122,110,82,0.1)',color:'#7a6e52'}}>{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead><tr>{['Pursuit Name','Type','Phase','Total SF','Submarket','Capital','Broker','Deals','Created'].map(h=>(
            <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8aa0b8',background:'#fdf8f0',borderBottom:'1px solid rgba(26,47,72,0.09)',whiteSpace:'nowrap'}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {pursuits.map(p => {
              const ps = PS[p.assetAnalysisPhase]||PS.IN_PROGRESS
              return (
                <tr key={p.id} style={{borderBottom:'1px solid rgba(26,47,72,0.07)'}}>
                  <td style={{padding:'10px 12px',fontWeight:500,color:'#1e2d3d'}}>{p.name}</td>
                  <td style={{padding:'10px 12px'}}><span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:'rgba(26,72,140,0.08)',color:'#1a4880',border:'1px solid rgba(26,72,140,0.18)'}}>{TL[p.type]||p.type}</span></td>
                  <td style={{padding:'10px 12px'}}><span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:ps.bg,color:ps.color,border:`1px solid ${ps.border}`}}>{PL[p.assetAnalysisPhase]}</span></td>
                  <td style={{padding:'10px 12px',textAlign:'right',color:'#4a6080'}}>{p.totalSf?Number(p.totalSf).toLocaleString():'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{p.submarket||'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{p.capital?.companyName||'—'}</td>
                  <td style={{padding:'10px 12px',color:'#4a6080'}}>{p.broker?.name||'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'center',color:'#4a6080'}}>{p.deals.length||'—'}</td>
                  <td style={{padding:'10px 12px',color:'#8aa0b8'}}>{new Date(p.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                </tr>
              )
            })}
            {pursuits.length===0&&<tr><td colSpan={9} style={{padding:'32px',textAlign:'center',color:'#8aa0b8'}}>No pursuits — run seed to import data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
