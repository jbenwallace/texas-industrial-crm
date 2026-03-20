'use client'
import { useEffect, useRef } from 'react'
import { propertyHtml } from './propertyHtml'
import { propertyJs } from './propertyJs'

export default function PropertyClientPage({ id }: { id: string }) {
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  useEffect(() => {
    const script = document.createElement('script')
    script.textContent = propertyJs
    document.body.appendChild(script)
    scriptRef.current = script
    return () => { if (scriptRef.current) { document.body.removeChild(scriptRef.current); scriptRef.current = null } }
  }, [])
  return <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}} dangerouslySetInnerHTML={{__html:propertyHtml}} />
}
