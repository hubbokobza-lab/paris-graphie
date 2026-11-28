/* ---------- recherche d'adresse ---------- */
let ADDR=null;
const nz=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’'\-]/g,' ').replace(/\s+/g,' ').trim();
function loadAddr(){if(!ADDR)ADDR=getJson('addr.json').then(j=>j.map(e=>{const z=nz(e[0]);return {n:e[0],z,c:z.replace(/ /g,''),w:z.split(' '),a:e[1]};})).catch(()=>null);return ADDR;}
const qi=$('#q'),sg=$('#sg');let sug=[],sgi=-1;
const Q_ABR={bd:'boulevard',bld:'boulevard',boul:'boulevard',av:'avenue',ave:'avenue',pl:'place',fg:'faubourg',fbg:'faubourg',st:'saint',ste:'sainte',imp:'impasse',pass:'passage',sq:'square',r:'rue',ch:'chemin',crs:'cours',all:'allee',vla:'villa',cite:'cite',pte:'porte',qu:'quai'};
const Q_TYP=new Set(['rue','avenue','boulevard','place','quai','impasse','passage','square','villa','cite','allee','cours','chemin','porte','faubourg','sentier','cour','galerie','hameau','port','pont','rond','point','voie','route','parvis','esplanade','promenade','jardin','carrefour']),Q_STOP=new Set(['de','du','des','la','le','les','l','d','et','a','au','aux','en','sur']);
/* adresse collée en entier : « 65 bis, rue La Fayette, 75009 Paris » → « 65 bis rue la fayette » */
const qClean=q=>q.replace(/,/g,' ').replace(/\b75\d{3}\b/g,' ').replace(/\bparis(\s+\d{1,2}\s*(e|er|eme|ème))?\b/g,' ').replace(/\b\d{1,2}\s*(e|er|eme)\s*(arr\w*)?$/,' ').replace(/\bfrance\b/g,' ').split(' ').filter(Boolean).map(t=>Q_ABR[t.replace(/\.$/,'')]||t).join(' ');
function qNear(a,b){if(Math.abs(a.length-b.length)>1)return false;let i=0,j=0,e=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++e>1)return false;if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}}return e+(a.length-i)+(b.length-j)<=1;}
async function suggest(){
 const raw=nz(qi.value);if(raw.length<2){sg.hidden=true;return;}
 const A=await loadAddr();if(!A)return;
 const toks=qClean(raw).replace(/\b(\d+)\s+(bis|ter|quater|b|t|q)\b/,'$1$2').split(' '),ni=toks.findIndex(t=>/^\d+(bis|ter|quater|b|t|q)?$/.test(t));
 const num=ni>=0?toks[ni]:null,ws=toks.filter((_,i)=>i!==ni);
 if(!ws.length){sg.hidden=true;return;}
 const joined=ws.join(' ');
 /* trois passes, de la plus stricte à la plus tolérante : mots tels quels (espaces ignorés : « lafayette ») ; sans type de voie ni petits mots ; une faute de frappe par mot */
 const has=(s,w)=>s.z.includes(w)||s.c.includes(w);
 let c=A.filter(s=>ws.every(w=>has(s,w)));
 if(!c.length){const w2=ws.filter(w=>!Q_TYP.has(w)&&!Q_STOP.has(w));if(w2.length)c=A.filter(s=>w2.every(w=>has(s,w)));
  if(!c.length&&w2.length)c=A.filter(s=>w2.every(w=>has(s,w)||(w.length>=4&&s.w.some(x=>qNear(x,w)))));}
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

