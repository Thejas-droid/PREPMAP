export type TaskStatus = 'todo' | 'done'

export interface TaskResource {
  id: string
  name: string
  url: string
  use: string
  kind: 'Guide' | 'Video'
}

export interface PlanTask {
  id: string
  offsetDays: number
  originalDate: string
  week: number
  day: string
  time: string
  hours: number
  track: string
  task: string
  resource: string
  evidence: string
  mandatory: boolean
  benefit: string
  steps: string[]
  doneWhen: string
  checkpoint?: string
  resources: TaskResource[]
}

export interface PlanGate { id: string; week: number; theme: string; criteria: string }
export interface PlanProject { id: string; project: string; milestone: string; targetWeek: number; done: string }
export interface PlanResource { id: string; track: string; name: string; use: string; url: string; window: string }
export interface PlanApplication { id: string; company: string; role: string; location: string; fit: string; requirements: string; when: string; url: string; strategy: string }

export interface PlanData {
  meta: { title: string; subtitle: string; startDate: string; weeks: number; source: string; version: number }
  tasks: PlanTask[]
  gates: PlanGate[]
  projects: PlanProject[]
  resources: PlanResource[]
  applications: PlanApplication[]
  weekThemes: Record<string, string>
}

export interface AppState {
  schema: 4
  updatedAt: number
  settings: { theme: 'light' | 'dark' | 'system'; startDate: string }
  taskStatus: Record<string, TaskStatus>
}

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline' | 'error'
