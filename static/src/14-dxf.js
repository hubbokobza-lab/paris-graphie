/* ---------- export DXF géoréférencé (Lambert 93, EPSG:2154), un calque par couche ---------- */
const L93=(()=>{const a=6378137,e=0.0818191910428158,l0=3*Math.PI/180,p0=46.5*Math.PI/180,p1=44*Math.PI/180,p2=49*Math.PI/180;
 const m=p=>Math.cos(p)/Math.sqrt(1-e*e*Math.sin(p)**2),tt=p=>Math.tan(Math.PI/4-p/2)/Math.pow((1-e*Math.sin(p))/(1+e*Math.sin(p)),e/2);
 const n=(Math.log(m(p1))-Math.log(m(p2)))/(Math.log(tt(p1))-Math.log(tt(p2))),F=m(p1)/(n*Math.pow(tt(p1),n)),r0=a*F*Math.pow(tt(p0),n);
 return (lon,lat)=>{const r=a*F*Math.pow(tt(lat*Math.PI/180),n),th=n*(lon*Math.PI/180-l0);return [700000+r*Math.sin(th),6600000+r0-r*Math.cos(th)];};})();
const ACI=(()=>{const L=[[1,[255,0,0]],[2,[255,255,0]],[3,[0,255,0]],[4,[0,255,255]],[5,[0,0,255]],[6,[255,0,255]],[7,[255,255,255]],[8,[128,128,128]],[9,[192,192,192]]];
 const V=[[1,1],[1,.5],[.8,1],[.8,.5],[.6,1],[.6,.5],[.5,1],[.5,.5],[.3,1],[.3,.5]];
 for(let h=0;h<24;h++)V.forEach(([v,s],j)=>{const hh=h*15/60,i=Math.floor(hh),f=hh-i,p=v*(1-s),q=v*(1-s*f),t=v*(1-s*(1-f));const rgb=[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];L.push([10+h*10+j,rgb.map(x=>Math.round(x*255))]);});
 for(let g=0;g<6;g++)L.push([250+g,[51+g*41,51+g*41,51+g*41].map(x=>Math.min(255,x))]);
 return h=>{const v=parseInt((h||'#888888').slice(1,7),16),r=v>>16&255,g=v>>8&255,b=v&255;let best=7,bd=1e9;for(const [i,c] of L){const d=(c[0]-r)**2+(c[1]-g)**2+(c[2]-b)**2;if(d<bd){bd=d;best=i;}}return best;};})();
