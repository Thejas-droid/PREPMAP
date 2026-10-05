import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pg from 'pg'
import { z } from 'zod'

const { Pool }=pg
const PORT=Number(process.env.PORT||10000)
const DATABASE_URL=process.env.DATABASE_URL
const JWT_SECRET=process.env.JWT_SECRET
const OWNER_SETUP_CODE=process.env.OWNER_SETUP_CODE
if(!DATABASE_URL||!JWT_SECRET||!OWNER_SETUP_CODE){console.error('DATABASE_URL, JWT_SECRET and OWNER_SETUP_CODE are required');process.exit(1)}
const pool=new Pool({connectionString:DATABASE_URL,ssl:{rejectUnauthorized:false},max:5})

async function init(){
  await pool.query(`CREATE TABLE IF NOT EXISTS users(
    id text PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  )`)
  await pool.query(`CREATE TABLE IF NOT EXISTS user_state(
    user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state jsonb NOT NULL,
    updated_at bigint NOT NULL,
    revision integer NOT NULL DEFAULT 1,
    saved_at timestamptz NOT NULL DEFAULT now()
  )`)
}

const app=express()
app.set('trust proxy',1)
app.use(helmet())
const allowed=(process.env.CORS_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)
app.use(cors({origin(origin,cb){if(!origin||allowed.length===0||allowed.some(a=>origin===a||origin.startsWith(`${a}/`)))return cb(null,true);return cb(new Error('Origin not allowed'))}}))
app.use(express.json({limit:'1mb'}))
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:true,legacyHeaders:false}))

const credentials=z.object({email:z.string().email().max(200).transform(x=>x.toLowerCase().trim()),password:z.string().min(10).max(200)})
const appState=z.object({schema:z.literal(4),updatedAt:z.number().int().positive(),settings:z.object({theme:z.enum(['light','dark','system']),startDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)}),taskStatus:z.record(z.string(),z.enum(['todo','done']))})
function issue(user){return jwt.sign({sub:user.id,email:user.email},JWT_SECRET,{expiresIn:'90d',issuer:'quant-path'})}
function auth(req,res,next){const h=req.headers.authorization||'';const token=h.startsWith('Bearer ')?h.slice(7):'';try{req.user=jwt.verify(token,JWT_SECRET,{issuer:'quant-path'});next()}catch{return res.status(401).json({error:'Please sign in again.'})}}

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'quant-path-api'}))
app.post('/api/auth/setup',async(req,res)=>{
  try{
    const {email,password}=credentials.parse(req.body);const setupCode=String(req.body.setupCode||'')
    if(setupCode!==OWNER_SETUP_CODE)return res.status(403).json({error:'Incorrect owner setup code.'})
    const count=Number((await pool.query('SELECT count(*)::int AS count FROM users')).rows[0].count)
    if(count>0)return res.status(409).json({error:'Owner account already exists. Use Sign in.'})
    const id=crypto.randomUUID(),hash=await bcrypt.hash(password,12)
    await pool.query('INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)',[id,email,hash])
    res.json({token:issue({id,email})})
  }catch(e){if(e?.issues)return res.status(400).json({error:'Use a valid email and a password of at least 10 characters.'});console.error(e);res.status(500).json({error:'Could not create the account.'})}
})
app.post('/api/auth/login',async(req,res)=>{
  try{
    const {email,password}=credentials.parse(req.body);const row=(await pool.query('SELECT id,email,password_hash FROM users WHERE email=$1',[email])).rows[0]
    if(!row||!(await bcrypt.compare(password,row.password_hash)))return res.status(401).json({error:'Incorrect email or password.'})
    res.json({token:issue(row)})
  }catch(e){if(e?.issues)return res.status(400).json({error:'Use a valid email and password.'});console.error(e);res.status(500).json({error:'Could not sign in.'})}
})
app.get('/api/sync',auth,async(req,res)=>{
  try{const row=(await pool.query('SELECT state,updated_at,revision FROM user_state WHERE user_id=$1',[req.user.sub])).rows[0];if(!row)return res.json({state:null,updatedAt:0,revision:0});res.json({state:row.state,updatedAt:Number(row.updated_at),revision:row.revision})}catch(e){console.error(e);res.status(500).json({error:'Could not load cloud progress.'})}
})
app.put('/api/sync',auth,async(req,res)=>{
  try{
    const state=appState.parse(req.body.state)
    const result=await pool.query(`INSERT INTO user_state(user_id,state,updated_at,revision) VALUES($1,$2,$3,1)
      ON CONFLICT(user_id) DO UPDATE SET state=EXCLUDED.state,updated_at=EXCLUDED.updated_at,revision=user_state.revision+1,saved_at=now()
      WHERE user_state.updated_at <= EXCLUDED.updated_at
      RETURNING state,updated_at,revision`,[req.user.sub,state,state.updatedAt])
    if(result.rowCount===0){const current=(await pool.query('SELECT state,updated_at,revision FROM user_state WHERE user_id=$1',[req.user.sub])).rows[0];return res.status(409).json({error:'A newer cloud version exists.',state:current.state,updatedAt:Number(current.updated_at),revision:current.revision})}
    const row=result.rows[0];res.json({state:row.state,updatedAt:Number(row.updated_at),revision:row.revision})
  }catch(e){if(e?.issues)return res.status(400).json({error:'Invalid progress payload.'});console.error(e);res.status(500).json({error:'Could not save cloud progress.'})}
})
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'Server error.'})})
await init()
app.listen(PORT,'0.0.0.0',()=>console.log(`Quant Path API listening on ${PORT}`))
