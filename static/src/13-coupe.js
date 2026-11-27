/* ---------- coupe vectorielle : bâti, terrain (RGE ALTI IGN), arbres schématiques, points et courbes topographiques à ±20 m ---------- */
let XC=null;const BAND=20,DMAX=150,PTOL=.1;let LDg=20,CUTC=null;try{LDg=Math.min(DMAX,Math.max(.1,+localStorage.getItem('pg_lidd')||20));}catch(e){}
function drawXCut(){if(!XC||!XC.a)return;const k=view.k,X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;lx.setTransform(dpr,0,0,dpr,0,0);
 const [ax,ay]=XC.a,[bx,by]=XC.b,L=Math.hypot(bx-ax,by-ay)||1,nx=-(by-ay)/L*LDg,ny=(bx-ax)/L*LDg;
 lx.fillStyle='rgba(255,210,127,.13)';lx.beginPath();lx.moveTo(X(ax),Y(ay));lx.lineTo(X(bx),Y(by));lx.lineTo(X(bx+nx),Y(by+ny));lx.lineTo(X(ax+nx),Y(ay+ny));lx.closePath();lx.fill();
 lx.strokeStyle='#ffd27f';lx.lineWidth=2;lx.beginPath();lx.moveTo(X(ax),Y(ay));lx.lineTo(X(bx),Y(by));lx.stroke();
 lx.fillStyle='#ffd27f';lx.font='600 12px Inter, system-ui, sans-serif';lx.fillText('A',X(ax)-12,Y(ay)-6);lx.fillText('B  '+Math.round(L)+' m',X(bx)+6,Y(by)-6);}
const xcOff=()=>{XC=null;SNAP=null;$('#zc').classList.remove('on');cv.style.cursor='';xMsg('');draw();};
$('#zc').onclick=()=>{if(XC){xcOff();return;}if(XP)xpOff();if(MS)msOff();XC={a:null,b:null};$('#zc').classList.add('on');cv.style.cursor='crosshair';xMsg('Tracez la ligne de coupe sur la carte, de A vers B. Aimant : sommets et arêtes des bâtiments (carré, croix), directions perpendiculaires ou parallèles aux façades (⊥). Échap pour annuler.');};
addEventListener('keydown',e=>{if(e.key==='Escape'&&XC)xcOff();});
cv.addEventListener('pointerdown',e=>{if(!XC)return;e.stopImmediatePropagation();e.preventDefault();XC.a=snapW(s2w(e.clientX,e.clientY)).p;XC.b=XC.a;cv.setPointerCapture(e.pointerId);},true);
cv.addEventListener('pointermove',e=>{if(!XC||!XC.a)return;e.stopImmediatePropagation();XC.b=shW(e,XC.a,snapW(s2w(e.clientX,e.clientY),XC.a).p);draw();},true);
cv.addEventListener('pointerup',async e=>{if(!XC||!XC.a)return;e.stopImmediatePropagation();const a=XC.a,b=XC.b;
 if(Math.hypot(b[0]-a[0],b[1]-a[1])<15){XC.a=null;draw();return;}
 xMsg('Calcul de la coupe…');try{await cutShow(a,b);}catch(err){xMsg('Échec de la coupe : '+esc(String(err&&err.message||err)));return;}
 XC=null;$('#zc').classList.remove('on');cv.style.cursor='';xMsg('');draw();},true);
/* coupe : calques PLU décodés une fois (anneaux + emprise) */
const OVR=new Map();
function ovRings(id){if(OVR.has(id))return OVR.get(id);
 const p=getJson('ov_'+id+'.json').then(j=>j.f.map(f=>{const rs=f[2].map(decPath);let b=[1e18,1e18,-1e18,-1e18];
  for(const a of rs)for(let i=0;i<a.length;i+=2){const x=a[i],y=a[i+1];if(x<b[0])b[0]=x;if(x>b[2])b[2]=x;if(y<b[1])b[1]=y;if(y>b[3])b[3]=y;}return {c:f[0],l:f[1],rs,b};})).catch(()=>null);
 OVR.set(id,p);return p;}
const pip=(rs,x,y)=>{let k=false;for(const a of rs){const n=a.length;for(let i=0,j=n-2;i<n;j=i,i+=2){const yi=a[i+1],yj=a[j+1];if((yi>y)!==(yj>y)&&x<(a[j]-a[i])*(y-yi)/(yj-yi)+a[i])k=!k;}}return k;};
const c10=x=>Math.ceil(x*10-1e-6)/10,fr=(v,d=1)=>v.toFixed(d).replace('.',',');
/* silhouettes d'arbres par genre : col (fastigié), con (conique), pin (parasol), ple (pleureur), eta (étalé), ovo (ovoïde) */
function treeKind(g,e,v){g=(g||'').toLowerCase();e=(e||'').toLowerCase();v=(v||'').toLowerCase();
 if(/fastig|column|pyramid|italica|erect|stricta|upright|monumentalis/.test(v+' '+e)||(g==='populus'&&e==='nigra')||g==='cupressus'||g==='x cupressocyparis')return 'col';
 if(/pendul/.test(v+' '+e)||g==='salix')return 'ple';
 if(g==='pinus')return 'pin';
 if(['cedrus','abies','picea','sequoia','sequoiadendron','metasequoia','taxodium','larix','cryptomeria','calocedrus','chamaecyparis','thuja','ginkgo','liquidambar','araucaria','tsuga'].includes(g))return 'con';
 if(['platanus','paulownia','catalpa','albizia','gleditsia','robinia','styphnolobium','koelreuteria','juglans','quercus','celtis','ulmus','zelkova','pterocarya','gymnocladus','toona','morus','ailanthus','broussonetia'].includes(g))return 'eta';
 return 'ovo';}
const TK={col:{w:.26,cb:.12,n:'fastigié'},con:{w:.45,cb:.07,n:'conique'},pin:{w:.62,cb:.55,n:'en parasol'},ple:{w:.8,cb:.3,n:'pleureur'},eta:{w:.85,cb:.32,n:'étalé'},ovo:{w:.6,cb:.28,n:'ovoïde'}};
function treeGeom(a){const h=a.h,t=a.t,z=a.z,K=TK[a.f]||TK.ovo,w=Math.max(1.2,h*K.w),cb=h*K.cb,ch=h-cb,rt=Math.max(.12,(a.c||0)/100/Math.PI/2);
 let sd=Math.abs(Math.sin(t*12.9898+h*78.233)*43758.5453);const rnd=()=>{sd=Math.abs(Math.sin(sd*1.7+.3)*9731.17);return sd%1;};
 const tr=[[t-rt*1.4,z],[t-rt,z+.5],[t-rt*.7,z+cb],[t+rt*.7,z+cb],[t+rt,z+.5],[t+rt*1.4,z]],br=[],cr=[];
 const lob=(cx,cz,A,B,nl,am,top)=>{const P=[],ph=rnd()*6;for(let i=0;i<48;i++){const q=i/48*2*Math.PI,s=Math.sin(q);let r=1+am*Math.sin(nl*q+ph)+am*.4*Math.sin(2.3*nl*q+ph*2);let xx=Math.cos(q)*A*r;if(top&&s>0)xx*=1-top*s;P.push([cx+xx,cz+s*B*r]);}return P;};
 if(a.f==='con'){const n=Math.max(3,Math.min(6,Math.round(ch/3))),L_=[],R_=[];for(let i=0;i<n;i++){const z0=z+cb+ch*i/n,z1=z+cb+ch*(i+.75)/n,wi=w/2*(1-i/n*.8);L_.push([t-wi,z0],[t-wi*.45,z1]);R_.push([t+wi,z0],[t+wi*.45,z1]);}
  cr.push([...L_,[t,z+h],...R_.reverse()]);br.push([[t,z+cb],[t,z+h*.9]]);}
 else if(a.f==='ple'){const cz=z+h*.6,A=w/2,B=h*.4,P=[];for(let i=0;i<=24;i++){const q=Math.PI*i/24;P.push([t+Math.cos(q)*A,cz+Math.sin(q)*B*(1+.06*Math.sin(9*q))]);}
  const bot=z+h*.22;P.push([t-A*1.02,bot]);for(let i=0;i<=12;i++){const xx=t-A+2*A*i/12;P.push([xx,bot+(i%2?.6:0)+.3*rnd()]);}P.push([t+A*1.02,bot]);cr.push(P);
  for(let i=1;i<6;i++){const xx=t-A*.8+A*1.6*i/6;br.push([[xx,cz+B*.6],[xx+(rnd()-.5)*.4,bot+.8]]);}br.push([[t,z+cb],[t-A*.4,cz+B*.5]],[[t,z+cb],[t+A*.4,cz+B*.5]]);}
 else if(a.f==='pin'){const cz=z+cb+ch/2;cr.push(lob(t+(rnd()-.5)*.6,cz,w/2,ch/2,5,.16,0));br.push([[t,z+cb],[t-w*.3,cz]],[[t,z+cb],[t+w*.3,cz]],[[t,z+cb],[t,cz+ch*.2]]);}
 else{const cz=z+cb+ch/2,nl=a.f==='col'?6:8+Math.floor(rnd()*4);cr.push(lob(t,cz,w/2,ch/2,nl,a.f==='col'?.05:.08,a.f==='col'?.35:0));
  const sp=a.f==='eta'?.34:a.f==='col'?.1:.24;br.push([[t,z+cb],[t-w*sp,cz+ch*.12]],[[t,z+cb],[t+w*sp,cz+ch*.12]],[[t,z+cb*1.02],[t,cz+ch*.25]]);
  if(a.f!=='col')br.push([[t-w*sp*.55,cz-ch*.12],[t-w*sp*.9,cz+ch*.25]],[[t+w*sp*.55,cz-ch*.12],[t+w*sp*.9,cz+ch*.25]]);}
 return {tr,cr,br,w};}
/* ---------- magnétisme : sommets et arêtes des bâtiments, directions orthogonales ---------- */
let SNAP=null;
/* Maj maintenue : la direction du segment est verrouillée (arrondie à 45° si elle en est proche), comme dans un logiciel de dessin */
const lockDir=(st_,sh,fx,fy,x,y)=>{if(!sh){st_.d=null;st_.lp=[x,y,fx,fy];return null;}const dx=x-fx,dy=y-fy;if(!st_.d){/* direction du segment tel qu'il était affiché avant l'appui sur Maj */const lp=st_.lp&&st_.lp[2]===fx&&st_.lp[3]===fy&&Math.hypot(st_.lp[0]-fx,st_.lp[1]-fy)>1e-9?st_.lp:null,ex=lp?lp[0]-fx:dx,ey=lp?lp[1]-fy:dy;if(Math.hypot(ex,ey)<1e-9)return null;let a=Math.atan2(ey,ex);const r=Math.round(a/(Math.PI/4))*Math.PI/4;if(Math.abs(a-r)<8*Math.PI/180)a=r;st_.d=[Math.cos(a),Math.sin(a)];}
 const t=dx*st_.d[0]+dy*st_.d[1];return [fx+t*st_.d[0],fy+t*st_.d[1]];};
const SHL={};const shW=(e,from,p)=>{if(!from){SHL.d=null;return p;}const q=lockDir(SHL,e.shiftKey,from[0],from[1],p[0],p[1]);if(!q)return p;SNAP={p:q,k:'o',from,sh:1};return q;};
function snapW(w,from){const k=view.k,tv=11/k,te=8/k,[x,y]=w;let bv=null,dv=tv,be=null,de=te,dirs=[];
 for(let s_=0;s_<N;s_++){if(bbox[4*s_]>x+tv||bbox[4*s_+2]<x-tv||bbox[4*s_+1]>y+tv||bbox[4*s_+3]<y-tv)continue;
  for(let e=edgS[s_];e<edgS[s_+1];e+=2){const a=edg[e],b=edg[e+1],ax=pos[2*a],ay=pos[2*a+1],bx=pos[2*b],by=pos[2*b+1];
   const d=Math.hypot(ax-x,ay-y);if(d<dv){dv=d;bv=[ax,ay];}
   const vx=bx-ax,vy=by-ay,l2=vx*vx+vy*vy;if(!l2)continue;const u=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy)/l2)),px=ax+u*vx,py=ay+u*vy,dd=Math.hypot(px-x,py-y);if(dd<de){de=dd;be=[px,py,vx,vy];}}}
 if(bv)return SNAP={p:bv,k:'v'};
 if(from){const dx=x-from[0],dy=y-from[1],L=Math.hypot(dx,dy);if(L>1e-6){
  dirs=[[1,0],[0,1]];if(be)dirs.push([be[2],be[3]],[-be[3],be[2]]);
  // directions des arêtes proches du point de départ (coupe perpendiculaire à une façade)
  const r0=12/k;for(let s_=0;s_<N;s_++){if(bbox[4*s_]>from[0]+r0||bbox[4*s_+2]<from[0]-r0||bbox[4*s_+1]>from[1]+r0||bbox[4*s_+3]<from[1]-r0)continue;
   for(let e=edgS[s_];e<edgS[s_+1];e+=2){const a=edg[e],b=edg[e+1],ax=pos[2*a],ay=pos[2*a+1],vx=pos[2*b]-ax,vy=pos[2*b+1]-ay,l2=vx*vx+vy*vy;if(l2<1)continue;const u=Math.max(0,Math.min(1,((from[0]-ax)*vx+(from[1]-ay)*vy)/l2));if(Math.hypot(ax+u*vx-from[0],ay+u*vy-from[1])<r0)dirs.push([vx,vy],[-vy,vx]);}}
  if(MS&&MS.pts.length>1){const q=MS.pts[MS.pts.length-2];dirs.push([from[0]-q[0],from[1]-q[1]],[-(from[1]-q[1]),from[0]-q[0]]);}
  let best=null,ba=5*Math.PI/180;for(const [vx,vy] of dirs){const l=Math.hypot(vx,vy);if(!l)continue;const c=Math.abs((dx*vx+dy*vy)/(L*l)),an=Math.acos(Math.min(1,c));if(an<ba){ba=an;best=[vx/l,vy/l];}}
  if(best){const pr=dx*best[0]+dy*best[1];return SNAP={p:[from[0]+best[0]*pr,from[1]+best[1]*pr],k:'o',from};}}}
 if(be)return SNAP={p:[be[0],be[1]],k:'e'};
 return SNAP={p:w,k:''};}
function drawSnap(){if(!SNAP||!SNAP.k||!(MS||XC))return;const k=view.k,X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k,[sx,sy]=[X(SNAP.p[0]),Y(SNAP.p[1])];lx.setTransform(dpr,0,0,dpr,0,0);lx.strokeStyle='#ffd27f';lx.lineWidth=1.6;
 if(SNAP.k==='v')lx.strokeRect(sx-5,sy-5,10,10);else if(SNAP.k==='e'){lx.beginPath();lx.moveTo(sx-5,sy-5);lx.lineTo(sx+5,sy+5);lx.moveTo(sx+5,sy-5);lx.lineTo(sx-5,sy+5);lx.stroke();}
 else if(SNAP.k==='o'){lx.setLineDash([4,4]);lx.beginPath();const [fx,fy]=[X(SNAP.from[0]),Y(SNAP.from[1])],dx=sx-fx,dy=sy-fy;lx.moveTo(fx-dx*2,fy-dy*2);lx.lineTo(fx+dx*3,fy+dy*3);lx.stroke();lx.setLineDash([]);lx.font='600 10px Inter, system-ui, sans-serif';lx.fillStyle='#ffd27f';lx.fillText(SNAP.sh?'⇧':'⊥',sx+7,sy-7);}}
