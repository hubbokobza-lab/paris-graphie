// ---------- Analyse d'une liste d'adresses (aussi utilisable par une IA : ?adresses=a|b|c, ou window.parisGraphie.analyse([...])) ----------
const ABRV={bd:'boulevard',bld:'boulevard',boul:'boulevard',av:'avenue',ave:'avenue',r:'rue',pl:'place',fg:'faubourg',fbg:'faubourg',st:'saint',ste:'sainte',sq:'square',imp:'impasse',pass:'passage',qu:'quai',all:'allee',cr:'cours',che:'chemin',vla:'villa',cite:'cite',gal:'galerie',rte:'route',pont:'pont',prom:'promenade',sent:'sentier',carr:'carrefour',rpt:'rond point'};
function parseAdr(l){
 let x=nz(String(l).replace(/\b(75|92|93|94)\d{3}\b.*$/,'').replace(/,?\s*paris\s*(\d{1,2}\s*(e|er|eme|ème))?\s*$/i,'').replace(/[,;]/g,' '));
 const m=x.match(/^(\d+)\s*(?:(bis|ter|quater|b|t|q)\b)?(?:\s*(?:a|à|et|-)\s*\d+\s*(?:bis|ter)?)?\s+(.*)$/);
 let num=null,suf='',voie=x;if(m){num=m[1];suf=m[2]||'';voie=m[3];}
 suf={b:'bis',t:'ter',q:'quater'}[suf]||suf;
 voie=voie.split(' ').map(w=>ABRV[w]||w).join(' ').replace(/\bsaint (\w)/g,'saint $1');
 return {num,suf,voie};
}
async function adrSug(line,n=6){   // suggestions d'adresses pour une ligne saisie (même logique que la recherche)
 const A=await loadAddr();if(!A)return [];const p=parseAdr(line);const ws=(p.voie||'').split(' ').filter(w=>w.length>1&&!['de','du','des','la','le','les'].includes(w));if(!ws.length)return [];
 let c=A.filter(s=>ws.every(w=>s.z.includes(w)));
 if(!c.length){   // faute de frappe : chaque mot comparé aux mots de la voie (distance d'édition)
  const ed=(x,y)=>{if(Math.abs(x.length-y.length)>2)return 9;let p=[...Array(y.length+1).keys()];for(let i=1;i<=x.length;i++){const q=[i];for(let j=1;j<=y.length;j++)q[j]=Math.min(p[j]+1,q[j-1]+1,p[j-1]+(x[i-1]===y[j-1]?0:1));p=q;}return p[y.length];};
  const sc=s=>{const Z=s.z.split(' ');let t=0;for(const w of ws){let b=9;for(const z of Z){const d=z.startsWith(w)?0:ed(w,z);if(d<b)b=d;}t+=b<=(w.length>=6?2:w.length>=4?1:0)?b:20;}return t;};
  c=A.map(s=>[sc(s),s]).filter(x=>x[0]<20).sort((a,b)=>a[0]-b[0]||a[1].n.length-b[1].n.length).slice(0,20).map(x=>x[1]);}
 const joined=ws.join(' ');c.sort((a,b)=>((a.z.startsWith(joined)?0:a.z.includes(joined)?1:2)-(b.z.startsWith(joined)?0:b.z.includes(joined)?1:2))||a.n.length-b.n.length);
 const out=[];for(const s of c.slice(0,20)){
  if(p.num){const want=nz(p.num+(p.suf?' '+p.suf:''));let e=s.a.find(q=>nz(q[0])===want);
   if(!e){let bd=1e9;for(const q of s.a){const d=Math.abs(parseInt(q[0])-+p.num);if(d<bd){bd=d;e=q;}}}
   if(e)out.push({t:e[0]+' '+s.n,s:'Paris '+(e[3]?(e[3]===1?'1er':e[3]+'e'):'')});}
  else out.push({t:s.n,s:s.a.length+' numéros',street:true});
  if(out.length>=n)break;}
 return out;
}
async function locAdr(l){
 const A=await loadAddr();if(!A)return null;const p=parseAdr(l);if(!p.voie)return null;
 const ws=p.voie.split(' ').filter(w=>!['de','du','des','la','le','les','l','d'].includes(w));
 const hasW=(z,w)=>(' '+z+' ').includes(' '+w+' ')||(w.length>=4&&(' '+z).includes(' '+w));   // mot entier (ou début de mot)
 let c=A.filter(s=>ws.every(w=>hasW(s.z,w)));
 if(!c.length&&ws.length>2)c=A.filter(s=>ws.filter(w=>hasW(s.z,w)).length>=ws.length-1);
 if(!c.length)return null;
 c.sort((a,b)=>(a.z===p.voie?0:a.z.endsWith(p.voie)?1:2)-(b.z===p.voie?0:b.z.endsWith(p.voie)?1:2)||a.n.length-b.n.length);
 const s=c[0];let e=null;
 if(p.num){const want=nz(p.num+(p.suf?' '+p.suf:''));e=s.a.find(q=>nz(q[0])===want)||s.a.find(q=>nz(q[0]).split(' ')[0]===p.num);
  if(!e){let bd=1e9;for(const q of s.a){const d=Math.abs(parseInt(q[0])-+p.num);if(d<bd&&(parseInt(q[0])-+p.num)%2===0){bd=d;e=q;}}if(e&&bd>6)e=null;}}
 if(!e)return {q:l,adr:s.n,ok:false,note:p.num?'numéro introuvable sur cette voie':'pas de numéro'};
 const wx=e[1]/2,wy=e[2]/2;let b=pick(wx,wy);
 if(b<0)for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2],[4,4],[-4,4],[4,-4],[-4,-4],[8,0],[-8,0],[0,8],[0,-8],[12,0],[-12,0],[0,12],[0,-12],[16,16],[-16,16],[16,-16],[-16,-16],[20,0],[-20,0],[0,20],[0,-20]]){b=pick(wx+dx,wy+dy);if(b>=0)break;}
 return {q:l,adr:e[0]+' '+s.n,ok:b>=0,b,x:wx,y:wy,note:b<0?'aucun bâtiment à cette adresse':''};
}
const LOC_BAN={G:'interdit à la location depuis le 1er janvier 2025',F:'interdit à la location à partir du 1er janvier 2028',E:'interdit à la location à partir du 1er janvier 2034'};
const strip=x=>String(x).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
function bldRow(b){
 const [lo,la]=bldLonLat(b),r={'Arrondissement':ARR[b]?ARR[b]+(ARR[b]===1?'er':'e'):'','Année de construction':AN[b]||'','Hauteur médiane (m)':HM[b]?(HM[b]/10).toFixed(1).replace('.',','):'','Hauteur maximale (m)':HX[b]?(HX[b]/10).toFixed(1).replace('.',','):'','Niveaux':nivOf(b),'Emprise au sol (m²)':Math.round(area[b]),'Surface de plancher estimée (m²)':nf.format(Math.round(SPL(b)*.6/10)*10)+' à '+nf.format(Math.round(SPL(b)*.8/10)*10)};
 for(const c of CRIT){if(['neu','yr','arr','per','hm','hx','niv'].includes(c.id))continue;let i;try{i=c.cls(b);}catch(e){continue;}if(i==null||c.lab[i]==null)continue;r[strip(c.name)]=strip(c.lab[i]);}
 {const v=vacOf(b);if(v.c){r['Suspicion de vacance (sur 5)']=v.c===6?'transformation':(v.sc??v.c);r['Fiabilité de l\'indice (sur 5)']=v.f;r['Motif']=v.why;const o=occOf(b);if(o&&o.ok&&v.c<6)r['Occupation apparente (%)']=Math.round(o.r*100);}}
 const d=r['DPE, étiquette énergie'];if(d&&LOC_BAN[d])r['Location (loi Climat)']=LOC_BAN[d];
 r['Lien']=location.origin+location.pathname+'?b='+lo.toFixed(6)+','+la.toFixed(6);r['lon']=+lo.toFixed(6);r['lat']=+la.toFixed(6);
 return r;
}
async function ownInto(r,b){const D=await loadArr(ARR[b]);const O=D&&D.o&&D.o[b];if(!O||!O.length)return;const P=O.filter(o=>o[4]);
 if(P[0]){r['Propriétaire principal']=P[0][0]+(P[0][1]?' ('+P[0][1]+')':'');r['SIREN du propriétaire']=P[0][2];r['Fiche entreprise']=P[0][2]?'https://annuaire-entreprises.data.gouv.fr/entreprise/'+P[0][2]:'';}
 if(P.length>1)r['Autres propriétaires']=P.slice(1).map(o=>o[0]).join(' ; ');}
