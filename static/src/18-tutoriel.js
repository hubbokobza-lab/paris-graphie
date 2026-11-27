/* ---------- tutoriel des premières visites : 4 étapes, bouton Passer, relançable depuis le pied de page ---------- */
const TUTO=[
 {el:[isMob()?'#panel':'#scroll'],h:'Une adresse, des calques',p:'Tapez une adresse pour centrer la carte sur un immeuble. Dans la liste, choisissez un calque, ici l\'âge du bâti : les bâtiments se colorent selon ce critère et la légende s\'affiche. Un clic sur un bâtiment ouvre sa fiche.',demo:tuD1},
 {el:['#pdfb'],h:'La fiche PDF',p:'Dans la fiche d\'un bâtiment, le bouton « Exporter la fiche en PDF » produit un dossier complet : carte, données sourcées, autorisations, plans historiques et coupes sur rue tracées automatiquement, de l\'immeuble d\'en face jusqu\'au fond de la parcelle.',img:'tuto-fiche.jpg',demo:tuD2},
 {el:['#zoom','#zpm'],map:1,h:'Le plan, en DXF ou en PDF',p:'Le bouton Plan propose deux formats avant de tracer un rectangle : DXF géoréférencé en Lambert 93 (un calque par couche, pour ArchiCAD, AutoCAD ou QGIS) ou PDF vectoriel aux couleurs de la carte, calques affichés compris.',img:'tuto-plan.jpg',demo:tuD3},
 {el:['#zoom'],map:1,h:'La coupe',p:'Le bouton Coupe permet de tracer une ligne de A vers B : terrain IGN, bâti, gabarits du PLU avec leurs règles, arbres selon leur essence et nuage de points LiDAR HD, avec un curseur de profondeur, un plan de repérage et la mesure. Export DXF et PDF vectoriel.',img:'tuto-coupe.jpg',demo:tuD4}];
function flyView(k1,cx1,cy1,ms=1100){return new Promise(r=>{const k0=view.k,cx0=view.cx,cy0=view.cy,t0=performance.now();const st_=()=>{const u=Math.min(1,(performance.now()-t0)/ms),e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;view.k=k0*Math.pow(k1/k0,e);view.cx=cx0+(cx1-cx0)*e;view.cy=cy0+(cy1-cy0)*e;draw();if(u<1)requestAnimationFrame(st_);else r();};requestAnimationFrame(st_);});}
/* démonstration : toujours le même immeuble (65 bis rue La Fayette, projet de Bouchaud Architectes), aperçus pré-calculés */
const TS={tok:0,save:null,s:-1,cut:null};const tSleep=ms=>new Promise(r=>setTimeout(r,ms));
let TCUR=null;const tCur=()=>{if(!TCUR){TCUR=document.createElement('div');TCUR.id='tcur';TCUR.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M5 3l14 8-6.2 1.7L9.6 19z" fill="#fff" stroke="#0f1a24" stroke-width="1.4" stroke-linejoin="round"/></svg>';document.body.appendChild(TCUR);}return TCUR;};
async function tMove(x,y,ms=650){const c=tCur();c.style.transition='left '+ms+'ms cubic-bezier(.4,0,.2,1),top '+ms+'ms cubic-bezier(.4,0,.2,1),opacity .2s';c.style.opacity=1;c.style.left=x+'px';c.style.top=y+'px';await tSleep(ms+40);}
async function tClick(){const c=tCur();c.classList.remove('clk');void c.offsetWidth;c.classList.add('clk');await tSleep(400);}
const tPos=q=>{const e=typeof q==='string'?$(q):q;if(!e)return null;const r=e.getBoundingClientRect();return r.width?[r.left+r.width/2,r.top+r.height/2]:null;};
const tW2s=(x,y)=>[(x-view.cx)*view.k+W/2,Hh/2-(y-view.cy)*view.k];
async function tBuilding(){if(TS.s>=0)return TS.s;let wx,wy;
 // 65 bis rue La Fayette (Paris 9e), projet de Bouchaud Architectes, retrouvé dans la base d'adresses
 try{const A_=await loadAddr(),st_=A_&&A_.find(e=>/^rue la fayette$/.test(e.z)),e=st_&&st_.a.find(a=>nz(a[0])==='65 bis');if(e){wx=e[1]/2;wy=e[2]/2;}}catch(e){}
 if(wx==null)[wx,wy]=llToW(2.34635,48.87595);let s=pick(wx,wy);if(s<0)for(const [dx,dy] of [[3,0],[-3,0],[0,3],[0,-3],[6,6],[-6,-6]]){s=pick(wx+dx,wy+dy);if(s>=0)break;}
 TS.big=s;if(s>=0)ADPREF={s,t:'65 bis Rue la Fayette'};return TS.s=s;}
// coupe transversale de démonstration : perpendiculaire au grand axe de l'édifice, par son centre
function tCutLine(s){s=TS.big??s;let n=0,mx=0,my=0;for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e];mx+=pos[2*a];my+=pos[2*a+1];n++;}mx/=n;my/=n;let sxx=0,syy=0,sxy=0;
 for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e],x=pos[2*a]-mx,y=pos[2*a+1]-my;sxx+=x*x;syy+=y*y;sxy+=x*y;}const th=.5*Math.atan2(2*sxy,sxx-syy),ux=-Math.sin(th),uy=Math.cos(th);
 let h=0;for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e];h=Math.max(h,Math.abs((pos[2*a]-mx)*ux+(pos[2*a+1]-my)*uy));}h+=28;
 const A=[mx-ux*h,my-uy*h],B=[mx+ux*h,my+uy*h];return uy>=0?{A,B}:{A:B,B:A};}