/* ---------- mesure sur la carte : distances cumulées, surface si le tracé est fermé ---------- */
let MS=null;
const msLen=P=>{let d=0;for(let i=1;i<P.length;i++)d+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return d;},msArea=P=>{let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1];}return Math.abs(a)/2;};
const fm=v=>v<1000?(v<10?v.toFixed(2):v.toFixed(1)).replace('.',',')+' m':(v/1000).toFixed(2).replace('.',',')+' km';
function msInfo(){if(!MS)return;const P=MS.cur&&!MS.closed?MS.pts.concat([MS.cur]):MS.pts;let h='<b>Mesure</b> : '+(P.length<2?'cliquez le premier point':fm(msLen(MS.closed?P.concat([P[0]]):P)));
 if(MS.closed)h+=' (périmètre) ; surface '+Math.round(msArea(P)).toLocaleString('fr-FR')+' m²';else if(P.length>1){const l=P.length;h+=' ; dernier segment '+fm(Math.hypot(P[l-1][0]-P[l-2][0],P[l-1][1]-P[l-2][1]));}
 xMsg(h+' <span class="k">· clic sur le 1er point : surface'+(isMob()?'':' · Maj : garder la direction')+'</span><span class="msb">'+(MS.pts.length>1&&!MS.done&&!MS.closed?'<button type="button" data-m="end">Terminer</button>':'')+(MS.pts.length?'<button type="button" data-m="clr">Effacer</button>':'')+'<button type="button" data-m="quit">Fermer</button></span>');}
function drawMeas(){if(!MS||!MS.pts.length)return;const k=view.k,X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;lx.setTransform(dpr,0,0,dpr,0,0);
 const P=MS.cur&&!MS.closed?MS.pts.concat([MS.cur]):MS.pts;lx.lineWidth=2;lx.strokeStyle='#7fe0ff';lx.fillStyle='rgba(127,224,255,.15)';lx.beginPath();P.forEach((p,i)=>i?lx.lineTo(X(p[0]),Y(p[1])):lx.moveTo(X(p[0]),Y(p[1])));if(MS.closed){lx.closePath();lx.fill();}lx.stroke();
 lx.fillStyle='#7fe0ff';for(const p of MS.pts){lx.beginPath();lx.arc(X(p[0]),Y(p[1]),3.5,0,7);lx.fill();}
 lx.font='600 11px Inter, system-ui, sans-serif';lx.lineWidth=3;lx.strokeStyle='rgba(8,16,24,.9)';
 const Q=MS.closed?P.concat([P[0]]):P;for(let i=1;i<Q.length;i++){const a=Q[i-1],b=Q[i],t=fm(Math.hypot(b[0]-a[0],b[1]-a[1])),x=(X(a[0])+X(b[0]))/2+4,y=(Y(a[1])+Y(b[1]))/2-4;lx.strokeText(t,x,y);lx.fillStyle='#e9f8ff';lx.fillText(t,x,y);}
 if(MS.closed){let cx=0,cy=0;for(const p of P){cx+=p[0];cy+=p[1];}const t=Math.round(msArea(P)).toLocaleString('fr-FR')+' m²';lx.font='700 13px Inter, system-ui, sans-serif';lx.strokeText(t,X(cx/P.length)-20,Y(cy/P.length));lx.fillStyle='#ffffff';lx.fillText(t,X(cx/P.length)-20,Y(cy/P.length));}}
xmsg.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b||!MS)return;e.stopPropagation();const m=b.dataset.m;if(m==='end'){MS.done=true;MS.cur=null;draw();msInfo();}else if(m==='clr'){MS={pts:[],cur:null,closed:false};draw();msInfo();}else msOff();});
const msOff=()=>{MS=null;SNAP=null;$('#zm').classList.remove('on');cv.style.cursor='';xMsg('');draw();};
$('#zm').onclick=()=>{if(MS){msOff();return;}if(XC)xcOff();if(XP)xpOff();MS={pts:[],cur:null,closed:false};$('#zm').classList.add('on');cv.style.cursor='crosshair';msInfo();};
addEventListener('keydown',e=>{if(e.key==='Escape'&&MS){if(MS.pts.length&&!MS.done){MS.done=true;MS.cur=null;draw();msInfo();}else msOff();}});
cv.addEventListener('pointerdown',e=>{if(!MS)return;e.stopImmediatePropagation();e.preventDefault();
 if(MS.closed||MS.done)MS={pts:[],cur:null,closed:false};const w=shW(e,MS.pts[MS.pts.length-1],snapW(s2w(e.clientX,e.clientY),MS.pts[MS.pts.length-1]).p);
 if(MS.pts.length>2){const p0=MS.pts[0];if(Math.hypot(p0[0]-w[0],p0[1]-w[1])*view.k<10){MS.closed=true;MS.cur=null;draw();msInfo();return;}}
 MS.pts.push(w);draw();msInfo();},true);
