const $=s=>document.querySelector(s);const isMob=()=>innerWidth<=760||(innerWidth<=1024&&innerHeight>innerWidth);
const nf=new Intl.NumberFormat('fr-FR');
/* design de 2026-11 (accueil, charte, typographie) : par défaut ; ?essai=0 rend l'ancien design le temps de la transition, ?essai=1 le rétablit */
const ESSAI=(()=>{const m=location.search.match(/[?&]essai=([01])/);try{if(m)localStorage.setItem('pg_essai',m[1]);return localStorage.getItem('pg_essai')!=='0';}catch(e){return !(m&&m[1]==='0');}})();
if(ESSAI)document.body.classList.add('essai');
const tick=()=>new Promise(r=>setTimeout(r,0));
function prog(msg,p){$('#loadmsg').textContent=msg;$('#loadbar').style.width=(p*100)+'%';const b=$('#accbar');if(b)b.style.width=(p*100)+'%';}
function fail(msg){const ac=$('#acc');if(ac)ac.remove();$('#loadmsg').textContent=msg;$('#load .bar').style.display='none';}
if(typeof earcut==='undefined'){fail("La bibliothèque de triangulation n'a pas pu se charger.");return;}
if(typeof DecompressionStream==='undefined'){fail("Ce navigateur ne sait pas décompresser les données (DecompressionStream). Essayer une version récente de Chrome, Safari ou Firefox.");return;}

/* ---------- données ---------- */
const DV='202611171316';async function getBin(u){const r=await fetch(u+(u.includes('?')?'&':'?')+'v='+DV);if(!r.ok)throw new Error(u+' : '+r.status);let b=await r.arrayBuffer();const v=new Uint8Array(b);if(v[0]===0x1f&&v[1]===0x8b)b=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();return b;}
async function getJson(u){return JSON.parse(new TextDecoder().decode(await getBin(u)));}
prog("Chargement des données…",.05); await tick();
let buf;try{buf=await getBin('data.json');}catch(e){fail("Impossible de charger les données ("+e.message+").");return;}
const hl=new DataView(buf).getUint32(0,true);
const H=JSON.parse(new TextDecoder().decode(new Uint8Array(buf,4,hl)));
const TY={B:[Uint8Array,1],H:[Uint16Array,2],h:[Int16Array,2],I:[Uint32Array,4]};
const S={};let off=4+hl;
for(const [k,t,n] of H.streams){const [C,sz]=TY[t];S[k]=new C(buf.slice(off,off+n*sz));off+=n*sz;}
const N=H.n;

