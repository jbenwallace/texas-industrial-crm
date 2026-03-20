import Link from 'next/link'
export default function PropertiesPage() {
  return (
    <div style={{padding:'24px'}}>
      <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:'22px',fontWeight:600,color:'#1e2d3d',marginBottom:'16px'}}>Properties</div>
      <Link href="/properties/northgate-demo" style={{display:'inline-flex',alignItems:'center',gap:'12px',padding:'14px 20px',background:'#fffcf6',border:'1px solid rgba(26,47,72,0.12)',borderRadius:'6px',textDecoration:'none',color:'#1e2d3d'}}>
        <span style={{fontSize:'20px'}}>🏭</span>
        <div>
          <div style={{fontWeight:500,fontSize:'14px'}}>Northgate Distribution Center</div>
          <div style={{fontSize:'11px',color:'#8aa0b8',marginTop:'2px'}}>4201 Northgate Blvd · Dallas, TX 75247 · Class A Industrial</div>
        </div>
        <span style={{marginLeft:'auto',color:'#9e8f64',fontSize:'12px'}}>View →</span>
      </Link>
    </div>
  )
}