cv.addEventListener('pointermove',e=>{if((MS&&!MS.pts.length)||(XC&&!XC.a)){snapW(s2w(e.clientX,e.clientY));draw();}if(!MS||MS.closed||MS.done||!MS.pts.length)return;e.stopImmediatePropagation();MS.cur=shW(e,MS.pts[MS.pts.length-1],snapW(s2w(e.clientX,e.clientY),MS.pts[MS.pts.length-1]).p);draw();msInfo();},true);
cv.addEventListener('pointerup',e=>{if(MS)e.stopImmediatePropagation();},true);
cv.addEventListener('dblclick',e=>{if(!MS)return;e.stopImmediatePropagation();e.preventDefault();if(MS.pts.length>2)MS.pts.pop();MS.done=true;MS.cur=null;draw();msInfo();},true);
cv.addEventListener('click',e=>{if(MS)e.stopImmediatePropagation();},true);
async function cutData(A,B){
 const [ax,ay]=A,[bx,by]=B,L=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/L,uy=(by-ay)/L;
 const proj=(x,y)=>[(x-ax)*ux+(y-ay)*uy,-(x-ax)*uy+(y-ay)*ux];   // [t le long de la coupe, d distance signée]
 const segX=(p,q)=>{const [t1,d1]=proj(p[0],p[1]),[t2,d2]=proj(q[0],q[1]);if((d1>0)===(d2>0)||d1===d2)return null;const t=t1+(t2-t1)*d1/(d1-d2);return t>=0&&t<=L?t:null;};
 const segXs=(x1,y1,x2,y2)=>{const t=segX([x1,y1],[x2,y2]);if(t==null)return null;const ex=x2-x1,ey=y2-y1;return [t,Math.abs(ux*ey-uy*ex)/(Math.hypot(ex,ey)||1)];};
 const ringX=(a,cb,closed)=>{const n=a.length;for(let i=0;i+(closed?0:2)<n;i+=2){const j=(i+2)%n;if(j===i)continue;const r=segXs(a[i],a[i+1],a[j],a[j+1]);if(r)cb(r);}};
 const xy=t=>[ax+ux*t,ay+uy*t];
 const kx=111320*Math.cos(H.lat0*Math.PI/180),ll=(x,y)=>[H.lon0+x/kx,H.lat0+y/110574];
 const x0=Math.min(ax,bx)-BAND-5,x1=Math.max(ax,bx)+BAND+5,y0=Math.min(ay,by)-BAND-5,y1=Math.max(ay,by)+BAND+5,inBB=b=>!(b[2]<x0||b[0]>x1||b[3]<y0||b[1]>y1);
 // arbres de la Ville de Paris (jeu « Les arbres ») autour de la coupe, en direct
 const nx_=-uy*(DMAX+2),ny_=ux*(DMAX+2),mx_=uy*1,my_=-ux*1,band=[[ax+nx_,ay+ny_],[bx+nx_,by+ny_],[bx+mx_,by+my_],[ax+mx_,ay+my_],[ax+nx_,ay+ny_]].map(([x,y])=>ll(x,y).map(v=>v.toFixed(6)).join(' ')).join(',');
 const arbU='https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/les-arbres/exports/json?where='+encodeURIComponent("intersects(geo_point_2d, geom'POLYGON(("+band+"))')")+'&select=libellefrancais,genre,espece,varieteoucultivar,hauteurenm,circonferenceencm,remarquable,stadedeveloppement,geo_point_2d';
 const arbF=()=>fetch(arbU).then(r=>r.ok?r.json():null).catch(()=>null);
 const arbP=arbF().then(j=>j||new Promise(r=>setTimeout(r,900)).then(arbF)).then(j=>j||new Promise(r=>setTimeout(r,1800)).then(arbF));
 // terrain : profil RGE ALTI de l'IGN, converti en NVP
 const n=Math.max(20,Math.min(200,Math.round(L/2))),[lo1,la1]=ll(ax,ay),[lo2,la2]=ll(bx,by);let T=[],tsrc='IGN, RGE ALTI (profil altimétrique)';
 try{const r=await fetch('https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevationLine.json?lon='+lo1.toFixed(6)+'|'+lo2.toFixed(6)+'&lat='+la1.toFixed(6)+'|'+la2.toFixed(6)+'&resource=ign_rge_alti_wld&sampling='+n+'&delimiter=|&indent=false').then(r=>r.json());
  T=r.elevations.filter(e=>e.z>-100).map((e,i,a)=>[L*i/(a.length-1),e.z-.33]);}catch(e){}
 // voies d'eau (plan de voirie de la Ville, emprises « bief ») coupées par la ligne, lues en direct
 const eauU='https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/plan-de-voirie-voies-deau/records?limit=100&select=geo_shape&where='+encodeURIComponent("intersects(geo_shape, geom'LINESTRING("+lo1.toFixed(6)+' '+la1.toFixed(6)+', '+lo2.toFixed(6)+' '+la2.toFixed(6)+")')");
 const eauF=()=>fetch(eauU).then(r=>r.ok?r.json():null).catch(()=>null),eauP=eauF().then(j=>j||new Promise(r=>setTimeout(r,900)).then(eauF)).then(j=>j||new Promise(r=>setTimeout(r,1800)).then(eauF));
 const [cote,courbe,veg,arbal,cad,hau,hmc,zon,fil,ppri,eauJ]=await Promise.all([getJson('ov_cote.json').catch(()=>null),getJson('ov_courbe.json').catch(()=>null),getJson('ov_veg.json').catch(()=>null),getJson('ov_arbal.json').catch(()=>null),ovRings('cad'),ovRings('hauteur'),ovRings('hmc'),ovRings('zonage'),ovRings('filet'),ovRings('ppri'),eauP]);
 // points de nivellement et courbes de niveau à ±20 m
 const C=[];if(cote)for(const f of cote.f){const x=f[2]/10,y=f[3]/10,[t,d]=proj(x,y);if(t<0||t>L||d<-PTOL||d>DMAX)continue;const z=parseFloat(String(f[1]).replace(',','.'));if(isFinite(z))C.push([t,z,d]);}
 const K=[],KX=[];if(courbe)for(const f of courbe.f){const z=parseFloat((String(f[1]).match(/(-?\d+(?:[.,]\d+)?)/)||[])[1]);if(!isFinite(z))continue;const zn=z-.33;
  for(const r of f[2].map(decPath)){for(let i=0;i+3<r.length;i+=2){const p=[r[i],r[i+1]],q=[r[i+2],r[i+3]];const tx=segX(p,q);if(tx!=null)KX.push([tx,zn]);
   const [t,d]=proj(p[0],p[1]);if(t>=0&&t<=L&&d>=-PTOL&&d<=DMAX)K.push([t,zn,d]);}}}
 if(T.length<2){const P=C.map(c=>[c[0],c[1]]).concat(KX).sort((a,b)=>a[0]-b[0]);if(P.length>=2){T=P;tsrc='interpolation des points et courbes de niveau (profil IGN indisponible)';}}
 const zAt=t=>{if(!T.length)return 30;if(t<=T[0][0])return T[0][1];for(let i=1;i<T.length;i++)if(t<=T[i][0]){const [t0,z0]=T[i-1],[t1,z1]=T[i];return z0+(z1-z0)*(t-t0)/((t1-t0)||1);}return T[T.length-1][1];};
 // intervalles coupés d'un jeu de polygones (anneaux en coordonnées carte)
 const cutIv=(rss)=>{const X_=[];for(const a of rss)ringX(a,r=>X_.push(r[0]),true);X_.sort((a,b)=>a-b);if(pip(rss,ax,ay))X_.unshift(0);if(X_.length%2)X_.push(L);const o=[];for(let i=0;i+1<X_.length;i+=2)if(X_[i+1]-X_[i]>.3)o.push([X_[i],X_[i+1]]);return o;};
 // eau : niveau = médiane du profil RGE ALTI sur le plan d'eau (le modèle de terrain y donne la surface de l'eau)
 const W=[];if(eauJ&&eauJ.results)for(const r of eauJ.results){const g=r.geo_shape&&(r.geo_shape.geometry||r.geo_shape);if(!g)continue;const polys=g.type==='MultiPolygon'?g.coordinates:g.type==='Polygon'?[g.coordinates]:[];
  for(const pl_ of polys){const rss=pl_.map(ring=>{const a=[];for(const [lo,la] of ring){const [x,y]=llToW(lo,la);a.push(x,y);}return a;});
   for(const [t0,t1] of cutIv(rss)){const zs=T.filter(p=>p[0]>=t0+1&&p[0]<=t1-1).map(p=>p[1]).sort((a,b)=>a-b);const z=zs.length?zs[zs.length>>1]:Math.min(zAt(t0),zAt(t1));W.push({t0,t1,z});}}}
 W.sort((a,b)=>a.t0-b.t0);
 // PPRI : zones réglementaires coupées
 const PR=[];if(ppri)for(const p of ppri){if(!inBB(p.b))continue;for(const [t0,t1] of cutIv(p.rs))PR.push({t0,t1,c:p.c});}PR.sort((a,b)=>a.t0-b.t0);
 // bâtiments coupés
 const Bt=[];
 for(let s=0;s<N;s++){if(bbox[4*s+2]<x0||bbox[4*s]>x1||bbox[4*s+3]<y0||bbox[4*s+1]>y1)continue;const ts=[];
  for(let e=edgS[s];e<edgS[s+1];e+=2){const a_=edg[e],b_=edg[e+1];const t=segX([pos[2*a_],pos[2*a_+1]],[pos[2*b_],pos[2*b_+1]]);if(t!=null)ts.push(t);}
  if(ts.length%2){let r=[],q=[],pv=-1;for(let e=edgS[s];e<edgS[s+1];e+=2){const a_=edg[e],b_=edg[e+1];if(a_!==pv){if(q.length)r.push(q);q=[pos[2*a_],pos[2*a_+1]];}else q.push(pos[2*a_],pos[2*a_+1]);pv=b_;}if(q.length)r.push(q);if(pip(r,ax,ay))ts.push(0);else ts.push(L);}
  if(ts.length<2)continue;ts.sort((p,q)=>p-q);const hm=HM[s]/10,hx=HX[s]/10;if(!(hm>0))continue;
  for(let i=0;i+1<ts.length;i+=2){const t0=ts[i],t1=ts[i+1];if(t1-t0<.3)continue;const zb=Math.min(zAt(t0),zAt(t1));Bt.push({s,t0,t1,zb,hm,hx:Math.max(hm,hx||hm),an:AN[s]});}}
 // parcelles cadastrales coupées : leur réunion donne les îlots, les intervalles entre elles les voies
 const PI=[];if(cad)for(const p of cad){if(!inBB(p.b))continue;const X_=[];for(const a of p.rs)ringX(a,r=>X_.push(r),true);X_.sort((a,b)=>a[0]-b[0]);
  if(pip(p.rs,ax,ay))X_.unshift([0,null]);if(X_.length%2)X_.push([L,null]);for(let i=0;i+1<X_.length;i+=2)PI.push([X_[i][0],X_[i+1][0],X_[i][1],X_[i+1][1]]);}
 PI.sort((a,b)=>a[0]-b[0]);const IL=[];for(const p of PI){const q=IL[IL.length-1];if(q&&p[0]<=q[1]+1.5){if(p[1]>q[1]){q[1]=p[1];q[3]=p[3];}}else IL.push(p.slice());}
 const V=[];for(let i=0;i+1<IL.length;i++){const s0=IL[i][1],s1=IL[i+1][0],len=s1-s0,ss=[IL[i][3],IL[i+1][2]].filter(v=>v!=null),sn=ss.length?ss.reduce((a,b)=>a+b,0)/ss.length:1,w=len*sn;
  V.push({s0,s1,len,sn,w,big:len>90||w>70,z0:zAt(s0)+.33,z1:zAt(s1)+.33});}
 // surface de nivellement d'îlot estimée le long de la coupe (cotes rondes NGF au-dessus de la cote du trottoir interpolée)
 const ILT=IL.map(p=>({ta:p[0],tb:p[1],zA:p[0]>.5?zAt(p[0])+.33:null,zB:p[1]<L-.5?zAt(p[1])+.33:null,sA:p[2]||1,sB:p[3]||1}));
 const ilotAt=t=>ILT.find(i=>t>=i.ta-1e-6&&t<=i.tb+1e-6);
 const nivAt=t=>{const i=ilotAt(t);if(!i)return null;let z;if(i.zA!=null&&i.zB!=null)z=i.zA+(i.zB-i.zA)*(t-i.ta)/((i.tb-i.ta)||1);else z=i.zA!=null?i.zA:i.zB;return z==null?null:Math.ceil(z-1e-6);};
 const polyAt=(F,x,y)=>{if(!F)return null;for(const p of F){if(x<p.b[0]||x>p.b[2]||y<p.b[1]||y>p.b[3])continue;if(pip(p.rs,x,y))return p;}return null;};
 const step=(fn)=>{const out=[];let cur=[];for(const i of ILT){let pv=null;for(let t=i.ta;t<=i.tb+.01;t+=.5){const tt=Math.min(t,i.tb),v=fn(tt);if(v==null){if(cur.length>1)out.push(cur);cur=[];pv=null;continue;}
   if(pv!=null&&Math.abs(v-pv)>.01)cur.push([tt,pv]);cur.push([tt,v]);pv=v;}if(cur.length>1)out.push(cur);cur=[];}return out;};
 const NIV=step(t=>{const v=nivAt(t);return v==null?null:v-.33;});
 const HPv=[18,25,31,37],hpAt=t=>{const [x,y]=xy(t),p=polyAt(hau,x,y);return p&&p.c<4?HPV(p.c):null;},HPV=c=>HPv[c];
 const PLAF=step(t=>{const v=nivAt(t),h=hpAt(t);return v==null||h==null?null:v-.33+h;});
 const HMC=step(t=>{const [x,y]=xy(t),p=polyAt(hmc,x,y);if(!p)return null;const m=String(p.l).match(/(\d+(?:[.,]\d+)?)/);return m?parseFloat(m[1].replace(',','.'))-.33:null;});
 // filets de couleur coupés
 const FX=[];if(fil)for(const p of fil){if(!inBB(p.b))continue;for(const a of p.rs)ringX(a,r=>FX.push({t:r[0],sn:r[1],c:p.c,l:String(p.l||'')}),false);}
 // gabarits-enveloppes en bordure de voie, de part et d'autre de chaque voie coupée
 const G=[],FH=[18,20,15,23,null,10,7,12,25],FN=['bleu clair','noir','violet','gris','marron foncé','vert','kaki','orange','bleu marine'];
 const zoneAt=t=>{const [x,y]=xy(Math.min(L,Math.max(0,t))),p=polyAt(zon,x,y);return p?p.c:null;};
 for(const v of V){if(v.big||v.w<2)continue;for(const dir of [-1,1]){const tl=dir<0?v.s0:v.s1;
  let fl=null,bd=1e9;for(const q of FX){const dd=(q.t-tl)*dir;if(dd>-3&&dd<6&&Math.abs(q.t-tl)<bd){bd=Math.abs(q.t-tl);fl=q;}}
  const zc=zoneAt(tl+dir*2);if(!fl&&zc!=null&&zc>1)continue;   // UV, N, PSMV : pas de gabarit sur voie du PLU
  const t0=fl?fl.t:tl,zn=nivAt(t0+dir*.3);if(zn==null)continue;const sn=Math.max(.25,(fl&&fl.sn)||v.sn||1),P=v.w;
  let Hh,h=0,pr,txt,rule=[];
  if(fl){const ty=/pointill/i.test(fl.l)?'P':/hachur/i.test(fl.l)?'H':/court/i.test(fl.l)?'C':/long/i.test(fl.l)?'L':/mixte/i.test(fl.l)?'M':'X';
   if(fl.c===4){const b=Bt.find(b=>t0+dir*1.5>=b.t0&&t0+dir*1.5<=b.t1);if(!b)continue;Hh=b.hm;}else{Hh=FH[fl.c];if(Hh==null)continue;}
   pr=[[0,0],[0,Hh]];const nm='filet '+(FN[fl.c]||'?')+' (H = '+(fl.c===4?fr(Hh)+' m, hauteur de façade existante estimée':Hh+' m')+')';
   if(ty==='X'){const r=Math.min(7,Math.max(3,c10(.25*P)));h=r;for(let k=1;k<=10;k++){const q=Math.PI/2*k/10;pr.push([r-r*Math.cos(q),Hh+r*Math.sin(q)]);}txt=nm+', trait continu : quart de cercle r = '+fr(r)+' m (25 % de P = '+fr(P)+' m, entre 3 et 7 m)';rule=['Filet '+FN[fl.c],'H = '+fr(Hh)+' m','trait continu : ¼ de cercle','r = 0,25 × P = 0,25 × '+fr(P)+' = '+fr(r)+' m'];}
   else{const S={P:[0,0,'trait pointillé : horizontale'],H:[1/3,2,'hachure : pente 1/3, h = 2 m'],C:[.5,3,'tireté court : pente 1/2, h = 3 m'],L:[1,4.5,'tireté long : pente 1/1, h = 4,5 m'],M:[2,4.5,'tireté mixte : pente 2/1, h = 4,5 m']}[ty];h=S[1];if(h)pr.push([h/S[0],Hh+h]);txt=nm+', '+S[2];rule=['Filet '+FN[fl.c],'H = '+fr(Hh)+' m',S[2]];}}
  else{Hh=Math.min(28,c10(1.25*P));const r=Math.min(7,Math.max(3,c10(.25*P)));h=r;pr=[[0,0],[0,Hh]];for(let k=1;k<=10;k++){const q=Math.PI/2*k/10;pr.push([r-r*Math.cos(q),Hh+r*Math.sin(q)]);}
   txt='voie sans filet : P = '+fr(P)+' m, H = P + 25 % = '+fr(Hh)+' m (28 m au plus), quart de cercle r = '+fr(r)+' m';rule=['Voie sans filet, P = '+fr(P)+' m','H = 1,25 × P = '+fr(Hh)+' m'+(Hh>=28?' (plafonné à 28)':''),'¼ de cercle r = 0,25 × P = '+fr(r)+' m'+(r===3&&.25*P<3?' (min. 3)':r===7&&.25*P>7?' (max. 7)':'')];}
  pr.push([18,Hh+h]);const z0=zn-.33,il=ilotAt(t0+dir*.3),lo=Math.max(0,il?il.ta:0),hi=Math.min(L,il?il.tb:L),cl=t=>Math.min(hi,Math.max(lo,t));G.push({t0,dir,z0,zn,H:Hh,h,txt,rule:[...rule,'attache '+zn+' m NGF'+(fl?' sur le filet':' en limite de voie')],fil:!!fl,pts:pr.map(([d,z])=>[cl(t0+dir*d/sn),z0+z])});}}
 // au-delà de la bande de constructibilité principale de 18 m : 15 m au-dessus de la surface de nivellement
 const B15=step(t=>{const i=ilotAt(t),v=nivAt(t);if(!i||v==null)return null;const inA=i.zA!=null&&t-i.ta<18/Math.max(.25,i.sA),inB=i.zB!=null&&i.tb-t<18/Math.max(.25,i.sB);return inA||inB?null:v-.33+15;});
 // arbres
 const A_=[],arb=await arbP;let tsrcA='';
 if(Array.isArray(arb)){tsrcA='Ville de Paris, « Les arbres » (essence, hauteur, circonférence), lu en direct';
  for(const r of arb){const g=r.geo_point_2d;if(!g)continue;const [x,y]=llToW(g.lon,g.lat),[t,d]=proj(x,y);if(t<0||t>L||d<-PTOL||d>DMAX)continue;
   let h=+r.hauteurenm||0;const c=+r.circonferenceencm||0;if(!(h>0&&h<45))h=c>0?Math.min(30,3+c*.08):8;
   A_.push({t,d,h,c,f:treeKind(r.genre,r.espece,r.varieteoucultivar),k:'arbre',n:[r.libellefrancais,r.genre,r.espece,r.varieteoucultivar].filter(Boolean).join(' '),rem:r.remarquable==='OUI',stade:r.stadedeveloppement});}}
 if(veg)for(const f of veg.f){const cl=f[0];if(cl%3===0)continue;const hT=cl%3===2?16:7;
  for(const r of f[2].map(decPath)){const ts=[];ringX(r,q=>ts.push(q[0]),true);ts.sort((p,q)=>p-q);
   for(let i=0;i+1<ts.length;i+=2){const t0=ts[i],t1=ts[i+1],w=t1-t0;if(w<2)continue;const nT=Math.max(1,Math.round(w/(hT>10?9:5)));
    for(let j=0;j<nT;j++){const t=t0+w*(j+.5)/nT;if(!A_.some(a=>a.k==='arbre'&&Math.abs(a.t-t)<6&&Math.abs(a.d)<6))A_.push({t,d:0,h:hT,c:0,f:'ovo',k:'canopée'});}}}}
 if(!tsrcA&&arbal)for(const f of arbal.f)for(const r of f[2].map(decPath))ringX(r,q=>{if(!A_.some(a=>Math.abs(a.t-q[0])<3))A_.push({t:q[0],d:0,h:14,c:0,f:'ovo',k:'alignement'});},false);
 for(const a of A_)a.z=zAt(a.t);A_.sort((a,b)=>Math.abs(b.d)-Math.abs(a.d));
 return {L,T,tsrc,tsrcA,C,K,KX,Bt,A:A_,zAt,V,NIV,PLAF,HMC,G,B15,W,PR,cad:!!cad};
}
/* ---------- LiDAR HD de l'IGN dans la coupe : lecture partielle des dalles COPC (requêtes HTTP Range) ---------- */
let COPC=null;
const lidarLib=()=>COPC||(COPC=import(new URL('pg-copc.js',location.href).href).then(async m=>({m,lp:await m.createLazPerf({locateFile:f=>new URL(f,location.href).href})})).catch(e=>{COPC=null;throw e;}));
const LCL=ESSAI?/* gammes de la charte : ocre (sol), verts sourds (végétation), gris-bleus (bâti), bleu (eau) */
 {1:['Non classé','#7d8b98'],2:['Sol','#b8925c'],3:['Végétation basse','#a9bd8f'],4:['Végétation moyenne','#7fa27a'],5:['Végétation haute','#5d8a6a'],6:['Bâtiment','#9fb6c8'],9:['Eau','#5f93c0'],17:['Tablier de pont','#c4b49a'],64:['Sursol pérenne','#d6b27c'],67:['Divers bâtis','#8fa3b4']}
 :{1:['Non classé','#9aa3ad'],2:['Sol','#9b7a45'],3:['Végétation basse','#a8cf6a'],4:['Végétation moyenne','#6fb35a'],5:['Végétation haute','#2f8a3e'],6:['Bâtiment','#c0504d'],9:['Eau','#3d7fd1'],17:['Tablier de pont','#8a5fbf'],64:['Sursol pérenne','#e39b2d'],67:['Divers bâtis','#d9849a']};
/* coupe à l'écran sur fond sombre, comme la carte ; les exports (PDF, DXF) restent sur fond blanc */
const CUTDK={'#ffffff':'#0f1a24','#fff':'#0f1a24','#1d2a36':'#dbe3e9','#7a8794':'#9fb3c2','#55606b':'#7f98ad','#6a7681':'#8aa0b3','#f7f7f5':'#16222d','#eef0f1':'#1d2b38','#e3e6e8':'#22323f','#e6e9ec':'#22323f','#cfd5db':'#3a4d5e','#c9cdd2':'#1f2d3a',
 '#efe6d4':'#2a261e','#6b5a3a':'#c9a46a','#9b7a45':'#c9a46a','#a8864a':'#c9a46a','#6b4f2a':'#a07a4a','#7a5a36':'#a07a4a','#a8761e':'#c9a46a','#c8a96a':'#c9a46a',
 '#1f6fd0':'#6aa8f0','#e07a1f':'#f0a35a','#b0412e':'#e57a62','#d4462f':'#ff6f52','#2f7fbf':'#78b6ea','#3f7f47':'#86c08c','#1f78b4':'#86bde8','#8a6fb5':'#b9a3de','#d9544d':'#ff7f72','#0b5d8a':'#86c6ea','#e0a83a':'#f0bf5a','#5d9466':'#86c08c','#2f8a3e':'#86c08c'};
