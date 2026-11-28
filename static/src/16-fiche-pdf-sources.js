/* ---------- fiche PDF et ressources externes ---------- */
const SRC={
 quart:['Ville de Paris, « Quartiers administratifs », Open Data','https://opendata.paris.fr/explore/dataset/quartier_paris/'],
 voir:['Ville de Paris, « Plan de voirie » (trottoirs, terre-pleins, passages piétons), Open Data','https://opendata.paris.fr/explore/?q=plan-de-voirie'],
 cad:['DGFiP, plan cadastral, diffusé par l\'IGN (Parcellaire Express, Licence Ouverte)','https://geoservices.ign.fr/parcellaire-express-pci'],
 atl:['Michel Huard, Atlas historique de Paris (cartes calées automatiquement sur le plan actuel, précision indicative)','https://paris-atlas-historique.fr/'],
 apur:['Apur, « Emprise bâtie Paris », Open Data (licence ODbL)','https://www.apur.org/en/open-data-maps/open-data/built-areas-paris-and-metropolis-reading-urban-fabric'],
 ban:['Base Adresse Nationale (BAN)','https://adresse.data.gouv.fr/'],
 dvf:['DGFiP, « Demandes de valeurs foncières », géolocalisées par Etalab','https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/'],
 calc:['Calcul de l\'outil à partir des données Apur (estimation indicative)',''],
 plu:['Ville de Paris, PLU bioclimatique, Open Data','https://opendata.paris.fr/explore/?q=plub'],
 pat:['Apur, couches « Patrimoine » (immeubles et périmètres protégés)','https://www.apur.org/en/open-data-maps/open-data/protected-heritage-paris-and-inner-suburbs-protected-areas-and-listed'],
 arch:['Ville de Paris, Référentiel archéologique de Paris','https://opendata.paris.fr/explore/dataset/referentiel-archeologique-de-paris/'],
 urb:['Ville de Paris, « Autorisations d\'Urbanisme - Historique » et « Dossiers récents d\'urbanisme »','https://opendata.paris.fr/explore/dataset/autorisations-durbanisme-h/'],
 cvp:['Ville de Paris, « Commission du Vieux Paris - Adresses instruites »','https://opendata.paris.fr/explore/dataset/commission-du-vieux-paris-adresses-instruites/'],
 gpu:['Géoportail de l\'urbanisme (État)','https://www.geoportail-urbanisme.gouv.fr/'],
 reg:['Ville de Paris, Portail des règles d\'urbanisme (PLU bioclimatique)','https://regles-urbanisme.paris.fr/plu-bioclimatique/'],
 mer:['Ministère de la Culture, base Mérimée, « Immeubles protégés au titre des monuments historiques » (Licence Ouverte)','https://www.data.gouv.fr/datasets/immeubles-proteges-au-titre-des-monuments-historiques-2'],
 typ:['Apur, « Besoin théorique de chauffage et typologie au bâti », Open Data (licence ODbL)','https://opendata.apur.org/'],
 com:['Apur, « BDCOM 2017 », base des commerces et services en rez-de-chaussée, Open Data (licence ODbL)','https://opendata.apur.org/'],
 bdnb:['CSTB, Base de données nationale des bâtiments (BDNB open), dernier millésime publié (Licence Ouverte)','https://bdnb.io/'],
 dpe:['Ademe, diagnostics de performance énergétique, via la BDNB (Licence Ouverte)','https://data.ademe.fr/'],
 co2:['Calcul de l\'outil : surface de plancher estimée × seuil RE2020 « IC construction » 2025 des logements collectifs (650 kg CO₂e/m²) ; ordre de grandeur indicatif, pas une analyse de cycle de vie','https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043936914'],
 moa:['SDES, base Sitadel, « Liste des permis de construire et autres autorisations d\'urbanisme » (maîtres d\'ouvrage personnes morales, depuis 2013, Licence Ouverte) ; sur le site public, les particuliers ne sont pas nommés','https://www.data.gouv.fr/datasets/liste-des-permis-de-construire-et-autres-autorisations-durbanisme'],
 cult:['Ministère de la Culture, « Base des lieux et équipements culturels (Basilic) » (Licence Ouverte)','https://www.data.gouv.fr/datasets/base-des-lieux-et-equipements-culturels-basilic'],
 culte:['© contributeurs OpenStreetMap, lieux de culte (licence ODbL)','https://www.openstreetmap.org/copyright'],
 boa0:['Bouchaud Architectes, projets publiés sur bouchaudarchitectes.com (relevé chaque semaine) ; les appartements sont placés sur leur rue, sans adresse précise','https://www.bouchaudarchitectes.com/'],
 boa1:['Bouchaud Architectes, projets publiés sur bouchaudarchitectes.com (relevé chaque semaine) ; les appartements sont placés sur leur rue, sans adresse précise','https://www.bouchaudarchitectes.com/'],
 boa2:['Bouchaud Architectes, projets publiés sur bouchaudarchitectes.com (relevé chaque semaine) ; les appartements sont placés sur leur rue, sans adresse précise','https://www.bouchaudarchitectes.com/'],
 osmm:['© contributeurs OpenStreetMap, voies ferrées du métro et du RER (licence ODbL) ; tracé indicatif, à vérifier auprès de la RATP et de la SNCF pour tout projet','https://www.openstreetmap.org/copyright'],
 tcf:['Île-de-France Mobilités, tracés du réseau ferré, gares et stations, accès (Licence Ouverte) et tracés des lignes de bus (source GTFS, ODbL)','https://data.iledefrance-mobilites.fr/'],
 hot:['Atout France, « Hébergements touristiques classés en France », géolocalisés par Paris-graphie à partir de la BAN','https://www.data.gouv.fr/datasets/hebergements-touristiques-classes-en-france'],
 cu:['Ville de Paris, « Registre des autorisations de changement d\'usage pour les meublés touristiques », Open Data (ODbL)','https://opendata.paris.fr/explore/dataset/registre-des-autorisations-de-changement-dusage-pour-les-meubles/'],
 abnb:['Inside Airbnb, relevé trimestriel des annonces de Paris (licence CC BY 4.0), agrégé par carré de 250 m : positions brouillées jusqu\'à 150 m par Airbnb, aucune annonce individuelle affichée','https://insideairbnb.com/paris/'],
 p70:['Bibliothèque historique de la Ville de Paris, fonds « C\'était Paris en 1970 » ; carroyage d\'après le projet This was Paris in 1970 (MIT) ; sites paris1970.fr et paris1970.jeantho.eu','https://paris1970.fr/'],
 lcz:['Cerema, « Cartographie des zones climatiques locales (LCZ) », aire urbaine de Paris, images SPOT 2022 (Licence Ouverte)','https://www.data.gouv.fr/datasets/cartographie-des-zones-climatiques-locales-lcz-des-93-territoires-de-plus-de-50-000-habitants-en-france'],
 veg:['Apur, « Hauteur de la végétation 2021 », Open Data (licence ODbL)','https://opendata.apur.org/'],
 frais:['Ville de Paris, « Îlots de fraîcheur » (espaces verts frais, équipements et activités), Open Data','https://opendata.paris.fr/explore/dataset/ilots-de-fraicheur-espaces-verts-frais/'],
 own:['DGFiP, fichiers des locaux et des parcelles des personnes morales (situation au 1er janvier), open data','https://data.economie.gouv.fr/explore/dataset/fichiers-des-locaux-et-des-parcelles-des-personnes-morales/'],
 sir:['Insee, base Sirene (stock du 01/11/2026)','https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/']
};

