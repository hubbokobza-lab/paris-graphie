/* ---------- héliodon ---------- */
const SUN={on:false,d:null,h:14,acc:null,busy:false};
function parisOffset(y,m,d,h){const ls=mo=>{const x=new Date(Date.UTC(y,mo,31));return 31-x.getUTCDay();};const t=Date.UTC(y,m,d,h);const a=Date.UTC(y,2,ls(2),1),b=Date.UTC(y,9,ls(9),1);return (t-1*3600e3>=a&&t-2*3600e3<b)?2:1;}
function sunPos(date,hour){// date "AAAA-MM-JJ", heure légale de Paris
 const [y,m,d]=date.split('-').map(Number);const off=parisOffset(y,m-1,d,Math.floor(hour));
 const t=Date.UTC(y,m-1,d)+(hour-off)*3600e3;const n=t/864e5-10957.5;// jours depuis J2000
 const L=(280.46+.9856474*n)%360,g=(357.528+.9856003*n)*Math.PI/180;
 const lam=(L+1.915*Math.sin(g)+.02*Math.sin(2*g))*Math.PI/180,eps=(23.439-4e-7*n)*Math.PI/180;
 const ra=Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam)),dec=Math.asin(Math.sin(eps)*Math.sin(lam));
 const gmst=(18.697374558+24.06570982441908*n)%24,lst=(gmst*15+H.lon0)*Math.PI/180,ha=lst-ra,la=H.lat0*Math.PI/180;
 const alt=Math.asin(Math.sin(la)*Math.sin(dec)+Math.cos(la)*Math.cos(dec)*Math.cos(ha));
 const az=Math.atan2(-Math.sin(ha),Math.tan(dec)*Math.cos(la)-Math.sin(la)*Math.cos(ha));
 return {alt,az:(az+2*Math.PI)%(2*Math.PI)};}
function viewBounds(m){const k=view.k;return [view.cx-W/2/k-m,view.cy-Hh/2/k-m,view.cx+W/2/k+m,view.cy+Hh/2/k+m];}
let SHV=new Float32Array(1<<20);
function shadowVerts(sun,vb){// triangles des ombres portées (balayage de chaque emprise), coordonnées monde
 const L=1/Math.tan(Math.max(sun.alt,.03)),dx=-Math.sin(sun.az)*L,dy=-Math.cos(sun.az)*L;let n=0;
 const need=m=>{if(n+m>SHV.length){const a=new Float32Array(Math.max(SHV.length*2,n+m));a.set(SHV.subarray(0,n));SHV=a;}};
 for(let s=0;s<N;s++){const h=HM[s]/10;if(h<=0)continue;const ox=dx*h,oy=dy*h;
  const x0=Math.min(bbox[4*s],bbox[4*s]+ox),x1=Math.max(bbox[4*s+2],bbox[4*s+2]+ox),y0=Math.min(bbox[4*s+1],bbox[4*s+1]+oy),y1=Math.max(bbox[4*s+3],bbox[4*s+3]+oy);
  if(x1<vb[0]||x0>vb[2]||y1<vb[1]||y0>vb[3])continue;
  need((edgS[s+1]-edgS[s])*6+(triS[s+1]-triS[s])*2);
  for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e],b=edg[e+1],ax=pos[2*a],ay=pos[2*a+1],bx=pos[2*b],by=pos[2*b+1];
   SHV[n++]=ax;SHV[n++]=ay;SHV[n++]=bx;SHV[n++]=by;SHV[n++]=bx+ox;SHV[n++]=by+oy;
   SHV[n++]=ax;SHV[n++]=ay;SHV[n++]=bx+ox;SHV[n++]=by+oy;SHV[n++]=ax+ox;SHV[n++]=ay+oy;}
  for(let q=triS[s];q<triS[s+1];q++){const a=idx[q];SHV[n++]=pos[2*a]+ox;SHV[n++]=pos[2*a+1]+oy;}
 }
 return n/2;}
