/* ---------- état ---------- */
const st={crit:CRIT[0],en:null,y0:1700,y1:2026,h0:0,h1:60,n0:1,n1:15,und:true,reh:false,sur:false,igh:false,cvp:false,rcn:false};
const CTX=pack('#1c2833'),GHOST=pack('#16212b');
const shapeCol=new Uint32Array(N);
const vcol=new Uint8Array(totalV*4),vcol32=new Uint32Array(vcol.buffer);
let nShown=0;
function recolor(){
 const c=st.crit,en=st.en,k=c.k;
 const yAct=st.y0>1700||st.y1<2026,hAct=st.h0>0||st.h1<60;
 const hLo=st.h0*10,hHi=st.h1>=60?1e9:st.h1*10;
 nShown=0;
 for(let s=0;s<N;s++){
  let ok=true;
  if(yAct){const y=AN[s];ok=y?((st.y0<=1700||y>=st.y0)&&(st.y1>=2026||y<=st.y1)):st.und;}
  if(ok&&hAct){const h=HM[s];ok=h>=hLo&&h<hHi;}
  if(ok&&(st.n0>1||st.n1<15)){const n=nivOf(s);ok=n>=st.n0&&(st.n1>=15||n<=st.n1);}
  if(ok&&st.reh)ok=RE[s]>=1900;
  if(ok&&st.sur)ok=SU[s]>0;
  if(ok&&st.igh)ok=IG[s]===1;
  if(ok&&st.cvp)ok=CN[s]>0;
  if(ok&&st.rcn)ok=RC[s]>0;
  let col;
  if(!ok)col=CTX;
  else if(!en[k[s]])col=GHOST;
  else{col=(c.grad&&k[s]===0)?YEAR32[AN[s]]:c.pal[k[s]];nShown++;}
  shapeCol[s]=col;
 }
 for(let v=0;v<totalV;v++)vcol32[v]=shapeCol[vShape[v]];
 if(gl){gl.bindBuffer(gl.ARRAY_BUFFER,colBuf);gl.bufferData(gl.ARRAY_BUFFER,vcol,gl.DYNAMIC_DRAW);}
 $('#count').textContent=nf.format(nShown)+" bâtiments affichés sur "+nf.format(N);
 draw();
}
function setCrit(c){
 st.crit=c;st.en=new Array(c.lab.length).fill(true);
 document.querySelectorAll('#crit button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===c.id));
 buildLegend();$('#legWrap').hidden=c.id==='neu';
 const pb=document.querySelector('#crit button[aria-pressed=true]');if(pb)pb.after($('#legWrap'));markLegend();
 recolor();
}
const NOHIST=new Set(['neu','yr','typ','usg','bur','mur','toit','rc','cvp','pro','sa','zo','arr','rs']);

// ---------- mini-carte des quartiers : une statistique par quartier administratif, pour les critères où l'agrégat a du sens
let QIDX=null;
function quartIdx(){if(QIDX||!BASE||!BASE.q||!BASE.q.length)return QIDX;QIDX=new Int16Array(N).fill(-1);
 const BB=BASE.q.map(q=>{let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const r of q.rings)for(const p of r){a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1]);}return [a,b,c,d];});
 for(let s=0;s<N;s++){const x=(bbox[4*s]+bbox[4*s+2])/2,y=(bbox[4*s+1]+bbox[4*s+3])/2;
  for(let i=0;i<BB.length;i++){const B=BB[i];if(x<B[0]||x>B[2]||y<B[1]||y>B[3])continue;if(BASE.q[i].rings.some(r=>inPts(r,x,y))){QIDX[s]=i;break;}}}
 return QIDX;}
