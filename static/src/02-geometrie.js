/* ---------- géométrie ---------- */
const kx=H.q*111320*Math.cos(H.lat0*Math.PI/180), ky=H.q*110574;
let totalV=0;for(let i=0;i<S.rl.length;i++)totalV+=S.rl[i];
const pos=new Float32Array(totalV*2), vShape=new Uint32Array(totalV);
let idx=new Uint32Array(totalV*3), edg=new Uint32Array(totalV*2);
const triS=new Uint32Array(N+1), edgS=new Uint32Array(N+1), vS=new Uint32Array(N+1);
const bbox=new Float32Array(N*4), area=new Float32Array(N);
{
 let ri=0,dp=0,vp=0,ip=0,ep=0;
 let gx0=1e9,gy0=1e9,gx1=-1e9,gy1=-1e9;
 for(let s=0;s<N;s++){
  if(s%7000===0){prog("Construction de la géométrie…",.1+.8*s/N);await tick();}
  triS[s]=ip;edgS[s]=ep;vS[s]=vp;
  const R=S.nr[s],co=[],holes=[],rings=[];
  let a=0;
  for(let r=0;r<R;r++,ri++){
   const L=S.rl[ri],st=co.length/2;
   if(r>0)holes.push(st);
   let qx=S.ab[2*ri],qy=S.ab[2*ri+1];
   co.push(qx*kx,qy*ky);
   for(let k=1;k<L;k++){qx+=S.dl[dp++];qy+=S.dl[dp++];co.push(qx*kx,qy*ky);}
   rings.push([st,L]);
  }
  /* anneaux : contours extérieurs (bâtiment en plusieurs parties) ou cours, selon l'imbrication */
  const inR=(px,py,st,L)=>{let c=false;for(let k=0,j=L-1;k<L;j=k++){const xi=co[2*(st+k)],yi=co[2*(st+k)+1],xj=co[2*(st+j)],yj=co[2*(st+j)+1];if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))c=!c;}return c;};
  const EX=[];
  for(let r=0;r<rings.length;r++){const [st,L]=rings[r];let ra=0;for(let k=0;k<L;k++){const j=(k+1)%L;ra+=co[2*(st+k)]*co[2*(st+j)+1]-co[2*(st+j)]*co[2*(st+k)+1];}ra=Math.abs(ra)/2;
   if(r===0){EX.push({r:0,h:[]});a+=ra;continue;}
   const px=co[2*st],py=co[2*st+1];let d=0,par=null;
   for(let q=0;q<r;q++)if(inR(px,py,rings[q][0],rings[q][1])){d++;const e=EX.find(e=>e.r===q);if(e)par=e;}
   if(d%2===0){EX.push({r,h:[]});a+=ra;}else{(par||EX[0]).h.push(r);a-=ra;}}
  area[s]=Math.max(0,a);
  const nv=co.length/2;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const outerN=rings[0][1];
  for(let i=0;i<nv;i++){
   const x=co[2*i],y=co[2*i+1];
   pos[2*(vp+i)]=x;pos[2*(vp+i)+1]=y;vShape[vp+i]=s;
   if(i<outerN||EX.length>1){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  }
  bbox[4*s]=x0;bbox[4*s+1]=y0;bbox[4*s+2]=x1;bbox[4*s+3]=y1;
  if(x0<gx0)gx0=x0;if(y0<gy0)gy0=y0;if(x1>gx1)gx1=x1;if(y1>gy1)gy1=y1;
  if(EX.length===1&&EX[0].h.length===rings.length-1){const tri=earcut(co,holes.length?holes:null,2);for(let t=0;t<tri.length;t++)idx[ip++]=vp+tri[t];}
  else for(const e of EX){const m=[],f=[],hh=[];for(const r of [e.r,...e.h]){const [st,L]=rings[r];if(r!==e.r)hh.push(m.length);for(let k=0;k<L;k++){m.push(st+k);f.push(co[2*(st+k)],co[2*(st+k)+1]);}}
   const tri=earcut(f,hh.length?hh:null,2);for(let t=0;t<tri.length;t++)idx[ip++]=vp+m[tri[t]];}
  for(const [st,L] of rings)for(let k=0;k<L;k++){edg[ep++]=vp+st+k;edg[ep++]=vp+st+(k+1)%L;}
  vp+=nv;
 }
 triS[N]=ip;edgS[N]=ep;vS[N]=vp;
 idx=idx.slice(0,ip);edg=edg.slice(0,ep);
 var EXT=[gx0,gy0,gx1,gy1];
}
/* grille de sélection */
const CELL=64,grid=new Map();
for(let s=0;s<N;s++){
 const c0=Math.floor(bbox[4*s]/CELL),c1=Math.floor(bbox[4*s+2]/CELL),r0=Math.floor(bbox[4*s+1]/CELL),r1=Math.floor(bbox[4*s+3]/CELL);
 for(let cx=c0;cx<=c1;cx++)for(let cy=r0;cy<=r1;cy++){const k=cx*8192+cy;let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(s);}
}
function pick(wx,wy){
 const a=grid.get(Math.floor(wx/CELL)*8192+Math.floor(wy/CELL));if(!a)return -1;
 let best=-1,ba=1e18;
 for(const s of a){
  if(wx<bbox[4*s]||wx>bbox[4*s+2]||wy<bbox[4*s+1]||wy>bbox[4*s+3])continue;
  for(let t=triS[s];t<triS[s+1];t+=3){
   const i0=idx[t]*2,i1=idx[t+1]*2,i2=idx[t+2]*2;
   const ax=pos[i0],ay=pos[i0+1],bx=pos[i1],by=pos[i1+1],cx=pos[i2],cy=pos[i2+1];
   const d1=(wx-bx)*(ay-by)-(ax-bx)*(wy-by),d2=(wx-cx)*(by-cy)-(bx-cx)*(wy-cy),d3=(wx-ax)*(cy-ay)-(cx-ax)*(wy-ay);
   if(!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0))){if(area[s]<ba){ba=area[s];best=s;}break;}
  }
 }
 return best;
}