const shBuf=gl.createBuffer(),qBuf=gl.createBuffer();
function glFlat(buf,mode,count,col){gl.useProgram(pFlat);gl.uniform4f(gl.getUniformLocation(pFlat,'u_col'),col[0],col[1],col[2],col[3]);const l=gl.getAttribLocation(pFlat,'a_pos');gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);gl.drawArrays(mode,0,count);}
function setFlatView(cx,cy,sx,sy){gl.useProgram(pFlat);gl.uniform2f(gl.getUniformLocation(pFlat,'u_c'),cx,cy);gl.uniform2f(gl.getUniformLocation(pFlat,'u_s'),sx,sy);}
function viewQuad(){const v=viewBounds(10);gl.bindBuffer(gl.ARRAY_BUFFER,qBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([v[0],v[1],v[2],v[1],v[2],v[3],v[0],v[1],v[2],v[3],v[0],v[3]]),gl.DYNAMIC_DRAW);}
/* moteur d'ombres : carte des hauteurs vue du dessus, puis lancer de rayons vers le soleil (sol et toitures) */
const ZG=S.zg||new Uint16Array(N);
let TOPO=null;const HMAXF=(()=>{let m=0;for(let s=0;s<N;s++)if(HM[s]>m)m=HM[s];return Math.min(150,m/10);})();// {tex,x0,y0,w,h} quand le modèle de terrain est chargé
const HMAXV=(()=>{let m=0;for(let s=0;s<N;s++){const v=HM[s]+ZG[s];if(v>m)m=v;}return Math.min(320,m/10);})();
function loadTopo(){if(TOPO!==null)return;TOPO=false;getBin('mnt.json').then(b=>{const hl=new DataView(b).getUint32(0,true),h=JSON.parse(new TextDecoder().decode(new Uint8Array(b,4,hl)));
 const q=new Uint16Array(b.slice(4+hl)),px=new Uint8Array(h.nx*h.ny*4);for(let i=0;i<q.length;i++){px[4*i]=q[i]>>8;px[4*i+1]=q[i]&255;px[4*i+3]=255;}
 const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,h.nx,h.ny,0,gl.RGBA,gl.UNSIGNED_BYTE,px);
 for(const [p,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
 TOPO={tex:tx,x0:h.x0,y0:h.y0,r:h.r,nx:h.nx,ny:h.ny};draw();}).catch(()=>{TOPO=false;});}
const pT=prog2('attribute vec2 a_q;varying vec2 v_uv;void main(){gl_Position=vec4(a_q,0.,1.);v_uv=a_q*.5+.5;}',
 `precision highp float;varying vec2 v_uv;uniform sampler2D u_t;uniform vec4 u_hr;uniform vec3 u_g0;uniform vec2 u_gn;
 float A(vec2 ij){ij=clamp(ij,vec2(0.),u_gn-1.);vec4 c=texture2D(u_t,(ij+.5)/u_gn);return c.r*255.*256.+c.g*255.;}
 void main(){vec2 w=mix(u_hr.xy,u_hr.zw,v_uv);vec2 f=(w-u_g0.xy)/u_g0.z;vec2 i0=floor(f),u=f-i0;
  float a=mix(mix(A(i0),A(i0+vec2(1.,0.)),u.x),mix(A(i0+vec2(0.,1.)),A(i0+vec2(1.,1.)),u.x),u.y);float d=floor(a+.5);
  gl_FragColor=vec4(floor(d/256.)/255.,mod(d,256.)/255.,0.,1.);}`);
const hBuf=gl.createBuffer(),hBufA=gl.createBuffer();{const a=new Float32Array(totalV),b=new Float32Array(totalV);for(let v=0;v<totalV;v++){const s=vShape[v];a[v]=HM[s]/10;b[v]=(HM[s]+ZG[s])/10;}gl.bindBuffer(gl.ARRAY_BUFFER,hBuf);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,hBufA);gl.bufferData(gl.ARRAY_BUFFER,b,gl.STATIC_DRAW);}
const pH=prog2('attribute vec2 a_pos;attribute float a_h;uniform vec2 u_c;uniform vec2 u_s;varying float v_h;void main(){gl_Position=vec4((a_pos-u_c)*u_s,0.,1.);v_h=a_h;}',
 'precision highp float;varying float v_h;void main(){float d=floor(v_h*10.+.5);gl_FragColor=vec4(floor(d/256.)/255.,mod(d,256.)/255.,1.,1.);}');