const cutDark=s=>ESSAI?s.replace(/#[0-9a-fA-F]{6}\b|#fff\b/g,m=>CUTDK[m.toLowerCase()]||m):s;
const LDX={2:'LIDAR_SOL',3:'LIDAR_VEGETATION',4:'LIDAR_VEGETATION',5:'LIDAR_VEGETATION',6:'LIDAR_BATI',9:'LIDAR_EAU',17:'LIDAR_PONT',64:'LIDAR_SURSOL',67:'LIDAR_BATI'};
async function lidarCut(A,B,prog,lo_=-BAND,hi_=BAND){
 const {m,lp}=await lidarLib();
 const kx=111320*Math.cos(H.lat0*Math.PI/180),ll=(x,y)=>[H.lon0+x/kx,H.lat0+y/110574],to93=(x,y)=>L93(...ll(x,y));
 const a=to93(...A),b=to93(...B),L9=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L9,uy=(b[1]-a[1])/L9,W=Math.max(-lo_,hi_);
 const Q=[[a[0]-uy*hi_,a[1]+ux*hi_],[b[0]-uy*hi_,b[1]+ux*hi_],[b[0]-uy*lo_,b[1]+ux*lo_],[a[0]-uy*lo_,a[1]+ux*lo_]];
 const ax_=[[1,0],[0,1],[ux,uy],[-uy,ux]];
 const hit=(x0,y0,x1,y1)=>ax_.every(([p,q])=>{const R=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(v=>v[0]*p+v[1]*q),S=Q.map(v=>v[0]*p+v[1]*q);return Math.max(...R)>=Math.min(...S)&&Math.max(...S)>=Math.min(...R);});
 // dalles concernées : catalogue LiDAR HD de la Géoplateforme
 const LL=[A,B].flatMap(([x,y])=>[[x-W-5,y-W-5],[x+W+5,y+W+5]]).map(([x,y])=>ll(x,y)),lo=LL.map(p=>p[0]),la=LL.map(p=>p[1]);
 const wfs='https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=IGNF_LIDAR-HD_METADONNEE:metadata&outputFormat=application/json&count=20&BBOX='+[Math.min(...la),Math.min(...lo),Math.max(...la),Math.max(...lo)].map(v=>v.toFixed(6)).join(',')+',urn:ogc:def:crs:EPSG::4326';
 const T=((await fetch(wfs).then(r=>r.json())).features||[]).map(f=>f.properties).filter(p=>p.url_npl);
 if(!T.length)throw new Error('pas de dalle LiDAR HD publiée ici');
 // file d'attente : 6 requêtes à la fois, nouvel essai si le serveur limite le débit
 let act=0;const wait=[],slot=()=>act<6?(act++,Promise.resolve()):new Promise(r=>wait.push(r)),free=()=>{const n=wait.shift();n?n():act--;};
 const mkGet=url=>async(b0,e0)=>{for(let k=0;k<6;k++){await slot();let r;try{r=await fetch(url,{headers:{Range:'bytes='+b0+'-'+(e0-1)}});}catch(e){r=null;}
   if(r&&(r.status===206||r.status===200)){const u=new Uint8Array(await r.arrayBuffer());free();return r.status===200?u.slice(b0,e0):u;}free();
   if(r&&r.status<500&&r.status!==429)throw new Error('LiDAR : HTTP '+r.status);await new Promise(s=>setTimeout(s,700*(k+1)));}throw new Error('LiDAR : serveur indisponible');};
 const sel=[];
 for(const p of T){const get=mkGet(p.url_npl),cp=await m.Copc.create(get),c=cp.info.cube,sz=c[3]-c[0];
  const nb=k=>{const [d,x,y]=k.split('-').map(Number),s=sz/2**d;return [c[0]+x*s,c[1]+y*s,c[0]+(x+1)*s,c[1]+(y+1)*s];};
  const walk=async pg=>{const h=await m.Copc.loadHierarchyPage(get,pg);
   for(const [k,n] of Object.entries(h.nodes))if(n.pointCount>0&&hit(...nb(k)))sel.push({get,cp,n,d:+k.split('-')[0]});
   await Promise.all(Object.entries(h.pages).filter(([k])=>hit(...nb(k))).map(([,q])=>walk(q)));};
  await walk(cp.info.rootHierarchyPage);}
 // budget : niveaux de détail ajoutés tant que le total reste raisonnable
 sel.sort((p,q)=>p.d-q.d);let tot=0,dmax=99;for(const s of sel){if(tot+s.n.pointCount>1.5e6&&s.d>2){dmax=s.d-1;break;}tot+=s.n.pointCount;}
 const use=sel.filter(s=>s.d<=dmax),P={t:[],z:[],d:[],c:[]},dmaxAll=Math.max(...sel.map(s=>s.d));let done=0;
 await Promise.all(use.map(async s=>{const v=await m.Copc.loadPointDataView(s.get,s.cp,s.n,{lazPerf:lp,include:['X','Y','Z','Classification']});
  const gx=v.getter('X'),gy=v.getter('Y'),gz=v.getter('Z'),gc=v.getter('Classification');
  for(let i=0;i<v.pointCount;i++){const x=gx(i)-a[0],y=gy(i)-a[1],t=x*ux+y*uy,d=-x*uy+y*ux;if(t<0||t>L9||d<lo_||d>hi_)continue;const c=gc(i);if(c===65||c===66||c===0||c===7||c===18)continue;
   P.t.push(t);P.z.push(gz(i)-.33);P.d.push(d);P.c.push(c);}
  done++;prog&&prog(done,use.length);}));
 return {P,L9,n:P.t.length,tiles:T.map(p=>(p.url_npl.split('/').pop()||'').replace('.copc.laz','')+' ('+(p.date_debut_acquisition||'').slice(0,10)+')'),partial:dmax<dmaxAll};
}
const CLY=[['lidar','Nuage LiDAR HD'],['terrain','Terrain'],['eau','Eau (voies d\'eau)'],['bati','Bâtiments'],['arbres','Arbres'],['cotes','Cotes NVP'],['courbes','Courbes de niveau'],['voies','Largeur des voies'],['nivellement','Surface de nivellement'],['gabarits','Gabarits sur voie'],['regles','Règles des gabarits'],['plafond','Plafond des hauteurs'],['b15','15 m hors bande'],['hmc','HMC'],['ppri','PPRI (zones inondables)'],['grille','Grille et axes'],['plan','Plan de repérage']];
let CUTOFF=new Set();try{CUTOFF=new Set((localStorage.getItem('pg_cutoff')||'').split(',').filter(Boolean));if(!localStorage.getItem('pg_cut2')){CUTOFF.add('ppri');localStorage.setItem('pg_cut2','1');localStorage.setItem('pg_cutoff',[...CUTOFF].join(','));}}catch(e){CUTOFF.add('ppri');}
/* poignées A et B du plan de repérage : on les fait glisser dans l'axe de la coupe, puis la coupe est recalculée */
function abDrag(box,A,B,L,sc,ox,yTop,oy,PY){const svg=box.querySelector('.cutsvg svg');if(!svg)return;const NS='http://www.w3.org/2000/svg',Lw=Math.hypot(B[0]-A[0],B[1]-A[1])||L,ux=(B[0]-A[0])/Lw,uy=(B[1]-A[1])/Lw;
 const mk=(n,at)=>{const e=document.createElementNS(NS,n);for(const k in at)e.setAttribute(k,at[k]);return e;};
 const g=mk('g',{id:'abdrag',style:'touch-action:none'}),gd=mk('g',{'pointer-events':'none'});g.append(gd);svg.append(g);
 const hd={};for(const w of ['A','B']){const x=w==='A'?ox:ox+L*sc,h=mk('g',{cursor:'ew-resize','data-ab':w});const ti=mk('title',{});ti.textContent='Faire glisser '+w+' dans l\'axe de la coupe (allonger ou raccourcir), la coupe est recalculée au relâcher';
  h.append(ti,mk('circle',{cx:x,cy:PY,r:9,fill:'#fff','fill-opacity':.01}),mk('circle',{cx:x,cy:PY,r:4.5,fill:'#fff',stroke:'#d4462f','stroke-width':1.6}),mk('path',{d:'M'+(x-8)+' '+(PY-9)+' l-3 3 l3 3 M'+(x+8)+' '+(PY-9)+' l3 3 l-3 3',fill:'none',stroke:'#d4462f','stroke-width':1}));g.append(h);hd[w]=h;}
 const hdr=box.querySelector('.alh b'),h0=hdr?hdr.textContent:'';let dr=null;
 const sx=e=>{const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse()).x;};
 const lim=(w,dt)=>w==='A'?Math.min(dt,L-15):Math.max(dt,15-L);
 const show=()=>{const {w,dt}=dr,t0=w==='A'?dt:0,t1=w==='B'?L+dt:L,x0=ox+t0*sc,x1=ox+t1*sc,xm=w==='A'?x0:x1;hd[w].setAttribute('transform','translate('+(dt*sc)+' 0)');
  gd.innerHTML='';gd.append(mk('line',{x1:x0,x2:x1,y1:PY,y2:PY,stroke:'#d4462f','stroke-width':1.4,'stroke-dasharray':'5 3'}),mk('line',{x1:xm,x2:xm,y1:yTop,y2:oy,stroke:'#d4462f','stroke-width':1,'stroke-dasharray':'3 3'}));
  if(hdr)hdr.textContent='Coupe A-B · '+Math.round(L)+' m → '+Math.round(t1-t0)+' m';};
 g.addEventListener('pointerdown',e=>{const h=e.target.closest('[data-ab]');if(!h)return;e.stopPropagation();e.preventDefault();dr={w:h.dataset.ab,x0:sx(e),dt:0};try{svg.setPointerCapture(e.pointerId);}catch(_){}},true);
 svg.addEventListener('pointermove',e=>{if(!dr)return;e.stopPropagation();e.preventDefault();dr.dt=lim(dr.w,(sx(e)-dr.x0)/sc);show();},true);
 const end=async e=>{if(!dr)return;e.stopPropagation();const {w,dt}=dr;dr=null;if(Math.abs(dt)<.5){hd[w].removeAttribute('transform');gd.innerHTML='';if(hdr)hdr.textContent=h0;return;}
  const nA=w==='A'?[A[0]+ux*dt,A[1]+uy*dt]:A,nB=w==='B'?[B[0]+ux*dt,B[1]+uy*dt]:B;if(hdr)hdr.textContent='Recalcul de la coupe…';
  try{await cutShow(nA,nB);}catch(err){if(hdr)hdr.textContent='Échec du recalcul : '+(err&&err.message||err);}};
 svg.addEventListener('pointerup',end,true);svg.addEventListener('pointercancel',end,true);}
