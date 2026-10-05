import type { AppState } from '../types'

const API=(import.meta.env.VITE_API_BASE_URL as string|undefined)?.replace(/\/$/,'')||''
const TOKEN_KEY='quant-path.sync-token'
export const apiConfigured=Boolean(API)
export const getToken=()=>localStorage.getItem(TOKEN_KEY)
export const setToken=(token:string)=>localStorage.setItem(TOKEN_KEY,token)
export const clearToken=()=>localStorage.removeItem(TOKEN_KEY)

async function request<T>(path:string, init:RequestInit={}){
  const token=getToken()
  const res=await fetch(`${API}${path}`,{
    ...init,
    headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...(init.headers||{})}
  })
  const body=await res.json().catch(()=>({}))
  if(!res.ok){const err:any=new Error(body.error||`Request failed (${res.status})`);err.status=res.status;err.body=body;throw err}
  return body as T
}

export async function setupAccount(email:string,password:string,setupCode:string){
  const r=await request<{token:string}>('/api/auth/setup',{method:'POST',body:JSON.stringify({email,password,setupCode})});setToken(r.token);return r
}
export async function login(email:string,password:string){
  const r=await request<{token:string}>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});setToken(r.token);return r
}
export async function pullState(){return request<{state:AppState|null;updatedAt:number;revision:number}>('/api/sync')}
export async function pushState(state:AppState){
  try{return await request<{state:AppState;updatedAt:number;revision:number}>('/api/sync',{method:'PUT',body:JSON.stringify({state})})}
  catch(err:any){if(err.status===409 && err.body?.state) return err.body as {state:AppState;updatedAt:number;revision:number}; throw err}
}
export async function health(){return request<{ok:boolean}>('/api/health')}