const med=a=>{if(!a.length)return null;a.sort((x,y)=>x-y);return a[a.length>>1];};
const QSTAT={
 vac:{t:'Part de la surface de bureaux probablement vide (notes 4 et 5)',u:'%',init:()=>[0,0],add:(A,s)=>{const v=vacOf(s);if(v.c>=1&&v.c<=5){const a=offSDP(s);A[1]+=a;if(v.c>=4)A[0]+=a;}},val:A=>A[1]>20000?100*A[0]/A[1]:null},
 occ:{t:'Occupation apparente moyenne des bureaux calculables',u:'%',init:()=>[0,0],add:(A,s)=>{const v=vacOf(s);if(!v.c||v.c===6)return;const o=occOf(s);if(o&&o.ok){A[0]+=SEF[s]*M2_SAL;A[1]+=offSDP(s);}},val:A=>A[1]>10000?Math.min(150,100*A[0]/A[1]):null},
 dpe:{t:'Part des immeubles classés F ou G (parmi ceux qui ont un DPE)',u:'%',init:()=>[0,0],add:(A,s)=>{if(BD[s]>0){A[1]++;if(BD[s]>=6)A[0]++;}},val:A=>A[1]>=20?100*A[0]/A[1]:null},
 per:{t:'Année de construction médiane',u:'',yr:1,init:()=>[],add:(A,s)=>{if(AN[s]>1000)A.push(AN[s]);},val:A=>med(A)},
 hm:{t:'Hauteur médiane des immeubles',u:' m',init:()=>[],add:(A,s)=>{if(HM[s]>0)A.push(HM[s]/10);},val:A=>med(A)},
 log:{t:'Nombre de logements',u:'',init:()=>[0],add:(A,s)=>{A[0]+=BL[s];},val:A=>A[0]},
 soc:{t:'Part de logements sociaux',u:'%',init:()=>[0,0],add:(A,s)=>{A[0]+=BS[s];A[1]+=BL[s];},val:A=>A[1]>=100?Math.min(100,100*A[0]/A[1]):null},
 own:{t:'Part des immeubles détenus par une société (civile ou commerciale)',u:'%',init:()=>[0,0],add:(A,s)=>{A[1]++;if(OWN[s]===4||OWN[s]===5)A[0]++;},val:A=>A[1]>=20?100*A[0]/A[1]:null},
 pro:{t:'Part des immeubles protégés (PLU ou monument historique)',u:'%',init:()=>[0,0],add:(A,s)=>{A[1]++;if(PF[s]&119)A[0]++;},val:A=>A[1]>=20?100*A[0]/A[1]:null},
 pc:{t:'Permis de construire accordés depuis 5 ans (immeubles concernés)',u:'',init:()=>[0],add:(A,s)=>{if(LPC[s]>=YNOW-5)A[0]++;},val:A=>A[0]},
 ne:{t:'Établissements actifs (Sirene)',u:'',init:()=>[0],add:(A,s)=>{if(SNE[s]<=100)A[0]+=SNE[s];},val:A=>A[0]}
};
// repères de marché publiés (Immostat via les conseils), saisis à la main avec leur source : à mettre à jour chaque trimestre
const MARCHE=[
 ['Taux de vacance des bureaux à Paris','9 %','JLL, fin T3 2026','https://www.jll.com/fr-fr/newsroom/cp-marche-locatif-bureaux-paris-t3-2026'],
 ['Taux de vacance dans le quartier central des affaires','6,9 % (5,1 % un an plus tôt) ; 487 000 m² disponibles','Cushman & Wakefield d\'après Immostat, T3 2026','https://www.cushmanwakefield.com/fr-fr/france/news/2026/10/reactions-immostat-t3-2026'],
 ['Offre disponible à Paris','1,4 million de m² (+32 % sur un an)','Cushman & Wakefield d\'après Immostat, fin 2025','https://www.cushmanwakefield.com/fr-fr/france/news/2026/01/immostat-t4-2025'],
 ['Taux de vacance en Île-de-France','11,8 %','JLL, fin T3 2026','https://www.jll.com/fr-fr/newsroom/cp-marche-locatif-bureaux-paris-t3-2026'],
 ['Loyer prime, quartier central des affaires','1 300 €/m²/an','BNP Paribas Real Estate, T2 2026','https://www.realestate.bnpparibas.fr/media/france/2026-08/REVIEW%20BUREAUX%20IDF%20-%20T2%202026.pdf']
];
const QCACHE={};
function miniMap(c,L){const Q=QSTAT[c.id];if(!Q||!quartIdx())return;
 if(!QCACHE[c.id]){const acc=BASE.q.map(()=>Q.init()),qi=quartIdx();for(let s=0;s<N;s++)if(qi[s]>=0)Q.add(acc[qi[s]],s);QCACHE[c.id]=acc.map(a=>Q.val(a));}
 const V=QCACHE[c.id],ok=V.filter(v=>v!=null).sort((a,b)=>a-b);if(!ok.length)return;
 const lo=ok[Math.floor(ok.length*.05)],hi=ok[Math.floor(ok.length*.95)];
 const box=document.createElement('div');box.className='qmap';box.innerHTML='<div class="k" style="margin:8px 0 3px">'+esc(Q.t)+', par quartier</div>';
 const cv=document.createElement('canvas'),W=260,Hh=190,dpr=window.devicePixelRatio||1;cv.width=W*dpr;cv.height=Hh*dpr;cv.style.width=W+'px';cv.style.height=Hh+'px';box.appendChild(cv);
 let a=1e9,b=1e9,c2=-1e9,d=-1e9;for(const q of BASE.q)for(const r of q.rings)for(const p of r){a=Math.min(a,p[0]);b=Math.min(b,p[1]);c2=Math.max(c2,p[0]);d=Math.max(d,p[1]);}
 const k=Math.min((W-8)/(c2-a),(Hh-8)/(d-b)),ox=(W-(c2-a)*k)/2,oy=(Hh-(d-b)*k)/2,X=x=>ox+(x-a)*k,Y=y=>Hh-oy-(y-b)*k;
 const RAMP=['#f7fbff','#c6dbef','#6baed6','#2171b5','#08306b'],colOf=v=>{if(v==null)return '#3a4652';const t=hi>lo?Math.max(0,Math.min(.999,(v-lo)/(hi-lo))):.5;return RAMP[Math.floor(t*RAMP.length)];};
 const g=cv.getContext('2d');g.scale(dpr,dpr);g.lineWidth=.5;g.strokeStyle='rgba(0,0,0,.35)';
 BASE.q.forEach((q,i)=>{g.fillStyle=colOf(V[i]);for(const r of q.rings){g.beginPath();r.forEach((p,j)=>j?g.lineTo(X(p[0]),Y(p[1])):g.moveTo(X(p[0]),Y(p[1])));g.closePath();g.fill();g.stroke();}});
 const fm=v=>v==null?'données insuffisantes':Q.yr?String(Math.round(v)):(Q.u==='%'?(Math.round(v*10)/10).toString().replace('.',','):nf.format(Math.round(Q.u===' m'?v*10:v)/(Q.u===' m'?10:1)))+Q.u;
 const lg=document.createElement('div');lg.className='k qleg';lg.innerHTML='<span>'+fm(lo)+'</span><i style="background:linear-gradient(90deg,'+RAMP.join(',')+')"></i><span>'+fm(hi)+'</span>';box.appendChild(lg);
 const tp=document.createElement('div');tp.className='k';tp.style.minHeight='1.3em';tp.textContent='Survolez un quartier.';box.appendChild(tp);
 cv.addEventListener('mousemove',e=>{const R=cv.getBoundingClientRect(),x=a+(e.clientX-R.left-ox)/k,y=b+(Hh-(e.clientY-R.top)-oy)/k;
  const i=BASE.q.findIndex(q=>q.rings.some(r=>inPts(r,x,y)));tp.textContent=i<0?'':BASE.q[i].n+' : '+fm(V[i]);});
 if(c.id==='vac'){const m=document.createElement('div');m.className='k';m.style.marginTop='8px';
  m.innerHTML='<b style="color:var(--ink)">Repères de marché publiés</b> (offre commercialisée, surfaces utiles ; à comparer avec prudence)'+MARCHE.map(r=>'<div style="margin-top:3px">'+esc(r[0])+' : <b style="color:var(--ink)">'+esc(r[1])+'</b> · <a href="'+r[3]+'" target="_blank" rel="noopener">'+esc(r[2])+'</a></div>').join('');box.appendChild(m);}
 L.appendChild(box);
}
function buildLegend(){
 const c=st.crit,L=$('#legend');L.innerHTML='';
 
 if(c.grad){
  const g=document.createElement('div');g.className='grad';
  g.style.background='linear-gradient(90deg,'+KNOTS.map((y,i)=>SPEC[i]+' '+Math.round(i/10*100)+'%').join(',')+')';
  L.appendChild(g);
  const t=document.createElement('div');t.className='ticks';t.innerHTML='<span>1750</span><span>1882</span><span>1953</span><span>1995</span><span>2015</span>';L.appendChild(t);
 }
 if(c.cnt&&c.lab.length>2&&!NOHIST.has(c.id)){   // histogramme pour les grandeurs ordonnées (âge, hauteur, quantités, prix...) ; pas pour les catégories
  const neu=i=>c.col[i]===GRAY||/^(Aucune|Aucun|Pas de|Inconnu|Non renseign)/.test(c.lab[i]);   // classe « sans donnée » : hors échelle
  const mx=Math.max(1,...c.cnt.filter((_,i)=>!neu(i))),H=document.createElement('div');H.className='hist';
  c.lab.forEach((lab,i)=>{const b=document.createElement('div');b.className='hb';b.dataset.i=i;
   b.style.height=Math.min(100,Math.max(c.cnt[i]?3:0,c.cnt[i]/mx*100))+'%';if(neu(i)&&c.cnt[i]>mx)b.classList.add('cut');
   b.style.background=c.grad&&i===0?'linear-gradient(0deg,'+SPEC[0]+','+SPEC[5]+','+SPEC[10]+')':(c.col[i]||'#999');
   b.title=lab.replace(/<[^>]+>/g,'')+' : '+nf.format(c.cnt[i])+' immeubles';
   b.addEventListener('click',()=>{st.en[i]=!st.en[i];syncRows();recolor();});H.appendChild(b);});
  L.appendChild(H);
 }
 c.lab.forEach((lab,i)=>{
  const r=document.createElement('div');r.className='row';r.dataset.i=i;
  const col=c.col[i]||'#999';
  r.innerHTML='<span class="sw" style="background:'+(c.grad&&i===0?'linear-gradient(90deg,'+SPEC[0]+','+SPEC[5]+','+SPEC[10]+')':col)+'"></span><span class="lb">'+lab+'</span><span class="n">'+nf.format(c.cnt[i])+' · '+nf.format(Math.round(c.ha[i]))+' ha</span>';
  r.addEventListener('click',()=>{st.en[i]=!st.en[i];syncRows();recolor();});
  r.addEventListener('dblclick',()=>{st.en=st.en.map((_,j)=>j===i);syncRows();recolor();});
  L.appendChild(r);
 });
 syncRows();
 try{miniMap(c,L);}catch(e){console.warn(e);}
}
function syncRows(){document.querySelectorAll('#legend .row,#legend .hb').forEach(r=>r.classList.toggle('off',!st.en[+r.dataset.i]));}
$('#reset').onclick=()=>{st.en=st.en.map(()=>true);syncRows();recolor();};
{const box=$('#crit');let g='';const slot=x=>{if(!x)return;const s=document.createElement('div');s.className='ovslot';s.dataset.g=x;box.appendChild(s);};for(const c of CRIT){if(c.id==='neu')continue;if(c.g!==g){slot(g);if(g==='Âge'){const d=document.createElement('div');d.className='g';d.textContent='Histoire';box.appendChild(d);slot('Histoire');}g=c.g;const fm={'Volume':1,'Usages':2}[g];if(fm){const f=document.createElement('div');f.className='lfam';f.innerHTML='<b>'+FAM[fm]+'</b><span>'+(fm===1?'Ce qui est construit, dure et se mesure':'Comment on occupe, possède et réglemente')+'</span>';box.appendChild(f);}const d=document.createElement('div');d.className='g';d.textContent=g;box.appendChild(d);}
 const b=document.createElement('button');b.type='button';b.dataset.id=c.id;b.innerHTML='<span class="dot"></span><span class="cn">'+c.name+'</span>'+orgHtml(c.id);b.onclick=()=>setCrit(st.crit===c?CRIT[0]:c);box.appendChild(b);}slot(g);}

