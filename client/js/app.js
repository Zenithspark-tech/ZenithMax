let token=localStorage.getItem("zenith_token"), mode="login", view="home", me=null;
const $=id=>document.getElementById(id), api=async(url,opt={})=>{
  opt.headers={...(opt.headers||{}),...(token?{Authorization:"Bearer "+token}:{})};
  const r=await fetch(url,opt); const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||"Request failed"); return d;
};
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function authUI(){ $("auth").classList.toggle("hidden",!!token); $("logoutBtn").classList.toggle("hidden",!token); }
async function boot(){if(token){try{me=(await api("/api/me")).user}catch(e){token=null;localStorage.removeItem("zenith_token")}}authUI();render()}
$("switchAuth").onclick=()=>{mode=mode==="login"?"register":"login";$("authTitle").textContent=mode==="login"?"Welcome back":"Create your account";$("authSub").textContent=mode==="login"?"Sign in to continue.":"Join ZenithMax today."; $("name").classList.toggle("hidden",mode==="login");$("authBtn").textContent=mode==="login"?"Sign In":"Create Account";$("switchAuth").textContent=mode==="login"?"Create an account":"I already have an account"};
$("authBtn").onclick=async()=>{try{const body={email:$("email").value,password:$("password").value};if(mode==="register")body.name=$("name").value;const d=await api("/api/auth/"+(mode==="login"?"login":"register"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});token=d.token;me=d.user;localStorage.setItem("zenith_token",token);$("authMsg").textContent="";authUI();render()}catch(e){$("authMsg").textContent=e.message}};
$("logoutBtn").onclick=()=>{token=null;me=null;localStorage.removeItem("zenith_token");authUI();render()};
$("themeBtn").onclick=()=>document.body.classList.toggle("dark");
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});
$("search").onkeydown=e=>{if(e.key==="Enter"){view="discover";render(e.target.value)}};

async function render(search=""){
 if(!token){$("app").innerHTML='<div class="hero"><h1>Welcome to ZenithMax</h1><p>A social video platform for creators and communities.</p></div>';return}
 let data;
 if(["home","shorts","discover","following"].includes(view)){data=await api("/api/videos?"+new URLSearchParams({q:search,sort:view==="discover"?"trending":"latest"}));}
 if(view==="home")home(data.videos); else if(view==="shorts")home(data.videos.filter(v=>v.url),true); else if(view==="discover")home(data.videos); else if(view==="following")home(data.videos);
 else if(view==="upload")upload(); else if(view==="profile")profile(); else if(view==="studio")studio(); else if(view==="messages")messages(); else if(view==="notifications")notifications();
}
function home(vs,shorts=false){$("app").innerHTML=`<div class="hero"><h1>${shorts?"Shorts":"Your ZenithMax feed"}</h1><p>Discover creators, watch videos and share your ideas.</p></div><div class="grid">${vs.length?vs.map(v=>card(v,shorts)).join(""):"<div class='panel'>No videos yet. Be the first creator!</div>"}</div>`}
function card(v,shorts){return `<article class="card"><video class="thumb" controls preload="metadata" src="${esc(v.url)}" onplay="viewVideo('${v.id}')"></video><div class="card-body"><div class="title">${esc(v.title)}</div><div class="muted">${esc(v.description||"ZenithMax creator")} · ${v.views} views</div><div>${(v.tags||[]).map(t=>`<span class="tag">#${esc(t)}</span>`).join("")}</div><div class="actions"><button onclick="likeVideo('${v.id}')">${v.liked?"♥":"♡"} ${v.likes}</button><button onclick="commentVideo('${v.id}')">💬 Comments</button></div></div></article>`}
async function likeVideo(id){try{await api("/api/videos/"+id+"/like",{method:"POST"});render()}catch(e){alert(e.message)}}
async function viewVideo(id){fetch("/api/videos/"+id+"/view",{method:"POST"})}
async function commentVideo(id){const t=prompt("Write a comment:");if(t)try{await api("/api/videos/"+id+"/comments",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:t})});alert("Comment added")}catch(e){alert(e.message)}}
function upload(){$("app").innerHTML=`<div class="panel"><h2>Upload a video</h2><p class="muted">Supported: MP4, WebM or MOV. Maximum 250 MB.</p><form id="uploadForm" class="form"><input name="title" required placeholder="Video title"><textarea name="description" placeholder="Description"></textarea><input name="tags" placeholder="Tags separated by commas"><input name="video" type="file" accept="video/mp4,video/webm,video/quicktime" required><button class="primary">Publish video</button></form><p id="uploadMsg" class="muted"></p></div>`;$("uploadForm").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api("/api/videos",{method:"POST",body:f});$("uploadMsg").textContent="Published!";view="home";render()}catch(x){$("uploadMsg").textContent=x.message}}}
async function profile(){const d=await api("/api/users/"+me.id);$("app").innerHTML=`<div class="panel"><div class="userline"><div class="avatar">${esc(me.name[0])}</div><div><h2>${esc(d.user.name)}</h2><div class="muted">${d.user.followers} followers · ${d.user.following} following</div></div></div><p>${esc(d.user.bio||"")}</p></div><h2>Your videos</h2><div class="grid">${d.videos.map(v=>card(v)).join("")||"<div class='panel'>Upload your first video.</div>"}</div>`}
async function studio(){const s=await api("/api/stats");$("app").innerHTML=`<div class="panel"><h2>Creator Studio</h2><div class="statgrid"><div class="stat"><b>${s.videos}</b>Videos</div><div class="stat"><b>${s.views}</b>Views</div><div class="stat"><b>${s.likes}</b>Likes</div><div class="stat"><b>${s.followers}</b>Followers</div></div></div>`}
function messages(){$("app").innerHTML=`<div class="panel"><h2>Messages</h2><p class="muted">Messaging UI is ready for V8/V9 realtime upgrades.</p><div class="list"><div class="list-item">💬 Your creator inbox will appear here.</div></div></div>`}
function notifications(){$("app").innerHTML=`<div class="panel"><h2>Notifications</h2><div class="list"><div class="list-item">✨ Welcome to ZenithMax, ${esc(me.name)}!</div></div></div>`}
boot();