async function analyse(list,walk=true){const out=[],B=[];for(const l of list){const t=String(l).trim();if(!t)continue;const a=await locAdr(t);
 const row=Object.assign({'Adresse saisie':t,'Adresse trouvée':a?a.adr:'','Statut':!a?'adresse introuvable':a.ok?'ok':a.note},a&&a.ok?bldRow(a.b):{});
 if(!a||!a.ok){const S=await adrSug(t,3);if(S.length)row['Suggestion']=S.map(x=>x.t).join(' ; ');}
 out.push(row);B.push(a&&a.ok?a.b:-1);}
 if(walk){let i=0;const W=async()=>{while(i<B.length){const k=i++;if(B[k]<0)continue;const w=await walkFor(B[k]).catch(()=>null);if(!w||!w.length)continue;
   const r=out[k];r['Métro ou RER le plus proche']=w[0].n;r['Distance à pied (m)']=w[0].m;r['Temps à pied (min)']=w[0].min;
   if(w[1]){r['Deuxième station']=w[1].n;r['Distance à pied, deuxième station (m)']=w[1].m;}}};
  await Promise.all([W(),W(),W(),W()]);}
 for(let k=0;k<B.length;k++)if(B[k]>=0)await ownInto(out[k],B[k]);
 return out;}
function colSrc(k){const P=parisGraphie.sources().producteur_par_champ;if(P[k])return P[k];
 if(k==='Arrondissement')return 'Ville de Paris';if(/^(Adresse|Statut|Suggestion|Lien|lon|lat)/.test(k))return k.startsWith('Adresse trouvée')||k==='Suggestion'?'Base Adresse Nationale':'';
 if(/Métro|station|Distance à pied|Temps à pied/i.test(k))return 'IDFM (gares), itinéraire piéton IGN';
 if(/propriétaire|SIREN|Fiche entreprise/i.test(k))return 'DGFiP (locaux des personnes morales), annuaire des entreprises';
 if(/Fiabilité|Motif/.test(k))return 'Déduction (Insee Sirene, permis, Apur)';return '';}