const pS=prog2('attribute vec2 a_q;varying vec2 v_uv;void main(){gl_Position=vec4(a_q,0.,1.);v_uv=a_q*.5+.5;}',
 `precision highp float;varying vec2 v_uv;uniform sampler2D u_hm;uniform vec4 u_vw;uniform vec4 u_hr;uniform vec2 u_dir;uniform float u_tan;uniform float u_hmax;uniform float u_mode;uniform float u_c;
 vec4 T(vec2 w){vec2 uv=clamp((w-u_hr.xy)/(u_hr.zw-u_hr.xy),0.,1.);return texture2D(u_hm,uv);}
 float H(vec2 w){vec4 c=T(w);return (c.r*255.*256.+c.g*255.)/10.;}
 void main(){vec2 w=mix(u_vw.xy,u_vw.zw,v_uv);float h0=H(w);bool roof=T(w).b>.5;float md=min(450.,max(0.,u_hmax-h0)/u_tan);float lit=1.;
  for(int i=1;i<=96;i++){float d=md*float(i)/96.;if(d<=0.)break;if(H(w+u_dir*d)>h0+d*u_tan+.4){lit=0.;break;}}
  if(u_mode>.5){gl_FragColor=vec4(lit*u_c,0.,0.,0.);return;}
  if(roof){gl_FragColor=lit>.5?vec4(0.):vec4(.02,.04,.08,.45);}else{gl_FragColor=lit>.5?vec4(1.,.84,.55,.30):vec4(0.);}}`);
const fsq=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,fsq);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
const HMS=Math.min(2048,gl.getParameter(gl.MAX_TEXTURE_SIZE));let hmT=null,hmF=null;
function heightMap(hr){// rend les hauteurs de toutes les emprises dans une texture couvrant hr
 if(!hmT){hmT=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,hmT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,HMS,HMS,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  for(const [p,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);
  hmF=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,hmF);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,hmT,0);}
 gl.bindFramebuffer(gl.FRAMEBUFFER,hmF);gl.viewport(0,0,HMS,HMS);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.BLEND);
 const topo=TOPO&&TOPO.tex;
 if(topo){gl.useProgram(pT);gl.uniform4f(gl.getUniformLocation(pT,'u_hr'),hr[0],hr[1],hr[2],hr[3]);gl.uniform3f(gl.getUniformLocation(pT,'u_g0'),TOPO.x0,TOPO.y0,TOPO.r);gl.uniform2f(gl.getUniformLocation(pT,'u_gn'),TOPO.nx,TOPO.ny);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,TOPO.tex);gl.uniform1i(gl.getUniformLocation(pT,'u_t'),0);
  const lq=gl.getAttribLocation(pT,'a_q');gl.bindBuffer(gl.ARRAY_BUFFER,fsq);gl.enableVertexAttribArray(lq);gl.vertexAttribPointer(lq,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,6);}
 gl.useProgram(pH);gl.uniform2f(gl.getUniformLocation(pH,'u_c'),(hr[0]+hr[2])/2,(hr[1]+hr[3])/2);gl.uniform2f(gl.getUniformLocation(pH,'u_s'),2/(hr[2]-hr[0]),2/(hr[3]-hr[1]));
 bindPos(pH);const lh=gl.getAttribLocation(pH,'a_h');gl.bindBuffer(gl.ARRAY_BUFFER,topo?hBufA:hBuf);gl.enableVertexAttribArray(lh);gl.vertexAttribPointer(lh,1,gl.FLOAT,false,0,0);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idxBuf);gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_INT,0);gl.disableVertexAttribArray(lh);}
