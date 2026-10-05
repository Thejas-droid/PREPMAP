import type { AppState, PlanData, PlanTask } from '../types'
import { addDays, campaignOffset, isoDate } from './date'
export const isDone=(state:AppState,id:string)=>state.taskStatus[id]==='done'
export const taskDate=(state:AppState,t:PlanTask)=>addDays(state.settings.startDate,t.offsetDays)
export function currentOffset(state:AppState){return campaignOffset(state.settings.startDate)}
export function weekForOffset(offset:number){return Math.min(16,Math.max(1,Math.floor(Math.max(0,offset)/7)+1))}
export function tasksForOffset(plan:PlanData,offset:number){return plan.tasks.filter(t=>t.offsetDays===offset)}
export function carryOver(plan:PlanData,state:AppState,offset:number){return plan.tasks.filter(t=>t.offsetDays<offset&&t.mandatory&&!isDone(state,t.id)).sort((a,b)=>b.offsetDays-a.offsetDays)}
export function completion(plan:PlanData,state:AppState){const done=plan.tasks.filter(t=>isDone(state,t.id)).length;return {done,total:plan.tasks.length,percent:Math.round(done/plan.tasks.length*100)}}
export function weekCompletion(plan:PlanData,state:AppState,week:number){const x=plan.tasks.filter(t=>t.week===week);const done=x.filter(t=>isDone(state,t.id)).length;return {done,total:x.length,percent:x.length?Math.round(done/x.length*100):0}}
export function dayCompletion(tasks:PlanTask[],state:AppState){const done=tasks.filter(t=>isDone(state,t.id)).length;return {done,total:tasks.length,percent:tasks.length?Math.round(done/tasks.length*100):0}}
export function streak(plan:PlanData,state:AppState){const doneDays=new Set(plan.tasks.filter(t=>isDone(state,t.id)).map(t=>isoDate(taskDate(state,t))));let d=new Date();if(!doneDays.has(isoDate(d))){d.setDate(d.getDate()-1);if(!doneDays.has(isoDate(d)))return 0}let n=0;while(doneDays.has(isoDate(d))){n++;d.setDate(d.getDate()-1)}return n}