function tInside(s){const [x0,y0,x1,y1]=[bbox[4*s],bbox[4*s+1],bbox[4*s+2],bbox[4*s+3]];let best=null,bd=-1;for(let i=1;i<8;i++)for(let j=1;j<8;j++){const x=x0+(x1-x0)*i/8,y=y0+(y1-y0)*j/8;if(pick(x,y)!==s)continue;const d=Math.min(i,8-i)+Math.min(j,8-j);if(d>bd){bd=d;best=[x,y];}}return tW2s(...(best||[(x0+x1)/2,(y0+y1)/2]));}
async function tZoom(card){const s=await tBuilding();if(s<0)return -1;const g=TS.big??s,sz=Math.max(bbox[4*g+2]-bbox[4*g],bbox[4*g+3]-bbox[4*g+1]),bx=(bbox[4*g]+bbox[4*g+2])/2,by=(bbox[4*g+1]+bbox[4*g+3])/2,pw=isMob()?0:340-422;
 // sur téléphone : zoom qui laisse voir la coupe entière ; immeuble au-dessus du volet de la fiche, ou sous la bulle du tutoriel
 const k=isMob()?Math.min(4,Math.max(1.5,innerWidth*.72/85)):Math.min(6,Math.max(2.3,260/sz)),off=isMob()?(card?Hh*.25:-Hh*.12):Hh*.17,cy=by-off/k;
 if(Math.abs(view.k-k)>.05||Math.hypot(view.cx-(bx-pw/2/k),view.cy-cy)>3)await flyView(k,bx-pw/2/k,cy);return s;}
