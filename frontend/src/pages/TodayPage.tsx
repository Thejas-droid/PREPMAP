import { ChevronLeft, ChevronRight, Clock3, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import StudyTaskCard from '../components/StudyTaskCard'
import { useApp } from '../lib/AppContext'
import { addDays, campaignOffset, longDate } from '../lib/date'
import { carryOver, dayCompletion, tasksForOffset, weekForOffset } from '../lib/progress'

function encouragement(done:number,total:number){
  if(total===0)return 'There is nothing scheduled for this day.'
  if(done===total)return 'Day complete. Stop here, recover well, and come back fresh tomorrow.'
  if(done===0)return 'Start with the first block only. The rest of the day can wait.'
  if(done<Math.ceil(total/2))return 'Good start. Keep your attention on the next block, not the whole plan.'
  return 'You are past the halfway point. Finish one block at a time and call the day done.'
}
export default function TodayPage(){
  const {plan,state}=useApp();const raw=campaignOffset(state.settings.startDate);const base=raw<0?0:Math.min(111,raw);const [view,setView]=useState(base)
  const tasks=tasksForOffset(plan,view),progress=dayCompletion(tasks,state),week=weekForOffset(view),date=addDays(state.settings.startDate,view)
  const pending=useMemo(()=>carryOver(plan,state,view),[plan,state,view]);const isActual=view===base;const beforeStart=raw<0
  const firstIncomplete=tasks.find(t=>state.taskStatus[t.id]!=='done')
  return <div className="page today-page">
    <div className="page-topline"><div><div className="eyebrow">Week {week} · {plan.weekThemes[String(week)]}</div><h1>{beforeStart&&isActual?'Your first study day':isActual?'Today':longDate(date)}</h1><p>{beforeStart&&isActual?`Learning begins ${longDate(date)}. Everything below is prepared in advance.`:longDate(date)}</p></div><div className="date-nav"><button className="icon-button" onClick={()=>setView(v=>Math.max(0,v-1))} disabled={view===0}><ChevronLeft size={18}/></button><button className="today-jump" onClick={()=>setView(base)}>{beforeStart?'Day 1':'Today'}</button><button className="icon-button" onClick={()=>setView(v=>Math.min(111,v+1))} disabled={view===111}><ChevronRight size={18}/></button></div></div>

    <section className="day-summary">
      <div><span className="summary-label">Today’s progress</span><strong>{progress.done} of {progress.total} blocks</strong></div>
      <div className="summary-progress"><div className="progress-track large"><span style={{width:`${progress.percent}%`}}/></div><p>{encouragement(progress.done,progress.total)}</p></div>
      <div className="summary-time"><Clock3 size={17}/><span>{tasks.reduce((n,t)=>n+t.hours,0).toFixed(1)} planned hours</span></div>
    </section>

    {firstIncomplete&&<section className="next-card"><div className="next-label">Up next</div><div className="next-content"><div><strong>{firstIncomplete.time}</strong><h2>{firstIncomplete.task}</h2><p>{firstIncomplete.benefit}</p></div><button className="button" onClick={()=>document.getElementById(`task-${firstIncomplete.id}`)?.scrollIntoView({behavior:'smooth',block:'center'})}>Go to this block</button></div></section>}

    {pending.length>0&&view===base&&<details className="carry-panel"><summary><div><strong>{pending.length} unfinished block{pending.length===1?'':'s'} from earlier days</strong><span>They stay here; they do not replace today’s schedule. Open this only when you want to catch up.</span></div><RotateCcw size={17}/></summary><div className="carry-note">To avoid overload, finish today’s core schedule first. If you have energy left, take the most recent carry-over block.</div><div className="carry-list">{pending.slice(0,8).map(t=><StudyTaskCard key={t.id} task={t} compact carry/>)}{pending.length>8&&<p className="muted-note">{pending.length-8} older carry-over blocks remain visible in the full Plan view.</p>}</div></details>}

    <section className="schedule-section"><div className="section-heading"><div><span className="eyebrow">Your day</span><h2>Study schedule</h2></div><p>Study, use the resource, then tick the block. Nothing else is required here.</p></div><div className="timeline">{tasks.map((task,i)=><div className="timeline-row" id={`task-${task.id}`} key={task.id}><div className="timeline-marker"><span>{i+1}</span>{i<tasks.length-1&&<i/>}</div><StudyTaskCard task={task}/></div>)}</div></section>

    <section className="tomorrow-preview"><div><span className="eyebrow">Tomorrow</span><h2>{view<111?longDate(addDays(state.settings.startDate,view+1)):'Campaign wrap-up'}</h2></div>{view<111&&<div>{tasksForOffset(plan,view+1).slice(0,2).map(t=><p key={t.id}><strong>{t.time}</strong> · {t.task}</p>)}<button className="text-button" onClick={()=>setView(Math.min(111,view+1))}>Preview tomorrow →</button></div>}</section>
  </div>
}