function lname(s){s=String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'');return (s||'CALQUE').slice(0,31);}
async function geoDxf(R){if(showLbl)await loadLbl();
 const [X0,Y0,X1,Y1]=R,LY=new Map(),ENT=[];
 const kx=111320*Math.cos(H.lat0*Math.PI/180),toL=(x,y)=>L93(H.lon0+x/kx,H.lat0+y/110574);
 const lay=(nm,col)=>{nm=lname(nm);if(!LY.has(nm))LY.set(nm,ACI(col));return nm;};
 const f=v=>v.toFixed(3);
 const pl=(layer,pts,closed)=>{if(pts.length<2)return;ENT.push('0\nPOLYLINE\n8\n'+layer+'\n66\n1\n70\n'+(closed?1:0)+'\n10\n0\n20\n0\n30\n0');
  for(const [x,y] of pts){const [a,b]=toL(x,y);ENT.push('0\nVERTEX\n8\n'+layer+'\n10\n'+f(a)+'\n20\n'+f(b)+'\n30\n0');}ENT.push('0\nSEQEND\n8\n'+layer);};
 const tx=(layer,x,y,h,s,rot)=>{const [a,b]=toL(x,y);ENT.push('0\nTEXT\n8\n'+layer+'\n10\n'+f(a)+'\n20\n'+f(b)+'\n30\n0\n40\n'+h+'\n1\n'+String(s).replace(/[\r\n]/g,' ')+(rot?'\n50\n'+rot:'')+'\n72\n1\n11\n'+f(a)+'\n21\n'+f(b)+'\n31\n0');};
 const inB=b=>b[2]>=X0&&b[0]<=X1&&b[3]>=Y0&&b[1]<=Y1;
 // cadre de la zone
 pl(lay('CADRE_ZONE','#ff0000'),[[X0,Y0],[X1,Y0],[X1,Y1],[X0,Y1]],true);
 // Seine
 if(BASE&&BASE.w){const L_=lay('SEINE_ET_CANAUX','#18344e');for(const poly of BASE.w)for(const r of poly){let b=[1e18,1e18,-1e18,-1e18];for(const p of r){b=[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])];}if(inB(b))pl(L_,r,true);}}
 // bâtiments : un calque par classe du calque actif
 const c=st.crit,neu=c.id==='neu';let nb=0;
 for(let s=0;s<N;s++){if(bbox[4*s+2]<X0||bbox[4*s]>X1||bbox[4*s+3]<Y0||bbox[4*s+1]>Y1)continue;
  const col=shapeCol[s],hid=col===CTX||col===GHOST,ci=c.k[s];
  const L_=hid?lay('BATI_HORS_FILTRE','#555555'):neu?lay('BATI','#8b98a4'):lay('BATI_'+c.lab[ci],c.grad&&ci===0?'#e6a23c':(c.col[ci]||'#8b98a4'));
  let ring=[],prev=-1;
  for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e],b=edg[e+1];if(a!==prev){if(ring.length)pl(L_,ring,true);ring=[[pos[2*a],pos[2*a+1]]];}else ring.push([pos[2*a],pos[2*a+1]]);prev=b;}
  if(ring.length)pl(L_,ring,true);nb++;}
 // calques superposés actifs (dont trottoirs et terre-pleins si affichés)
 let no=0;
 for(const o of OVO){if(!o.on||!o.raw)continue;const j=o.raw,base=o.atlas?'ATLAS_'+o.n:o.n;
  if(j.bg&&o.atlas){const b=j.bg.map(v=>v/10);pl(lay(base+'_EMPRISE','#f2ecdd'),[[b[0],b[1]],[b[2],b[3]],[b[4],b[5]],[b[6],b[7]]],true);}
  for(const ft of j.f){const ci=Math.min(ft[0],o.cols.length-1),lab=o.atlas?'':(o.lab&&o.lab[ci]&&o.lab.length>1?'_'+o.lab[ci]:'');
   if(j.k==='pt'){const x=ft[2]/10,y=ft[3]/10;if(x<X0||x>X1||y<Y0||y>Y1)continue;const L_=lay(base+lab,o.cols[ci]),r=2;pl(L_,[[x-r,y-r],[x+r,y-r],[x+r,y+r],[x-r,y+r]],true);if(ft[1])tx(lay(base+'_TEXTE',o.cols[ci]),x+3,y,1.5,String(ft[1]).slice(0,120));no++;continue;}
   const rings=ft[2].map(decPath);let b=[1e18,1e18,-1e18,-1e18];for(const a of rings)for(let i=0;i<a.length;i+=2){if(a[i]<b[0])b[0]=a[i];if(a[i]>b[2])b[2]=a[i];if(a[i+1]<b[1])b[1]=a[i+1];if(a[i+1]>b[3])b[3]=a[i+1];}
   if(!inB(b))continue;const L_=o.atlas?lay(base+'_'+o.cols[ci].slice(1),o.cols[ci]):lay(base+lab,o.cols[ci]);
   for(const a of rings){const p=[];for(let i=0;i<a.length;i+=2)p.push([a[i],a[i+1]]);pl(L_,p,j.k==='poly');}no++;}
  if(j.L)for(const l of j.L){const x=l[0]/10,y=l[1]/10;if(x<X0||x>X1||y<Y0||y>Y1)continue;tx(lay(base+'_TEXTE','#3a2c1c'),x,y,o.atlas?2.5:1.5,l[2]+(o.lsuf??' m'));}}
 // limites et noms
 if(BASE&&showArr){const LA=lay('LIMITES_ARRONDISSEMENTS','#cccccc'),LQ=lay('LIMITES_QUARTIERS','#999999'),LT=lay('NOMS_QUARTIERS','#ffd27f');
  for(const a of BASE.a)for(const r of a.rings)pl(LA,r,true);for(const q of BASE.q){for(const r of q.rings)pl(LQ,r,true);const [x,y]=q.c;if(x>=X0&&x<=X1&&y>=Y0&&y<=Y1)tx(LT,x,y,6,q.n.toUpperCase());}}
 // noms de rues et numéros
 if(showLbl&&LBL){const LR=lay('NOMS_DE_RUES','#ffffff'),LN=lay('NUMEROS','#e8c06a');
  for(const l of LBL.s||[]){const [x,y,ang,nm]=l;if(x<X0||x>X1||y<Y0||y>Y1)continue;tx(LR,x,y,3,nm,ang);}
  for(const q of LBL.n||[]){const x=q[0]/2,y=q[1]/2;if(x<X0||x>X1||y<Y0||y>Y1)continue;tx(LN,x,y,1.6,q[2]);}}
 // cartouche
 const [la0,lo0]=[H.lat0+Y0/110574,H.lon0+X0/kx],now=new Date();
 const LI=lay('INFO','#ffffff');
 tx(LI,X0,Y0-12,3,'Paris-graphie, extrait du '+now.toLocaleDateString('fr-FR')+' - Lambert 93 (RGF93, EPSG:2154), unites en metres');
 tx(LI,X0,Y0-17,2,'Calque des batiments : '+(neu?'plan neutre':c.name)+'. Sources : Apur, Ville de Paris, BAN, CSTB, DGFiP/IGN, Michel Huard (atlas). Donnees ouvertes (ODbL, Licence Ouverte).');
 // en-tête et tables
 const [ex0,ey0]=toL(X0,Y0-20),[ex1,ey1]=toL(X1,Y1);
 const hd=['0\nSECTION\n2\nHEADER','9\n$ACADVER\n1\nAC1009','9\n$DWGCODEPAGE\n3\nANSI_1252','9\n$INSBASE\n10\n0\n20\n0\n30\n0','9\n$EXTMIN\n10\n'+f(ex0)+'\n20\n'+f(ey0)+'\n30\n0','9\n$EXTMAX\n10\n'+f(ex1)+'\n20\n'+f(ey1)+'\n30\n0','0\nENDSEC',
  '0\nSECTION\n2\nTABLES','0\nTABLE\n2\nLTYPE\n70\n1','0\nLTYPE\n2\nCONTINUOUS\n70\n0\n3\nSolid line\n72\n65\n73\n0\n40\n0.0','0\nENDTAB',
  '0\nTABLE\n2\nLAYER\n70\n'+(LY.size+1),'0\nLAYER\n2\n0\n70\n0\n62\n7\n6\nCONTINUOUS',...[...LY].map(([nm,ci])=>'0\nLAYER\n2\n'+nm+'\n70\n0\n62\n'+ci+'\n6\nCONTINUOUS'),'0\nENDTAB','0\nENDSEC',
  '0\nSECTION\n2\nENTITIES'];
 const txt=hd.concat(ENT,['0\nENDSEC','0\nEOF']).join('\n')+'\n';
 const u8=new Uint8Array(txt.length);for(let i=0;i<txt.length;i++){const k=txt.charCodeAt(i);u8[i]=k<256?k:63;}
 return {blob:new Blob([u8],{type:'application/dxf'}),nb,no,nl:LY.size};
}