let SRCD={};
const fd10=d=>d?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'';
function srcLabel(k){const d=SRCD[k];return SRC[k][0]+(d?', données extraites le '+fd10(d):'');}
function srcList(){return Object.keys(SRC).filter(k=>SRC[k][1]&&!(PUB&&k==='dvf')).map(k=>[srcLabel(k),SRC[k][1]]);}
const METH=/*METH*/[];   /* méthodologie : static/methodes.json, injectée à l'assemblage (step_site) */
function renderSrc(){const b=$('#srct');if(!b)return;b.innerHTML='<div style="margin-bottom:6px">Données ouvertes (licence ODbL ou Licence Ouverte selon le producteur). Date d\'extraction indiquée pour chaque source'+(SRCD._maj?' ; dernière mise à jour du site : '+fd10(SRCD._maj):'')+'.</div>'+srcList().map(x=>'<div style="margin:3px 0"><a href="'+esc(x[1])+'" target="_blank" rel="noopener">'+esc(x[0])+'</a></div>').join('');}
getJson('sources.json').then(j=>{SRCD=j||{};renderSrc();}).catch(()=>renderSrc());
function bldCenter(s){const wx=(bbox[4*s]+bbox[4*s+2])/2,wy=(bbox[4*s+1]+bbox[4*s+3])/2;return [H.lon0+wx/(H.q*111320*Math.cos(H.lat0*Math.PI/180))*H.q,H.lat0+wy/(H.q*110574)*H.q];}
function llToW(lo,la){return [(lo-H.lon0)*111320*Math.cos(H.lat0*Math.PI/180),(la-H.lat0)*110574];}
function bldLonLat(s){const wx=(bbox[4*s]+bbox[4*s+2])/2,wy=(bbox[4*s+1]+bbox[4*s+3])/2;return [H.lon0+wx/(111320*Math.cos(H.lat0*Math.PI/180)),H.lat0+wy/110574];}
const OPD='https://opendata.paris.fr/explore/dataset/',
 dossUrl=n=>{const y=+(n.split(' ')[3]||0),rec=y>=24&&y<=40;return OPD+(rec?'dossiers-recents-durbanisme':'autorisations-durbanisme-h')+'/table/?q='+encodeURIComponent('"'+n+'"');},
 banUrl=(a,arr)=>'https://api-adresse.data.gouv.fr/search/?limit=1&q='+encodeURIComponent(a+' 750'+String(arr||0).padStart(2,'0')+' Paris');
let GARES=null;const GARESP=getJson('gares.json').then(v=>{GARES=v;return v;}).catch(()=>null);
// distance à pied (itinéraire piéton IGN Géoplateforme) vers les stations de métro et de RER les plus proches
const WALK={},w2ll=(x,y)=>[H.lon0+x/(111320*Math.cos(H.lat0*Math.PI/180)),H.lat0+y/110574];
async function walkFor(s){
 if(WALK[s])return WALK[s];await GARESP;if(!GARES)return null;
 const wx=(bbox[4*s]+bbox[4*s+2])/2,wy=(bbox[4*s+1]+bbox[4*s+3])/2,[lo,la]=w2ll(wx,wy);
 const C=GARES.filter(g=>/Métro|RER/.test(g[2])).map(g=>[Math.hypot(g[0]-wx,g[1]-wy),g]).sort((a,b)=>a[0]-b[0]).slice(0,4);
 const R=await Promise.all(C.map(async([d,g])=>{const [glo,gla]=w2ll(g[0],g[1]);
  try{const r=await fetch('https://data.geopf.fr/navigation/itineraire?resource=bdtopo-osrm&profile=pedestrian&optimization=shortest&start='+lo.toFixed(6)+','+la.toFixed(6)+'&end='+glo.toFixed(6)+','+gla.toFixed(6)+'&distanceUnit=meter&timeUnit=minute&getSteps=false&geometryFormat=polyline').then(r=>r.json());
   if(r&&r.distance>0)return {n:g[2],m:Math.round(r.distance),min:Math.max(1,Math.round(r.distance/75)),ok:1};}catch(e){}
  return {n:g[2],m:Math.round(d*1.3),min:Math.max(1,Math.round(d*1.3/75)),ok:0};}));
 R.sort((a,b)=>a.m-b.m);WALK[s]=R;return R;
}
const walkTxt=w=>w.n+' : '+nf.format(Math.round(w.m/10)*10)+' m à pied, environ '+w.min+' min'+(w.ok?'':' (estimation)');
const XTRA=[['tour.json','Hébergement touristique',null],['cult.json','Lieux culturels',null],['culte.json','Lieux de culte',null]];for(const x of XTRA)getJson(x[0]).then(v=>{x[2]=v;}).catch(()=>{});
let FEM=null;   // femmes illustres retirées de la carte (25/11/2026)
let P70=null;getJson('p70.json').then(v=>{P70=v;}).catch(()=>{});
function p70Of(lo,la){if(!P70)return null;const [a,b]=P70.d;for(const q of P70.s)if(la<=q[1]&&la>q[1]-a&&lo<=q[2]&&lo>q[2]-b)return q;return null;}
let VERG=null;getJson('vergue.json').then(v=>{VERG=v;}).catch(()=>{});
const ARKP='arko_default_67d426d4c0eab',ARKT='arko_default_64ca128917636';
const arkUrl=(base,P,G,q)=>base+'?'+[P+'--filtreGroupes[mode]=simple',P+'--filtreGroupes[op]=AND',P+'--filtreGroupes[groupes][0]['+G+'][op]=AND',P+'--filtreGroupes[groupes][0]['+G+'][q][]='+encodeURIComponent(q),P+'--from=0',P+'--resultSize=50'].map(x=>x.replace(/\[/g,'%5B').replace(/\]/g,'%5D')).join('&');
const archTopo=a=>arkUrl('https://archives.paris.fr/rechercher-et-consulter/faire-une-recherche-topographique',ARKT,'arko_default_64ca1320a6401',a.replace(/-/g,' '));
const archPhoto=v=>arkUrl('https://archives.paris.fr/rechercher-dans-les-collections-photographiques',ARKP,'arko_default_67d42ab0a5eaa',v.replace(/-/g,' '));
function vergNear(lo,la){if(!VERG)return [];const kx=111320*Math.cos(la*Math.PI/180),ky=110574;
 return VERG.map(v=>[Math.hypot((v[0]-lo)*kx,(v[1]-la)*ky),v]).filter(d=>d[0]<=80).sort((a,b)=>a[0]-b[0]).slice(0,6);}
