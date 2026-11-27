function drawLabels(){
 lx.setTransform(1,0,0,1,0,0);lx.clearRect(0,0,lb.width,lb.height);
 drawSun();
 drawOv();
 drawArr();drawSelOutline();drawXRect();drawXCut();drawMeas();drawSnap();markLegend();
 if(!LBL&&showLbl&&view.k>=.16)loadLbl();
 if(!LBL||!showLbl)return;
 const k=view.k;
 lx.setTransform(dpr,0,0,dpr,0,0);lx.textAlign='center';lx.textBaseline='middle';lx.lineJoin='round';
 const X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;
 const x0=view.cx-W/2/k-60,x1=view.cx+W/2/k+60,y0=view.cy-Hh/2/k-60,y1=view.cy+Hh/2/k+60;
 /* numéros */
 if(k>=1.25){
  const fs=Math.min(13,8+k*.9);lx.font='500 '+fs+'px "Avenir Next",Avenir,"Segoe UI",sans-serif';
  lx.lineWidth=3;lx.strokeStyle='rgba(15,26,36,.92)';lx.fillStyle='#ffd9a0';
  const seen=new Set(),cell=fs*2.6;
  for(const p of LBL.n){
   const wx=p[0]/2,wy=p[1]/2;if(wx<x0||wx>x1||wy<y0||wy>y1)continue;
   const sx=X(wx),sy=Y(wy),key=Math.round(sx/cell)*10000+Math.round(sy/(fs*1.4));
   if(seen.has(key))continue;seen.add(key);
   lx.strokeText(p[2],sx,sy);lx.fillText(p[2],sx,sy);
  }
 }
 /* rues */
 if(k>=.16){
  const fs=Math.max(10,Math.min(15,9+k*2.2));lx.font='600 '+fs+'px "Avenir Next",Avenir,"Segoe UI",sans-serif';
  lx.lineWidth=3.5;lx.strokeStyle='rgba(15,26,36,.95)';lx.fillStyle=k>=1.7?'#a9c4d8':'#d7e4ee';
  const placed=[];const hit=(r)=>{for(const q of placed){if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1])return true;}return false;};
  for(const l of LBL.s){
   const wx=l[0],wy=l[1];if(wx<x0||wx>x1||wy<y0||wy>y1)continue;
   let nm=l[3];let w=lx.measureText(nm).width;const len=l[4]*k;
   if(w>len*1.05){nm=shortName(nm);w=lx.measureText(nm).width;}
   if(w>len*1.05)continue;
   const sx=X(wx),sy=Y(wy),a=-l[2]*Math.PI/180,c=Math.abs(Math.cos(a)),s_=Math.abs(Math.sin(a));
   const hw=(w*c+fs*s_)/2+3,hh=(w*s_+fs*c)/2+2,r=[sx-hw,sy-hh,sx+hw,sy+hh];
   if(hit(r))continue;placed.push(r);
   lx.save();lx.translate(sx,sy);lx.rotate(a);lx.strokeText(nm,0,0);lx.fillText(nm,0,0);lx.restore();
  }
 }
}
function scaleBar(){
 const target=110/view.k,p=Math.pow(10,Math.floor(Math.log10(target)));let m=p;for(const f of [1,2,5,10]){if(f*p<=target)m=f*p;}
 $('#scB').style.width=(m*view.k)+'px';$('#scT').textContent=m>=1000?(m/1000)+' km':m+' m';
}
function w2s(wx,wy){return [(wx-view.cx)*view.k+W/2,(view.cy-wy)*view.k+Hh/2];}
function s2w(x,y){const r=cv.getBoundingClientRect();return [view.cx+(x-r.left-W/2)/view.k,view.cy-(y-r.top-Hh/2)/view.k];}
function zoomAt(x,y,f){const [wx,wy]=s2w(x,y);const r=cv.getBoundingClientRect();view.k=Math.max(fitK*.12,Math.min(14,view.k*f));view.cx=wx-(x-r.left-W/2)/view.k;view.cy=wy+(y-r.top-Hh/2)/view.k;draw();}
const pts=new Map();let moved=false,pinch0=0,k0=1;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=false;if(pts.size===2){const [a,b]=[...pts.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);k0=view.k;}});
cv.addEventListener('pointermove',e=>{
 if(pts.has(e.pointerId)){
  const o=pts.get(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);
  if(pts.size===2){const [a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);const f=d/pinch0*k0/view.k;zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,f);moved=true;return;}
  const dx=e.clientX-o[0],dy=e.clientY-o[1];if(Math.abs(dx)+Math.abs(dy)>0){moved=true;view.cx-=dx/view.k;view.cy+=dy/view.k;draw();}
 }else if(e.pointerType==='mouse'){hover(e.clientX,e.clientY);ovTip(e.clientX,e.clientY);}
});
function urlClick(wx,wy){const tol=9/view.k;for(const o of OVO){if(!o.on||!o.d||!o.d.pts||!o.raw||!o.raw.u)continue;let best=null,bd=tol*tol;for(const p of o.d.pts){const dx=p[0]-wx,dy=p[1]-wy,dd=dx*dx+dy*dy;if(dd<bd&&p[4]){bd=dd;best=p;}}if(best){window.open(best[4],'_blank','noopener');return true;}}return false;}
function p70Click(wx,wy){const o=OVO.find(o=>o.id==='p70');if(!o||!o.on)return false;const q=p70Of(H.lon0+wx/(111320*Math.cos(H.lat0*Math.PI/180)),H.lat0+wy/110574);if(!q)return false;window.open('https://paris1970.fr/carre/'+q[0],'_blank','noopener');return true;}
function end(e){const was=pts.size===1&&!moved;pts.delete(e.pointerId);if(was){if(urlClick(...s2w(e.clientX,e.clientY))||p70Click(...s2w(e.clientX,e.clientY)))return;ovTip(e.clientX,e.clientY);const [wx,wy]=s2w(e.clientX,e.clientY);const s=pick(wx,wy);if(s>=0&&s!==sel){sel=s;showCard(s,true);}else{sel=-1;hov=-1;showCard(e.pointerType==='mouse'?pick(wx,wy):-1,false);}draw();}}
cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',e=>pts.delete(e.pointerId));
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)));},{passive:false});
cv.addEventListener('dblclick',e=>zoomAt(e.clientX,e.clientY,2));
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&hov>=0){hov=-1;draw();}});
function hover(x,y){if(sel>=0)return;const [wx,wy]=s2w(x,y);const s=pick(wx,wy);if(s!==hov){hov=s;draw();}}
$('#cx').onclick=()=>{sel=-1;hov=-1;showCard(-1);draw();};addEventListener('keydown',e=>{if(e.key==='Escape'&&sel>=0){sel=-1;showCard(-1);draw();}});
$('#zi').onclick=()=>zoomAt(innerWidth/2,innerHeight/2,1.6);$('#zo').onclick=()=>zoomAt(innerWidth/2,innerHeight/2,1/1.6);$('#zr').onclick=()=>{fit();draw();};
const esc=x=>String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
