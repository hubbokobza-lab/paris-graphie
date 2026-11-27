/* ---------- PDF vectoriel : plan aux vraies couleurs, coupe (LiDAR compris) ---------- */
const VCPX={'€':'\x80','…':'\x85','‘':'\x91','’':'\x92','“':'\x93','”':'\x94','•':'\x95','●':'\x95','–':'\x96','—':'\x97','œ':'\x9c','Œ':'\x8c','≈':'~','→':'->','·':'\xb7','−':'-','⊥':'perp.','⟂':'perp.','²':'\xb2','×':'\xd7','¼':'\xbc','½':'\xbd','✕':'x','‑':'-'};
const vEnc=t=>String(t).replace(/[\r\n\t]+/g,' ').replace(/[   ]/g,' ').replace(/[\s\S]/g,c=>{const k=c.charCodeAt(0);if(k<128)return (c==='\\'||c==='('||c===')')?'\\'+c:c;if(k<256)return c;return VCPX[c]||'?';});
const VGX=document.createElement('canvas').getContext('2d');
const vWid=(t,sz,b)=>{VGX.font=(b?'bold ':'')+sz+'px Helvetica, Arial, sans-serif';return VGX.measureText(String(t)).width;};
const vN=v=>{const r=Math.round(v*100)/100;return Object.is(r,-0)?'0':String(r);};
function vCol(c){if(!c||c==='none'||c==='transparent')return null;c=String(c).trim();let m;
 if(c[0]==='#'){if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const v=parseInt(c.slice(1,7),16);return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255,1];}
 if((m=c.match(/rgba?\(([^)]+)\)/))){const p=m[1].split(/[,\s/]+/).filter(Boolean).map(Number);return [p[0]/255,p[1]/255,p[2]/255,p.length>3?p[3]:1];}
 return c==='white'?[1,1,1,1]:[0,0,0,1];}
