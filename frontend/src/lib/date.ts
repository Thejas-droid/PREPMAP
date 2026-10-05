export const parseDate = (value: string) => new Date(`${value}T12:00:00`)
export const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
export const addDays = (value: string, days: number) => { const d=parseDate(value); d.setDate(d.getDate()+days); return d }
export const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime()-a.getTime())/86400000)
export const longDate = (date: Date) => date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})
export const shortDate = (date: Date) => date.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})
export const campaignOffset = (startDate: string, date = new Date()) => daysBetween(parseDate(startDate), parseDate(isoDate(date)))
