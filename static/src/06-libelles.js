/* ---------- noms de rues et numéros ---------- */
let LBL=null,showLbl=true;
/* noms de rues et numéros (1 Mo) : chargés seulement quand on zoome assez pour les afficher, ou avant un export */
let LBLP=null;const loadLbl=()=>LBLP||(LBLP=getJson('labels.json').then(j=>{j.s.sort((a,b)=>b[4]-a[4]);LBL=j;draw();return j;}).catch(()=>{LBLP=null;return null;}));
const ABR=[[/^Boulevard /,'Bd '],[/^Avenue /,'Av. '],[/^Place /,'Pl. '],[/^Quai /,'Q. '],[/^Passage /,'Pass. ']];
const shortName=n=>{for(const [r,s] of ABR)if(r.test(n))return n.replace(r,s);return n;};
function drawArr(){
 if(!BASE||!showArr)return;const k=view.k;
 lx.setTransform(dpr,0,0,dpr,0,0);const X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;
 lx.save();lx.strokeStyle='rgba(235,242,248,'+(k<1?.55:.4)+')';lx.lineWidth=k<1?1.3:1.8;lx.setLineDash([7,5]);lx.beginPath();
 for(const a of BASE.a)for(const r of a.rings){r.forEach((p,i)=>i?lx.lineTo(X(p[0]),Y(p[1])):lx.moveTo(X(p[0]),Y(p[1])));lx.closePath();}
 lx.stroke();lx.setLineDash([]);
 if(k>=0.16&&BASE.q.length){lx.strokeStyle='rgba(235,242,248,'+Math.min(.32,(k-.16)*1.5)+')';lx.lineWidth=1;lx.setLineDash([2,4]);lx.beginPath();
  for(const a of BASE.q)for(const r of a.rings){r.forEach((p,i)=>i?lx.lineTo(X(p[0]),Y(p[1])):lx.moveTo(X(p[0]),Y(p[1])));lx.closePath();}
  lx.stroke();lx.setLineDash([]);
  if(k>=0.2&&k<6){const fs=Math.max(11,Math.min(16,k*16));lx.font='italic 500 '+fs+'px Inter, system-ui, sans-serif';lx.textAlign='center';lx.textBaseline='middle';lx.lineJoin='round';const al=k<2?.8:Math.max(0,.8-(k-2)*.25);
   for(const a of BASE.q){const x=X(a.c[0]),y=Y(a.c[1]);if(x<-200||x>W+200||y<-50||y>Hh+50)continue;const t=a.n.toUpperCase();lx.lineWidth=4;lx.strokeStyle='rgba(15,26,36,'+(al*.85)+')';lx.strokeText(t,x,y);lx.fillStyle='rgba(255,236,190,'+al+')';lx.fillText(t,x,y);}}}
 if(k<0.2){const fs=Math.max(13,Math.min(30,k*55));lx.font='600 '+fs+'px Inter, system-ui, sans-serif';lx.textAlign='center';lx.textBaseline='middle';lx.lineJoin='round';
  for(const a of BASE.a){const x=X(a.c[0]),y=Y(a.c[1]),t=a.n+(a.n===1?'er':'e');lx.lineWidth=4;lx.strokeStyle='rgba(15,26,36,.75)';lx.strokeText(t,x,y);lx.fillStyle='rgba(255,255,255,.82)';lx.fillText(t,x,y);}}
 lx.restore();
}
function drawSelOutline(){
 const s=sel>=0?sel:hov;if(s<0)return;const k=view.k;
 lx.setTransform(dpr,0,0,dpr,0,0);const X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;
 lx.save();lx.beginPath();for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e],b=edg[e+1];lx.moveTo(X(pos[2*a]),Y(pos[2*a+1]));lx.lineTo(X(pos[2*b]),Y(pos[2*b+1]));}
 lx.lineCap='round';lx.strokeStyle='rgba(15,26,36,.9)';lx.lineWidth=sel>=0?5.5:4;lx.stroke();lx.strokeStyle='#fff';lx.lineWidth=sel>=0?2.6:1.8;lx.stroke();lx.restore();
}
function markLegend(){const s=sel>=0?sel:hov,L=s>=0?legendOf(s):null;document.querySelectorAll('#legend .row').forEach(r=>r.classList.toggle('cur',!!L&&!L.c.grad&&+r.dataset.i===L.i));}
function legendOf(s){const c=st.crit;if(!c||c.id==='neu')return null;const i=c.k[s];const col=(c.grad&&i===0&&AN[s])?yearColor(AN[s]):(c.col[i]||'#999');return {name:c.name,lab:c.grad&&i===0&&AN[s]?String(AN[s]):c.lab[i],col,i,c};}
function legendHtml(s){const L=legendOf(s);if(!L)return '';return '<div class="lgsel"><span class="sw" style="background:'+L.col+'"></span><span><span class="k">'+esc(L.name)+' : </span><b>'+esc(L.lab)+'</b></span></div>';}
