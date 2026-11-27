/* ---------- export d'une zone en PDF géoréférencé ---------- */
let XP=null;const xmsg=$('#xmsg');
function xMsg(h){xmsg.innerHTML=h;xmsg.hidden=!h;}
const zpm=$('#zpm'),zpMenu=o=>{zpm.hidden=!o;$('#zp').setAttribute('aria-expanded',o?'true':'false');};
function xpOff(){XP=null;['#zp','#zx','#zpp'].forEach(q=>$(q).classList.remove('on'));xMsg('');cv.style.cursor='';draw();}
$('#zp').onclick=()=>{if(XP){xpOff();zpMenu(false);return;}zpMenu(zpm.hidden);};
const xpStart=fmt=>{if(typeof XC!=='undefined'&&XC)xcOff();if(typeof MS!=='undefined'&&MS)msOff();XP={a:null,b:null,fmt};zpMenu(false);$('#zp').classList.add('on');cv.style.cursor='crosshair';
 xMsg(fmt==='pdf'?'Tracez un rectangle sur la carte : plan PDF vectoriel aux couleurs de la carte, calques affichés compris (Échap pour annuler)':'Tracez un rectangle sur la carte : export DXF géoréférencé en Lambert 93 (Échap pour annuler)');};
$('#zx').onclick=()=>xpStart('dxf');$('#zpp').onclick=()=>xpStart('pdf');
addEventListener('keydown',e=>{if(e.key==='Escape'){if(XP)xpOff();zpMenu(false);}});
cv.addEventListener('pointerdown',e=>{if(!XP)return;e.stopImmediatePropagation();e.preventDefault();XP.a=s2w(e.clientX,e.clientY);XP.b=XP.a;cv.setPointerCapture(e.pointerId);},true);
cv.addEventListener('pointermove',e=>{if(!XP)return;e.stopImmediatePropagation();if(!XP.a)return;XP.b=s2w(e.clientX,e.clientY);draw();},true);
cv.addEventListener('pointerup',async e=>{if(!XP||!XP.a)return;e.stopImmediatePropagation();const a=XP.a,b=XP.b;const R=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];
 if(R[2]-R[0]<20||R[3]-R[1]<20){XP.a=null;draw();return;}
 const fmt=XP.fmt;xpOff();xMsg(fmt==='pdf'?'Préparation du plan PDF…':'Préparation du DXF…');
 if(fmt==='pdf'){try{const r=await geoPdf(R),nm='paris-graphie-plan-'+new Date().toISOString().slice(0,10)+'.pdf';
  await savePdf(r.blob,nm,(h,cb)=>{xMsg(h.replace('PDF prêt','Plan PDF prêt ('+r.nb+' bâtiments, '+r.no+' objets de calques, échelle 1/'+Math.round(r.den/10)*10+' en A3)')+' · <a href="#" id="xclose">fermer</a>');$('#xclose').onclick=ev=>{ev.preventDefault();xMsg('');};if(cb)cb(xmsg);});}
  catch(err){xMsg('Échec de l\'export : '+esc(String(err&&err.message||err)));}draw();return;}
 try{const r=await geoDxf(R),blob=r.blob,nm='paris-graphie-zone-L93-'+new Date().toISOString().slice(0,10)+'.dxf';
  await savePdf(blob,nm,(h,cb)=>{xMsg(h.replace('DXF prêt','DXF prêt ('+r.nb+' bâtiments, '+r.no+' objets de calques, '+r.nl+' calques DXF, Lambert 93)').replace('PDF enregistré','DXF enregistré')+' · <a href="#" id="xclose">fermer</a>');$('#xclose').onclick=ev=>{ev.preventDefault();xMsg('');};if(cb)cb(xmsg);});
 }catch(err){xMsg('Échec de l\'export : '+esc(String(err&&err.message||err)));}
 draw();},true);
function drawXRect(){if(!XP||!XP.a)return;const k=view.k,X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;lx.setTransform(dpr,0,0,dpr,0,0);
 const x0=X(Math.min(XP.a[0],XP.b[0])),x1=X(Math.max(XP.a[0],XP.b[0])),y0=Y(Math.max(XP.a[1],XP.b[1])),y1=Y(Math.min(XP.a[1],XP.b[1]));
 lx.fillStyle='rgba(255,255,255,.12)';lx.fillRect(x0,y0,x1-x0,y1-y0);lx.setLineDash([6,4]);lx.strokeStyle='#fff';lx.lineWidth=1.5;lx.strokeRect(x0,y0,x1-x0,y1-y0);lx.setLineDash([]);
 const wm=Math.abs(XP.b[0]-XP.a[0]),hm=Math.abs(XP.b[1]-XP.a[1]);lx.font='600 12px Inter, system-ui, sans-serif';lx.fillStyle='#fff';lx.textAlign='left';lx.fillText(Math.round(wm)+' × '+Math.round(hm)+' m',x0+4,y0-6);}