function toCsv(rows){const K=[];for(const r of rows)for(const k of Object.keys(r))if(!K.includes(k))K.push(k);
 const q=v=>{v=v==null?'':String(v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
 return '\ufeff'+[K.map(k=>q(colSrc(k)?k+' ['+colSrc(k)+']':k)).join(';')].concat(rows.map(r=>K.map(k=>q(r[k])).join(';'))).join('\r\n');}
function bldAt(e){const wx=e[1]/2,wy=e[2]/2;let b=pick(wx,wy);if(b<0)for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2],[4,4],[-4,4],[4,-4],[-4,-4],[8,0],[-8,0],[0,8],[0,-8]]){b=pick(wx+dx,wy+dy);if(b>=0)break;}return b;}
async function dumpStreets(i0,i1){   // utilisé par le robot pour publier l'accès statique api/ (lisible par les IA)
 const A=await loadAddr(),out=[];
 for(const s of A.slice(i0,i1)){const B={},N={};
  for(const e of s.a){const b=bldAt(e);if(b<0)continue;if(!(b in B)){const r=bldRow(b);delete r['Lien'];await ownInto(r,b);B[b]=r;}N[e[0]]=b;}
  out.push({voie:s.n,numeros:N,batiments:B});}
 return {total:A.length,out};
}
window.parisGraphie={analyse,toCsv,bldRow,dumpStreets,sources:()=>({methodologie:METH,sources:Object.keys(SRC).filter(k=>SRC[k][1]&&!(PUB&&k==='dvf')).map(k=>({id:k,source:SRC[k][0],url:SRC[k][1],extrait_le:SRCD[k]||null})),
 producteur_par_champ:Object.fromEntries(CRIT.filter(c=>!['neu','yr','arr','per'].includes(c.id)).map(c=>[strip(c.name),orgOf(c.id)]).concat([['Année de construction','Apur'],['Hauteur médiane (m)','Apur'],['Hauteur maximale (m)','Apur'],['Emprise au sol (m²)','Apur (calcul)'],['Niveaux','CSTB (BDNB), sinon estimé par la hauteur (Apur)'],['Surface de plancher estimée (m²)','Calcul : emprise × niveaux, moins 20 à 40 %'],['Suspicion de vacance (sur 5)','Déduction (Insee Sirene, permis, Apur)'],['Propriétaire principal','DGFiP (locaux des personnes morales)'],['SIREN du propriétaire','DGFiP (locaux des personnes morales)'],['Location (loi Climat)','Loi Climat et résilience, d\'après l\'étiquette DPE (ADEME)']]))})};
{const box=document.createElement('div');box.id='alst';box.hidden=true;
 box.innerHTML='<div class="alp"><div class="alh"><b>Analyse d\'une liste d\'adresses</b><button id="alx" aria-label="Fermer">✕</button></div>'
  +'<div class="k">Une adresse par ligne (Paris intra-muros). Exemple : 12 rue de Rivoli, 75004 Paris</div>'
  +'<textarea id="alt" rows="7" spellcheck="false" placeholder="12 rue de Rivoli\n3 bd Haussmann\n27 rue La Fayette"></textarea>'
  +'<div id="alsg" hidden></div>'+'<div class="alb"><button id="alg">Analyser</button><button id="alc" disabled>Exporter (Excel, CSV)</button><span class="k" id="als"></span></div><div id="alr"></div></div>';
 document.body.appendChild(box);
 const sb=document.createElement('button');sb.id='alo';sb.type='button';sb.textContent='Analyser une liste d\'adresses';$('#srch').after(sb);
 let ROWS=[];
 const run=async()=>{const L=$('#alt').value.split(/\n+/).map(s=>s.trim()).filter(Boolean).slice(0,500);$('#als').textContent='Analyse de '+L.length+' adresses…';
  ROWS=await analyse(L);const ok=ROWS.filter(r=>r.Statut==='ok').length;$('#als').textContent=ok+' sur '+ROWS.length+' adresses localisées';$('#alc').disabled=!ROWS.length;
  const K=[];for(const r of ROWS)for(const k of Object.keys(r))if(!K.includes(k)&&!['Adresse saisie','lon','lat','Lien'].includes(k))K.push(k);
  $('#alr').innerHTML='<table><tr><th>Saisie</th>'+K.map(k=>'<th>'+esc(k)+(colSrc(k)?'<div class="k" style="font-weight:400;font-size:var(--fs-xs)">'+esc(colSrc(k))+'</div>':'')+'</th>').join('')+'</tr>'+ROWS.map((r,i)=>'<tr data-i="'+i+'"'+(r.Statut==='ok'?'':' class="ko"')+'><td>'+esc(r['Adresse saisie'])+'</td>'+K.map(k=>'<td>'+esc(r[k]??'')+'</td>').join('')+'</tr>').join('')+'</table>';
  $('#alr').querySelectorAll('tr[data-i]').forEach(tr=>tr.onclick=()=>{const r=ROWS[+tr.dataset.i];if(r.Statut!=='ok')return;box.hidden=true;goTo(Object.assign({t:r['Adresse trouvée'],k:7},xyOf(r)));});};
 const xyOf=r=>{const [x,y]=llToW(r.lon,r.lat);return {x:x*2,y:y*2};};
 { // suggestions d'adresse pour la ligne en cours de saisie
  const ta=$('#alt'),sb_=$('#alsg');let S=[],si=-1,tm=0;
  const cur=()=>{const v=ta.value,p=ta.selectionStart,a0=v.lastIndexOf('\n',p-1)+1,e0=v.indexOf('\n',p);return [a0,e0<0?v.length:e0];};
  const show=()=>{sb_.innerHTML='';S.forEach((r,i)=>{const d=document.createElement('div');d.className=i===si?'on':'';d.innerHTML=esc(r.t)+' <span class="k">'+esc(r.s)+'</span>';d.onmousedown=ev=>{ev.preventDefault();pickS(i);};sb_.appendChild(d);});sb_.hidden=!S.length;};
  const pickS=i=>{const [a0,e0]=cur(),r=S[i];const ins=r.street?'':r.t;const v=ta.value;
   if(r.street){const p=parseAdr(v.slice(a0,e0));ta.value=v.slice(0,a0)+(p.num?p.num+' ':'')+r.t+v.slice(e0);}else ta.value=v.slice(0,a0)+ins+v.slice(e0);
   const np=a0+(r.street?(parseAdr(v.slice(a0,e0)).num?parseAdr(v.slice(a0,e0)).num.length+1:0)+r.t.length:ins.length);ta.focus();ta.setSelectionRange(np,np);S=[];show();};
  ta.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(async()=>{const [a0,e0]=cur(),l=ta.value.slice(a0,e0).trim();S=l.length<3?[]:await adrSug(l);si=-1;show();},180);});
  ta.addEventListener('keydown',ev=>{if(sb_.hidden)return;if(ev.key==='ArrowDown'){si=Math.min(S.length-1,si+1);show();ev.preventDefault();}else if(ev.key==='ArrowUp'){si=Math.max(0,si-1);show();ev.preventDefault();}else if(ev.key==='Enter'&&si>=0){pickS(si);ev.preventDefault();}else if(ev.key==='Escape'){S=[];show();}});
  ta.addEventListener('blur',()=>setTimeout(()=>{S=[];show();},150));
 }
 $('#alg').onclick=run;$('#alx').onclick=()=>box.hidden=true;sb.onclick=()=>{box.hidden=false;$('#alt').focus();};
 $('#alc').onclick=()=>{const u=URL.createObjectURL(new Blob([toCsv(ROWS)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='paris-graphie-adresses.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);};
 const P=new URLSearchParams(location.search);
 if(P.get('adresses')){$('#alt').value=P.get('adresses').split('|').join('\n');box.hidden=false;run();}
 if(P.get('b')){const [lo,la]=P.get('b').split(',').map(Number);if(isFinite(lo)&&isFinite(la)){const [x,y]=llToW(lo,la);setTimeout(()=>goTo({t:'',x:x*2,y:y*2,k:7}),300);}}
}
new ResizeObserver(()=>{const first=W===1;resize();if(first)fit();draw();}).observe(cv);
resize();fit();
setCrit(CRIT[0]);ready=true;
/* mode avancé : critères et calques spécialisés masqués par défaut (toujours trouvables par la recherche de calques) */
{const AC=new Set(['occ','vac','reh','sur','ncm','soc','bur','ges','mur','toit','co2','pd','sf','rc','pm','dv','sa','ne','se','cl','arr','rs','ar','dh']);
 const AG=new Set(['Hébergement touristique','Culture et cultes','Commerces','Cadastre','Voirie','Archéologie','Îlots de chaleur','PLU : secteurs et réserves','Sous-sol et risques','Mobilité']);
 const AS=new Set(['Ensoleillement','Filtres','Marché (DVF 2021-2025)','Occupants (Sirene)','Sous-sol et fouilles']);
 const cb_=$('#adv');let on=false;try{on=localStorage.getItem('pg_adv')==='1';}catch(e){}
 const mark=()=>{const act=b=>b.getAttribute('aria-pressed')==='true'||b.classList.contains('on');
  document.querySelectorAll('#crit button[data-id]').forEach(b=>b.classList.toggle('advx',AC.has(b.dataset.id)&&!act(b)));
  document.querySelectorAll('details.ovgrp').forEach(d=>d.classList.toggle('advx',AG.has(d.dataset.g)&&![...d.querySelectorAll('input[type=checkbox]')].some(c=>c.checked)));
  document.querySelectorAll('details.lsec').forEach(d=>{const items=[...d.querySelectorAll('button[data-id], details.ovgrp')];
   const hideAll=AS.has(d.dataset.g)||(items.length&&items.every(x=>x.classList.contains('advx')));
   const busy=d.dataset.g!=='Filtres'&&d.querySelector('button[aria-pressed=true]')||d.dataset.g!=='Filtres'&&[...d.querySelectorAll('input[type=checkbox]:not(#adv)')].some(c=>c.checked);
   d.classList.toggle('advx',!!hideAll&&!busy);});
  const n=document.querySelectorAll('.advx').length;$('#advn').textContent=on?'':'('+n+' éléments masqués)';};
 const set=v=>{on=v;cb_.checked=v;document.body.classList.toggle('adv',v);try{localStorage.setItem('pg_adv',v?'1':'0');}catch(e){}mark();};
 cb_.onchange=()=>set(cb_.checked);setTimeout(()=>set(on),50);
}
