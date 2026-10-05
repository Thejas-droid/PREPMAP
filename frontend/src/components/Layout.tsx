import { useEffect, useState } from 'react'
import { BookOpen, CalendarRange, CheckCircle2, Cloud, CloudOff, Menu, Settings, X } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../lib/AppContext'
import { completion } from '../lib/progress'

const nav=[
  {to:'/',label:'Today',icon:CheckCircle2,end:true},
  {to:'/plan',label:'Plan',icon:CalendarRange},
  {to:'/progress',label:'Progress',icon:BookOpen},
  {to:'/library',label:'Library',icon:BookOpen},
  {to:'/settings',label:'Settings',icon:Settings},
]
export default function Layout(){
  const {plan,state,syncStatus,signedIn}=useApp();const [open,setOpen]=useState(false);const c=completion(plan,state)
  useEffect(()=>{const root=document.documentElement;const apply=()=>{root.dataset.theme=state.settings.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):state.settings.theme};apply();const m=matchMedia('(prefers-color-scheme: dark)');m.addEventListener?.('change',apply);return()=>m.removeEventListener?.('change',apply)},[state.settings.theme])
  return <div className="app-shell">
    <header className="mobile-bar"><button className="icon-button" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><div><strong>Quant Path</strong><span>Optiver preparation</span></div></header>
    {open&&<button className="nav-backdrop" onClick={()=>setOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="brand"><div className="brand-mark">Q</div><div><div className="brand-title">Quant Path</div><div className="brand-sub">Optiver preparation</div></div><button className="icon-button sidebar-close" onClick={()=>setOpen(false)} aria-label="Close"><X size={18}/></button></div>
      <div className="side-progress"><div className="side-progress-top"><span>Plan completed</span><strong>{c.percent}%</strong></div><div className="progress-track"><span style={{width:`${c.percent}%`}}/></div><div className="side-progress-foot">{c.done} of {c.total} study blocks</div></div>
      <nav className="nav-list">{nav.map(i=><NavLink key={i.to} to={i.to} end={i.end} onClick={()=>setOpen(false)} className={({isActive})=>`nav-link ${isActive?'active':''}`}><i.icon size={17}/><span>{i.label}</span></NavLink>)}</nav>
      <div className="sidebar-spacer"/>
      <div className={`sync-pill ${syncStatus}`}>{signedIn?(syncStatus==='offline'?<CloudOff size={14}/>:<Cloud size={14}/>):<CloudOff size={14}/>}<span>{signedIn?(syncStatus==='synced'?'Synced':syncStatus==='syncing'?'Syncing…':syncStatus==='offline'?'Offline — saved locally':'Sync needs attention'):'Saved on this device'}</span></div>
      <div className="sidebar-note">Start date · 7 Oct 2026</div>
    </aside>
    <main className="content"><Outlet/></main>
  </div>
}