async function cutShow(A,B,opt={}){await loadLbl();
 let CC;if(opt.headless)CC={A,B,D:await cutData(A,B),lid:null,lidP:null,rid:0};else{if(!CUTC||CUTC.A!==A||CUTC.B!==B)CUTC={A,B,D:await cutData(A,B),lid:null,lidP:null,rid:0};CC=CUTC;}const rid=++CC.rid,D=CC.D,inD=d=>d>=-PTOL&&d<=LDg;
 const {L,T,KX,Bt,V,NIV,PLAF,HMC,G,B15}=D,W=D.W||[],PR=D.PR||[],PRC=(OVL.flatMap(g=>g.items).find(o=>o.id==='ppri')||{cols:[]}).cols,PRL=['bleue claire','bleue claire hors Seine','bleue sombre','bleue sombre hors Seine','rouge','verte'],C=D.C.filter(c=>inD(c[2])),K=D.K.filter(c=>inD(c[2])),Tr=D.A.filter(a=>inD(a.d));
 const allZ=[...PLAF.flat(),...G.flatMap(g=>g.pts),...B15.flat()].map(p=>p[1]);
 let zmin=Math.min(...T.map(p=>p[1]),...C.map(c=>c[1]),...K.map(c=>c[1]),...NIV.flat().map(p=>p[1]),1e9),zmax=Math.max(...Bt.map(b=>b.zb+b.hx),...Tr.map(a=>a.z+a.h),...T.map(p=>p[1]),...allZ,-1e9);
 if(!isFinite(zmin)||zmin>1e8)zmin=25;if(!isFinite(zmax)||zmax<-1e8)zmax=zmin+30;zmin=Math.floor((zmin-5)/5)*5;zmax=Math.ceil((zmax+5)/5)*5;
 const Wd=Math.min(1600,Math.max(700,L*4)),sc=Math.min((Wd-90)/L,6),ox=60,X=t=>ox+t*sc;
 /* règles des gabarits : étiquettes rangées en bandeau au-dessus du dessin, sans chevauchement, reliées à leur gabarit par un trait fin */
 const RL=[],RLH=9,RLG=8;{VGX.font='600 7.5px Inter, Arial, sans-serif';const wOf=r=>r.map((t,i)=>{VGX.font=(i?'':'600 ')+'7.5px Inter, Arial, sans-serif';return VGX.measureText(t).width;}).reduce((a,b)=>Math.max(a,b),0)+4;
  const xmax=ox+L*sc+25,rows=[];
  for(const g of [...G].sort((a,b)=>a.pts[1][0]-b.pts[1][0])){const w=wOf(g.rule),xa=X(g.pts[1][0]);let x0=Math.min(Math.max(ox-40,xa-w/2),xmax-w),r=0;
   for(;;r++){const end=rows[r]??-1e9;if(x0>=end+RLG)break;const nx=end+RLG;if(nx+w<=xmax&&nx-xa<=w*.9){x0=nx;break;}}
   rows[r]=x0+w;RL.push({g,x0,w,r,xa});}
  RL.rows=rows.length;}
 const RLL=RL.length?Math.max(...G.map(g=>g.rule.length)):0,RLRH=RLL*RLH+10,TB=RL.rows?RL.rows*RLRH+8:0;
 const Ht=Math.max(260,(zmax-zmin)*sc+70)+TB,oy=Ht-35,Y=z=>oy-(z-zmin)*sc;
 const Hw=Math.min(60,Math.max(BAND+8,140/sc)),PH=2*Hw*sc+34,PY=Ht+18+Hw*sc,PD=d=>PY-d*sc;
 const S=[],f=v=>v.toFixed(1),pth=P=>'M'+P.map(p=>f(X(p[0]))+' '+f(Y(p[1]))).join(' L');
 S.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+f(ox+L*sc+30)+' '+f(Ht+PH)+'" font-family="Inter,Arial,sans-serif" font-size="10">');
 S.push('<rect width="100%" height="100%" fill="#ffffff"/>');
 S.push('<g data-ly="grille">');for(let z=zmin;z<=zmax;z+=5){S.push('<line x1="'+ox+'" x2="'+f(X(L))+'" y1="'+f(Y(z))+'" y2="'+f(Y(z))+'" stroke="#e6e9ec" stroke-width=".5"/><text x="'+(ox-6)+'" y="'+f(Y(z)+3)+'" text-anchor="end" fill="#7a8794">'+z+'</text>');}
 const st=L>600?100:L>200?50:L>80?20:10;for(let t=0;t<=L+.1;t+=st)S.push('<line x1="'+f(X(t))+'" x2="'+f(X(t))+'" y1="'+f(oy)+'" y2="'+f(oy+4)+'" stroke="#7a8794"/><text x="'+f(X(t))+'" y="'+f(oy+15)+'" text-anchor="middle" fill="#7a8794">'+Math.round(t)+' m</text>');
 S.push('<text x="'+(ox-40)+'" y="'+f(TB+14)+'" fill="#7a8794">m NVP</text></g><g data-ly="courbes">');
 for(const k of K)S.push('<circle cx="'+f(X(k[0]))+'" cy="'+f(Y(k[1]))+'" r="1" fill="#c8a96a" opacity=".6"/>');
 for(const k of KX)S.push('<line x1="'+f(X(k[0]))+'" x2="'+f(X(k[0]))+'" y1="'+f(Y(k[1])-6)+'" y2="'+f(Y(k[1])+6)+'" stroke="#a8864a"/><text x="'+f(X(k[0])+2)+'" y="'+f(Y(k[1])-8)+'" fill="#a8864a" font-size="8">'+f(k[1])+'</text>');
 S.push('</g><g data-ly="terrain">');if(T.length>1){S.push('<path d="'+pth(T)+' L'+f(X(T[T.length-1][0]))+' '+f(oy)+' L'+f(X(T[0][0]))+' '+f(oy)+' Z" fill="#efe6d4"/>');S.push('<path d="'+pth(T)+'" fill="none" stroke="#6b5a3a" stroke-width="1.4"/>');}
 // eau, schématique : plan d'eau au niveau relevé, fond non représenté (dégradé en bandes)
 S.push('</g><g data-ly="eau">');for(const w of W){const x0=X(w.t0),ww=(w.t1-w.t0)*sc;[[0,1.2,.55],[1.2,2.4,.35],[2.4,3.6,.18]].forEach(([a,b,o])=>S.push('<rect x="'+f(x0)+'" y="'+f(Y(w.z-a))+'" width="'+f(ww)+'" height="'+f((b-a)*sc)+'" fill="#5aa9dc" fill-opacity="'+o+'"/>'));
  S.push('<line x1="'+f(x0)+'" x2="'+f(x0+ww)+'" y1="'+f(Y(w.z))+'" y2="'+f(Y(w.z))+'" stroke="#1f78b4" stroke-width="1.2"><title>Voie d\'eau : niveau relevé '+fr(w.z,2)+' m NVP (profil IGN)</title></line>');
  for(let x=x0+6;x<x0+ww-8;x+=14)S.push('<path d="M'+f(x)+' '+f(Y(w.z)+3)+' q2 -2 4 0 t4 0" fill="none" stroke="#1f78b4" stroke-width=".6"/>');
  if(ww>40)S.push('<text x="'+f(x0+ww/2)+'" y="'+f(Y(w.z)-4)+'" text-anchor="middle" fill="#1f78b4" font-size="8.5">eau '+fr(w.z,1)+' m NVP</text>');}
 S.push('</g><g data-ly="ppri">');for(const r of PR){const x0=X(r.t0),ww=(r.t1-r.t0)*sc;S.push('<rect x="'+f(x0)+'" y="'+f(oy-6)+'" width="'+f(ww)+'" height="6" fill="'+(PRC[r.c]||'#48cae4')+'" fill-opacity=".85"><title>PPRI : zone '+PRL[r.c]+'</title></rect>');if(ww>70)S.push('<text x="'+f(x0+3)+'" y="'+f(oy-8)+'" fill="#0b5d8a" font-size="8">PPRI '+PRL[r.c]+'</text>');}
 // arbres situés derrière ou devant le plan de coupe (plus pâles avec la distance)
 const treeSvg=a=>{const g=treeGeom(a),op=Math.max(.25,1-Math.abs(a.d)/Math.max(1,LDg)*.7),cf=a.f==='con'||a.f==='pin'||a.f==='col'&&/cupress|thuja|taxus/i.test(a.n||'')?'#5d9466':'#8cc583',tip=esc((a.n||'Arbre ('+a.k+')')+' : '+fr(a.h,0)+' m'+(a.c?', circonférence '+a.c+' cm':'')+', port '+TK[a.f].n+(a.rem?', arbre remarquable':'')+(a.d?', à '+fr(Math.abs(a.d),0)+' m de la coupe':''));
  return '<g opacity="'+op.toFixed(2)+'"><title>'+tip+'</title><path d="'+pth(g.tr)+' Z" fill="#7a5a36"/>'+g.cr.map(c=>'<path d="'+pth(c)+' Z" fill="'+cf+'" fill-opacity=".6" stroke="#3f7f47" stroke-width=".6"/>').join('')+g.br.map(b=>'<path d="'+pth(b)+'" fill="none" stroke="#6b4f2a" stroke-width=".6" opacity=".7"/>').join('')+'</g>';};
 S.push('</g><g data-ly="arbres">');for(const a of Tr)if(Math.abs(a.d)>3)S.push(treeSvg(a));S.push('</g><g data-ly="bati">');
 for(const b of Bt){S.push('<rect x="'+f(X(b.t0))+'" y="'+f(Y(b.zb+b.hm))+'" width="'+f((b.t1-b.t0)*sc)+'" height="'+f(b.hm*sc)+'" fill="#eef0f1" stroke="#55606b" stroke-width=".7"><title>Bâtiment : hauteur médiane '+f(b.hm)+' m, maximale '+f(b.hx)+' m'+(b.an?', construit vers '+b.an:'')+'</title></rect>');
  if(b.hx>b.hm+.5)S.push('<rect x="'+f(X(b.t0))+'" y="'+f(Y(b.zb+b.hx))+'" width="'+f((b.t1-b.t0)*sc)+'" height="'+f((b.hx-b.hm)*sc)+'" fill="none" stroke="#55606b" stroke-dasharray="2 2" stroke-width=".6"/>');}
 S.push('</g><g data-ly="arbres">');for(const a of Tr)if(Math.abs(a.d)<=3)S.push(treeSvg(a));S.push('</g>');
 // PLU : nivellement, plafond, HMC, 15 m hors bande, gabarits
 S.push('<g data-ly="lidar"></g><g data-ly="nivellement">');for(const P of NIV)S.push('<path d="'+pth(P)+'" fill="none" stroke="#2f7fbf" stroke-width="1" stroke-dasharray="1 2"><title>Surface de nivellement d\'îlot estimée (cote ronde NGF)</title></path>');
 S.push('</g><g data-ly="b15">');for(const P of B15)S.push('<path d="'+pth(P)+'" fill="none" stroke="#8a6fb5" stroke-width="1" stroke-dasharray="4 3"><title>15 m au-dessus de la surface de nivellement, au-delà de la bande de constructibilité principale de 18 m</title></path>');
 S.push('</g><g data-ly="plafond">');for(const P of PLAF)S.push('<path d="'+pth(P)+'" fill="none" stroke="#d9544d" stroke-width="1.2" stroke-dasharray="7 3"><title>Plafond des hauteurs (Plan général des hauteurs) au-dessus de la surface de nivellement</title></path>');
 S.push('</g><g data-ly="hmc">');for(const P of HMC)S.push('<path d="'+pth(P)+'" fill="none" stroke="#e07fb0" stroke-width="1.2" stroke-dasharray="2 2"><title>Hauteur maximale constructible (cote NGF)</title></path>');
 S.push('</g><g data-ly="gabarits">');
 for(const g of G){S.push('<path d="'+pth(g.pts)+'" fill="none" stroke="'+(g.fil?'#e07a1f':'#1f6fd0')+'" stroke-width="1.5"><title>'+esc('Gabarit-enveloppe, '+g.txt+'. Point d\'attache : '+g.zn+' m NGF')+'</title></path>');
  const [tp,zp]=g.pts[1],co=g.fil?'#e07a1f':'#1f6fd0';S.push('<text x="'+f(X(tp)+(g.dir>0?3:-3))+'" y="'+f(Y(zp/2+g.z0/2))+'" text-anchor="'+(g.dir>0?'start':'end')+'" fill="'+co+'" font-size="8">H '+fr(g.H)+'</text>');}
 const RT=[];for(const l of RL){const g=l.g,co=g.fil?'#e07a1f':'#1f6fd0',zt=g.pts[g.pts.length-1][1],[tp]=g.pts[1],yb=8+l.r*RLRH,yl=yb+g.rule.length*RLH,xa=X(tp),xc=Math.min(Math.max(xa,l.x0+3),l.x0+l.w-3);
  S.push('<path data-ly="regles" d="M'+f(xc)+' '+f(yl+1)+' L'+f(xc)+' '+f(Math.min(yl+6,Y(zt)-3))+' L'+f(xa)+' '+f(Y(zt)-3)+'" fill="none" stroke="'+co+'" stroke-width=".5" stroke-opacity=".7"/><circle data-ly="regles" cx="'+f(xa)+'" cy="'+f(Y(zt)-3)+'" r="1.3" fill="'+co+'"/>');
  RT.push('<text x="'+f(l.x0+2)+'" y="'+f(yb+7)+'" data-ly="regles" fill="'+co+'" font-size="7.5" stroke="#fff" stroke-width="2.6" paint-order="stroke" stroke-linejoin="round">'+g.rule.map((r,i)=>'<tspan x="'+f(l.x0+2)+'" dy="'+(i?RLH:0)+'"'+(i?'':' font-weight="600"')+'>'+esc(r)+'</tspan>').join('')+'</text>');}
 S.push(...RT);   /* textes après tous les traits de rappel : le liseré blanc les masque */
 S.push('</g><g data-ly="voies">');
 for(const v of V){if(v.w<2)continue;const zm=Math.max(D.zAt(v.s0),D.zAt(v.s1))+1.2,y=Y(zm);
  S.push('<path d="M'+f(X(v.s0))+' '+f(y)+' H'+f(X(v.s1))+' M'+f(X(v.s0))+' '+f(y-3)+' v6 M'+f(X(v.s1))+' '+f(y-3)+' v6" stroke="#1d2a36" stroke-width=".7"/>');
  S.push('<text x="'+f((X(v.s0)+X(v.s1))/2)+'" y="'+f(y-3)+'" text-anchor="middle" fill="#1d2a36" font-size="8.5">'+(v.big?'espace non cadastré '+fr(v.len,0)+' m':'voie '+fr(v.w)+' m ⟂')+'</text>');
  for(const [t,z] of [[v.s0,v.z0],[v.s1,v.z1]])S.push('<path d="M'+f(X(t))+' '+f(Y(z-.33))+' l-3 -5 h6 Z" fill="#2f7fbf"><title>Limite de voie : trottoir à '+fr(z,2)+' m NGF (terrain IGN)</title></path>');}
 S.push('</g><g data-ly="cotes">');for(const c of C)S.push('<path d="M'+f(X(c[0])-3)+' '+f(Y(c[1]))+' h6 M'+f(X(c[0]))+' '+f(Y(c[1])-3)+' v6" stroke="#b0412e" stroke-width="1"/><text x="'+f(X(c[0])+4)+'" y="'+f(Y(c[1])-4)+'" fill="#b0412e" font-size="8">'+f(c[1])+'</text>');
 S.push('</g>');S.push('<text x="'+ox+'" y="'+f(Y(zmax)-6)+'" font-weight="600" fill="#1d2a36">A</text><text x="'+f(X(L))+'" y="'+f(Y(zmax)-6)+'" text-anchor="end" font-weight="600" fill="#1d2a36">B</text>');
 const VBW=ox+L*sc+30;let PLAN=null;
 // plan de repérage : même échelle horizontale que la coupe, ligne A-B horizontale, nord indiqué
 {const [ax,ay]=A,[bx,by]=B,ux=(bx-ax)/L,uy=(by-ay)/L,pj=(x,y)=>[(x-ax)*ux+(y-ay)*uy,-(x-ax)*uy+(y-ay)*ux],m=Hw+12,inW=(t,d)=>t>-m&&t<L+m&&Math.abs(d)<m;
  const P_=['<g data-ly="plan"><defs><clipPath id="pclip"><rect x="0" y="'+f(PD(Hw))+'" width="'+f(VBW)+'" height="'+f(2*Hw*sc)+'"/></clipPath></defs><rect x="0" y="'+f(PD(Hw))+'" width="'+f(VBW)+'" height="'+f(2*Hw*sc)+'" fill="#f7f7f5"/><g clip-path="url(#pclip)">'];
  const ring=pts=>'M'+pts.map(([t,d])=>f(X(t))+' '+f(PD(d))).join(' L')+' Z',DXP=[];
  const cadR=await ovRings('cad').catch(()=>null),x0=Math.min(ax,bx)-m-20,x1=Math.max(ax,bx)+m+20,y0=Math.min(ay,by)-m-20,y1=Math.max(ay,by)+m+20;
  if(cadR)for(const p of cadR){if(p.b[2]<x0||p.b[0]>x1||p.b[3]<y0||p.b[1]>y1)continue;for(const a of p.rs){const q=[];for(let i=0;i<a.length;i+=2)q.push(pj(a[i],a[i+1]));if(!q.some(v=>inW(...v)))continue;P_.push('<path d="'+ring(q)+'" fill="none" stroke="#c9cdd2" stroke-width=".5"/>');DXP.push(['PLAN_PARCELLES',q]);}}
  P_.push('<rect id="pband" x="'+f(X(0))+'" y="'+f(PD(Math.min(LDg,Hw)))+'" width="'+f(L*sc)+'" height="'+f(Math.max(.5,Math.min(LDg,Hw)*sc))+'" fill="#ffd27f" fill-opacity=".28" stroke="#e0a83a" stroke-width=".6" stroke-dasharray="3 2"/>');P_.push('<text x="'+f(X(0)+4)+'" y="'+f(PD(Math.min(LDg,Hw))+(LDg>Hw?11:-3))+'" fill="#a8761e" font-size="8.5">profondeur visible : '+(LDg<1?Math.round(LDg*100)+' cm':fr(LDg,LDg<10?1:0)+' m')+(LDg>Hw?' (au-delà du cadre)':'')+'</text>');
  const cutS=new Set(Bt.map(b=>b.s));
  for(let s_=0;s_<N;s_++){if(bbox[4*s_+2]<x0||bbox[4*s_]>x1||bbox[4*s_+3]<y0||bbox[4*s_+1]>y1)continue;let q=[],prev=-1;const rs=[];
   for(let e=edgS[s_];e<edgS[s_+1];e+=2){const a_=edg[e],b_=edg[e+1];if(a_!==prev){if(q.length)rs.push(q);q=[pj(pos[2*a_],pos[2*a_+1])];}else q.push(pj(pos[2*a_],pos[2*a_+1]));prev=b_;}if(q.length)rs.push(q);
   if(!rs.some(r=>r.some(v=>inW(...v))))continue;const c=cutS.has(s_);P_.push('<path d="'+rs.map(ring).join(' ')+'" fill="'+(c?'#55606b':'#cfd5db')+'" fill-rule="evenodd" stroke="#55606b" stroke-width=".5"/>');for(const r of rs)DXP.push([c?'PLAN_BATI_COUPE':'PLAN_BATI',r]);}
  for(const a of Tr)if(a.k==='arbre')P_.push('<circle cx="'+f(X(a.t))+'" cy="'+f(PD(a.d))+'" r="'+f(Math.max(1.5,TK[a.f].w*a.h/2*sc*.5))+'" fill="#6fb35a" fill-opacity=".45" stroke="#3f7f47" stroke-width=".4"/>');
  if(LBL)for(const l of LBL.s||[]){const [t,d]=pj(l[0],l[1]);if(!inW(t,d))continue;let an=-(l[2]||0)+Math.atan2(uy,ux)*180/Math.PI;an=((an%360)+540)%360-180;if(an>90)an-=180;if(an<-90)an+=180;P_.push('<text x="'+f(X(t))+'" y="'+f(PD(d))+'" transform="rotate('+f(an)+' '+f(X(t))+' '+f(PD(d))+')" text-anchor="middle" fill="#6a7681" font-size="7.5" font-style="italic">'+esc(l[3])+'</text>');}
  P_.push('</g><path d="M'+f(X(0))+' '+f(PD(0))+' H'+f(X(L))+'" stroke="#d4462f" stroke-width="1.6"/><path d="M'+f(X(0))+' '+f(PD(0)-7)+' v14 M'+f(X(L))+' '+f(PD(0)-7)+' v14" stroke="#d4462f" stroke-width="1.6"/>');
  for(const t of [0,L])P_.push('<path d="M'+f(X(t))+' '+f(PD(0)+16)+' V'+f(PD(0)+3)+' M'+f(X(t)-3.5)+' '+f(PD(0)+8)+' L'+f(X(t))+' '+f(PD(0)+2)+' L'+f(X(t)+3.5)+' '+f(PD(0)+8)+'" fill="none" stroke="#d4462f" stroke-width="1.4"/>');
  P_.push('<text x="'+f(X(0)-4)+'" y="'+f(PD(0)+4)+'" text-anchor="end" font-weight="600" fill="#d4462f">A</text><text x="'+f(X(L)+4)+'" y="'+f(PD(0)+4)+'" font-weight="600" fill="#d4462f">B</text>');
  // flèche du nord : le nord (0,1) vaut (uy, ux) dans le repère (t, d)
  const cx=VBW-26,cy=PD(Hw)+28,vx=uy,vy=-ux;P_.push('<circle cx="'+f(cx)+'" cy="'+f(cy)+'" r="15" fill="#fff" stroke="#1d2a36" stroke-width=".6"/><path d="M'+f(cx+vx*12)+' '+f(cy+vy*12)+' L'+f(cx-vy*4.5-vx*7)+' '+f(cy+vx*4.5-vy*7)+' L'+f(cx-vx*3)+' '+f(cy-vy*3)+' Z" fill="#1d2a36"/><path d="M'+f(cx+vx*12)+' '+f(cy+vy*12)+' L'+f(cx+vy*4.5-vx*7)+' '+f(cy-vx*4.5-vy*7)+' L'+f(cx-vx*3)+' '+f(cy-vy*3)+' Z" fill="#fff" stroke="#1d2a36" stroke-width=".6"/><text x="'+f(cx+vx*21)+'" y="'+f(cy+vy*21+3.5)+'" text-anchor="middle" font-weight="700" font-size="10" fill="#1d2a36">N</text>');
  P_.push('<text x="'+f(X(0))+'" y="'+f(PD(-Hw)+14)+'" fill="#7a8794" font-size="9">Plan de repérage à la même échelle ; jaune : profondeur visible derrière le plan ; flèches rouges : sens de vue</text></g>');
  S.push(P_.join(''));PLAN={DXP,ux,uy};}
 S.push('</svg>');let svg=S.join('');
 // DXF de la coupe (repère local : X = distance depuis A, Y = altitude NVP), un calque par famille
 const E=[],pl=(ly,P,cl)=>{if(P.length<2)return;const q=['0\nPOLYLINE\n8\n'+ly+'\n66\n1\n70\n'+(cl?1:0)];for(const [x,y] of P)q.push('0\nVERTEX\n8\n'+ly+'\n10\n'+x.toFixed(3)+'\n20\n'+y.toFixed(3)+'\n30\n0');q.push('0\nSEQEND\n8\n'+ly);E.push([ly,q.join('\n')]);};
 const tx=(ly,x,y,hh,s)=>E.push([ly,'0\nTEXT\n8\n'+ly+'\n10\n'+x.toFixed(3)+'\n20\n'+y.toFixed(3)+'\n30\n0\n40\n'+hh+'\n1\n'+String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^\x20-\x7e]/g,'-')]);
 pl('TERRAIN',T,false);for(const w of W){pl('EAU',[[w.t0,w.z],[w.t1,w.z]],false);tx('EAU',(w.t0+w.t1)/2,w.z+.4,.5,'eau '+w.z.toFixed(2)+' NVP');}for(const r of PR){pl('PPRI_ZONES',[[r.t0,zmin+.5],[r.t1,zmin+.5],[r.t1,zmin+1.5],[r.t0,zmin+1.5]],true);tx('PPRI_ZONES',r.t0+.3,zmin+1.8,.5,'PPRI zone '+PRL[r.c]);}for(const b of Bt){pl('BATI',[[b.t0,b.zb],[b.t1,b.zb],[b.t1,b.zb+b.hm],[b.t0,b.zb+b.hm]],true);if(b.hx>b.hm+.5)pl('BATI_HAUTEUR_MAX',[[b.t0,b.zb+b.hm],[b.t0,b.zb+b.hx],[b.t1,b.zb+b.hx],[b.t1,b.zb+b.hm]],false);}
 for(const a of Tr){const g=treeGeom(a),ly=Math.abs(a.d)<=3?'':'_ARRIERE_PLAN';pl('ARBRES_TRONCS'+ly,g.tr,true);for(const c of g.cr)pl('ARBRES_HOUPPIERS'+ly,c,true);for(const b of g.br)pl('ARBRES_BRANCHES'+ly,b,false);if(a.n)tx('ARBRES_ESSENCES',a.t,a.z+a.h+.4,.35,a.n+' '+fr(a.h,0)+' m');}
 for(const c of C){pl('COTES_NVP_20M',[[c[0]-.5,c[1]],[c[0]+.5,c[1]]],false);pl('COTES_NVP_20M',[[c[0],c[1]-.5],[c[0],c[1]+.5]],false);tx('COTES_NVP_20M',c[0]+.6,c[1]+.3,.5,c[1].toFixed(2));}
 for(const k of KX){pl('COURBES_DE_NIVEAU',[[k[0],k[1]-1],[k[0],k[1]+1]],false);tx('COURBES_DE_NIVEAU',k[0]+.3,k[1]+1.2,.5,k[1].toFixed(1));}
 for(const k of K)pl('COURBES_POINTS_20M',[[k[0]-.15,k[1]],[k[0]+.15,k[1]]],false);
 for(const P of NIV)pl('PLU_NIVELLEMENT_ESTIME',P,false);for(const P of PLAF)pl('PLU_PLAFOND',P,false);for(const P of HMC)pl('PLU_HMC',P,false);for(const P of B15)pl('PLU_15M_HORS_BANDE',P,false);
 for(const g of G){pl(g.fil?'PLU_GABARIT_FILET':'PLU_GABARIT_VOIE',g.pts,false);tx(g.fil?'PLU_GABARIT_FILET':'PLU_GABARIT_VOIE',g.pts[1][0]+g.dir*.3,(g.z0+g.pts[1][1])/2,.45,'H '+fr(g.H)+' m');g.rule.forEach((r,i)=>tx('PLU_GABARIT_REGLES',g.pts[1][0]+(g.dir>0?.3:-r.length*.32),g.pts[g.pts.length-1][1]+.6+(g.rule.length-1-i)*.6,.4,r.replace('¼','1/4').replace(/×/g,'x')));}
 if(PLAN){const Y0=zmin-14-Hw;for(const [ly,r] of PLAN.DXP)pl(ly,r.map(([t,d])=>[t,Y0+d]),true);pl('PLAN_COUPE',[[0,Y0],[L,Y0]],false);tx('PLAN_COUPE',-2,Y0,1.2,'A');tx('PLAN_COUPE',L+.8,Y0,1.2,'B');
  const nx=L+8,ny=Y0+Hw-8,vx=PLAN.uy,vy=PLAN.ux;pl('PLAN_NORD',[[nx-vx*5,ny-vy*5],[nx+vx*5,ny+vy*5]],false);pl('PLAN_NORD',[[nx+vx*5,ny+vy*5],[nx+vx*3-vy*1.2,ny+vy*3+vx*1.2],[nx+vx*3+vy*1.2,ny+vy*3-vx*1.2],[nx+vx*5,ny+vy*5]],true);tx('PLAN_NORD',nx+vx*7-.4,ny+vy*7-.5,1.2,'N');}
 for(const v of V){if(v.w<2)continue;const zm=Math.max(D.zAt(v.s0),D.zAt(v.s1))+1.2;pl('VOIES_LARGEUR',[[v.s0,zm],[v.s1,zm]],false);pl('VOIES_LARGEUR',[[v.s0,zm-.4],[v.s0,zm+.4]],false);pl('VOIES_LARGEUR',[[v.s1,zm-.4],[v.s1,zm+.4]],false);tx('VOIES_LARGEUR',(v.s0+v.s1)/2,zm+.3,.5,v.big?'espace non cadastre':'voie '+fr(v.w)+' m (perpendiculaire)');}
 tx('INFO',0,zmin-4,1.2,'Paris-graphie (Bouchaud Architectes) - coupe A-B de '+Math.round(L)+' m - X : distance depuis A (m), Y : altitude NVP (m) - terrain : '+D.tsrc+' ; bati : Apur ; PLU bioclimatique (Ville de Paris, dec. 2025) : estimation indicative sans valeur reglementaire');
 const LYS=['TERRAIN','EAU','BATI','BATI_HAUTEUR_MAX','ARBRES_TRONCS','ARBRES_HOUPPIERS','ARBRES_BRANCHES','ARBRES_TRONCS_ARRIERE_PLAN','ARBRES_HOUPPIERS_ARRIERE_PLAN','ARBRES_BRANCHES_ARRIERE_PLAN','ARBRES_ESSENCES','COTES_NVP_20M','COURBES_DE_NIVEAU','COURBES_POINTS_20M','PLU_NIVELLEMENT_ESTIME','PLU_PLAFOND','PLU_HMC','PLU_15M_HORS_BANDE','PLU_GABARIT_VOIE','PLU_GABARIT_FILET','PLU_GABARIT_REGLES','VOIES_LARGEUR','PLAN_PARCELLES','PLAN_BATI','PLAN_BATI_COUPE','PLAN_COUPE','PLAN_NORD','PPRI_ZONES','INFO'];
 const LC=[33,5,8,252,32,3,32,33,83,33,94,1,42,41,150,1,221,190,5,30,30,7,9,8,250,1,7,4,7];
 const LK=l=>/^EAU/.test(l)?'eau':/^PPRI/.test(l)?'ppri':/^PLAN_/.test(l)?'plan':/^LIDAR/.test(l)?'lidar':/^TERRAIN/.test(l)?'terrain':/^BATI/.test(l)?'bati':/^ARBRES/.test(l)?'arbres':/^COTES/.test(l)?'cotes':/^COURBES/.test(l)?'courbes':/NIVELLEMENT/.test(l)?'nivellement':/PLAFOND/.test(l)?'plafond':/HMC/.test(l)?'hmc':/15M/.test(l)?'b15':/REGLES/.test(l)?'regles':/GABARIT/.test(l)?'gabarits':/^VOIES/.test(l)?'voies':'';
 let LIDE=()=>[];
 const mkDxf=on=>{const keep=l=>{const k=LK(l);return !k||on.has(k);},ly=LYS.filter(keep);return '0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n6\n0\nENDSEC\n0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n70\n'+ly.length+'\n'+ly.map(l=>'0\nLAYER\n2\n'+l+'\n70\n0\n62\n'+LC[LYS.indexOf(l)]+'\n6\nCONTINUOUS').join('\n')+'\n0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n'+E.concat(LIDE()).filter(e=>keep(e[0])).map(e=>e[1]).join('\n')+'\n0\nENDSEC\n0\nEOF\n';};
 let box=opt.headless?document.createElement('div'):$('#cutw');if(!box){box=document.createElement('div');box.id='cutw';document.body.appendChild(box);}
 const nm='paris-graphie-coupe-'+new Date().toISOString().slice(0,10),nG=G.length,nA=Tr.filter(a=>a.k==='arbre').length;
 const sw=(c,d)=>'<svg width="26" height="8" style="vertical-align:middle;margin-right:5px"><line x1="0" y1="4" x2="26" y2="4" stroke="'+c+'" stroke-width="1.6"'+(d?' stroke-dasharray="'+d+'"':'')+'/></svg>';
 const LEG=[
  ['<svg width="26" height="8" style="vertical-align:middle;margin-right:5px">'+[2,5,6,9].map((c,i)=>'<circle cx="'+(3+i*6.5)+'" cy="4" r="2.2" fill="'+LCL[c][1]+'"/>').join('')+'</svg>','Nuage de points LiDAR HD (IGN)','Points classés du LiDAR HD de l\'IGN (au moins 10 points/m², relevé '+'aérien 2021-2025), projetés perpendiculairement sur la coupe. Seuls les morceaux utiles des dalles sont téléchargés (format COPC, requêtes partielles). Couleurs : '+Object.values(LCL).map(v=>'<span style="color:'+v[1]+'">●</span> '+v[0].toLowerCase()).join(', ')+'. Seuls les points situés derrière le plan de coupe, dans le sens de vue (flèches rouges du plan de repérage), sont gardés, jusqu\'à la profondeur réglée par le curseur (10 cm à 150 m, pratique pour les places) ; ceux placés entre l\'observateur et le plan sont supprimés. Opacité : 100 % à moins de 25 cm du plan, puis de 50 % jusqu\'à presque rien à la profondeur choisie. Au-delà de 1,5 million de points, le niveau de détail est réduit. Altitudes IGN69 converties en NVP. Points virtuels, bruit et artefacts écartés. Dans le DXF, un calque par classe (points). Données IGN, Licence Ouverte Etalab 2.0.'],
  [sw('#6b5a3a'),'Terrain','Profil altimétrique RGE ALTI de l\'IGN échantillonné le long de A-B (un point tous les 2 m environ), converti en NVP (NGF − 0,33 m). À défaut, interpolation des cotes et des courbes de niveau. Source : '+esc(D.tsrc)+'.'],
  [sw('#1f78b4'),'Eau (schématique)','Emprises des voies d\'eau du plan de voirie de la Ville de Paris (Seine, canaux), lues en direct et coupées par la ligne. Le niveau tracé est la médiane du profil RGE ALTI de l\'IGN sur le plan d\'eau, qui donne la surface de l\'eau au moment du relevé (un niveau courant, pas une crue). Le fond n\'est pas connu : l\'eau est figurée par un dégradé sur 3,6 m, sans valeur de profondeur.'],
  ['<svg width="26" height="8" style="vertical-align:middle;margin-right:5px"><rect x=".5" y=".5" width="25" height="7" fill="#eef0f1" stroke="#55606b"/></svg>','Bâtiments','Intersections de la ligne avec les emprises Apur. Hauteur médiane en blanc cassé (pour laisser voir le LiDAR), maximale en pointillé, posées au point bas du terrain sous l\'emprise. Les hauteurs Apur viennent d\'un relevé photogrammétrique : vérifier sur relevé de géomètre.'],
  [sw('#3f7f47'),'Arbres',(D.tsrcA?'Chaque arbre public situé derrière le plan de coupe, jusqu\'à la profondeur choisie ('+nA+' ici), vient du jeu « Les arbres » de la Ville de Paris, lu en direct : position projetée sur la coupe, hauteur relevée (à défaut, 3 m + 0,08 × circonférence en cm), tronc au diamètre déduit de la circonférence. Le port dépend du genre : fastigié (peupliers d\'Italie, cyprès, cultivars « Fastigiata »), conique (cèdres, séquoias, ginkgos, liquidambars), en parasol (pins), pleureur (saules, cultivars « Pendula »), étalé (platanes, sophoras, paulownias, chênes, micocouliers), ovoïde pour les autres (tilleuls, marronniers, érables). Largeur du houppier et hauteur de la première branche en proportion de la hauteur. Les arbres privés hors de ce jeu sont déduits de la canopée Apur 2021 (16 m ou 7 m, ovoïdes). Plus un arbre est loin du plan de coupe, plus il est pâle.':'Jeu « Les arbres » indisponible : arbres déduits de la canopée Apur 2021 (16 m ou 7 m) et des alignements du PLU (14 m).')],
  [sw('#b0412e'),'Cotes et courbes','Points de nivellement NVP de la Ville de Paris et sommets des courbes de niveau IGN situés derrière le plan de coupe jusqu\'à la profondeur choisie, projetés perpendiculairement. Traits verticaux : courbes coupées par la ligne.'],
  [sw('#1d2a36'),'Largeur des voies','Les limites de voie sont les bords des parcelles cadastrales (DGFiP) coupées : tout intervalle hors parcelle est compté comme voie. La largeur affichée est mesurée perpendiculairement à la limite, pas dans le sens de la coupe : longueur coupée × sinus de l\'angle entre la coupe et la limite de parcelle, moyenne des deux rives. Au-delà de 90 m (Seine, grandes places), l\'espace est dit non cadastré et ne reçoit pas de gabarit.'],
  [sw('#2f7fbf','1 2'),'Surface de nivellement d\'îlot (estimée)','PLU, dispositions générales : plans horizontaux de cote ronde NGF en gradins d\'un mètre, établis à partir des cotes du trottoir sur le périmètre de l\'îlot. Ici, la cote du trottoir est prise sur le terrain IGN à chaque limite de voie coupée (triangles bleus), interpolée entre les deux rives de l\'îlot puis arrondie au mètre NGF supérieur. Le PLU tient compte de tout le périmètre de l\'îlot : c\'est une estimation à reprendre avec les cotes de voirie réelles. Point d\'attache des gabarits et origine du plafond.'],
  [sw('#1f6fd0'),'Gabarit-enveloppe, voie sans filet (UG.3.2.4, 2°)','Verticale H = P + 25 % de P (28 m au plus, arrondie au décimètre supérieur), P étant la largeur de voie perpendiculaire ; quart de cercle de rayon r = 25 % de P (entre 3 et 7 m) ; horizontale à H + r. Attache sur la surface de nivellement, à la limite de voie, sur 18 m de profondeur (bande de constructibilité principale). Non tracé en zones UV, N et dans les secteurs sauvegardés (PSMV), qui ont leurs propres règles.'],
  [sw('#e07a1f'),'Gabarit-enveloppe, filet de couleur (UG.3.2.4, 3°)','Verticale selon la couleur du filet : kaki 7 m, vert 10 m, orange 12 m, violet 15 m, bleu clair 18 m, noir 20 m, gris 23 m, bleu marine 25 m, marron foncé hauteur de façade existante (ici la hauteur médiane Apur). Couronnement selon le trait : pointillé horizontale, hachure pente 1/3 et h = 2 m, tireté court 1/2 et 3 m, tireté long 1/1 et 4,5 m, tireté mixte 2/1 et 4,5 m, continu quart de cercle comme pour une voie sans filet. Attache sur le filet coupé à moins de 6 m de la limite de voie.'],
  [sw('#d9544d','7 3'),'Plafond des hauteurs (UG.3.2.1)','Hauteur plafond du Plan général des hauteurs (18, 25, 31 ou 37 m) comptée depuis la surface de nivellement estimée. Le plafond de 25 m ne s\'applique pas dans la bande de 18 m le long des voies bordées de filets.'],
  ['<svg width="26" height="8" style="vertical-align:middle;margin-right:5px"><rect x="0" y="1" width="26" height="6" fill="#0096c7"/></svg>','PPRI (zones inondables, masqué par défaut)','Zones réglementaires du Plan de prévention du risque d\'inondation de la Seine à Paris (arrêté préfectoral du 19 avril 2007), d\'après la couche « Secteurs de risque - Inondations » du PLU bioclimatique (Ville de Paris), en bande colorée au pied de la coupe. La crue de référence est celle de janvier 1910. Les cotes des plus hautes eaux connues (PHEC), qui fixent le niveau à respecter, sont données casier par casier sur les cartes de zonage du PPRI au 1/5 000 et ne sont pas publiées en données ouvertes : elles ne sont donc pas tracées. À vérifier sur les cartes du PPRI (cotes en IGN 69, soit environ 33 cm de plus qu\'en NVP).'],
  [sw('#8a6fb5','4 3'),'Au-delà de la bande de 18 m (UG.3.2.1, 2°)','15 m au-dessus de la surface de nivellement, hors équipements publics, terrains de plus de 4 000 m² et secteur des bâtiments modernes, où le plafond s\'applique.'],
  [sw('#e07fb0','2 2'),'Hauteur maximale constructible','Cote NGF des périmètres HMC du PLU, convertie en NVP.']];
 const leg='<div class="cutleg">'+LEG.map(l=>'<p>'+l[0]+'<b>'+l[1]+'.</b> '+l[2]+'</p>').join('')+'<p class="k">Dans le sens de la coupe, les longueurs horizontales d\'un gabarit sont divisées par le sinus de l\'angle entre la coupe et la limite : une coupe biaise étire le gabarit, une coupe perpendiculaire aux façades le donne en vraie grandeur. Données du PLU bioclimatique de Paris (décembre 2025, Ville de Paris, open data sans valeur réglementaire). Cette coupe est une aide à l\'esquisse : seuls le règlement, les documents graphiques officiels et un relevé de géomètre font foi. Tous les éléments sont sur des calques séparés du DXF pour être repris.</p></div>';
 const CG=[['Relevés',['lidar','terrain','eau','bati','arbres','cotes','courbes']],['PLU',['voies','nivellement','gabarits','regles','plafond','b15','hmc','ppri']],['Mise en page',['grille','plan']]],CN=Object.fromEntries(CLY);
 const CCOL={lidar:'linear-gradient(90deg,'+LCL[2][1]+' 0 33%,'+LCL[4][1]+' 33% 66%,'+LCL[6][1]+' 66%)',terrain:'#9b7a45',bati:'#e3e6e8;box-shadow:inset 0 0 0 1px #55606b',arbres:'#3f7f47',cotes:'#b0412e',courbes:'#a8864a',eau:'#5aa9dc',ppri:'#0096c7',voies:'#1d2a36',nivellement:'#2f7fbf',gabarits:'#1f6fd0',regles:'#e07a1f',plafond:'#d9544d',b15:'#8a6fb5',hmc:'#e07fb0',grille:'#c9cdd2',plan:'#d4462f'};
 const stat=Bt.length+' bâtiments coupés, '+V.filter(v=>v.w>=2&&!v.big).length+' voies, '+nG+' gabarits, '+Tr.length+' arbres, '+C.length+' cotes NVP et '+K.length+' points de courbes jusqu\'à '+(LDg<1?Math.round(LDg*100)+' cm':fr(LDg,LDg<10?1:0)+' m')+' derrière le plan'+(D.cad?'':' (cadastre indisponible : pas de voies ni de règles du PLU)');
 box.innerHTML='<div class="alp"><div class="alh"><b>Coupe A-B · '+Math.round(L)+' m</b><span class="cutha"><button id="cutpl" type="button" aria-pressed="true">Masquer le plan</button><button id="cutsb" type="button" aria-expanded="false">Calques</button><button id="cutx" aria-label="Fermer">✕</button></span></div><div class="cuthint">↻ Tournez votre téléphone pour voir la coupe en grand</div><div class="cutg"><aside class="cutside">'
  +CG.map(([g,ks])=>'<div class="cuth">'+g+'</div>'+ks.map(k=>'<label class="cutr"><input type="checkbox" data-k="'+k+'"'+(CUTOFF.has(k)?'':' checked')+'><i style="background:'+CCOL[k]+'"></i><span>'+CN[k]+'</span></label>').join('')).join('')
  +'<div class="cuth">Profondeur visible</div><div class="cutsl"><input type="range" id="lidd" min="0" max="1000" step="1" aria-label="Profondeur visible derrière le plan de coupe"><b id="liddv"></b></div><div class="k cutk">Derrière le plan, de 10 cm à 150 m : LiDAR, arbres, cotes et courbes. Rien n\'est montré devant le plan.</div>'
  +'<div class="k cutk" id="cutms" style="color:#0a6f99"></div><div class="k cutk" id="cutl"></div><div class="k cutk">'+stat+'</div></aside>'
  +'<div class="cutmain">'+'<div class="cuttb" role="toolbar" aria-label="Outils de la coupe"><button id="cutm" title="Mesurer sur la coupe ou le plan : glisser d\'un point à l\'autre (Maj : garder la direction), Échap pour effacer" aria-label="Mesurer"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="M5.5 13 7.6 15.1M8 10.5 9.3 11.8M10.5 8 12.6 10.1M13 5.5 14.3 6.8"/></svg><span>Mesurer</span></button><button id="cutmx" hidden title="Effacer les mesures" aria-label="Effacer les mesures">Effacer</button><span class="cutsep"></span><button id="cutzo" title="Zoom arrière" aria-label="Zoom arrière"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button><button id="cutzi" title="Zoom avant (aussi : pincer, ou Ctrl + molette)" aria-label="Zoom avant"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><button id="cutzr" title="Voir toute la coupe" aria-label="Voir toute la coupe"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button><span class="cutsep"></span><button id="cutd" title="DXF (repère local), un calque par famille">DXF</button><button id="cuts" title="PDF vectoriel A3 (LiDAR compris), calques affichés">PDF</button></div>'+'<div class="cutsvg">'+cutDark(svg)+'</div>'
  +'<details class="cutd" open><summary>Comment chaque élément est calculé</summary>'+leg+'</details></div></div></div>';
 box.hidden=false;box.querySelector('#cutx').onclick=()=>box.hidden=true;abDrag(box,A,B,L,sc,ox,Y(zmax),oy,PY);{const sb=box.querySelector('#cutsb');sb.onclick=()=>{const o=box.classList.toggle('side');sb.setAttribute('aria-expanded',o?'true':'false');};}
 let lidSt=0;const lidMsg=(t,busy)=>{const e=box.querySelector('#cutl');if(e)e.innerHTML=(busy?'<span class="spin"></span>':'')+esc(t);const o=box.querySelector('.lidspin');if(busy&&!o){const d=document.createElement('div');d.className='lidspin';d.innerHTML='<span class="spin"></span>LiDAR HD';box.querySelector('.cutsvg').appendChild(d);}if(!busy&&o)o.remove();};
 // profondeur de visibilité du LiDAR : du plan de coupe (vu depuis le bas du plan de repérage) jusqu'à la profondeur choisie, 10 cm à 150 m
 const sl2d=v=>.1*Math.pow(1500,v/1000),d2sl=d=>Math.round(1000*Math.log(d/.1)/Math.log(1500)),fd=d=>d<1?Math.round(d*100)+' cm':d<10?fr(d)+' m':Math.round(d)+' m';
 let LIDP=null,LIDK=1,LIDR=null,lidHi=0,LD=LDg;if(CC.lid)({P:LIDP,K:LIDK,R:LIDR,hi:lidHi}=CC.lid);
 const drawLid=()=>{if(!LIDP)return;const P=LIDP,k=LIDK,cv2=document.createElement('canvas'),q=2;cv2.width=Math.ceil(VBW*q);cv2.height=Math.ceil(Ht*q);const g=cv2.getContext('2d'),col={};for(const c in LCL)col[c]=LCL[c][1];
  const ord=[];for(let i=0;i<P.t.length;i++)if(P.d[i]<=LD&&P.d[i]>=-PTOL)ord.push(i);ord.sort((i,j)=>P.d[j]-P.d[i]);
  for(const i of ord){const ad=Math.abs(P.d[i]),near=ad<=.25;g.globalAlpha=near?1:Math.max(.04,.5*(1-(ad-.25)/Math.max(.01,LD-.25)));g.fillStyle=col[P.c[i]]||'#9aa3ad';g.fillRect(X(P.t[i]*k)*q-.9,Y(P.z[i])*q-.9,near?2:1.5,near?2:1.5);}
  const img='<image x="0" y="0" width="'+f(VBW)+'" height="'+f(Ht)+'" href="'+cv2.toDataURL('image/png')+'"><title>LiDAR HD IGN : '+ord.length+' points, de 0 à '+fd(LD)+' derrière le plan de coupe</title></image>';
  svg=svg.replace(/<g data-ly="lidar">[\s\S]*?<\/g><g data-ly="nivellement">/,'<g data-ly="lidar">'+img+'</g><g data-ly="nivellement">');const gl=box.querySelector('.cutsvg [data-ly=lidar]');if(gl)gl.innerHTML=img;
  // profondeur reportée sur le plan de repérage
  const pr=box.querySelector('.cutsvg #pband'),Hv=Math.min(LD,Hw);if(pr){pr.setAttribute('y',f(PD(Hv)));pr.setAttribute('height',f(Math.max(.5,Hv*sc)));}
  lidMsg('LiDAR HD : '+ord.length.toLocaleString('fr-FR')+' points affichés, de 0 à '+fd(LD)+' derrière le plan ('+LIDR.tiles.join(', ')+')'+(LIDR.partial?', niveau de détail réduit sur cette surface':'')+'.');};
 const loadLid=async()=>{if(LIDP&&lidHi>=LD)return drawLid();if(lidSt===1)return;lidSt=1;const hi=Math.min(DMAX,Math.max(LD,lidHi));lidMsg('LiDAR HD : recherche des dalles…',1);
  try{if(!(CC.lidP&&CC.lidHi>=hi)){CC.lidHi=hi;CC.lidP=lidarCut(A,B,(i,n)=>{if(CC.rid===rid)lidMsg('LiDAR HD : '+i+' / '+n+' blocs',1);},-PTOL,hi);}const R_=await CC.lidP;if(CC.rid!==rid)return;
   LIDR=R_;LIDP=R_.P;LIDK=L/R_.L9;lidHi=CC.lidHi;CC.lid={P:LIDP,K:LIDK,R:LIDR,hi:lidHi};
   for(const [l,c] of [['LIDAR_SOL',33],['LIDAR_VEGETATION',94],['LIDAR_BATI',12],['LIDAR_EAU',150],['LIDAR_PONT',200],['LIDAR_SURSOL',40],['LIDAR_AUTRE',9]])if(!LYS.includes(l)){LYS.push(l);LC.push(c);}
   lidSt=2;drawLid();if(LD>lidHi)loadLid();}
  catch(e){lidSt=0;CC.lidP=null;lidMsg('LiDAR HD indisponible : '+String(e&&e.message||e));}};
 LIDE=()=>{if(!LIDP)return [];const P=LIDP,o=[],idx=[];for(let i=0;i<P.t.length;i++)if(P.d[i]<=LD&&P.d[i]>=-PTOL)idx.push(i);const st_=Math.max(1,Math.ceil(idx.length/3e5));
  for(let j=0;j<idx.length;j+=st_){const i=idx[j],ly=LDX[P.c[i]]||'LIDAR_AUTRE';o.push([ly,'0\nPOINT\n8\n'+ly+'\n10\n'+(P.t[i]*LIDK).toFixed(2)+'\n20\n'+P.z[i].toFixed(2)+'\n30\n'+P.d[i].toFixed(2)]);}return o;};
 const sl=box.querySelector('#lidd'),slv=box.querySelector('#liddv');sl.value=d2sl(LD);slv.textContent=fd(LD);
 sl.oninput=()=>{LD=Math.round(sl2d(+sl.value)*100)/100;LD=LD<1?Math.round(LD*20)/20:LD<10?Math.round(LD*10)/10:Math.round(LD);slv.textContent=fd(LD);if(LIDP&&LD<=lidHi)drawLid();};
 sl.onchange=()=>{LDg=LD;try{localStorage.setItem('pg_lidd',LD);}catch(e){}const sy=box.querySelector('.alp').scrollTop;cutShow(A,B).then(()=>{const a=box.querySelector('.alp');if(a)a.scrollTop=sy;});};
 if(!CUTOFF.has('lidar')&&!opt.headless)loadLid();
 const on=()=>new Set(CLY.map(c=>c[0]).filter(k=>!CUTOFF.has(k))),apply=()=>{for(const g of box.querySelectorAll('.cutsvg [data-ly]'))g.style.display=CUTOFF.has(g.dataset.ly)?'none':'';const sv_=box.querySelector('.cutsvg svg');if(sv_){const y0=CUTOFF.has('regles')?TB:0;ZM.b=[0,y0,ox+L*sc+30,(CUTOFF.has('plan')?Ht:Ht+PH)-y0];vb();}   /* bandeau des règles et plan de repérage : la place suit les calques */const pb=box.querySelector('#cutpl');if(pb){pb.setAttribute('aria-pressed',CUTOFF.has('plan')?'false':'true');pb.textContent=CUTOFF.has('plan')?'Afficher le plan':'Masquer le plan';}};
 /* zoom et déplacement du dessin : boutons, Ctrl + molette (pincement du pavé tactile), pincement à deux doigts ; glisser pour se déplacer une fois zoomé (à un doigt si la mesure est coupée) */
 const ZM={k:1,x:0,y:0,b:[0,0,1,1]};
 const vb=()=>{const sv_=box.querySelector('.cutsvg svg');if(!sv_)return;const [bx,by,bw,bh]=ZM.b,w=bw/ZM.k,h=bh/ZM.k;ZM.x=Math.min(Math.max(ZM.x,bx),bx+bw-w);ZM.y=Math.min(Math.max(ZM.y,by),by+bh-h);sv_.setAttribute('viewBox',f(ZM.x)+' '+f(ZM.y)+' '+f(w)+' '+f(h));sv_.classList.toggle('zoomed',ZM.k>1.01);};
 const zoomAt=(k,cx,cy)=>{const [bx,by,bw,bh]=ZM.b,k2=Math.min(12,Math.max(1,k));if(cx==null){cx=ZM.x+bw/ZM.k/2;cy=ZM.y+bh/ZM.k/2;}const fx=(cx-ZM.x)/(bw/ZM.k),fy=(cy-ZM.y)/(bh/ZM.k);ZM.k=k2;ZM.x=cx-fx*bw/k2;ZM.y=cy-fy*bh/k2;vb();};
 const toSvg=(x,y)=>{const sv_=box.querySelector('.cutsvg svg'),pt=sv_.createSVGPoint();pt.x=x;pt.y=y;return pt.matrixTransform(sv_.getScreenCTM().inverse());};
 box.querySelector('#cutzi').onclick=()=>zoomAt(ZM.k*1.6);box.querySelector('#cutzo').onclick=()=>zoomAt(ZM.k/1.6);box.querySelector('#cutzr').onclick=()=>{ZM.k=1;vb();};
 {const host=box.querySelector('.cutsvg');
  host.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const p=toSvg(e.clientX,e.clientY);zoomAt(ZM.k*Math.exp(-e.deltaY*.01),p.x,p.y);},{passive:false});
  let pinch=null,pan=null;
  host.addEventListener('touchstart',e=>{if(e.touches.length===2){const [a,b]=e.touches,m=toSvg((a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2);pinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),k:ZM.k,m,sx:(a.clientX+b.clientX)/2,sy:(a.clientY+b.clientY)/2,x:ZM.x,y:ZM.y};pan=null;e.preventDefault();}
   else if(e.touches.length===1&&ZM.k>1.01&&!host.classList.contains('meas')){const t=e.touches[0];pan={sx:t.clientX,sy:t.clientY,x:ZM.x,y:ZM.y};}},{passive:false});
  host.addEventListener('touchmove',e=>{const sv_=box.querySelector('.cutsvg svg');if(!sv_)return;const C=sv_.getScreenCTM();if(!C||!C.a)return;
   /* repère écran du dessin : x_écran = a·(x - x_vue) + gauche */
   const L0=C.e+C.a*ZM.x,T0=C.f+C.d*ZM.y;
   if(pinch&&e.touches.length===2){e.preventDefault();const [a,b]=e.touches,d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),k2=Math.min(12,Math.max(1,pinch.k*d/pinch.d)),s2=C.a*k2/ZM.k,mx=(a.clientX+b.clientX)/2,my=(a.clientY+b.clientY)/2;
    ZM.k=k2;ZM.x=pinch.m.x-(mx-L0)/s2;ZM.y=pinch.m.y-(my-T0)/s2;vb();}
   else if(pan&&e.touches.length===1){e.preventDefault();const t=e.touches[0];ZM.x=pan.x-(t.clientX-pan.sx)/C.a;ZM.y=pan.y-(t.clientY-pan.sy)/C.d;vb();}},{passive:false});
  host.addEventListener('touchend',e=>{if(e.touches.length<2)pinch=null;if(!e.touches.length)pan=null;});
  let mp=null;host.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||ZM.k<=1.01||host.classList.contains('meas')||e.target.closest('[data-ab]'))return;mp={sx:e.clientX,sy:e.clientY,x:ZM.x,y:ZM.y};host.classList.add('grab');});
  addEventListener('pointermove',e=>{if(!mp)return;const C=box.querySelector('.cutsvg svg').getScreenCTM();if(!C||!C.a)return;ZM.x=mp.x-(e.clientX-mp.sx)/C.a;ZM.y=mp.y-(e.clientY-mp.sy)/C.d;vb();});
  addEventListener('pointerup',()=>{mp=null;host.classList.remove('grab');});}
 {const pb=box.querySelector('#cutpl');if(pb)pb.onclick=()=>{CUTOFF.has('plan')?CUTOFF.delete('plan'):CUTOFF.add('plan');const c=box.querySelector('.cutside input[data-k=plan]');if(c)c.checked=!CUTOFF.has('plan');try{localStorage.setItem('pg_cutoff',[...CUTOFF].join(','));}catch(e){}apply();};}
 for(const c of box.querySelectorAll('.cutside input[data-k]'))c.onchange=()=>{c.checked?CUTOFF.delete(c.dataset.k):CUTOFF.add(c.dataset.k);if(c.checked&&c.dataset.k==='lidar')loadLid();try{localStorage.setItem('pg_cutoff',[...CUTOFF].join(','));}catch(e){}apply();};apply();
 const svgOn=()=>{const d=new DOMParser().parseFromString(svg,'image/svg+xml');for(const g of [...d.querySelectorAll('[data-ly]')])if(CUTOFF.has(g.getAttribute('data-ly')))g.remove();return new XMLSerializer().serializeToString(d);};
 const dl=(txt,type,ext)=>{const u=URL.createObjectURL(new Blob([txt],{type}));const a=document.createElement('a');a.href=u;a.download=nm+ext;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);};
 // nuage LiDAR en vectoriel : un petit carré par point, regroupés par couleur et par opacité
 const lidarVec=(max=4e5)=>doc=>{if(!LIDP||CUTOFF.has('lidar'))return '';const P=LIDP,k=LIDK,G_=new Map(),idx=[];for(let i=0;i<P.t.length;i++){const dd=P.d[i];if(dd<=LDg&&dd>=-PTOL)idx.push(i);}
  const stp=Math.max(1,Math.ceil(idx.length/max));for(let j=0;j<idx.length;j+=stp){const i=idx[j],ad=Math.abs(P.d[i]),near=ad<=.25,al=near?1:Math.max(.05,.5*(1-(ad-.25)/Math.max(.01,LDg-.25))),q=Math.round(al*20)/20,key=q+'|'+P.c[i];let a=G_.get(key);if(!a)G_.set(key,a=[]);const w=near?1:.75;a.push(vN(X(P.t[i]*k)-w/2)+' '+vN(Y(P.z[i])-w/2)+' '+w+' '+w+' re');}
  let o='';for(const key of [...G_.keys()].sort((a,b)=>parseFloat(a)-parseFloat(b))){const [q,c]=key.split('|'),col=vCol((LCL[c]||[0,'#9aa3ad'])[1]);o+='q '+vRGB(col)+' rg '+doc.a(+q)+'\n'+G_.get(key).join('\n')+'\nf Q\n';}return o;};
 const vecCut=(doc,box,max)=>svg2pdf(svgOn(),doc,box,{lidar:lidarVec(max)});
 const pdfCut=async()=>{const doc=new VPdf(),PW_=1190.55,PH_=841.89,M=28,p=doc.page(PW_,PH_),r=vecCut(doc,[M,M+26,PW_-2*M,PH_-2*M-60]);p.o.push(r.ops);
  const den=Math.round(2834.65/(sc*r.s)/10)*10;
  p.o.push(vText(doc,M,PH_-M-14,'Coupe A-B · '+Math.round(L)+' m · Paris-graphie, '+new Date().toLocaleDateString('fr-FR'),14,'#1a486a',{b:1}));
  p.o.push(vText(doc,M,PH_-M-30,'Échelle 1/'+den+' en A3 paysage (verticale égale à l\'horizontale) · profondeur visible '+(LDg<1?Math.round(LDg*100)+' cm':fr(LDg,LDg<10?1:0)+' m')+' derrière le plan · on regarde vers la gauche du trait A-B',9,'#55606b'));
  p.o.push(vText(doc,M,M+8,'Bouchaud Architectes · Paris-graphie. Terrain : '+D.tsrc+' ; bâti : Apur ; PLU bioclimatique : Ville de Paris (déc. 2025) ; arbres : Ville de Paris ; LiDAR HD : IGN (Licence Ouverte). Estimation sans valeur réglementaire.',6.5,'#7a8794'));
  return doc.blob();};
 box.querySelector('#cutd').onclick=()=>dl(mkDxf(on()),'application/dxf','.dxf');
 box.querySelector('#cuts').onclick=async()=>{const b=box.querySelector('#cuts');b.textContent='…';try{const bl=await pdfCut();const u=URL.createObjectURL(bl),a=document.createElement('a');a.href=u;a.download=nm+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(u),4000);}catch(e){alert('Échec du PDF : '+e.message);}b.textContent='PDF';};
 {const bm=box.querySelector('#cutm'),sv=()=>box.querySelector('.cutsvg svg');let on=false,a0=null,gm=null,tmp=null;const NS='http://www.w3.org/2000/svg';
  // géométrie aimantée de la coupe et du plan, en unités SVG
  const SV=[],SG=[],ap=(P,cl)=>{for(let i=0;i<P.length;i++){SV.push(P[i]);if(i)SG.push([P[i-1],P[i]]);}if(cl&&P.length>2)SG.push([P[P.length-1],P[0]]);};
  for(const b of Bt){ap([[X(b.t0),Y(b.zb)],[X(b.t1),Y(b.zb)],[X(b.t1),Y(b.zb+b.hm)],[X(b.t0),Y(b.zb+b.hm)]],true);if(b.hx>b.hm+.5)ap([[X(b.t0),Y(b.zb+b.hx)],[X(b.t1),Y(b.zb+b.hx)]]);}
  ap(T.map(p=>[X(p[0]),Y(p[1])]));for(const g of G)ap(g.pts.map(p=>[X(p[0]),Y(p[1])]));for(const P of [...NIV,...PLAF,...HMC])ap(P.map(p=>[X(p[0]),Y(p[1])]));
  if(PLAN)for(const [,r] of PLAN.DXP)ap(r.map(([t,d])=>[X(t),PD(d)]),true);ap([[X(0),PD(0)],[X(L),PD(0)]]);
  // points LiDAR affichés, indexés par cases de 8 unités SVG
  let LGI=null,LGK='';const lgrid=()=>{const key=(LIDP?LIDP.t.length:0)+'|'+LDg;if(LGK===key)return LGI;LGK=key;LGI=null;if(!LIDP||CUTOFF.has('lidar'))return null;const m=new Map();
   for(let i=0;i<LIDP.t.length;i++){if(LIDP.d[i]>LDg||LIDP.d[i]<-PTOL)continue;const x=X(LIDP.t[i]*LIDK),y=Y(LIDP.z[i]),c=Math.floor(x/8)+':'+Math.floor(y/8);let a=m.get(c);if(!a)m.set(c,a=[]);a.push(x,y);}return LGI=m;};
  let mk=null;const snapS=(p,from)=>{const s_=sv(),sc_=s_.getScreenCTM().a||1,tv=10/sc_,te=7/sc_;let bv=null,dv=tv,be=null,de=te;
   for(const q of SV){const d=Math.hypot(q[0]-p.x,q[1]-p.y);if(d<dv){dv=d;bv=q;}}
   if(bv)return {x:bv[0],y:bv[1],k:'v'};
   const lg=lgrid();if(lg){let bl=null,dl=Math.min(tv,8);const cx=Math.floor(p.x/8),cy=Math.floor(p.y/8);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=lg.get((cx+i)+':'+(cy+j));if(!a)continue;for(let k=0;k<a.length;k+=2){const d=Math.hypot(a[k]-p.x,a[k+1]-p.y);if(d<dl){dl=d;bl=[a[k],a[k+1]];}}}
    if(bl){if(from){const dx=bl[0]-from.x,dy=bl[1]-from.y,an=Math.atan2(Math.abs(dy),Math.abs(dx));if(an<2*Math.PI/180)return {x:bl[0],y:from.y,k:'l'};if(an>88*Math.PI/180)return {x:from.x,y:bl[1],k:'l'};}return {x:bl[0],y:bl[1],k:'l'};}}
   if(from){const dx=p.x-from.x,dy=p.y-from.y,L_=Math.hypot(dx,dy);if(L_>2/sc_){const an=Math.atan2(Math.abs(dy),Math.abs(dx));if(an<5*Math.PI/180)return {x:p.x,y:from.y,k:'o'};if(an>85*Math.PI/180)return {x:from.x,y:p.y,k:'o'};}}
   for(const [a,b] of SG){const vx=b[0]-a[0],vy=b[1]-a[1],l2=vx*vx+vy*vy;if(!l2)continue;const u=Math.max(0,Math.min(1,((p.x-a[0])*vx+(p.y-a[1])*vy)/l2)),px=a[0]+u*vx,py=a[1]+u*vy,d=Math.hypot(px-p.x,py-p.y);if(d<de){de=d;be=[px,py];}}
   return be?{x:be[0],y:be[1],k:'e'}:{x:p.x,y:p.y,k:''};};
  const showMk=q=>{if(!gm)return;if(!mk){mk=el('g',{});gm.append(mk);}mk.innerHTML='';if(!q.k)return;const c='#d4462f';
   if(q.k==='v')mk.append(el('rect',{x:q.x-3.5,y:q.y-3.5,width:7,height:7,fill:'none',stroke:c,'stroke-width':1.2}));else if(q.k==='l')mk.append(el('circle',{cx:q.x,cy:q.y,r:3.5,fill:'none',stroke:c,'stroke-width':1.2}));else if(q.k==='e')mk.append(el('path',{d:'M'+(q.x-3.5)+' '+(q.y-3.5)+' l7 7 m0 -7 l-7 7',stroke:c,'stroke-width':1.2}));else mk.append(el('text',{x:q.x+5,y:q.y-5,fill:c,'font-size':9,'font-weight':700},'⊥'));};
  const loc=(e,from)=>{const s_=sv(),pt=s_.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;let q=snapS(pt.matrixTransform(s_.getScreenCTM().inverse()),from);if(from){const z=lockDir(CSL,e.shiftKey,from.x,from.y,q.x,q.y);if(z)q={x:z[0],y:z[1],k:'o'};}else CSL.d=null;showMk(q);return q;};const CSL={};
  const val=p=>p.y<=Ht?{k:'c',t:(p.x-ox)/sc,z:zmin+(oy-p.y)/sc}:{k:'p',t:(p.x-ox)/sc,d:(PY-p.y)/sc};
  const MC=ESSAI?'#5fc0ee':'#0a8fc4';const el=(n,at,tx)=>{const e=document.createElementNS(NS,n);for(const k in at)e.setAttribute(k,at[k]);if(tx)e.textContent=tx;return e;};
  const draw_=(p,q,g)=>{g.innerHTML='';const A_=val(p),B_=val(q);let t1,t2;if(A_.k==='c'&&B_.k==='c'){const dh=Math.abs(B_.t-A_.t),dv=B_.z-A_.z;t1=fm(Math.hypot(dh,dv))+' (horizontal '+fm(dh)+', vertical '+(dv>=0?'+':'−')+fm(Math.abs(dv))+(dh>.05?', pente '+Math.round(Math.abs(dv)/dh*100)+' %':'')+')';t2=fr(A_.z,2)+' → '+fr(B_.z,2)+' m NVP';}
   else{const dt=B_.t-A_.t,dd=(B_.d??0)-(A_.d??0);t1=fm(Math.hypot(dt,dd))+(A_.k==='p'&&B_.k==='p'?' en plan':'');t2='';}
   g.append(el('line',{x1:p.x,y1:p.y,x2:q.x,y2:q.y,stroke:MC,'stroke-width':1.4}),el('circle',{cx:p.x,cy:p.y,r:2.5,fill:MC}),el('circle',{cx:q.x,cy:q.y,r:2.5,fill:MC}));
   const mx=(p.x+q.x)/2+5,my=(p.y+q.y)/2-6,tt=el('text',{x:mx,y:my,fill:ESSAI?'#7fd0f5':'#0a6f99','font-size':9,'font-weight':600,stroke:ESSAI?'#0f1a24':'#fff','stroke-width':2.6,'paint-order':'stroke'});tt.append(el('tspan',{x:mx},t1));if(t2)tt.append(el('tspan',{x:mx,dy:11,'font-weight':400},t2));g.append(tt);};
  const down=e=>{if(!on||!e.isPrimary)return;e.preventDefault();a0=loc(e);tmp=el('g',{});gm.append(tmp);try{sv().setPointerCapture(e.pointerId);}catch(_){}};
  const move=e=>{if(!on||!e.isPrimary)return;if(a0&&tmp){e.preventDefault();draw_(a0,loc(e,a0),tmp);}else loc(e);};
  const up=e=>{if(!on||!a0)return;const p=loc(e,a0);if(Math.hypot(p.x-a0.x,p.y-a0.y)<2)tmp.remove();else draw_(a0,p,tmp);a0=null;tmp=null;};
  const clr=()=>{if(gm)gm.innerHTML='';mk=null;a0=null;tmp=null;};const esc_=e=>{if(e.key==='Escape'&&on)clr();};box.querySelector('#cutmx').onclick=clr;
  bm.onclick=()=>{on=!on;bm.classList.toggle('on',on);box.querySelector('.cutsvg').classList.toggle('meas',on);box.querySelector('#cutmx').hidden=!on;const s_=sv();s_.style.cursor=on?'crosshair':'';s_.style.touchAction=on?'none':'';if(on&&!gm){gm=el('g',{id:'meas'});s_.append(gm);s_.addEventListener('pointerdown',down);s_.addEventListener('pointermove',move);s_.addEventListener('pointerup',up);s_.addEventListener('pointercancel',up);addEventListener('keydown',esc_);}
   box.querySelector('#cutms').textContent=on?'Mesure : faites glisser d\'un point à l\'autre (aimant : sommets, arêtes, points LiDAR, horizontales et verticales ; Maj maintenue : garder la direction) sur la coupe (distance, horizontal, vertical, pente) ou sur le plan ; le dessin ne défile plus, faites défiler la fenêtre en dehors. « Effacer » (ou Échap) retire les mesures.':'';};}
 if(opt.headless){if(!CUTOFF.has('lidar'))await loadLid();return {svg:svgOn(),L,lid:LIDP?LIDP.t.length:0,vec:(doc,box)=>vecCut(doc,box,6e4)};}
}
