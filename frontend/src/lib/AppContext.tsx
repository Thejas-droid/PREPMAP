import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppState, PlanData, SyncStatus } from '../types'
import { loadState, resetState, saveState } from './db'
import { apiConfigured, clearToken, getToken, login as apiLogin, pullState, pushState, setupAccount } from './api'

interface Ctx {
  plan:PlanData; state:AppState; syncStatus:SyncStatus; signedIn:boolean; apiConfigured:boolean
  toggleTask:(id:string)=>void; setTheme:(theme:AppState['settings']['theme'])=>void
  login:(email:string,password:string)=>Promise<void>; setup:(email:string,password:string,code:string)=>Promise<void>; logout:()=>void; syncNow:()=>Promise<void>
  exportBackup:()=>void; importBackup:(file:File)=>Promise<void>; reset:()=>Promise<void>
}
const Context=createContext<Ctx|null>(null)

export function AppProvider({children}:{children:ReactNode}){
  const [plan,setPlan]=useState<PlanData|null>(null),[state,setState]=useState<AppState|null>(null)
  const [syncStatus,setSyncStatus]=useState<SyncStatus>('local')
  const stateRef=useRef<AppState|null>(null),timer=useRef<number|null>(null)
  const [signedIn,setSignedIn]=useState(Boolean(getToken()))

  useEffect(()=>{fetch(`${import.meta.env.BASE_URL}plan.json`).then(r=>r.json()).then(async(p:PlanData)=>{setPlan(p);const s=await loadState(p.meta.startDate);stateRef.current=s;setState(s)})},[])
  const persist=useCallback(async(next:AppState)=>{stateRef.current=next;setState(next);await saveState(next)},[])

  const syncNow=useCallback(async()=>{
    if(!apiConfigured||!getToken()||!stateRef.current){setSyncStatus('local');return}
    if(!navigator.onLine){setSyncStatus('offline');return}
    try{
      setSyncStatus('syncing')
      const local=stateRef.current, remote=await pullState()
      const localHasProgress=Object.values(local.taskStatus).some(v=>v==='done')
      if(remote.state && (!localHasProgress || remote.updatedAt>local.updatedAt)) await persist(remote.state)
      else {
        const result=await pushState(local)
        if(result.state.updatedAt>local.updatedAt) await persist(result.state)
      }
      setSyncStatus('synced')
    }catch(e){console.error(e);setSyncStatus(navigator.onLine?'error':'offline')}
  },[persist])

  useEffect(()=>{if(state&&signedIn) void syncNow()},[Boolean(state),signedIn,syncNow])
  useEffect(()=>{const online=()=>{if(signedIn)void syncNow()};const offline=()=>setSyncStatus(signedIn?'offline':'local');window.addEventListener('online',online);window.addEventListener('offline',offline);return()=>{window.removeEventListener('online',online);window.removeEventListener('offline',offline)}},[signedIn,syncNow])

  const update=useCallback((fn:(s:AppState)=>void)=>{
    if(!stateRef.current)return;const next=structuredClone(stateRef.current);fn(next);next.updatedAt=Date.now();void persist(next)
    if(signedIn&&apiConfigured){setSyncStatus(navigator.onLine?'syncing':'offline');if(timer.current)window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>void syncNow(),900)}
  },[persist,signedIn,syncNow])

  const value=useMemo<Ctx|null>(()=>plan&&state?{
    plan,state,syncStatus,signedIn,apiConfigured,
    toggleTask:(id)=>update(s=>{s.taskStatus[id]=s.taskStatus[id]==='done'?'todo':'done'}),
    setTheme:(theme)=>update(s=>{s.settings.theme=theme}),
    login:async(email,password)=>{await apiLogin(email,password);setSignedIn(true);await syncNow()},
    setup:async(email,password,code)=>{await setupAccount(email,password,code);setSignedIn(true);await syncNow()},
    logout:()=>{clearToken();setSignedIn(false);setSyncStatus('local')},syncNow,
    exportBackup:()=>{const blob=new Blob([JSON.stringify(stateRef.current,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`quant-path-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url)},
    importBackup:async(file)=>{const parsed=JSON.parse(await file.text()) as AppState;if(parsed.schema!==4)throw new Error('Unsupported backup');parsed.updatedAt=Date.now();await persist(parsed);if(signedIn)await syncNow()},
    reset:async()=>{const fresh=await resetState(plan.meta.startDate);await persist(fresh);if(signedIn)await syncNow()}
  }:null,[plan,state,syncStatus,signedIn,update,syncNow,persist])

  if(!value)return <div className="boot"><div className="boot-mark">Q</div><p>Preparing your study day…</p></div>
  return <Context.Provider value={value}>{children}</Context.Provider>
}
export function useApp(){const v=useContext(Context);if(!v)throw new Error('useApp outside provider');return v}