const vRGB=c=>c.slice(0,3).map(v=>v.toFixed(3)).join(' ');
class VPdf{constructor(){this.pages=[];this.gs=new Set([100]);}
 page(w,h){const p={w,h,o:[]};this.pages.push(p);return p;}
 a(al){const k=Math.max(0,Math.min(100,Math.round(al*100)));this.gs.add(k);return '/G'+k+' gs ';}
 async blob(){const enc=s=>{const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u;};
  const zip=async s=>{const u=enc(s);if(typeof CompressionStream==='undefined')return {u,z:false};try{const st=new Blob([u]).stream().pipeThrough(new CompressionStream('deflate'));return {u:new Uint8Array(await new Response(st).arrayBuffer()),z:true};}catch(e){return {u,z:false};}};
  const parts=[],offs=[];let len=0;const push=x=>{const u=typeof x==='string'?enc(x):x;parts.push(u);len+=u.length;};
  const objs=[];const add=v=>{objs.push(v);return objs.length;};
  add('<< /Type /Catalog /Pages 2 0 R >>');add(null);
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const gs='/ExtGState << '+[...this.gs].map(k=>'/G'+k+' << /ca '+(k/100)+' /CA '+(k/100)+' >>').join(' ')+' >>',kids=[];
  for(const p of this.pages){const c=await zip(p.o.join('\n'));const so=add({head:'<< /Length '+c.u.length+(c.z?' /Filter /FlateDecode':'')+' >>\nstream\n',body:c.u});
   kids.push(add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+vN(p.w)+' '+vN(p.h)+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> '+gs+' >> /Contents '+so+' 0 R >>'));}
  objs[1]='<< /Type /Pages /Kids ['+kids.map(k=>k+' 0 R').join(' ')+'] /Count '+kids.length+' >>';
  push('%PDF-1.5\n%\xe2\xe3\xcf\xd3\n');
  objs.forEach((o,i)=>{offs.push(len);push((i+1)+' 0 obj\n');if(typeof o==='string')push(o);else{push(o.head);push(o.body);push('\nendstream');}push('\nendobj\n');});
  const xr=len;push('xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join(''));
  push('trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R /Info << /Producer (Paris-graphie, Bouchaud Architectes) >> >>\nstartxref\n'+xr+'\n%%EOF');
  return new Blob(parts,{type:'application/pdf'});}}
// texte (Helvetica), avec halo éventuel ; x, y en points, ancrage start | middle | end, rotation en degrés
function vText(doc,x,y,t,sz,col,o={}){const b=!!o.b,w=vWid(t,sz,b),an=o.an||'start',r=(o.rot||0)*Math.PI/180,c=Math.cos(r),s=Math.sin(r),dx=an==='middle'?-w/2:an==='end'?-w:0,dy=o.mid?-sz*.35:0;
 const X=x+c*dx-s*dy,Y=y+s*dx+c*dy,tm=[c,s,-s,c,X,Y].map(vN).join(' ')+' Tm',str='('+vEnc(t)+') Tj';let out='';
 if(o.halo){const h=vCol(o.halo);out+='q '+doc.a((o.ha??1)*h[3])+vRGB(h)+' RG '+vN(o.hw||sz*.28)+' w 1 j BT /F'+(b?2:1)+' '+vN(sz)+' Tf 1 Tr '+tm+' '+str+' ET Q\n';}
 const k=vCol(col);return out+'q '+doc.a((o.al??1)*k[3])+vRGB(k)+' rg BT /F'+(b?2:1)+' '+vN(sz)+' Tf 0 Tr '+tm+' '+str+' ET Q';}
function vPath(d){const t=d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g)||[];let i=0,c='',x=0,y=0,sx=0,sy=0;const o=[],n=()=>+t[i++],P=()=>vN(x)+' '+vN(y);
 while(i<t.length){if(/^[a-zA-Z]$/.test(t[i]))c=t[i++];
  switch(c){case 'M':x=n();y=n();sx=x;sy=y;o.push(P()+' m');c='L';break;case 'm':x+=n();y+=n();sx=x;sy=y;o.push(P()+' m');c='l';break;
   case 'L':x=n();y=n();o.push(P()+' l');break;case 'l':x+=n();y+=n();o.push(P()+' l');break;
   case 'H':x=n();o.push(P()+' l');break;case 'h':x+=n();o.push(P()+' l');break;case 'V':y=n();o.push(P()+' l');break;case 'v':y+=n();o.push(P()+' l');break;
   case 'C':{const a=[n(),n(),n(),n(),n(),n()];o.push(a.map(vN).join(' ')+' c');x=a[4];y=a[5];break;}
   case 'Z':case 'z':o.push('h');x=sx;y=sy;break;default:i++;}}
 return o.join(' ');}
// conversion d'un SVG de Paris-graphie (coupe, plan de repérage) en opérateurs PDF vectoriels
function svg2pdf(svgStr,doc,box,opt={}){
 const d=new DOMParser().parseFromString(svgStr,'image/svg+xml'),root=d.documentElement,vb=(root.getAttribute('viewBox')||'0 0 100 100').split(/[\s,]+/).map(Number);
 const s=Math.min(box[2]/vb[2],box[3]/vb[3]),ox=box[0]+(box[2]-vb[2]*s)/2,oy=box[1]+(box[3]-vb[3]*s)/2,O=[];
 O.push('q '+[s,0,0,-s,ox-vb[0]*s,oy+(vb[3]+vb[1])*s].map(vN).join(' ')+' cm 1 j 1 J');
 const clips={};for(const c of root.querySelectorAll('clipPath')){const r=c.querySelector('rect');if(r)clips[c.id]=['x','y','width','height'].map(k=>+r.getAttribute(k)||0);}
 const A=(el,k)=>el.getAttribute(k);
 const paint=(g,st,canFill=true)=>{const f=canFill?vCol(st.fill):null,k=vCol(st.stroke);if(!f&&!k)return;const fa=f?st.op*st.fo*f[3]:0,sa=k?st.op*st.so*k[3]:0,ev=st.fr==='evenodd'?'*':'';
  const sk=k?vRGB(k)+' RG '+vN(st.sw)+' w '+(st.dash?'['+st.dash+'] 0 d ':''):'';
  if(f&&k&&Math.abs(fa-sa)>.01){O.push('q '+vRGB(f)+' rg '+doc.a(fa)+g+' f'+ev+' Q');O.push('q '+sk+doc.a(sa)+g+' S Q');return;}
  O.push('q '+(f?vRGB(f)+' rg ':'')+sk+doc.a(f?fa:sa)+g+(f&&k?' B'+ev:f?' f'+ev:' S')+' Q');};
 const circ=(cx,cy,r)=>{const k=.5523*r;return [cx+r,cy,'m',cx+r,cy+k,cx+k,cy+r,cx,cy+r,'c',cx-k,cy+r,cx-r,cy+k,cx-r,cy,'c',cx-r,cy-k,cx-k,cy-r,cx,cy-r,'c',cx+k,cy-r,cx+r,cy-k,cx+r,cy,'c','h'].map(v=>typeof v==='number'?vN(v):v).join(' ');};
 const mtx=t=>{if(!t)return null;let m=[1,0,0,1,0,0];const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
  for(const [,fn,args] of t.matchAll(/(\w+)\(([^)]*)\)/g)){const p=args.split(/[\s,]+/).filter(Boolean).map(Number);
   if(fn==='translate')m=mul(m,[1,0,0,1,p[0],p[1]||0]);else if(fn==='scale')m=mul(m,[p[0],0,0,p[1]??p[0],0,0]);else if(fn==='matrix')m=mul(m,p);
   else if(fn==='rotate'){const r=p[0]*Math.PI/180,c=Math.cos(r),sn=Math.sin(r),cx=p[1]||0,cy=p[2]||0;m=mul(m,[1,0,0,1,cx,cy]);m=mul(m,[c,sn,-sn,c,0,0]);m=mul(m,[1,0,0,1,-cx,-cy]);}}
  return m;};
 const walk=(el,P)=>{const tag=el.localName;if(!tag||['title','defs','clipPath','desc','style','metadata'].includes(tag))return;
  if(A(el,'display')==='none'||(el.style&&el.style.display==='none'))return;
  const st=Object.assign({},P),g=k=>{const v=A(el,k);return v==null?null:v;};
  if(g('fill')!=null)st.fill=g('fill');if(g('stroke')!=null)st.stroke=g('stroke');if(g('stroke-width')!=null)st.sw=+g('stroke-width');
  if(g('opacity')!=null)st.op*=+g('opacity');if(g('fill-opacity')!=null)st.fo=+g('fill-opacity');if(g('stroke-opacity')!=null)st.so=+g('stroke-opacity');
  if(g('stroke-dasharray')!=null)st.dash=g('stroke-dasharray')==='none'?null:g('stroke-dasharray').split(/[\s,]+/).map(Number).map(vN).join(' ');
  if(g('font-size')!=null)st.fs=+g('font-size');if(g('font-weight')!=null)st.fw=g('font-weight');if(g('text-anchor')!=null)st.ta=g('text-anchor');if(g('fill-rule')!=null)st.fr=g('fill-rule');if(g('paint-order')!=null)st.po=g('paint-order');
  const m=mtx(g('transform')),cp=g('clip-path'),cid=cp&&(cp.match(/#([^)]+)/)||[])[1];let pushed=0;
  if(m){O.push('q '+m.map(vN).join(' ')+' cm');pushed++;}if(cid&&clips[cid]){const r=clips[cid];O.push('q '+r.map(vN).join(' ')+' re W n');pushed++;}
  if(tag==='svg'||tag==='g'){if(el.getAttribute('data-ly')==='lidar'&&opt.lidar){O.push(opt.lidar(doc));}else for(const c of el.children)walk(c,st);}
  else if(tag==='rect'){const w=A(el,'width'),h=A(el,'height'),x=+A(el,'x')||0,y=+A(el,'y')||0,W_=/%/.test(w)?vb[2]:+w,H_=/%/.test(h)?vb[3]:+h;paint(vN(x)+' '+vN(y)+' '+vN(W_)+' '+vN(H_)+' re',st);}
  else if(tag==='line')paint(vN(+A(el,'x1'))+' '+vN(+A(el,'y1'))+' m '+vN(+A(el,'x2'))+' '+vN(+A(el,'y2'))+' l',st,false);
  else if(tag==='circle')paint(circ(+A(el,'cx'),+A(el,'cy'),+A(el,'r')),st);
  else if(tag==='path'){const dd=A(el,'d');if(dd)paint(vPath(dd),st);}
  else if(tag==='text'){const sp=[...el.children].filter(c=>c.localName==='tspan'),x0=+A(el,'x')||0;let cy=+A(el,'y')||0;
   const one=(t,x,y,S)=>{if(!t.trim())return;const b=S.fw==='bold'||+S.fw>=600,w=vWid(t,S.fs,b),xx=S.ta==='middle'?x-w/2:S.ta==='end'?x-w:x,tm='1 0 0 -1 '+vN(xx)+' '+vN(y)+' Tm',str='('+vEnc(t)+') Tj',f=vCol(S.fill),k=vCol(S.stroke);
    if(k&&S.po==='stroke')O.push('q '+doc.a(S.op*S.so*k[3])+vRGB(k)+' RG '+vN(S.sw)+' w BT /F'+(b?2:1)+' '+vN(S.fs)+' Tf 1 Tr '+tm+' '+str+' ET Q');
    if(f)O.push('q '+doc.a(S.op*S.fo*f[3])+vRGB(f)+' rg BT /F'+(b?2:1)+' '+vN(S.fs)+' Tf 0 Tr '+tm+' '+str+' ET Q');};
   if(!sp.length)one([...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(''),x0,cy,st);
   else for(const t of sp){const S=Object.assign({},st);if(A(t,'font-weight'))S.fw=A(t,'font-weight');if(A(t,'fill'))S.fill=A(t,'fill');cy+=+(A(t,'dy')||0);one(t.textContent,A(t,'x')!=null?+A(t,'x'):x0,cy,S);}}
  else if(tag==='image'&&opt.lidar&&el.closest('[data-ly="lidar"]'))O.push(opt.lidar(doc));
  for(let i=0;i<pushed;i++)O.push('Q');};
 walk(root,{fill:'#000',stroke:null,sw:1,op:1,fo:1,so:1,dash:null,fs:10,fw:'400',ta:'start',fr:'nonzero',po:''});
 O.push('Q');return {ops:O.join('\n'),s,ox,oy,vb};}
// plan vectoriel aux couleurs de la carte (rectangle R en coordonnées de la carte, mètres)
async function geoPdf(R){if(showLbl)await loadLbl();
 const [X0,Y0,X1,Y1]=R,wm=X1-X0,hm=Y1-Y0,land=wm>=hm*1.05,PW_=land?1190.55:841.89,PH_=land?841.89:1190.55,M=28,top=46,bot=96;
 const aw=PW_-2*M,ah=PH_-2*M-top-bot,s=Math.min(aw/wm,ah/hm),mx=M+(aw-wm*s)/2,my=M+bot+(ah-hm*s)/2,doc=new VPdf(),p=doc.page(PW_,PH_),O=p.o;
 const TX=x=>mx+(x-X0)*s,TY=y=>my+(y-Y0)*s,T=(x,y)=>vN(TX(x))+' '+vN(TY(y));
 const ringA=(a,close)=>{let o=T(a[0],a[1])+' m';for(let i=2;i<a.length;i+=2)o+=' '+T(a[i],a[i+1])+' l';return o+(close?' h':'');};
 const ringP=(r,close)=>{let o=T(r[0][0],r[0][1])+' m';for(let i=1;i<r.length;i++)o+=' '+T(r[i][0],r[i][1])+' l';return o+(close?' h':'');};
 const inB=b=>b[2]>=X0&&b[0]<=X1&&b[3]>=Y0&&b[1]<=Y1,BG=vCol('#0f1a24'),fw=wm*s,fh=hm*s,den=2834.65/s;
 O.push('q '+vRGB(BG)+' rg '+vN(mx)+' '+vN(my)+' '+vN(fw)+' '+vN(fh)+' re f Q');
 O.push('q '+vN(mx)+' '+vN(my)+' '+vN(fw)+' '+vN(fh)+' re W n 1 j 1 J');
 // Seine et canaux
 if(BASE&&BASE.w){const o=[];for(const poly of BASE.w)for(const r of poly){let b=[1e18,1e18,-1e18,-1e18];for(const q of r){b=[Math.min(b[0],q[0]),Math.min(b[1],q[1]),Math.max(b[2],q[0]),Math.max(b[3],q[1])];}if(inB(b))o.push(ringP(r,true));}if(o.length)O.push('q 0.094 0.204 0.306 rg '+o.join(' ')+' f* Q');}
 // bâtiments, groupés par couleur
 const BY=new Map();let nb=0;
 for(let s_=0;s_<N;s_++){if(bbox[4*s_+2]<X0||bbox[4*s_]>X1||bbox[4*s_+3]<Y0||bbox[4*s_+1]>Y1)continue;const c=shapeCol[s_];let a=BY.get(c);if(!a)BY.set(c,a=[]);
  let ring=[],prev=-1;const rs=[];for(let e=edgS[s_];e<edgS[s_+1];e+=2){const a_=edg[e],b_=edg[e+1];if(a_!==prev){if(ring.length)rs.push(ring);ring=[[pos[2*a_],pos[2*a_+1]]];}else ring.push([pos[2*a_],pos[2*a_+1]]);prev=b_;}if(ring.length)rs.push(ring);
  a.push(rs.map(r=>ringP(r,true)).join(' '));nb++;}
 const lw=Math.max(.12,Math.min(.5,s*.12));
 for(const [c,a] of BY){const rgb=[(c&255)/255,(c>>8&255)/255,(c>>16&255)/255];O.push('q '+vRGB(rgb)+' rg 0.04 0.07 0.1 RG '+vN(lw)+' w '+doc.a(1)+a.join(' ')+' f* Q');O.push('q 0.04 0.07 0.1 RG '+vN(lw)+' w '+doc.a(.55)+a.join(' ')+' S Q');}
 // calques superposés affichés
 let no=0;const px=v=>v*.55;
 for(const o of OVO){if(!o.on||!o.raw)continue;const j=o.raw;
  if(j.bg&&o.atlas){const b=j.bg.map(v=>v/10),c=vCol(ATLBG);O.push('q '+vRGB(c)+' rg '+doc.a(o.a)+ringA(b,true)+' f Q');}
  for(const ft of j.f){const ci=Math.min(ft[0],o.cols.length-1),col=vCol(o.cols[ci]);if(!col)continue;
   if(j.k==='pt'){const x=ft[2]/10,y=ft[3]/10;if(x<X0||x>X1||y<Y0||y>Y1)continue;const r=px(o.id==='mob'?4+ci*1.5:(o.r||o.rr||4)),k=.5523*r,cx=TX(x),cy=TY(y);
    O.push('q '+vRGB(col)+' rg 0.059 0.102 0.141 RG 0.5 w '+doc.a(1)+[cx+r,cy,'m',cx+r,cy+k,cx+k,cy+r,cx,cy+r,'c',cx-k,cy+r,cx-r,cy+k,cx-r,cy,'c',cx-r,cy-k,cx-k,cy-r,cx,cy-r,'c',cx+k,cy-r,cx+r,cy-k,cx+r,cy,'c'].map(v=>typeof v==='number'?vN(v):v).join(' ')+(o.r?' f':' B')+' Q');no++;continue;}
   const rings=ft[2].map(decPath);let b=[1e18,1e18,-1e18,-1e18];for(const a of rings)for(let i=0;i<a.length;i+=2){if(a[i]<b[0])b[0]=a[i];if(a[i]>b[2])b[2]=a[i];if(a[i+1]<b[1])b[1]=a[i+1];if(a[i+1]>b[3])b[3]=a[i+1];}
   if(!inB(b))continue;const g_=rings.map(a=>ringA(a,j.k==='poly')).join(' ');no++;
   if(j.k==='poly'){if(o.atlas){O.push('q '+vRGB(col)+' rg '+doc.a(o.a)+g_+' f* Q');continue;}
    if(o.a===0){O.push('q '+vRGB(col)+' RG 0.4 w '+doc.a(.5)+g_+' S Q');continue;}
    const fa=o.hatch?(o.hal?.06:.13)+.15:o.a;O.push('q '+vRGB(col)+' rg '+doc.a(fa)+g_+' f* Q');O.push('q '+vRGB(col)+' RG 0.45 w '+doc.a(Math.min(1,o.a+.4))+g_+' S Q');}
   else O.push('q '+vRGB(col)+' RG '+vN(px(o.lw?o.lw[ci]:o.lwa||1.7))+' w '+doc.a(.95)+g_+' S Q');}
  if(j.L){const lc=o.lcol||o.cols[1]||o.cols[0];for(const l of j.L){const x=l[0]/10,y=l[1]/10;if(x<X0||x>X1||y<Y0||y>Y1)continue;O.push(vText(doc,TX(x),TY(y),l[2]+(o.lsuf??' m'),5.5,o.atlas?'#3a2c1c':lc,{an:'middle',mid:1,b:1,halo:o.atlas?'rgba(242,236,221,.92)':'rgba(15,26,36,.9)',hw:1.6}));}}}
 // limites d'arrondissement
 if(BASE&&showArr){const o=[];for(const a of BASE.a)for(const r of a.rings)o.push(ringP(r,true));O.push('q 0.92 0.95 0.97 RG 0.9 w [4 3] 0 d '+doc.a(.45)+o.join(' ')+' S Q');}
 // bâtiment sélectionné
 if(sel>=0&&!(bbox[4*sel+2]<X0||bbox[4*sel]>X1||bbox[4*sel+3]<Y0||bbox[4*sel+1]>Y1)){let o='';for(let e=edgS[sel];e<edgS[sel+1];e+=2){const a_=edg[e],b_=edg[e+1];o+=T(pos[2*a_],pos[2*a_+1])+' m '+T(pos[2*b_],pos[2*b_+1])+' l ';}O.push('q 0.059 0.102 0.141 RG 3 w '+o+'S Q');O.push('q 1 1 1 RG 1.4 w '+o+'S Q');}
 // numéros et noms de rues
 if(showLbl&&LBL){if(s>=1.1)for(const q of LBL.n||[]){const x=q[0]/2,y=q[1]/2;if(x<X0||x>X1||y<Y0||y>Y1)continue;O.push(vText(doc,TX(x),TY(y),q[2],Math.min(7,3+s*.9),'#ffd9a0',{an:'middle',mid:1,halo:'rgba(15,26,36,.92)',hw:1.4}));}
  if(s>=.18){const fs=Math.min(9,Math.max(5.5,3+s*2));for(const l of LBL.s||[]){const [x,y,ang,nm0,len]=l;if(x<X0||x>X1||y<Y0||y>Y1)continue;let nm=nm0;if(vWid(nm,fs,1)>len*s*1.05)nm=shortName(nm);if(vWid(nm,fs,1)>len*s*1.05)continue;
   let a=ang||0;a=((a%360)+540)%360-180;if(a>90)a-=180;if(a<-90)a+=180;O.push(vText(doc,TX(x),TY(y),nm,fs,'#d7e4ee',{an:'middle',mid:1,b:1,rot:a,halo:'rgba(15,26,36,.95)',hw:1.8}));}}}
 O.push('Q');
 // cadre, titre, échelle, nord, légende, sources
 O.push('q 0.10 0.16 0.22 RG 0.8 w '+vN(mx)+' '+vN(my)+' '+vN(fw)+' '+vN(fh)+' re S Q');
 const c=st.crit,neu=c.id==='neu',nice=[5,10,20,25,50,100,200,250,500,1000,2000],sb=nice.find(v=>v*s>=70)||nice[nice.length-1],now=new Date();
 O.push(vText(doc,M,PH_-M-14,'Paris-graphie · plan du '+now.toLocaleDateString('fr-FR'),14,'#1a486a',{b:1}));
 O.push(vText(doc,M,PH_-M-30,'Calque : '+(neu?'plan neutre':c.name)+' · zone de '+Math.round(wm)+' × '+Math.round(hm)+' m · échelle 1/'+Math.round(den/10)*10+' en '+(land?'A3 paysage':'A3 portrait'),9,'#55606b'));
 const by=M+bot-30;O.push('q 0.10 0.16 0.22 rg '+vN(M)+' '+vN(by)+' '+vN(sb*s/2)+' 4 re f 1 1 1 rg '+vN(M+sb*s/2)+' '+vN(by)+' '+vN(sb*s/2)+' 4 re f 0.10 0.16 0.22 RG 0.6 w '+vN(M)+' '+vN(by)+' '+vN(sb*s)+' 4 re S Q');
 O.push(vText(doc,M,by+8,'0',7,'#1d2a36'));O.push(vText(doc,M+sb*s,by+8,sb+' m',7,'#1d2a36',{an:'middle'}));
 {const nx=mx+fw-20,ny=my+fh-26;O.push('q 1 1 1 rg 0.10 0.16 0.22 RG 0.6 w '+vN(nx-10)+' '+vN(ny-12)+' 20 30 re B 0.10 0.16 0.22 rg '+vN(nx)+' '+vN(ny+12)+' m '+vN(nx-5)+' '+vN(ny-6)+' l '+vN(nx)+' '+vN(ny-2)+' l '+vN(nx+5)+' '+vN(ny-6)+' l h f Q');O.push(vText(doc,nx,ny+12.5,'N',7,'#1d2a36',{an:'middle',b:1}));}
 if(!neu){const it=c.lab.map((l,i)=>[l,c.grad&&i===0?'#e6a23c':(c.col[i]||'#8b98a4'),c.cnt?c.cnt[i]:1]).filter(e=>e[2]>0).slice(0,18),cw=Math.max(110,Math.min(200,(PW_-2*M-180)/Math.ceil(it.length/3)));
  it.forEach((e,i)=>{const x=M+180+Math.floor(i/3)*cw,y=M+bot-22-(i%3)*12,k=vCol(e[1]);O.push('q '+vRGB(k)+' rg '+vN(x)+' '+vN(y-1)+' 8 7 re f Q');O.push(vText(doc,x+12,y,String(e[0]).slice(0,40),7,'#1d2a36'));});}
 O.push(vText(doc,M,M+14,'Bouchaud Architectes · Paris-graphie (https://www.bouchaudarchitectes.com/hors-piste/paris-graphie). Plan non géoréférencé, à usage indicatif ; pour un plan en Lambert 93, utiliser l\'export DXF.',6.5,'#7a8794'));
 O.push(vText(doc,M,M+5,'Sources : Apur (emprises, hauteurs), Ville de Paris (PLU, voirie, arbres), Base Adresse Nationale, IGN, DGFiP, CSTB. Données ouvertes (ODbL, Licence Ouverte).',6.5,'#7a8794'));
 return {blob:await doc.blob(),nb,no,den};}