// volet du téléphone : ouvert / fermé par le bouton du panneau, comme le ferait l'utilisateur
async function tSheet(open,tok){if(!isMob())return;const p=$('#panel'),mn=p.classList.contains('min');if(open===!mn)return;if(await tGo('#tog',500))await tClick();if(tok!==TS.tok)return;p.classList.toggle('min',!open);syncTog();await tSleep(450);TS.place&&TS.place();}
async function tuD1(tok){const sc=$('#scroll'),b=$('#scroll button[data-id="per"]'),sec=b&&b.closest('details'),sm=sec&&sec.querySelector('summary');if(!b)return;
 if(sec&&sec.open)sec.open=false;await tSleep(60);
 if(isMob()){await tMove(innerWidth*.5,innerHeight*.45,400);await tSheet(true,tok);}else{await tMove(innerWidth*.6,innerHeight*.55,500);const p0=tPos(sc);if(p0)await tMove(p0[0],p0[1]);}
 if(tok!==TS.tok)return;
 if(sc&&sm){// défilement jusqu'au dossier « Âge »
  const r=sm.getBoundingClientRect(),r0=sc.getBoundingClientRect();sc.scrollTo({top:sc.scrollTop+r.top-r0.top-r0.height*.25,behavior:'smooth'});await tSleep(900);if(tok!==TS.tok)return;
  // clic sur le dossier pour le déplier, puis sur « Période de construction »
  let p=tPos(sm);if(p)await tMove(p[0],p[1]);await tClick();if(tok!==TS.tok)return;sec.open=true;await tSleep(450);if(tok!==TS.tok)return;
  p=tPos(b);if(p)await tMove(p[0],p[1]);await tClick();}
 if(tok!==TS.tok)return;if(st.crit.id!=='per')b.click();
 if(isMob()){await tSleep(900);if(tok!==TS.tok)return;await tSheet(false,tok);}}
async function tuD2(tok){if(st.crit.id!=='per'){const b=$('#scroll button[data-id="per"]');if(b)b.click();}
 await tSheet(false,tok);const s=await tZoom(1);if(s<0||tok!==TS.tok)return;const bc=tInside(s);await tMove(bc[0],bc[1]);await tClick();if(tok!==TS.tok)return;
 sel=s;await showCard(s,true);draw();await tSleep(450);if(tok!==TS.tok)return;const pb=$('#pdfb');if(pb){pb.scrollIntoView({block:'nearest',behavior:'smooth'});await tSleep(500);}TS.place&&TS.place();if(await tGo('#pdfb'))await tClick();}
const tBox=(a,b,p)=>{const A_=tW2s(...a),B_=tW2s(...b);return {left:Math.min(A_[0],B_[0])-p,top:Math.min(A_[1],B_[1])-p,right:Math.max(A_[0],B_[0])+p,bottom:Math.max(A_[1],B_[1])+p};};
// déplacement vers un bouton, recalé si le bouton a bougé pendant le trajet (volet, fiche)
async function tGo(q,ms){let p=tPos(q);if(!p)return null;await tMove(p[0],p[1],ms);const p2=tPos(q);if(p2&&Math.hypot(p2[0]-p[0],p2[1]-p[1])>3){await tMove(p2[0],p2[1],220);p=p2;}return p;}
async function tuD3(tok){await tSheet(false,tok);const s=await tZoom();if(s<0||tok!==TS.tok)return;sel=s;if(cardFor>=0){await showCard(-1);}draw();TS.place&&TS.place();
 await tSleep(350);if(tok!==TS.tok)return;if(await tGo('#zp'))await tClick();if(tok!==TS.tok)return;zpMenu(true);TS.place&&TS.place();await tSleep(250);
 // le bandeau se déplie : on montre DXF, puis on choisit PDF
 await tGo('#zx',500);await tSleep(500);if(await tGo('#zpp',450))await tClick();if(tok!==TS.tok)return;
 $('#zp').classList.add('on');$('#zpp').classList.add('on');const m=15,g=TS.big??s,a=[bbox[4*g]-m,bbox[4*g+3]+m],b=[bbox[4*g+2]+m,bbox[4*g+1]-m];XP={a,b:a,fmt:'pdf',demo:1};TS.focus=()=>XP&&tBox(XP.a,XP.b,10);const pa=tW2s(...a);await tMove(pa[0],pa[1],500);TS.place&&TS.place();
 const t0=performance.now();await new Promise(r=>{const f=()=>{if(tok!==TS.tok||!XP)return r();const u=Math.min(1,(performance.now()-t0)/1100);XP.b=[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];const q=tW2s(...XP.b),c=tCur();c.style.transition='none';c.style.left=q[0]+'px';c.style.top=q[1]+'px';draw();TS.hl&&TS.hl();if(u<1)requestAnimationFrame(f);else r();};requestAnimationFrame(f);});}
