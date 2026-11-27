/* ---------- WebGL ---------- */
const cv=$('#cv');
const gl=cv.getContext('webgl',{antialias:false,alpha:false,stencil:true});
if(!gl||!gl.getExtension('OES_element_index_uint')){fail("WebGL n'est pas disponible dans ce navigateur.");return;}
function prog2(vs,fs){const p=gl.createProgram();for(const [t,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh);}gl.linkProgram(p);return p;}
const pFill=prog2('attribute vec2 a_pos;attribute vec4 a_col;uniform vec2 u_c;uniform vec2 u_s;varying vec4 v;void main(){gl_Position=vec4((a_pos-u_c)*u_s,0.,1.);v=a_col;}','precision mediump float;varying vec4 v;void main(){gl_FragColor=v;}');
const pFlat=prog2('attribute vec2 a_pos;uniform vec2 u_c;uniform vec2 u_s;void main(){gl_Position=vec4((a_pos-u_c)*u_s,0.,1.);}','precision mediump float;uniform vec4 u_col;void main(){gl_FragColor=u_col;}');
const posBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,posBuf);gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);
const colBuf=gl.createBuffer();
const idxBuf=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idxBuf);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
const edgBuf=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,edgBuf);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,edg,gl.STATIC_DRAW);
let BASE=null,showArr=true;const wBuf=gl.createBuffer(),wIdx=gl.createBuffer();let wN=0;
{const KX=111320*Math.cos(H.lat0*Math.PI/180),KY=110574,P=c=>[(c[0]-H.lon0)*KX,(c[1]-H.lat0)*KY];
 getJson('base.json').then(j=>{
  const vs=[],ix=[];
  for(const poly of j.w){const flat=[],holes=[];let n=0;poly.forEach((r,i)=>{if(i)holes.push(n);for(const c of r){const p=P(c);flat.push(p[0],p[1]);n++;}});const b=vs.length/2;for(const k of earcut(flat,holes))ix.push(b+k);for(const v of flat)vs.push(v);}
  gl.bindBuffer(gl.ARRAY_BUFFER,wBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vs),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,wIdx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(ix),gl.STATIC_DRAW);wN=ix.length;
  BASE={w:j.w.map(poly=>poly.map(r=>r.map(P))),a:j.a.map(([n,polys,c])=>({n,rings:polys.map(p=>p[0].map(P)),c:P(c)})),q:(j.q||[]).map(([n,polys,c])=>({n,rings:polys.map(p=>p[0].map(P)),c:P(c)}))};draw();
 }).catch(()=>{});}
const view={cx:(EXT[0]+EXT[2])/2,cy:(EXT[1]+EXT[3])/2,k:.05};window.__pg={view};
let W=1,Hh=1,dpr=1,hov=-1,sel=-1,fitK=.05;
const lb=$('#lb'),lx=lb.getContext('2d');
function resize(){dpr=Math.min(window.devicePixelRatio||1,2);W=cv.clientWidth;Hh=cv.clientHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(Hh*dpr);lb.width=cv.width;lb.height=cv.height;}
function sheetH(){const c=$('#card'),p=$('#panel');return !isMob()?0:(c&&!c.hidden?c.offsetHeight:p.offsetHeight);}
function fit(){const pw=isMob()?0:340,sh=sheetH();const kx2=(W-pw-(isMob()?24:40))/(EXT[2]-EXT[0]),ky2=(Hh-sh-40)/(EXT[3]-EXT[1]);fitK=Math.min(kx2,ky2);view.k=fitK;view.cx=(EXT[0]+EXT[2])/2-pw/2/fitK;view.cy=(EXT[1]+EXT[3])/2-sh/2/fitK;}
let rq=0;function draw(){if(!rq)rq=requestAnimationFrame(render);}
function bindPos(p){const l=gl.getAttribLocation(p,'a_pos');gl.bindBuffer(gl.ARRAY_BUFFER,posBuf);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);}
function render(){
 rq=0;gl.viewport(0,0,cv.width,cv.height);gl.clearColor(15/255,26/255,36/255,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
 const sx=2*view.k/W,sy=2*view.k/Hh;
 const sx_=2*view.k/W,sy_=2*view.k/Hh;
 if(wN){gl.disable(gl.BLEND);gl.useProgram(pFlat);gl.uniform2f(gl.getUniformLocation(pFlat,'u_c'),view.cx,view.cy);gl.uniform2f(gl.getUniformLocation(pFlat,'u_s'),sx_,sy_);gl.uniform4f(gl.getUniformLocation(pFlat,'u_col'),24/255,52/255,78/255,1);const l=gl.getAttribLocation(pFlat,'a_pos');gl.bindBuffer(gl.ARRAY_BUFFER,wBuf);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,wIdx);gl.drawElements(gl.TRIANGLES,wN,gl.UNSIGNED_INT,0);}
 gl.disable(gl.BLEND);gl.useProgram(pFill);
 gl.uniform2f(gl.getUniformLocation(pFill,'u_c'),view.cx,view.cy);gl.uniform2f(gl.getUniformLocation(pFill,'u_s'),sx,sy);
 bindPos(pFill);const lc=gl.getAttribLocation(pFill,'a_col');gl.bindBuffer(gl.ARRAY_BUFFER,colBuf);gl.enableVertexAttribArray(lc);gl.vertexAttribPointer(lc,4,gl.UNSIGNED_BYTE,true,0,0);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idxBuf);gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_INT,0);
 gl.disableVertexAttribArray(lc);
 gl.useProgram(pFlat);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 gl.uniform2f(gl.getUniformLocation(pFlat,'u_c'),view.cx,view.cy);gl.uniform2f(gl.getUniformLocation(pFlat,'u_s'),sx,sy);
 const uc=gl.getUniformLocation(pFlat,'u_col');bindPos(pFlat);
 if(view.k>0.9){gl.uniform4f(uc,.04,.07,.1,Math.min(.65,(view.k-.9)*.5));gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,edgBuf);gl.drawElements(gl.LINES,edg.length,gl.UNSIGNED_INT,0);}
 glSun();gl.useProgram(pFlat);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);bindPos(pFlat);
 const hs=sel>=0?sel:hov;
 if(hs>=0){gl.uniform4f(uc,1,1,1,sel>=0?.22:.3);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idxBuf);gl.drawElements(gl.TRIANGLES,triS[hs+1]-triS[hs],gl.UNSIGNED_INT,triS[hs]*4);}
 scaleBar();drawLabels();
}