const vergTitle=u=>u.replace(/^\d+\//,'').replace(/-\d{4}$/,'').replace(/-/g,' ');
function extLinks(s,A,U){
 const [lo,la]=bldLonLat(s),f5=v=>v.toFixed(5),ad0=A&&A[s]&&A[s][0],q=ad0?'ces sites n\'ont pas de lien direct vers un lieu : chercher « '+ad0+' » ou se repérer sur la carte':'';
 const L=[
  ['Remonter le temps (IGN) : cartes et photos aériennes anciennes','https://remonterletemps.ign.fr/comparer?lon='+f5(lo)+'&lat='+f5(la)+'&z=18'],
  ['Règlement du PLU bioclimatique (texte)',REGL],
  ['Zonage du PLU sur le Géoportail de l\'urbanisme, centré sur le bâtiment',gpuUrl(lo,la)],
  ['Cassini | Grand Paris (Apur) : plans historiques de 1728 à nos jours','https://www.apur.org/fr/geo-data/cassini-grand-paris-plans-historiques-1728-nos-jours'],
  ['Plan parcellaire de Paris en ligne (Ville de Paris, Vasserot et plans modernes)','https://www.paris.fr/pages/plans-donnees-et-documents-d-urbanisme-3708'],
  ['Plans cadastraux des immeubles de Paris 1809-1856 (Archives nationales)','https://www.data.gouv.fr/datasets/plans-cadastraux-des-immeubles-de-paris-1809-1856'],
  ['Plans d\'îlots Vasserot, projet Paris Time Machine','https://paris-timemachine.huma-num.fr/en/old-parcel-plans/'],
  ...(ad0?[['Archives de Paris, recherche à l\'adresse « '+ad0+' » : permis de construire, casier sanitaire, calepins du cadastre, sommier foncier (résultats à trier, la recherche inclut des adresses voisines)',archTopo(ad0)],
     ['Archives de Paris, photographies de la voie « '+ad0.replace(/^\d+\s*(bis|ter|quater|[a-z])?\s+/i,'')+' »',archPhoto(ad0.replace(/^\d+\s*(bis|ter|quater|[a-z])?\s+/i,''))]]
    :[['Photographies anciennes des Archives de Paris, recherche dans les collections','https://archives.paris.fr/rechercher-dans-les-collections-photographiques',q]]),
  ['Photographies de la Commission du Vieux Paris depuis 1916, carte interactive','https://fnp.huma-num.fr/adws/app/515ec27b-90ce-11ec-a660-af5a22dfde2b/',q],
  ...(()=>{const vn=vergNear(lo,la);return vn.length?vn.map(d=>['Photographie ancienne (Vergue) : '+vergTitle(d[1][3])+(d[1][2]>=1800?', '+d[1][2]:'')+', prise à '+Math.round(d[0])+' m','https://vergue.com/post/'+d[1][3]+'.html']):[['Photographies du Paris du XIXe siècle (Vergue), carte','https://vergue.com/carto-vergue-paris/','aucune photographie à moins de 80 m du bâtiment']];})(),
  ['OpenStreetMap','https://www.openstreetmap.org/?mlat='+f5(la)+'&mlon='+f5(lo)+'#map=19/'+f5(la)+'/'+f5(lo)],
  ['Google Maps','https://www.google.com/maps/search/?api=1&query='+f5(la)+','+f5(lo)]
 ];
 if(U&&U.mh)for(const m of mhUniq(U.mh))if(m[2])L.unshift(['Notice Mérimée '+m[2]+' (base POP, ministère de la Culture)','https://www.pop.culture.gouv.fr/notice/merimee/'+encodeURIComponent(m[2])]);
 return L;
}
function extHtml(s,A,U){
 return '<h3>Cartes anciennes, archives, photos (liens externes)</h3>'+extLinks(s,A,U).map(l=>'<div class="dm" style="margin:2px 0"><a href="'+esc(l[1])+'" target="_blank" rel="noopener">'+esc(l[0])+'</a>'+(l[2]?'<div class="k" style="font-size:var(--fs-xs)">'+esc(l[2])+'</div>':'')+'</div>').join('')
  +'<div style="margin:12px 0 2px"><button id="pdfb" type="button" class="pdfb">Exporter la fiche en PDF, avec sources</button> <span id="pdfm" class="k"></span></div>';
}
function docModel(s,c){
 const ad=c.A&&c.A[s]||[],M=c.M||cardModel(s,{A:c.A,P:c.P,D:c.D,C:c.C,SR:c.SR,AT:c.atl});
 const sec=M.filter(x=>x.items.length).map(x=>({id:x.id,f:x.f,h:x.h+(x.n?' ('+nf.format(x.n)+')':''),items:x.items}));
 sec.push({id:'src',h:'Sources et licences',items:[{t:'Toutes les données proviennent de jeux de données ouverts (licence ODbL ou Licence Ouverte, selon le producteur). Les dossiers d\'urbanisme sont rattachés au bâtiment par leur adresse ou leur localisation : le rattachement est approximatif et ne remplace ni un extrait cadastral, ni une note de renseignements d\'urbanisme.',s:'',u:''},
  ...srcList().map(x=>({t:x[0],s:'',u:x[1]}))]});
 return {title:ad[0]||'Bâtiment sans adresse rattachée',sub:'Paris '+(ARR[s]?ARR[s]+'e':'')+(ad.length>1?' · '+(ad.length-1)+' autre'+(ad.length>2?'s':'')+' adresse'+(ad.length>2?'s':''):''),sec};
}

function captureParcel(s){
 try{
  const sv={cx:view.cx,cy:view.cy,k:view.k},ss=sel,sm=mark;
  const bw=bbox[4*s+2]-bbox[4*s],bh=bbox[4*s+3]-bbox[4*s+1];
  const cwC=Math.min(cv.width,Math.round(cv.height*1.5)),chC=Math.round(cwC/1.5);
  const cwCss=cwC/dpr;
  view.k=Math.max(.8,Math.min(8,cwCss*.5/Math.max(60,Math.max(bw,bh*1.5)*1.6)));
  view.cx=(bbox[4*s]+bbox[4*s+2])/2;view.cy=(bbox[4*s+1]+bbox[4*s+3])/2;sel=s;mark=null;
  render();
  const o=document.createElement('canvas');o.width=cwC;o.height=chC;const c=o.getContext('2d');
  const sx=Math.round((cv.width-cwC)/2),sy=Math.round((cv.height-chC)/2);
  c.fillStyle='#0f1a24';c.fillRect(0,0,cwC,chC);
  c.drawImage(cv,sx,sy,cwC,chC,0,0,cwC,chC);c.drawImage(lb,sx,sy,cwC,chC,0,0,cwC,chC);
  const url=o.toDataURL('image/jpeg',.86);
  const wm=cwCss/view.k;
  view.cx=sv.cx;view.cy=sv.cy;view.k=sv.k;sel=ss;mark=sm;render();
  return {url,w:cwC,h:chC,wm};
 }catch(e){return null;}
}

async function histCaptures(s,AT){
 const out=[];if(!AT||!AT.length)return out;const cov=new Set(atlasOf(s,AT).map(m=>m.n));
 const W_=560,H_=400,wm=380,k=W_/wm,cx=(bbox[4*s]+bbox[4*s+2])/2,cy=(bbox[4*s+1]+bbox[4*s+3])/2,X0=cx-wm/2,X1=cx+wm/2,Y0=cy-H_/k/2,Y1=cy+H_/k/2;
 for(const g of OVL)for(const o of g.items){
  if(!o.atlas||!cov.has(o.src))continue;
  let d;try{d=await loadOv(o);}catch(e){continue;}
  const cvs=document.createElement('canvas');cvs.width=W_;cvs.height=H_;const c=cvs.getContext('2d');
  c.fillStyle='#d9d6cf';c.fillRect(0,0,W_,H_);
  c.setTransform(k,0,0,-k,W_/2-cx*k,H_/2+cy*k);
  if(d.bg){const b=d.bg;c.beginPath();c.moveTo(b[0],b[1]);for(let i=2;i<8;i+=2)c.lineTo(b[i],b[i+1]);c.closePath();c.fillStyle=ATLBG;c.fill();}
  let nf_=0;for(let i=0;i<d.nc;i++)for(const C of d.cells.values())if(C.P[i]&&C.b[2]>=X0&&C.b[0]<=X1&&C.b[3]>=Y0&&C.b[1]<=Y1){c.fillStyle=o.cols[i];c.fill(C.P[i],'evenodd');nf_++;}
  if(!nf_){out.empty=(out.empty||[]).concat(o.n);continue;}
  c.setTransform(1,0,0,1,0,0);const X=x=>(x-cx)*k+W_/2,Y=y=>H_/2-(y-cy)*k;
  if(d.L){c.font='italic 12px '+ATLFONT;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
   for(const l of d.L){const x=X(l[0]),y=Y(l[1]);if(x<-40||x>W_+40||y<-10||y>H_+10)continue;c.lineWidth=3;c.strokeStyle='rgba(242,236,221,.9)';c.strokeText(l[2],x,y);c.fillStyle='#3a2c1c';c.fillText(l[2],x,y);}}
  c.beginPath();for(let e=edgS[s];e<edgS[s+1];e+=2){const a=edg[e],b=edg[e+1];c.moveTo(X(pos[2*a]),Y(pos[2*a+1]));c.lineTo(X(pos[2*b]),Y(pos[2*b+1]));}
  c.lineCap='round';c.strokeStyle='#fff';c.lineWidth=6;c.stroke();c.strokeStyle='#d0021b';c.lineWidth=3;c.stroke();
  c.beginPath();c.arc(W_/2,H_/2,Math.max(26,Math.hypot(bbox[4*s+2]-bbox[4*s],bbox[4*s+3]-bbox[4*s+1])*k/2+12),0,6.2832);c.strokeStyle='rgba(208,2,27,.85)';c.lineWidth=2;c.setLineDash([6,4]);c.stroke();c.setLineDash([]);
  c.fillStyle='rgba(255,255,255,.85)';c.fillRect(10,H_-28,120,20);c.fillStyle='#222';c.fillRect(16,H_-14,100*k,3);c.font='11px Arial';c.textAlign='left';c.fillText('100 m',20+100*k,H_-12);
  c.strokeStyle='#888';c.lineWidth=1;c.strokeRect(.5,.5,W_-1,H_-1);
  const m=AT.find(m=>m.n===o.src);
  out.push({url:cvs.toDataURL('image/jpeg',.85),w:W_,h:H_,cap:o.n,u:o.url||(m&&m.p[0][1])});
 }
 return out;
}
/* ---------- coupes sur rue pour la fiche PDF : une par façade sur rue, de l'immeuble en face jusqu'au fond de la parcelle ---------- */
async function facadeCuts(s_){await loadLbl();
 const cad=await ovRings('cad');if(!cad)return [];
 const rs=[];let q=[],prev=-1;for(let e=edgS[s_];e<edgS[s_+1];e+=2){const a_=edg[e],b_=edg[e+1];if(a_!==prev){if(q.length)rs.push(q);q=[pos[2*a_],pos[2*a_+1]];}else q.push(pos[2*a_],pos[2*a_+1]);prev=b_;}if(q.length)rs.push(q);
 const inB=(x,y)=>pip(rs,x,y),parAt=(x,y)=>{for(const p of cad){if(x<p.b[0]||x>p.b[2]||y<p.b[1]||y>p.b[3])continue;if(pip(p.rs,x,y))return p;}return null;};
 const E_=[];for(const r of rs){const n=r.length;for(let i=0;i<n;i+=2){const j=(i+2)%n,x1=r[i],y1=r[i+1],x2=r[j],y2=r[j+1],l=Math.hypot(x2-x1,y2-y1);if(l<1.5)continue;
  const mx=(x1+x2)/2,my=(y1+y2)/2;let nx=-(y2-y1)/l,ny=(x2-x1)/l;if(inB(mx+nx*.5,my+ny*.5)){nx=-nx;ny=-ny;}
  if(parAt(mx+nx*2.5,my+ny*2.5)||parAt(mx+nx*5,my+ny*5))continue;E_.push({mx,my,nx,ny,l,a:Math.atan2(ny,nx)});}}
 const G_=[];for(const e of E_.sort((p,q)=>q.l-p.l)){const g=G_.find(g=>{let d=Math.abs(g.a-e.a);d=Math.min(d,2*Math.PI-d);return d<25*Math.PI/180;});if(g){g.L+=e.l;g.sx+=e.nx*e.l;g.sy+=e.ny*e.l;}else G_.push({e,a:e.a,L:e.l,sx:e.nx*e.l,sy:e.ny*e.l});}
 const out=[];
 for(const g of G_.filter(g=>g.L>=3).sort((p,q)=>q.L-p.L).slice(0,3)){const k=Math.hypot(g.sx,g.sy)||1,nx=g.sx/k,ny=g.sy/k,{mx,my}=g.e;
  let w=null;for(let d=.5;d<=100;d+=.5)if(parAt(mx+nx*d,my+ny*d)&&parAt(mx+nx*(d+1),my+ny*(d+1))){w=d;break;}
  const own=parAt(mx-nx*1,my-ny*1);let p_=30;if(own){for(let d=1;d<=200;d+=.5)if(parAt(mx-nx*d,my-ny*d)!==own){p_=d;break;}}
  const A=[mx+nx*Math.min(110,(w||25)+12),my+ny*Math.min(110,(w||25)+12)],B=[mx-nx*(p_+5),my-ny*(p_+5)];
  let st='',bd=300;const px=mx+nx*(w||10)/2,py=my+ny*(w||10)/2;if(LBL)for(const l of LBL.s||[]){const dx=l[0]-px,dy=l[1]-py,dn=Math.abs(dx*nx+dy*ny),da=Math.abs(-dx*ny+dy*nx);if(dn<(w||10)/2+6&&da<bd){bd=da;st=l[3];}}
  out.push({A,B,w,p:p_,L:g.L,st});}
 return out;}
async function svgJpeg(svg){const vb=svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/),w=+vb[1],h=+vb[2],img=new Image(),u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 await new Promise((r,j)=>{img.onload=r;img.onerror=()=>j(new Error('rendu de la coupe'));img.src=u;});const k=Math.min(2.2,2600/w),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);
 const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);return {url:c.toDataURL('image/jpeg',.86),w:c.width,h:c.height};}