async function tuD4(tok){if(XP&&XP.demo){XP=null;$('#zp').classList.remove('on');}await tSheet(false,tok);const s=await tZoom();if(s<0||tok!==TS.tok)return;sel=s;if(cardFor>=0)await showCard(-1);draw();TS.place&&TS.place();
 if(!TS.cut){const F=await facadeCuts(s).catch(()=>[]);const sy=c=>(c.A[1]-c.B[1])/Math.hypot(c.A[0]-c.B[0],c.A[1]-c.B[1]);F.sort((p,q)=>sy(p)-sy(q));const F2=F.filter(c=>F.length&&sy(c)<sy(F[0])+.5).sort((p,q)=>p.L-q.L);TS.cut=F2[0]||F[0]||tCutLine(s);/* petite façade sur la rue La Fayette (au sud), coupe perpendiculaire */}
 await tSleep(350);if(tok!==TS.tok)return;if(await tGo('#zc'))await tClick();if(tok!==TS.tok)return;$('#zc').classList.add('on');const {A,B}=TS.cut;XC={a:A,b:A,demo:1};TS.focus=()=>XC&&tBox(XC.a,XC.b,26);const pa=tW2s(...A);await tMove(pa[0],pa[1],600);TS.place&&TS.place();
 const t0=performance.now();await new Promise(r=>{const f=()=>{if(tok!==TS.tok||!XC)return r();const u=Math.min(1,(performance.now()-t0)/1200);XC.b=[A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u];const q=tW2s(...XC.b),c=tCur();c.style.transition='none';c.style.left=q[0]+'px';c.style.top=q[1]+'px';draw();TS.hl&&TS.hl();if(u<1)requestAnimationFrame(f);else r();};requestAnimationFrame(f);});}
