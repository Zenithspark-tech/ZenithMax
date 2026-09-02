const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, {recursive:true});
const DB = path.join(DATA_DIR, "db.json");
const SECRET = process.env.JWT_SECRET || "CHANGE_THIS_IN_PRODUCTION";

function load(){
  if(!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({users:[],videos:[],comments:[],follows:[],likes:[]},null,2));
  return JSON.parse(fs.readFileSync(DB,"utf8"));
}
function save(d){ fs.writeFileSync(DB, JSON.stringify(d,null,2)); }
function id(){return crypto.randomUUID();}
function auth(req,res,next){
  const h=req.headers.authorization||"";
  try{req.user=jwt.verify(h.replace("Bearer ",""),SECRET);next();}
  catch(e){res.status(401).json({error:"Please sign in"});}
}
function optionalAuth(req,res,next){
  const h=req.headers.authorization||"";
  try{req.user=jwt.verify(h.replace("Bearer ",""),SECRET)}catch(e){req.user=null}
  next();
}
const storage=multer.diskStorage({destination:UPLOAD_DIR,filename:(req,file,cb)=>cb(null,id()+path.extname(file.originalname).toLowerCase())});
const upload=multer({storage,limits:{fileSize:250*1024*1024},fileFilter:(req,f,cb)=>cb(null,/^video\/(mp4|webm|quicktime)$/.test(f.mimetype))});

app.use(express.json({limit:"2mb"}));
app.use(express.urlencoded({extended:true}));
app.use("/uploads",express.static(UPLOAD_DIR));
app.use(express.static(path.join(ROOT,"client")));

app.post("/api/auth/register",async(req,res)=>{
  const {name,email,password}=req.body; if(!name||!email||!password||password.length<6)return res.status(400).json({error:"Name, email and a 6+ character password are required"});
  const d=load(); if(d.users.some(u=>u.email.toLowerCase()===email.toLowerCase()))return res.status(409).json({error:"Email already registered"});
  const user={id:id(),name:name.trim(),email:email.toLowerCase().trim(),password:await bcrypt.hash(password,10),bio:"New ZenithMax creator",followers:0,following:0,role:d.users.length===0?"admin":"user",createdAt:new Date().toISOString()};
  d.users.push(user);save(d); const token=jwt.sign({id:user.id,name:user.name},SECRET,{expiresIn:"7d"});res.json({token,user:{...user,password:undefined}});
});
app.post("/api/auth/login",async(req,res)=>{
  const d=load(),u=d.users.find(x=>x.email===String(req.body.email||"").toLowerCase().trim());
  if(!u||!(await bcrypt.compare(req.body.password||"",u.password)))return res.status(401).json({error:"Invalid email or password"});
  res.json({token:jwt.sign({id:u.id,name:u.name},SECRET,{expiresIn:"7d"}),user:{...u,password:undefined}});
});
app.get("/api/me",auth,(req,res)=>{const d=load();const u=d.users.find(x=>x.id===req.user.id);res.json({user:{...u,password:undefined}})});
app.get("/api/videos",optionalAuth,(req,res)=>{
  const d=load(),q=String(req.query.q||"").toLowerCase(),sort=req.query.sort||"latest";
  let vs=d.videos.filter(v=>!q||v.title.toLowerCase().includes(q)||v.description.toLowerCase().includes(q)||v.tags.join(" ").toLowerCase().includes(q));
  vs.sort((a,b)=>sort==="trending"?(b.likes*3+b.views-a.likes*3-a.views):(new Date(b.createdAt)-new Date(a.createdAt)));
  res.json({videos:vs.map(v=>({...v,liked:!!req.user&&d.likes.some(l=>l.videoId===v.id&&l.userId===req.user.id)}))});
});
app.post("/api/videos",auth,upload.single("video"),(req,res)=>{
  if(!req.file)return res.status(400).json({error:"Choose an MP4/WebM/MOV video"});
  const d=load(),v={id:id(),userId:req.user.id,title:req.body.title||"Untitled video",description:req.body.description||"",tags:String(req.body.tags||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,8),url:"/uploads/"+req.file.filename,likes:0,views:0,createdAt:new Date().toISOString()};
  d.videos.push(v);save(d);res.json({video:v});
});
app.post("/api/videos/:id/view",(req,res)=>{const d=load(),v=d.videos.find(x=>x.id===req.params.id);if(v){v.views++;save(d)}res.json({ok:true})});
app.post("/api/videos/:id/like",auth,(req,res)=>{const d=load(),v=d.videos.find(x=>x.id===req.params.id);if(!v)return res.sendStatus(404);const i=d.likes.findIndex(x=>x.videoId===v.id&&x.userId===req.user.id);if(i>=0){d.likes.splice(i,1);v.likes=Math.max(0,v.likes-1)}else{d.likes.push({videoId:v.id,userId:req.user.id});v.likes++}save(d);res.json({liked:i<0,likes:v.likes})});
app.post("/api/videos/:id/comments",auth,(req,res)=>{const d=load();const text=String(req.body.text||"").trim();if(!text)return res.status(400).json({error:"Comment is empty"});const c={id:id(),videoId:req.params.id,userId:req.user.id,text,createdAt:new Date().toISOString()};d.comments.push(c);save(d);res.json({comment:c})});
app.get("/api/videos/:id/comments",(req,res)=>{const d=load();res.json({comments:d.comments.filter(c=>c.videoId===req.params.id).map(c=>({...c,user:d.users.find(u=>u.id===c.userId)?.name||"User"}))})});
app.post("/api/users/:id/follow",auth,(req,res)=>{const d=load();if(req.params.id===req.user.id)return res.status(400).json({error:"You cannot follow yourself"});const i=d.follows.findIndex(f=>f.userId===req.user.id&&f.targetId===req.params.id);if(i>=0)d.follows.splice(i,1);else d.follows.push({userId:req.user.id,targetId:req.params.id});const target=d.users.find(u=>u.id===req.params.id);if(target)target.followers=d.follows.filter(f=>f.targetId===target.id).length;const me=d.users.find(u=>u.id===req.user.id);if(me)me.following=d.follows.filter(f=>f.userId===me.id).length;save(d);res.json({following:i<0})});
app.get("/api/users/:id",(req,res)=>{const d=load(),u=d.users.find(x=>x.id===req.params.id);if(!u)return res.sendStatus(404);res.json({user:{...u,password:undefined},videos:d.videos.filter(v=>v.userId===u.id)})});

