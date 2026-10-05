import { Check, ExternalLink, PlayCircle, Square } from 'lucide-react'
import { useState } from 'react'
import type { PlanTask } from '../types'
import { useApp } from '../lib/AppContext'

function displayDuration(hours:number){const m=Math.round(hours*60);return m<60?`${m} min`:`${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}`}
export default function StudyTaskCard({task,compact=false,carry=false}:{task:PlanTask;compact?:boolean;carry?:boolean}){
  const {state,toggleTask}=useApp();const done=state.taskStatus[task.id]==='done';const [expanded,setExpanded]=useState(!done&&!compact)
  return <article className={`study-card ${done?'is-done':''} ${compact?'compact':''}`}>
    <div className="study-card-main">
      <button className={`check-button ${done?'checked':''}`} onClick={()=>toggleTask(task.id)} aria-label={done?'Mark task incomplete':'Mark task complete'}>{done?<Check size={18}/>:<Square size={18}/>}</button>
      <div className="study-card-body">
        <div className="task-kicker"><span>{carry?'Carry-over · ':''}{task.time}</span><span>·</span><span>{displayDuration(task.hours)}</span><span className="task-track">{task.track}</span></div>
        <h3>{task.task}</h3>
        {!compact&&<p className="benefit"><strong>Why this matters:</strong> {task.benefit}</p>}
        {compact&&<button className="details-link" onClick={()=>setExpanded(x=>!x)}>{expanded?'Hide details':'Show details'}</button>}
      </div>
    </div>
    {expanded&&<div className="study-details">
      <div className="detail-block"><div className="detail-label">What to do</div><ol>{task.steps.map((s,i)=><li key={i}>{s}</li>)}</ol></div>
      {task.resources.length>0&&<div className="detail-block"><div className="detail-label">Resources</div><div className="resource-links">{task.resources.map(r=><a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="resource-link"><span className="resource-icon">{r.kind==='Video'?<PlayCircle size={17}/>:<ExternalLink size={16}/>}</span><span><strong>{r.name}</strong><small>{r.use}</small></span></a>)}</div></div>}
      {task.checkpoint&&<div className="checkpoint-box"><span>Checkpoint target</span><p>{task.checkpoint}</p></div>}
      <div className="done-when"><span>Done when</span><p>{task.doneWhen}</p></div>
    </div>}
  </article>
}
