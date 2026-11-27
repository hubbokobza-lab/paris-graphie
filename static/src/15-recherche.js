/* ---------- recherche d'adresse ---------- */
let ADDR=null;
const nz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’'\-]/g,' ').replace(/\s+/g,' ').trim();
function loadAddr(){if(!ADDR)ADDR=getJson('addr.json').then(j=>j.map(e=>({n:e[0],z:nz(e[0]),a:e[1]}))).catch(()=>null);return ADDR;}
const qi=$('#q'),sg=$('#sg');let sug=[],sgi=-1;
async function suggest(){
 const raw=nz(qi.value);if(raw.length<2){sg.hidden=true;return;}
 const A=await loadAddr();if(!A)return;
 const toks=raw.replace(/\b(\d+)\s+(bis|ter|quater|b|t|q)\b/,'$1$2').split(' '),ni=toks.findIndex(t=>/^\d+(bis|ter|quater|b|t|q)?$/.test(t));
 const num=ni>=0?toks[ni]:null,ws=toks.filter((_,i)=>i!==ni);
 if(!ws.length){sg.hidden=true;return;}
 const joined=ws.join(' ');
 let c=A.filter(s=>ws.every(w=>s.z.includes(w)));
 c.sort((a,b)=>((a.z.startsWith(joined)?0:a.z.includes(joined)?1:2)-(b.z.startsWith(joined)?0:b.z.includes(joined)?1:2))||a.n.length-b.n.length);
 sug=[];
 for(const s of c.slice(0,14)){
  if(num){
   const nn=num.replace(/(bis|ter|quater)$/,m=>' '+m).replace(/(\d)(b|t|q)$/,(m,d,l)=>d+' '+({b:'bis',t:'ter',q:'quater'}[l]));
   for(const e of s.a){if(nz(e[0])===nn){sug.push({t:e[0]+' '+s.n,s:'Paris '+(e[3]?(e[3]===1?'1er':e[3]+'e'):''),x:e[1],y:e[2],k:7});break;}}
  }else{
   let sx=0,sy=0;for(const e of s.a){sx+=e[1];sy+=e[2];}const m=s.a[s.a.length>>1];
   sug.push({t:s.n,s:s.a.length+' numéros',x:m[1],y:m[2],k:1.8,street:true});
  }
  if(sug.length>=8)break;
 }
 sg.innerHTML=sug.length?'':'<div class="k">Aucune adresse trouvée</div>';
 sug.forEach((r,i)=>{const d=document.createElement('div');d.innerHTML=esc(r.t)+' <span class="k">'+esc(r.s)+'</span>';d.onmousedown=e=>{e.preventDefault();goTo(r);};sg.appendChild(d);});
 sgi=-1;sg.hidden=false;
}
function goTo(r){
 sg.hidden=true;qi.value=r.t;qi.blur();
 const wx=r.x/2,wy=r.y/2,pw=isMob()?0:340-(r.street?0:422);
 if(isMob())$('#panel').classList.add('min'),syncTog();
 view.k=r.k;view.cx=wx-pw/2/view.k;view.cy=wy-(isMob()?(r.street?sheetH():innerHeight*.5)/2/view.k:0);
 if(r.street){mark=null;sel=-1;showCard(-1);draw();return;}
 mark={x:wx,y:wy};
 let s=pick(wx,wy);
 if(s<0)for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2],[4,4],[-4,4],[4,-4],[-4,-4],[8,0],[-8,0],[0,8],[0,-8]]){s=pick(wx+dx,wy+dy);if(s>=0)break;}
 if(s>=0){ADPREF={s,t:r.t};sel=s;showCard(s,true);}else{sel=-1;showCard(-1);}
 draw();
}
qi.addEventListener('input',suggest);qi.addEventListener('focus',()=>{loadAddr();if(qi.value)suggest();});
qi.addEventListener('blur',()=>setTimeout(()=>{sg.hidden=true;},150));
qi.addEventListener('keydown',e=>{
 const rows=[...sg.children];
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sgi=Math.max(0,Math.min(rows.length-1,sgi+(e.key==='ArrowDown'?1:-1)));rows.forEach((r,i)=>r.classList.toggle('on',i===sgi));}
 else if(e.key==='Enter'){const r=sug[sgi>=0?sgi:0];if(r)goTo(r);}
 else if(e.key==='Escape'){sg.hidden=true;qi.blur();}
});
cv.addEventListener('pointerdown',()=>{if(mark){mark=null;draw();}});
cv.addEventListener('pointerleave',()=>{tip.hidden=true;});