let ready=false;
/* filtres */
function rng(a,b,fl,lo,hi,out,fmtT,upd){
 const A=$(a),Bx=$(b),F=$(fl);
 function go(){let x=+A.value,y=+Bx.value;if(x>y){if(document.activeElement===A){x=y;A.value=x;}else{y=x;Bx.value=y;}}
  const mn=+A.min,mx=+A.max;F.style.left=((x-mn)/(mx-mn)*100)+'%';F.style.right=(100-(y-mn)/(mx-mn)*100)+'%';
  $(out).textContent=fmtT(x,y);upd(x,y);}
 A.oninput=go;Bx.oninput=go;go();
}
let tm;const later=()=>{clearTimeout(tm);tm=setTimeout(recolor,40);};
rng('#y0','#y1','#yF',0,0,'#yT',(x,y)=>(x<=1700&&y>=2026)?'toutes':(x<=1700?'avant 1700':x)+' – '+(y>=2026?'auj.':y),(x,y)=>{st.y0=x;st.y1=y;if(ready)later();});
rng('#n0','#n1','#nF',1,1,'#nT',(x,y)=>(x<=1&&y>=15)?'tous':(x===y?x:x+' – '+(y>=15?'15 et +':y))+' niv.',(x,y)=>{st.n0=x;st.n1=y;if(ready)later();});
rng('#h0','#h1','#hF',0,0,'#hT',(x,y)=>(x<=0&&y>=60)?'toutes':x+' – '+(y>=60?'60 m et +':y+' m'),(x,y)=>{st.h0=x;st.h1=y;if(ready)later();});
for(const [id,k] of [['#fUnd','und'],['#fReh','reh'],['#fSur','sur'],['#fIgh','igh'],['#fCvp','cvp'],['#fRec','rcn']])$(id).onchange=e=>{st[k]=e.target.checked;recolor();};
$('#fLbl').onchange=e=>{showLbl=e.target.checked;draw();};$('#fArr').onchange=e=>{showArr=e.target.checked;draw();};$('#fTrot').onchange=e=>{for(const o of BASEOV)o.on=e.target.checked;draw();};
function syncTog(){const p=$('#panel');$('#tog').textContent=p.classList.contains('min')?'Calques ▴':'Fermer ▾';}
$('#tog').onclick=()=>{$('#panel').classList.toggle('min');syncTog();};
$('#panel header').addEventListener('click',e=>{if(isMob()&&e.target.tagName!=='INPUT'&&e.target.id!=='tog'&&!e.target.closest('#sg')){$('#panel').classList.toggle('min');syncTog();}});
if(isMob()){$('#panel').classList.add('min');syncTog();}
/* glisser les volets sur mobile */
function sheetDrag(el,zoneOk,onEnd,live){let y0=null,dy=0,act=false,t0=0;
 el.addEventListener('touchstart',e=>{if(!isMob()||e.touches.length!==1||!zoneOk(e))return;y0=e.touches[0].clientY;dy=0;act=false;t0=Date.now();},{passive:true});
 el.addEventListener('touchmove',e=>{if(y0===null)return;dy=e.touches[0].clientY-y0;if(!act&&Math.abs(dy)>8)act=true;if(act){if(live){if(live(dy)!==false)e.preventDefault();}}},{passive:false});
 const end=()=>{if(y0===null)return;const v=dy/Math.max(1,Date.now()-t0);if(act)onEnd(dy,v);el.style.transition='transform .2s';el.style.transform='';setTimeout(()=>{el.style.transition='';},220);y0=null;act=false;};
 el.addEventListener('touchend',end);el.addEventListener('touchcancel',end);}
{const p=$('#panel');
 sheetDrag(p,e=>{const h=p.querySelector('header');return h.contains(e.target)&&e.target.tagName!=='INPUT'||(!p.classList.contains('min')&&p.querySelector('#scroll').scrollTop<=0&&e.touches[0].clientY-p.getBoundingClientRect().top<60);},
  (dy,v)=>{const mn=p.classList.contains('min');if(mn&&(dy<-30||v<-.4)){p.classList.remove('min');syncTog();}else if(!mn&&(dy>60||v>.5)){p.classList.add('min');syncTog();}},
  dy=>{if(!p.classList.contains('min'))p.style.transform='translateY('+Math.max(0,dy)+'px)';else p.style.transform='translateY('+Math.min(0,Math.max(-40,dy*.3))+'px)';});
 const c=$('#card');
 sheetDrag(c,e=>c.classList.contains('pin')&&(c.scrollTop<=0||e.touches[0].clientY-c.getBoundingClientRect().top<40),
  (dy,v)=>{if(dy<-30||v<-.4){c.classList.add('big');}else if(dy>70||v>.5){if(c.classList.contains('big'))c.classList.remove('big');else{sel=-1;hov=-1;showCard(-1);draw();}}},
  dy=>{if(dy<0){if(c.classList.contains('big'))return false;c.style.transform='translateY('+Math.max(-30,dy*.3)+'px) translateZ(0)';return;}c.style.transform='translateY('+dy+'px) translateZ(0)';});
}

{const upd=()=>document.documentElement.style.setProperty('--sheet',sheetH()+'px');try{const ro=new ResizeObserver(upd);ro.observe($('#panel'));ro.observe($('#card'));}catch(e){}addEventListener('resize',upd);setTimeout(upd,50);}

