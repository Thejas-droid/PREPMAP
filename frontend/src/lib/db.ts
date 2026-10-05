import Dexie, { type Table } from 'dexie'
import type { AppState } from '../types'

interface StateRow { id: 'main'; value: AppState }
class AppDB extends Dexie {
  state!: Table<StateRow, string>
  constructor(){ super('quant-path'); this.version(1).stores({state:'id'}) }
}
const db = new AppDB()

export const defaultState = (startDate='2026-10-07'): AppState => ({
  schema:4, updatedAt:Date.now(), settings:{theme:'light',startDate}, taskStatus:{}
})

export async function loadState(startDate:string){
  const row=await db.state.get('main')
  if(row?.value?.schema===4) return row.value
  // Lightweight migration from the earlier browser-only version when available.
  try{
    const legacy=localStorage.getItem('quantquest.optiver.v2')
    if(legacy){
      const raw=JSON.parse(legacy)
      const migrated=defaultState(startDate)
      for(const [id,status] of Object.entries(raw.taskStatus||{})) migrated.taskStatus[id]=status==='Done'?'done':'todo'
      migrated.settings.theme=raw.settings?.theme==='dark'?'dark':'light'
      await saveState(migrated); return migrated
    }
  }catch{/* ignore corrupt legacy data */}
  const fresh=defaultState(startDate); await saveState(fresh); return fresh
}
export const saveState=(value:AppState)=>db.state.put({id:'main',value})
export const resetState=async(startDate:string)=>{const s=defaultState(startDate);await saveState(s);return s}
