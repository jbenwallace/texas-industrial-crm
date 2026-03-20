import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function CompaniesPage({ searchParams }: { searchParams: { search?: string; type?: string } }) {
  const capitals = await prisma.capital.findMany({
    where: {
      ...(searchParams.search ? { companyName: { contains: searchParams.search, mode: 'insensitive' } } : {}),
      ...(searchParams.type ? { type: searchParams.type as any } : {}),
    },
    include: { contacts: true, deals: true, pursuits: true },
    orderBy: { companyName: 'asc' },
  })
  const TL: Record<string,string> = { INVESTOR_OWNER:'Investor / Owner', DEVELOPER:'Developer' }
  const TS: Record<string,{bg:string;color:string;border:string}> = {
    INVESTOR_OWNER:{bg:'rgba(26,72,140,0.08)',color:'#1a4880',border:'rgba(26,72,140,0.18)'},
    DEVELOPER:{bg:'rgba(80,40,120,0.08)',color:'#4a2870',border:'rgba(80,40,120,0.18)'},
  }
  const counts = await prisma.capital.groupBy({ by: ['type'], _count: true })
  const cm: Record<string,number> = {}
  counts.forEach(t => { cm[t.type] = t._count })

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 20px 0',background:'#fffcf6',borderBottom:'1px solid rgba(26,47,72,0.12)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d'}}>Companies</div>
          <form method="GET">
            {searchParams.type&&<input type="hidden" name="type" value={searchParams.type}/>}
            <input name="search" defaultValue={searchParams.search} placeholder="Search companies…" style={{padding:'5px 10px',border:'1px solid rgba(122,110,82,0.3)',borderRadius:'4px',fontSize:'12px',fontFamily:'inherit',outline:'none',background:'#fffcf6',width:'180px'}} />
          </form>
        </div>
        <div style={{display:'flex'}}>
          {[{key:'',label:'All',count:capitals.length},{key:'INVESTOR_OWNER',label:'Investor / Owner',count:cm['INVESTOR_OWNER']||0},{key:'DEVELOPER',label:'Developer',count:cm['DEVELOPER']||0}].map(t => (
            <Link key={t.key} href={`/companies${t.key?`?type=${t.key}`:''}`} style={{padding:'8px 14px',fontSize:'12px',textDecoration:'none',whiteSpace:'nowrap',
              color:searchParams.type===t.key||(!searchParams.type&&!t.key)?'#7a6e52':'#8aa0b8',
              borderBottom:searchParams.type===t.key||(!searchParams.type&&!t.key)?'2px solid #7a6e52':'2px solid transparent'}}>
              {t.label} <span style={{marginLeft:'4px',fontSize:'9px',padding:'1px 5px',borderRadius:'9px',background:'rgba(122,110,82,0.1)',color:'#7a6e52'}}>{t.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead><tr>{['Company Name','Type','Status','Owner Code','Deals','Pursuits','Contacts'].map(h=>(
            <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:500,textTransform:'uppercase',letterSpacing:'0.06em',color:'#8aa0b8',background:'#fdf8f0',borderBottom:'1px solid rgba(26,47,72,0.09)',whiteSpace:'nowrap'}}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {capitals.map(c => {
              const ts = TS[c.type]||TS.DEVELOPER
              return (
                <tr key={c.id} style={{borderBottom:'1px solid rgba(26,47,72,0.07)'}}>
                  <td style={{padding:'10px 12px',fontWeight:500,color:'#1e2d3d'}}>{c.companyName}</td>
                  <td style={{padding:'10px 12px'}}><span style={{fontSize:'9px',padding:'2px 6px',borderRadius:'3px',fontWeight:500,background:ts.bg,color:ts.color,border:`1px solid ${ts.border}`}}>{TL[c.type]||c.type}</span></td>
                  <td style={{padding:'10px 12px',color:c.status==='Active'?'#1e7a4a':'#8aa0b8',fontWeight:500,fontSize:'11px'}}>{c.status}</td>
                  <td style={{padding:'10px 12px',color:'#8aa0b8'}}>{c.ownerCode||'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'center',color:'#4a6080'}}>{c.deals.length||'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'center',color:'#4a6080'}}>{c.pursuits.length||'—'}</td>
                  <td style={{padding:'10px 12px',textAlign:'center',color:'#4a6080'}}>{c.contacts.length||'—'}</td>
                </tr>
              )
            })}
            {capitals.length===0&&<tr><td colSpan={7} style={{padding:'32px',textAlign:'center',color:'#8aa0b8'}}>No companies — run seed to import data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