// V8 social features
function ensureV8(d){for(const k of ["stories","messages","notifications","bookmarks"])if(!d[k])d[k]=[];return d}
app.post("/api/stories",auth,upload.single("media"),(req,res)=>{const d=ensureV8(load());if(!req.file)return res.status(400).json({error:"Choose a video"});const s={id:id(),userId:req.user.id,url:"/uploads/"+req.file.filename,createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+24*60*60*1000).toISOString()};d.stories.push(s);save(d);res.json({story:s})});
app.get("/api/stories",auth,(req,res)=>{const d=ensureV8(load());res.json({stories:d.stories.filter(s=>new Date(s.expiresAt)>new Date()).map(s=>({...s,user:d.users.find(u=>u.id===s.userId)?.name||"User"}))})});
app.post("/api/messages",auth,(req,res)=>{const d=ensureV8(load()),to=String(req.body.to||""),text=String(req.body.text||"").trim();if(!to||!text)return res.status(400).json({error:"Recipient and message are required"});const m={id:id(),from:req.user.id,to,text,createdAt:new Date().toISOString()};d.messages.push(m);save(d);res.json({message:m})});
app.get("/api/messages/:userId",auth,(req,res)=>{const d=ensureV8(load());res.json({messages:d.messages.filter(m=>(m.from===req.user.id&&m.to===req.params.userId)||(m.to===req.user.id&&m.from===req.params.userId))})});
app.post("/api/videos/:id/bookmark",auth,(req,res)=>{const d=ensureV8(load()),i=d.bookmarks.findIndex(b=>b.userId===req.user.id&&b.videoId===req.params.id);if(i>=0)d.bookmarks.splice(i,1);else d.bookmarks.push({userId:req.user.id,videoId:req.params.id});save(d);res.json({saved:i<0})});
app.get("/api/bookmarks",auth,(req,res)=>{const d=ensureV8(load());res.json({videos:d.videos.filter(v=>d.bookmarks.some(b=>b.userId===req.user.id&&b.videoId===v.id))})});


// V9 discovery, moderation and admin APIs
function admin(req,res,next){if(req.user?.role!=="admin")return res.status(403).json({error:"Admin access required"});next()}
app.get("/api/discover",optionalAuth,(req,res)=>{const d=load();const scored=d.videos.map(v=>({...v,score:v.likes*5+v.views*0.2+v.tags.length*2})).sort((a,b)=>b.score-a.score).slice(0,50);res.json({videos:scored})});
app.post("/api/videos/:id/report",auth,(req,res)=>{const d=load();if(!d.reports)d.reports=[];d.reports.push({id:id(),videoId:req.params.id,userId:req.user.id,reason:String(req.body.reason||"Other").slice(0,120),createdAt:new Date().toISOString()});save(d);res.json({ok:true})});
app.get("/api/admin/overview",auth,admin,(req,res)=>{const d=load();res.json({users:d.users.length,videos:d.videos.length,comments:d.comments.length,likes:d.likes.length,reports:(d.reports||[]).length})});
app.post("/api/admin/promote",auth,admin,(req,res)=>{const d=load(),u=d.users.find(x=>x.id===req.body.userId);if(!u)return res.sendStatus(404);u.role="creator";save(d);res.json({ok:true})});

app.get("/api/stats",auth,(req,res)=>{const d=load(),vs=d.videos.filter(v=>v.userId===req.user.id);res.json({videos:vs.length,views:vs.reduce((n,v)=>n+v.views,0),likes:vs.reduce((n,v)=>n+v.likes,0),followers:d.users.find(u=>u.id===req.user.id)?.followers||0})});

app.use((req,res)=>res.sendFile(path.join(ROOT,"client/index.html")));
app.listen(PORT,"0.0.0.0",()=>console.log(`ZenithMax V7 running on http://localhost:${PORT}`));