function tCleanStep(){TS.focus=null;$('#zpp').classList.remove('on');if(XP&&XP.demo){XP=null;$('#zp').classList.remove('on');}zpMenu(false);if(XC&&XC.demo){XC=null;$('#zc').classList.remove('on');}draw();}
function tuto(){let i=0;const hl=document.createElement('div'),w=document.createElement('div'),bk=document.createElement('div');hl.id='tuhl';w.id='tuw';bk.id='tublk';w.setAttribute('role','dialog');w.setAttribute('aria-label','Tutoriel');document.body.append(bk,hl,w);
 TS.save={crit:st.crit,k:view.k,cx:view.cx,cy:view.cy,sel,card:cardFor,min:$('#panel').classList.contains('min')};TS.tok++;
 const kd=e=>{if(e.key==='Escape')end();};addEventListener('keydown',kd);
 const end=async()=>{TS.tok++;document.body.classList.remove('tumap');removeEventListener('resize',place);removeEventListener('keydown',kd);w.remove();bk.remove();hl.style.opacity=0;if(TCUR)TCUR.style.opacity=0;tCleanStep();
  const S0=TS.save;if(S0){if(isMob()){$('#panel').classList.toggle('min',S0.min);syncTog();}if(st.crit!==S0.crit)setCrit(S0.crit);sel=S0.sel;await showCard(S0.card>=0?S0.card:-1,S0.card>=0);await flyView(S0.k,S0.cx,S0.cy,900);}hl.remove();try{localStorage.setItem('pg_tuto','1');}catch(e){}};
 const hlTo=(r,on)=>{const pd=6;Object.assign(hl.style,{left:(r.left-pd)+'px',top:(r.top-pd)+'px',width:(r.right-r.left+2*pd)+'px',height:(r.bottom-r.top+2*pd)+'px',opacity:on?1:0});};TS.hl=()=>{if(TS.focus){const r=TS.focus();if(r){hl.style.transition='none';hlTo(r,1);}}};
 function place(){const S=TUTO[i],fr_=TS.focus&&TS.focus(),rs=fr_?[fr_]:S.el.map(q=>$(q)).filter(e=>e&&e.getBoundingClientRect().width>0).map(e=>e.getBoundingClientRect());hl.style.transition='';
  let r={left:innerWidth/2-90,top:innerHeight/2-90,right:innerWidth/2+90,bottom:innerHeight/2+90};if(rs.length)r={left:Math.min(...rs.map(r=>r.left)),top:Math.min(...rs.map(r=>r.top)),right:Math.max(...rs.map(r=>r.right)),bottom:Math.min(innerHeight-8,Math.max(...rs.map(r=>r.bottom)))};
  const pd=6;hlTo(r,rs.length);
  const ww=w.offsetWidth,wh=w.offsetHeight,M=12;let x,y;
  if(innerWidth<640){x=(innerWidth-ww)/2;y=S.map||r.top>innerHeight/2?M:innerHeight-wh-M;}
  else if(S.img&&w.querySelector('.tuim.on')){x=Math.min(Math.max(M,r.left-ww-M-pd),innerWidth-ww-M);if(x+ww>r.left-pd&&r.left>ww+2*M)x=r.left-ww-M-pd;y=innerHeight-wh-M;}
  else if(r.left-M-ww>M){x=r.left-M-ww-pd;y=Math.min(Math.max(M,r.top),innerHeight-wh-M);}
  else if(r.right+M+ww<innerWidth-M){x=r.right+M+pd;y=Math.min(Math.max(M,r.top),innerHeight-wh-M);}
  else{x=(innerWidth-ww)/2;y=Math.min(innerHeight-wh-M,r.bottom+M+pd);}
  Object.assign(w.style,{left:Math.max(M,x)+'px',top:Math.max(M,y)+'px'});}
 async function show(){const S=TUTO[i],tok=++TS.tok;tCleanStep();document.body.classList.toggle('tumap',!!S.map&&isMob());
  w.innerHTML='<div class="tun">'+TUTO.map((_,k)=>'<span'+(k===i?' class="on"':'')+'>'+(k+1)+'</span>').join('')+'</div><h4>'+S.h+'</h4>'+(isMob()?'<button class="tumo" type="button" aria-expanded="false">Voir plus</button>':'')+'<div class="tumore"><p>'+S.p+'</p>'+(S.img?'<div class="tuim"><img alt="Aperçu" src="'+S.img+'" onerror="this.parentNode.remove()"></div>':'')+'</div><div class="tub"><button class="tus" type="button">Passer</button><span>'+(i?'<button class="tup" type="button">Précédent</button>':'')+'<button class="tuo" type="button">'+(i<TUTO.length-1?'Suivant':'Terminer')+'</button></span></div>';
  const mo=w.querySelector('.tumo');if(mo)mo.onclick=()=>{const o=w.classList.toggle('more');mo.textContent=o?'Voir moins':'Voir plus';mo.setAttribute('aria-expanded',o?'true':'false');place();setTimeout(place,480);};
  w.querySelector('.tus').onclick=end;w.querySelector('.tuo').onclick=()=>{if(i<TUTO.length-1){i++;show();}else end();};const pv=w.querySelector('.tup');if(pv)pv.onclick=()=>{i--;show();};
  place();w.querySelector('.tuo').focus();
  try{await S.demo(tok);}catch(e){}if(tok!==TS.tok)return;place();const im=w.querySelector('.tuim');if(im){im.classList.add('on');place();setTimeout(()=>{if(tok===TS.tok)place();},500);const ig=im.querySelector('img');if(ig&&!ig.complete)ig.onload=()=>{if(tok===TS.tok)place();};}if(TCUR)setTimeout(()=>{if(tok===TS.tok&&TCUR)TCUR.style.opacity=0;},900);}
 TS.place=place;addEventListener('resize',place);show();}
$('#tutob').onclick=e=>{e.preventDefault();if(!$('#tuw'))tuto();};
{let seen=false;try{seen=!!localStorage.getItem('pg_tuto');}catch(e){seen=true;}if(!seen&&!ESSAI&&!/[?&](adresses|embed)=/.test(location.search)&&!navigator.webdriver)setTimeout(()=>{if(!$('#tuw'))tuto();},900);}
$('#load').style.display='none';