function makePdf(M_,IMG,HIST,COUP){
 const VGS={gs:new Set([100]),a(al){const k=Math.max(0,Math.min(100,Math.round(al*100)));this.gs.add(k);return '/G'+k+' gs ';}};
 const PW=595.28,PH=841.89,MG=56,LW=PW-2*MG,pages=[];let cur,y;
 const g=document.createElement('canvas').getContext('2d');
 const wid=(t,sz,b)=>{g.font=(b?'bold ':'')+sz+'px Arial, Helvetica, sans-serif';return g.measureText(t).width;};
 const CP={'€':'\x80','…':'\x85','‘':'\x91','’':'\x92','“':'\x93','”':'\x94','•':'\x95','–':'\x96','—':'\x97','œ':'\x9c','Œ':'\x8c','≈':'~','→':'-','·':'\xb7'};
 const enc=t=>String(t).replace(/[\r\n\t]+/g,' ').replace(/[   ]/g,' ').replace(/[\s\S]/g,c=>{const k=c.charCodeAt(0);if(k<128)return (c==='\\'||c==='('||c===')')?'\\'+c:c;if(k<256)return c;return CP[c]||'?';});
 const newPage=()=>{cur={ops:[],ln:[]};pages.push(cur);y=PH-MG;};
 function wrap(t,sz,b,w){const out=[];let l='';for(const word of String(t).split(/\s+/)){if(!word)continue;let c=l?l+' '+word:word;if(wid(c,sz,b)<=w){l=c;continue;}if(l)out.push(l);if(wid(word,sz,b)>w){let p='';for(const ch of word){if(wid(p+ch,sz,b)>w){out.push(p);p=ch;}else p+=ch;}l=p;}else l=word;}if(l)out.push(l);return out;}
 function put(t,sz,b,col,ind,url,gap,lead){
  const lines=wrap(t,sz,b,LW-ind),ld=sz*(lead||1.45);
  for(const l of lines){if(y-ld<MG+20)newPage();y-=ld;cur.ops.push('BT /F'+(b?2:1)+' '+sz+' Tf '+col+' rg '+(MG+ind).toFixed(2)+' '+y.toFixed(2)+' Td ('+enc(l)+') Tj ET');if(url)cur.ln.push([MG+ind,y-2,MG+ind+wid(l,sz,b),y+sz,url]);}
  y-=gap||0;
 }
 newPage();
 put(M_.title,24,true,'0.10 0.28 0.41',0,null,4,1.25);
 put(M_.sub,12,false,'0.32 0.46 0.56',0,null,8);
 put('Fiche exportée le '+new Date().toLocaleDateString('fr-FR')+' à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+' avec Paris-graphie (Bouchaud Architectes, https://www.bouchaudarchitectes.com/hors-piste/paris-graphie ; API : https://paris-graphie-api.hub-bokobza.workers.dev/)'+(SRCD._maj?' (données mises à jour le '+fd10(SRCD._maj)+', date d\'extraction de chaque source en fin de document)':'')+'. Données ouvertes ; rattachements '+(PUB?'des dossiers':'des dossiers, ventes et établissements')+' au bâtiment par adresse ou localisation, donc approximatifs.',8.5,false,'0.45 0.45 0.45',0,null,18);
 let imgH=0;
 if(IMG){const w=LW,h=w*IMG.h/IMG.w;if(y-h<MG+40)newPage();y-=h;cur.ops.push('q '+w.toFixed(2)+' 0 0 '+h.toFixed(2)+' '+MG+' '+y.toFixed(2)+' cm /Im1 Do Q');
  y-=14;put('Capture de la carte Paris-graphie, largeur d\'environ '+Math.round(IMG.wm/10)*10+' m. Bâtiment sélectionné entouré de blanc'+(IMG.layer?', couleurs selon le calque « '+IMG.layer+' »':', plan neutre (aucun calque thématique)')+'. Fond : emprise bâtie Apur ; Seine et arrondissements : Ville de Paris ; numéros : Base Adresse Nationale.',7.5,false,'0.45 0.45 0.45',0,null,8);
  if(IMG.leg){const hx=h=>{const v=parseInt(h.slice(1),16);return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255].map(x=>x.toFixed(3)).join(' ');};
   put('Légende du calque « '+IMG.leg.name+' » (classe du bâtiment en gras)',9,true,'0.10 0.28 0.41',0,null,4);
   const it=IMG.leg.items,cols=it.length>6?2:1,cw=LW/cols,rows=Math.ceil(it.length/cols),rh=13;
   if(y-rows*rh<MG+20)newPage();const y0=y;
   it.forEach((e,i)=>{const cx=MG+Math.floor(i/rows)*cw,cy=y0-(i%rows+1)*rh;cur.ops.push(hx(e[0])+' rg '+cx.toFixed(2)+' '+(cy-1).toFixed(2)+' 9 9 re f'+(e[2]?' 0.10 0.28 0.41 RG 1.4 w '+(cx-1.5).toFixed(2)+' '+(cy-2.5).toFixed(2)+' 12 12 re S':''));cur.ops.push('BT /F'+(e[2]?2:1)+' 8.5 Tf '+(e[2]?'0.10 0.28 0.41':'0.30 0.30 0.30')+' rg '+(cx+15).toFixed(2)+' '+(cy+0.5).toFixed(2)+' Td ('+enc(e[1])+') Tj ET');});
   y=y0-rows*rh-10;}
 }
 /* appel à l'action de l'agence, en bas de la première page (ou à la suite si la page est pleine) */
 {const bh=50,P0=pages[0],url=CTA_URL+'&utm_medium=pdf';let pg_=P0,by=MG+8;if(!(pages.length===1&&y-bh-16>MG+8)){if(y-bh-16<MG+20)newPage();pg_=cur;by=y-bh-12;y=by-8;}
  pg_.ops.push('0.10 0.28 0.41 rg '+MG+' '+by.toFixed(2)+' '+LW.toFixed(2)+' '+bh+' re f');
  pg_.ops.push('BT /F2 12 Tf 1 1 1 rg '+(MG+16).toFixed(2)+' '+(by+28).toFixed(2)+' Td ('+enc(CTA_TXT)+') Tj ET');
  pg_.ops.push('BT /F1 8.5 Tf 0.76 0.81 0.84 rg '+(MG+16).toFixed(2)+' '+(by+12).toFixed(2)+' Td ('+enc(CTA_SUB)+') Tj ET');
  pg_.ln.push([MG,by,MG+LW,by+bh,url]);}
 if(COUP&&COUP.length){newPage();put('COUPES SUR RUE',13,true,'0.10 0.28 0.41',0,null,0,1.2);y-=4;cur.ops.push('0.75 0.81 0.85 RG 0.7 w '+MG+' '+y.toFixed(2)+' m '+(PW-MG)+' '+y.toFixed(2)+' l S');y-=12;
  put(COUP.note,8,false,'0.45 0.45 0.45',0,null,10);
  if(COUP.elev){y-=4;put('Potentiel de surélévation (indicatif)',10,true,'0.10 0.28 0.41',0,null,6);
   if(COUP.elev.prot)put('Attention : '+COUP.elev.prot+'. Une surélévation y est très encadrée, voire exclue ; l\'avis de l\'architecte des Bâtiments de France ou de la Ville (Commission du Vieux Paris) est à prévoir avant toute étude.',8.5,true,'0.70 0.19 0.25',0,null,8);
   for(const l of COUP.elev.lines)put(l,8.5,false,'0.15 0.15 0.15',0,null,6);put(COUP.elev.note,7.5,false,'0.45 0.45 0.45',0,null,12);}
  COUP.forEach((c,i)=>{let w=LW,h=w*c.vb[1]/c.vb[0];const hm=PH-2*MG-70;if(h>hm){h=hm;w=h*c.vb[0]/c.vb[1];}if(y-h-30<MG+20)newPage();y-=h;cur.ops.push(c.vec(VGS,[MG+(LW-w)/2,y,w,h]).ops);y-=6;put(c.cap,8,false,'0.25 0.25 0.25',0,null,14);});}
 const hist=()=>{if(!(HIST&&HIST.length))return;
  y-=10;put('Extraits des plans de Michel Huard (paris-atlas-historique.fr), calés automatiquement sur le plan actuel : l\'immeuble est cerclé et entouré de rouge. Précision indicative, de l\'ordre de 5 à 15 m. Chaque titre renvoie à la page de la carte.',8,false,'0.45 0.45 0.45',0,null,8);
  if(HIST.empty)put('Rien de dessiné autour de l\'immeuble sur : '+HIST.empty.join(', ')+' (site encore hors de la ville ou non renseigné).',8,false,'0.45 0.45 0.45',0,null,8);
  const gw=(LW-12)/2,gh=gw*HIST[0].h/HIST[0].w;
  HIST.forEach((im,i)=>{const col=i%2;if(col===0){if(y-gh-22<MG+20)newPage();}const x=MG+col*(gw+12),yt=y;
   cur.ops.push('q '+gw.toFixed(2)+' 0 0 '+gh.toFixed(2)+' '+x.toFixed(2)+' '+(yt-gh).toFixed(2)+' cm /Ih'+i+' Do Q');
   const ty=yt-gh-11;cur.ops.push('BT /F2 8.5 Tf 0.10 0.28 0.41 rg '+x.toFixed(2)+' '+ty.toFixed(2)+' Td ('+enc(im.cap)+') Tj ET');if(im.u)cur.ln.push([x,ty-2,x+wid(im.cap,8.5,true),ty+9,im.u]);
   if(col===1||i===HIST.length-1)y=yt-gh-24;});};
 let fam0=0;for(const S_ of M_.sec){
  newPage();
  if(S_.f&&S_.f!==fam0){fam0=S_.f;put(FAM[S_.f],9,true,'0.45 0.45 0.45',0,null,0,1.2);y-=4;}
  put(S_.h.toUpperCase(),13,true,'0.10 0.28 0.41',0,null,0,1.2);
  y-=4;cur.ops.push('0.75 0.81 0.85 RG 0.7 w '+MG+' '+y.toFixed(2)+' m '+(PW-MG)+' '+y.toFixed(2)+' l S');y-=12;
  if(S_.id==='hist')hist();
  for(const i of S_.items){
   put(i.t,9.5,false,i.s?'0.1 0.1 0.1':(i.u?'0.10 0.28 0.41':'0.1 0.1 0.1'),0,(!i.s&&i.u)?i.u:null,0,1.5);
   if(i.s){y-=2;put('Source : '+i.s+(i.u?' - '+i.u:''),7.5,false,'0.35 0.5 0.62',10,i.u||null,9,1.4);}else y-=9;
  }
 }
 const dexp=new Date().toLocaleDateString('fr-FR')+' à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 pages.forEach((p,i)=>{p.ops.push('BT /F1 7.5 Tf 0.5 0.5 0.5 rg '+(PW-MG-44).toFixed(2)+' 26 Td (Page '+(i+1)+' / '+pages.length+') Tj ET');p.ops.push('BT /F1 7.5 Tf 0.5 0.5 0.5 rg '+MG+' 26 Td ('+enc('Paris-graphie · fiche exportée le '+dexp+' · '+M_.title)+') Tj ET');});
 const objs=[];const add=s=>{objs.push(s);return objs.length;};
 add('<< /Type /Catalog /Pages 2 0 R >>');add('');add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 let imObj=0;
 const hObj=(HIST||[]).map(im=>{const bin=atob(im.url.split(',')[1]);return add('<< /Type /XObject /Subtype /Image /Width '+im.w+' /Height '+im.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+bin.length+' >>\nstream\n'+bin+'\nendstream');});
 const cObj=[];
 if(IMG){const bin=atob(IMG.url.split(',')[1]);imObj=add('<< /Type /XObject /Subtype /Image /Width '+IMG.w+' /Height '+IMG.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+bin.length+' >>\nstream\n'+bin+'\nendstream');}
 const kids=[];
 for(const p of pages){
  const cs=p.ops.join('\n'),cn=add('<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
  const an=p.ln.map(l=>add('<< /Type /Annot /Subtype /Link /Rect ['+l.slice(0,4).map(v=>v.toFixed(2)).join(' ')+'] /Border [0 0 0] /A << /S /URI /URI ('+enc(l[4])+') >> >>'));
  const pn=add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+PW+' '+PH+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << '+[...VGS.gs].map(k=>'/G'+k+' << /ca '+(k/100)+' /CA '+(k/100)+' >>').join(' ')+' >>'+((imObj||hObj.length||cObj.length)?' /XObject << '+(imObj?'/Im1 '+imObj+' 0 R ':'')+hObj.map((h,i)=>'/Ih'+i+' '+h+' 0 R ').join('')+cObj.map((h,i)=>'/Ic'+i+' '+h+' 0 R ').join('')+'>>':'')+' >> /Contents '+cn+' 0 R'+(an.length?' /Annots ['+an.map(a=>a+' 0 R').join(' ')+']':'')+' >>');
  kids.push(pn);
 }
 objs[1]='<< /Type /Pages /Count '+kids.length+' /Kids ['+kids.map(k=>k+' 0 R').join(' ')+'] >>';
 let out='%PDF-1.4\n',offs=[];
 objs.forEach((o,i)=>{offs.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n';});
 const xr=out.length;out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+xr+'\n%%EOF';
 const u8=new Uint8Array(out.length);for(let i=0;i<out.length;i++)u8[i]=out.charCodeAt(i)&255;
 return new Blob([u8],{type:'application/pdf'});
}
const ftOpen=(id,o)=>{if(o){if(isMob())$('#panel').classList.remove('min');setTimeout(()=>$(id).scrollIntoView({behavior:'smooth',block:'start'}),30);}};
$('#srcb').onclick=e=>{const o=$('#srct').hidden;$('#srct').hidden=!o;e.currentTarget.setAttribute('aria-expanded',o);ftOpen('#srct',o);};
// plein écran : API du navigateur ; si elle est bloquée (iframe sans autorisation, iPhone), ouverture de la carte seule dans un nouvel onglet
{const b=$('#fsb'),de=document.documentElement,req=de.requestFullscreen||de.webkitRequestFullscreen,ex=document.exitFullscreen||document.webkitExitFullscreen,cur=()=>document.fullscreenElement||document.webkitFullscreenElement;
 const upd=()=>{const on=!!cur();b.textContent=on?'✕':'⛶';b.title=on?'Quitter le plein écran':'Plein écran';b.setAttribute('aria-label',b.title);};
 b.onclick=async()=>{try{if(cur()){await ex.call(document);}else if(req&&(document.fullscreenEnabled||document.webkitFullscreenEnabled)){await req.call(de);}else throw 0;}catch(e){window.open(location.href,'_blank','noopener');}};
 document.addEventListener('fullscreenchange',upd);document.addEventListener('webkitfullscreenchange',upd);
 if(!(document.fullscreenEnabled||document.webkitFullscreenEnabled)&&window.top===window.self)b.hidden=true;   // iPhone : déjà en plein écran dans l'onglet
}
$('#methb').onclick=e=>{const b=$('#metht'),o=b.hidden;if(o&&!b.innerHTML)b.innerHTML='<div class="k" style="margin-top:6px">Les indicateurs ci-dessous sont calculés par Paris-graphie à partir des données sources. Ce sont des ordres de grandeur, à vérifier.</div>'+METH.map(m=>'<b>'+esc(m.indicateur)+'</b>'+esc(m.methode)).join('');b.hidden=!o;e.currentTarget.setAttribute('aria-expanded',o);ftOpen('#metht',o);};
let PCTX=null;
cb.addEventListener('click',async e=>{if(e.target&&e.target.id==='shb'&&PCTX){permalink(PCTX.s);const url=location.href,ad=(PCTX.A&&PCTX.A[PCTX.s]&&PCTX.A[PCTX.s][0])||'Immeuble',m=$('#pdfm');
  if(navigator.share&&isMob()){try{await navigator.share({title:ad+' · Paris-graphie',url});}catch(_){}}
  else{try{await navigator.clipboard.writeText(url);if(m)m.textContent='Lien copié';}catch(_){if(m)m.innerHTML='<input value="'+esc(url)+'" style="width:100%" onclick="this.select()" readonly>';}}return;}
 if(e.target&&e.target.id==='pdfb'&&PCTX&&(PF[PCTX.s]&3))await loadMhd();
 if(e.target.id!=='pdfb'||!PCTX)return;
 const m=$('#pdfm');
 try{
  const HIST=await histCaptures(PCTX.s,PCTX.atl).catch(()=>[]);const COUP=[];
  {const FC=await facadeCuts(PCTX.s).catch(()=>[]);
   for(let i=0;i<FC.length;i++){const c=FC[i];m.textContent='Coupe sur rue '+(i+1)+' / '+FC.length+' (terrain, PLU, arbres'+(CUTOFF.has('lidar')?'':', LiDAR HD')+')…';
    try{const r=await cutShow(c.A,c.B,{headless:true,s:PCTX.s}),J={elev:r.elev,st:c.st,vec:r.vec,vb:r.svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).slice(1).map(Number)};J.cap='Coupe '+(i+1)+' : perpendiculaire à la façade sur '+(c.st||'rue')+' (façade de '+fr(c.L,0)+' m), de l\'immeuble en face (A) jusqu\'au fond de la parcelle (B), '+fr(r.L,0)+' m ; voie d\'environ '+(c.w?fr(c.w,1)+' m':'?')+' entre limites de parcelles'+(r.lid?' ; '+r.lid.toLocaleString('fr-FR')+' points LiDAR HD':'')+'. On regarde vers la gauche du trait A-B (flèches rouges du plan de repérage).';COUP.push(J);}catch(e){}}
   {/* surélévation, indicatif : faîtage relevé comparé à l'enveloppe du PLU, coupe par coupe ; avertissement si l'immeuble est protégé */
    const f=PF[PCTX.s],prot=f&1?'monument historique':f&2?'immeuble protégé':f&4?'bâtiment protégé par le PLU':f&32?'volumétrie à conserver (PLU)':f&16?'bâtiment moderne signalé (PLU)':f&64?'parcelle signalée (PLU)':f&8?'dans un périmètre de protection de monument historique':'';
    const L_=[];COUP.forEach((c,i)=>{const e=c.elev;if(!e)return;const hs=fr(e.ridge-e.ground,1);
     if(e.allowed==null){L_.push('Coupe '+(i+1)+' ('+(c.st||'rue')+') : faîtage relevé à '+fr(e.ridge,1)+' m NVP ('+e.src+'), soit '+hs+' m au-dessus du sol ; pas d\'enveloppe du PLU calculée sur cette coupe.');return;}
     const d=e.delta,n=Math.floor(d/3);
     L_.push('Coupe '+(i+1)+' ('+(c.st||'rue')+') : faîtage relevé à '+fr(e.ridge,1)+' m NVP ('+e.src+'), soit '+hs+' m au-dessus du sol ; enveloppe du PLU jusqu\'à '+fr(e.allowed,1)+' m NVP sur l\'emprise coupée ; '+(d>=1?'marge d\'environ '+fr(d,1)+' m'+(n>=1?', soit '+n+' niveau'+(n>1?'x':'')+' de 3 m':', inférieure à un niveau'):d>-1?'pas de marge':'le faîtage dépasse déjà l\'enveloppe de '+fr(-d,1)+' m')+'.');});
    if(L_.length)COUP.elev={lines:L_,prot,note:'Indicatif, sans valeur réglementaire : enveloppe du PLU bioclimatique estimée (gabarit-enveloppe sur voie, plafond des hauteurs, hauteur maximale constructible ; la plus basse s\'applique), comparée au point le plus haut du bâtiment sur la coupe (faîtage, et non hauteur moyenne de la toiture). Ne tient compte ni des prospects sur cour, ni des règles de volumétrie, ni de la structure existante.'};}
   COUP.note='Coupes vectorielles tracées automatiquement perpendiculairement à chaque façade sur rue (bords de l\'emprise Apur donnant sur un espace hors parcelle cadastrale), de l\'immeuble d\'en face jusqu\'au fond de la parcelle. Calques et profondeur visible ('+(LDg<1?Math.round(LDg*100)+' cm':fr(LDg,LDg<10?1:0)+' m')+' derrière le plan) repris des réglages de la fenêtre Coupe. Méthodes et sources de chaque élément : voir « Coupe » dans les méthodes de calcul de Paris-graphie. Estimation sans valeur réglementaire.';}
  m.textContent='Assemblage du PDF…';
  const M_=docModel(PCTX.s,PCTX),IMG=captureParcel(PCTX.s),blob=makePdf(M_,(IMG&&(IMG.layer=st.crit.id==='neu'?'':st.crit.name,IMG.leg=(()=>{const L=legendOf(PCTX.s);if(!L)return null;const c=L.c;return {name:c.name,items:c.grad?[[L.col,'Année de construction : '+L.lab,true]]:c.lab.map((lb,i)=>[c.col[i]||'#999',lb,i===L.i])};})(),IMG)),HIST,COUP),url=URL.createObjectURL(blob);
  const nm='fiche-'+(M_.title.replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'batiment')+'.pdf';
  await savePdf(blob,nm,(h,cb)=>{m.innerHTML=h;if(cb)cb(m);});
 }catch(err){m.textContent='Échec de la génération du PDF ('+err.message+').';}
});

function fiche(s){}