function hmRect(){const v=viewBounds(0),cx=(v[0]+v[2])/2,cy=(v[1]+v[3])/2,r=Math.max(v[2]-v[0],v[3]-v[1])/2+460;return [cx-r,cy-r,cx+r,cy+r];}
function shadowPass(sun,hr,mode,c){
 gl.useProgram(pS);const az=sun.az;gl.uniform2f(gl.getUniformLocation(pS,'u_dir'),Math.sin(az),Math.cos(az));
 gl.uniform1f(gl.getUniformLocation(pS,'u_tan'),Math.tan(Math.max(sun.alt,.03)));gl.uniform1f(gl.getUniformLocation(pS,'u_hmax'),(TOPO&&TOPO.tex)?HMAXV:HMAXF);
 const v=[view.cx-W/2/view.k,view.cy-Hh/2/view.k,view.cx+W/2/view.k,view.cy+Hh/2/view.k];gl.uniform4f(gl.getUniformLocation(pS,'u_vw'),v[0],v[1],v[2],v[3]);
 gl.uniform4f(gl.getUniformLocation(pS,'u_hr'),hr[0],hr[1],hr[2],hr[3]);gl.uniform1f(gl.getUniformLocation(pS,'u_mode'),mode);gl.uniform1f(gl.getUniformLocation(pS,'u_c'),c||0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,hmT);gl.uniform1i(gl.getUniformLocation(pS,'u_hm'),0);
 const l=gl.getAttribLocation(pS,'a_q');gl.bindBuffer(gl.ARRAY_BUFFER,fsq);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,6);}
function glSun(){
 if(!SUN.on||SUN.acc||view.k<.45)return;const sun=sunPos(SUN.d,SUN.h);if(sun.alt<=0)return;
 const hr=hmRect();heightMap(hr);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);shadowPass(sun,hr,0);gl.disable(gl.BLEND);}
function drawSun(){
 if(!SUN.on||!SUN.acc||view.k<.45)return;const A=SUN.acc,k=view.k;lx.setTransform(1,0,0,1,0,0);lx.globalAlpha=.85;
 const sx=dpr*((A.x0-view.cx)*k+W/2),sy=dpr*(Hh/2-(A.y1-view.cy)*k);lx.drawImage(A.c,sx,sy,dpr*(A.x1-A.x0)*k,dpr*(A.y1-A.y0)*k);lx.globalAlpha=1;}
function sunLabel(){const s=sunPos(SUN.d,SUN.h),hh=Math.floor(SUN.h),mm=Math.round((SUN.h-hh)*60);
 $('#sunT').textContent=hh+' h '+String(mm).padStart(2,'0')+(s.alt>0?' · soleil à '+Math.round(s.alt*180/Math.PI)+'°, azimut '+Math.round(s.az*180/Math.PI)+'°':' · soleil couché');}
function dayLight(){const st=[];for(let h=3;h<=23;h+=1/3){const s=sunPos(SUN.d,h);if(s.alt>.035)st.push([h,s]);}return st;}// au-dessus de 2°
async function sunAccum(){
 if(SUN.busy)return;if(view.k<.8){$('#sunMsg').textContent='Zoomez à l\'échelle du quartier pour calculer les heures de soleil.';$('#sunLeg').hidden=false;return;}
 SUN.busy=true;const btn=$('#sunA');btn.classList.add('on');const steps=dayLight(),n=steps.length,hrs=n/3,c=Math.max(1,Math.floor(250/Math.max(1,n)))/255;
 const Wp=cv.width,Hp=cv.height,hr=hmRect();
 const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,Wp,Hp,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 const fb=gl.createFramebuffer();
 heightMap(hr);
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.viewport(0,0,Wp,Hp);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);
 for(let i=0;i<n;i++){
  gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,Wp,Hp);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);shadowPass(steps[i][1],hr,1,c);
  if(i%8===7){$('#sunMsg').textContent='Calcul… '+Math.round(i/n*100)+' %';await new Promise(r=>setTimeout(r,0));}
 }
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.disable(gl.BLEND);
 const px=new Uint8Array(Wp*Hp*4);gl.readPixels(0,0,Wp,Hp,gl.RGBA,gl.UNSIGNED_BYTE,px);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(fb);gl.deleteTexture(tex);gl.viewport(0,0,cv.width,cv.height);
 const out=document.createElement('canvas');out.width=Wp;out.height=Hp;const ox=out.getContext('2d'),im=ox.createImageData(Wp,Hp),D_=im.data,CM=[[13,8,135],[106,0,168],[177,42,144],[225,100,98],[252,166,54],[240,249,33]],cm=c*255*n;
 for(let y=0;y<Hp;y++)for(let x=0;x<Wp;x++){const p=((Hp-1-y)*Wp+x)*4,q=(y*Wp+x)*4;
  const f=Math.min(1,px[p]/cm),u0=f*5,i=Math.min(4,Math.floor(u0)),u=u0-i,a=CM[i],b=CM[i+1];D_[q]=a[0]+(b[0]-a[0])*u;D_[q+1]=a[1]+(b[1]-a[1])*u;D_[q+2]=a[2]+(b[2]-a[2])*u;D_[q+3]=255;}
 ox.putImageData(im,0,0);
 SUN.acc={c:out,x0:view.cx-W/2/view.k,x1:view.cx+W/2/view.k,y0:view.cy-Hh/2/view.k,y1:view.cy+Hh/2/view.k};
 SUN.busy=false;btn.classList.remove('on');
 $('#sunMax').textContent=(Math.round(hrs*10)/10).toString().replace('.',',')+' h';$('#sunLeg').hidden=false;
 $('#sunMsg').textContent='Durée d\'ensoleillement le '+SUN.d.split('-').reverse().join('/')+', au sol et sur les toitures (pas de 20 min, soleil au-dessus de 2°). Changer l\'heure ou la date efface le cumul.';draw();}
{const today=new Date(),iso=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');SUN.d=iso;$('#sunD').value=iso;
 const reset=()=>{SUN.acc=null;$('#sunLeg').hidden=true;};
 $('#sunOn').onchange=e=>{SUN.on=e.target.checked;if(SUN.on)loadTopo();$('#sunUI').hidden=!SUN.on;if(SUN.on&&view.k<.45){$('#sunMsg').textContent='';}sunLabel();draw();};
 $('#sunD').onchange=e=>{if(e.target.value){SUN.d=e.target.value;reset();sunLabel();draw();}};
 document.querySelectorAll('.sunq').forEach(b=>b.onclick=()=>{const y=(SUN.d||iso).slice(0,4);SUN.d=y+'-'+b.dataset.d;$('#sunD').value=SUN.d;reset();sunLabel();draw();});
 $('#sunH').oninput=e=>{SUN.h=+e.target.value;reset();sunLabel();draw();};
 let anim=null;$('#sunP').onclick=()=>{const b=$('#sunP');if(anim){clearInterval(anim);anim=null;b.classList.remove('on');b.textContent='▶ Animer la journée';return;}
  reset();b.classList.add('on');b.textContent='■ Arrêter';const st=dayLight();SUN.h=st.length?st[0][0]:6;
  anim=setInterval(()=>{SUN.h+=.25;if(!st.length||SUN.h>st[st.length-1][0]){SUN.h=st.length?st[0][0]:6;}$('#sunH').value=SUN.h;sunLabel();draw();},120);};
 $('#sunA').onclick=()=>{SUN.acc=null;sunAccum();};
 sunLabel();}
