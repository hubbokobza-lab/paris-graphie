/* ---------- critères ---------- */
const AN=S.an_const,RE=S.an_rehab,SU=S.an_surel,HM=S.h_med,HX=S.h_max,VG=S.veg,PE=S.per,ARR=S.arr,TE=S.ter,SO=S.sol,IG=S.igh;
const SNE=S.s_ne,SEF=S.s_eff,SAC=S.s_act,SCL=S.s_cl,SNEK=S.s_nek||new Uint16Array(N);
const ZO=S.zo,HP=S.hp,PF=S.pf,RS=S.rs,ARN=S.ar_n,TYP=S.ty||new Uint8Array(N),NCM=S.nc||new Uint16Array(N);
const TY_LAB=['Non renseigné','Logement collectif','Bâtiment mixte (logement et activité)','Tertiaire ou industriel','Logement individuel','Non déterminé'],TY_COL=['#3a4652','#66c2a5','#fee08b','#3288bd','#abdda4','#9a9aa8'];
const COM_LAB=['Grand magasin','Alimentaire','Non alimentaire','Service commercial','Restauration','Local vacant','Autre local','Hôtel'],COM_COL=['#c77dff','#80ed99','#4cc9f0','#ffd166','#ff8c42','#e5e5e5','#9a9aa8','#ff4d6d'];
const NA=S.n_adr,DN=S.dvf_n,DL=S.dvf_last,PM=S.pm2;
const NT=S.n_tot,LPC=S.last_pc,LPD=S.last_pd,SF=S.surf,CN=S.cvp_n,CK=S.cvp_k,RC=S.rec;
const GRAY='#56626e';
const PER_LAB=["Avant 1800","1801–1850","1851–1914","1915–1939","1940–1967","1968–1975","1976–1981","1982–1989","1990–1999","2000–2007","Depuis 2008","Non daté"];
const SPEC=["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#7b6fd0"];
const PMAP={1:0,2:1,3:2,5:3,6:4,7:5,8:6,9:7,10:8,11:9,12:10,13:11,0:11};
function hexRgb(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function pack(h){const [r,g,b]=hexRgb(h);return (r|(g<<8)|(b<<16)|(255<<24))>>>0;}
const KNOTS=[1750,1825,1882,1927,1953,1971,1979,1986,1995,2004,2015];
function yearColor(y){
 let i=0;if(y<=KNOTS[0])return SPEC[0];if(y>=KNOTS[10])return SPEC[10];
 while(y>KNOTS[i+1])i++;
 const t=(y-KNOTS[i])/(KNOTS[i+1]-KNOTS[i]),a=hexRgb(SPEC[i]),b=hexRgb(SPEC[i+1]);
 return '#'+a.map((v,j)=>Math.round(v+(b[j]-v)*t).toString(16).padStart(2,'0')).join('');
}
const YEAR32=new Uint32Array(2100);for(let y=0;y<2100;y++)YEAR32[y]=pack(yearColor(y));
const REH_LAB=["1900–1989","1990–1999","2000–2009","2010–2014","2015–2019","2020 et après","Aucune connue"];
const REH_COL=["#7b6fd0","#3288bd","#66c2a5","#abdda4","#fee08b","#f46d43",GRAY];
const SUR_LAB=["2000–2009","2010–2014","2015–2019","2020 et après","Aucune connue"];
const SUR_COL=["#3288bd","#66c2a5","#fee08b","#f46d43",GRAY];
const HT_LIM=[60,120,160,200,250,310,500,1000];
const BN=S.bn||new Uint8Array(N),BU=S.bu||new Uint8Array(N),BL=S.bl||new Uint16Array(N),BS=S.bs||new Uint16Array(N),BT=S.bt||new Uint16Array(N),BM=S.bm||new Uint8Array(N),BD=S.bd||new Uint8Array(N),BG=S.bg||new Uint8Array(N),BE=S.be||new Uint8Array(N);
const nivEst=s=>Math.max(1,Math.round(HM[s]/30)),nivFF=s=>BN[s]>0&&HM[s]/10/BN[s]<=5.5,nivOf=s=>nivFF(s)?BN[s]:nivEst(s);   // niveaux des fichiers fonciers, sauf s'ils sont incohérents avec la hauteur
const SPL=s=>Math.round(area[s]*nivOf(s)),SDPm=s=>Math.round(SPL(s)*.7),sdpTxt=s=>nf.format(Math.round(SPL(s)*.6/10)*10)+' à '+nf.format(Math.round(SPL(s)*.8/10)*10)+' m² (calcul : emprise × niveaux, moins 20 à 40 %)',CO2R=650,co2Of=s=>SDPm(s)*CO2R/1000;
const DPE_COL=['#3a4652','#009c6d','#52b153','#a5cc74','#f4e70f','#f0b50f','#eb8235','#d7221f'],GES_COL=['#3a4652','#f6edfd','#e4c7f5','#d5a9f0','#cb95ed','#ba72e6','#a74ddd','#8a24c7'];
const MAT_LAB=['Indéterminé','Pierre','Brique ou meulière (avec ou sans pierre)','Béton','Béton et maçonnerie','Bois','Autres'],MAT_COL=['#3a4652','#e9d8a6','#c8553d','#8d99ae','#adb5bd','#9c6644','#6c757d'];
const USG_LAB=['Non renseigné','Résidentiel collectif','Résidentiel individuel','Tertiaire','Secondaire ou primaire','Dépendance'];
const NACC=S.n_acc||new Uint16Array(N),TFO=S.tfo||new Uint8Array(N),OWN=S.own||new Uint8Array(N),OWNN=S.own_n||new Uint16Array(N);
const OWN_LAB=['Aucun propriétaire personne morale connu (particuliers ou inconnu)','État, Ville, établissement public','Bailleur social','Copropriété (syndicat des copropriétaires)','Société civile (SCI, SCPI…)','Société commerciale (foncière, assureur, banque…)','Association, fondation, autre'];
// Taux d'occupation apparent : effectif salarié estimé × 20 m² de surface de plancher par salarié, rapporté à la surface de plancher estimée (milieu de fourchette)
const M2_SAL=20;
const YNOW=new Date().getFullYear();
// surface de bureaux : surface de plancher estimée, moins 65 m² par logement dans les immeubles mixtes
const offSDP=s=>Math.max(0,SPL(s)*.7-BL[s]*65);
function occOf(s){const sdp=offSDP(s);if(!(sdp>0)||!SNE[s])return null;const kn=SNEK[s]/SNE[s];if(kn<.5)return {kn,ok:0};
 const r=SEF[s]*M2_SAL/sdp;return {r,kn,ok:1,c:r<.25?1:r<.5?2:r<.8?3:4};}
const occTxt=s=>{const o=occOf(s);if(!o)return '';if(!o.ok)return 'non calculable : effectif connu pour '+Math.round(o.kn*100)+' % des établissements seulement';
 return 'environ '+(o.r>=1.5?'plus de 150':Math.round(o.r*100/5)*5)+' % ('+nf.format(SEF[s])+' salariés estimés pour '+nf.format(Math.round(SPL(s)*.7/10)*10)+' m² de surface de plancher ; effectif connu pour '+Math.round(o.kn*100)+' % des établissements)';};
// Indice de suspicion de vacance des bureaux (0 à 5) et fiabilité (1 à 5), à partir de Sirene, des permis et de la date de construction
function vacOf(s){
 const mix=BU[s]===3&&BL[s]>0&&nivOf(s)>=3&&!BE[s]&&offSDP(s)>=.4*SPL(s)*.7;   // immeuble mixte à dominante de bureaux
 const off=burOf(s)===1||(BU[s]===3&&nivOf(s)>=2&&BL[s]===0)||mix;if(!off)return {c:0,f:0,why:''};
 // hors champ : musées et lieux culturels, lieux de culte, hôtels, propriétaires publics (État, Ville, établissements publics)
 let hors=OWN[s]===1||area[s]>12000||(PF[s]&3);   // propriétaire public, très grande emprise, monument historique
 let G_=null;try{G_=GARES;}catch(e){}
 if(!hors&&G_){const x0=bbox[4*s]-30,y0=bbox[4*s+1]-30,x1=bbox[4*s+2]+30,y1=bbox[4*s+3]+30;   // gares ferroviaires (trains grandes lignes ou Transilien)
  hors=G_.some(g=>/Train /.test(g[2])&&g[0]>=x0&&g[0]<=x1&&g[1]>=y0&&g[1]<=y1);}try{hors=hors||XTRA.some(x=>x[2]&&x[2][s]&&x[2][s].length);}catch(e){}
 if(hors)return {c:0,f:0,why:''};
 const ne=SNE[s],cl=SCL[s],na=NA[s],neuf=AN[s]>=2018||RE[s]>=2021||LPC[s]>=2020,multi=ne>=5||na>=3;
 if(TFO[s])return {c:6,f:4,why:'permis de transformation de bureaux en logements '+(TFO[s]===1?'accordé':'en instruction')+' depuis moins de 6 ans'};
 if(ne>100)return {c:1,f:1,why:'plus de 100 établissements déclarés : adresse de domiciliation probable, indice non significatif'};
 let sc,f,why;const r=cl/Math.max(1,ne+cl);
 if(ne===0){
  if(AN[s]>=YNOW-1||RE[s]>=YNOW-1){sc=5;f=2;why='livraison récente sans établissement actif : commercialisation en cours, ou emménagement que Sirene n\'enregistre qu\'avec plusieurs mois de retard';}
  else if(neuf){sc=5;f=3;why='immeuble neuf ou restructuré depuis plus d\'un an, toujours sans établissement actif';}
  else if(cl>0){sc=4;f=3;why='aucun établissement actif, '+cl+' fermeture'+(cl>1?'s':'')+' depuis 2024';}
  else{sc=3;f=2;why='aucun établissement déclaré à l\'adresse (un occupant unique peut être domicilié ailleurs)';}
 }else if(multi){
  sc=r>=.5?3:r>=.3?2:1;f=ne>=10?3:2;why='immeuble multilocataire ('+ne+' établissements actifs, '+cl+' fermés depuis 2024) : vacance partielle '+(sc>=2?'probable':'peu probable');
 }else{
  sc=r>=.5?3:cl>0?2:1;f=2;why=ne+' établissement'+(ne>1?'s':'')+' actif'+(ne>1?'s':'')+(cl?', '+cl+' fermé'+(cl>1?'s':'')+' depuis 2024':', aucune fermeture récente');
  if(neuf&&ne<=2){sc=Math.max(sc,3);why+=' ; immeuble neuf ou restructuré peu occupé';}
 }
 if(ne>0){const o=occOf(s);if(o&&o.ok){   // taux d'occupation apparent (effectifs Sirene / surface)
   if(o.r<.25){sc=Math.max(sc,4);why+=' ; occupation apparente inférieure à 25 %';}
   else if(o.r<.5){sc=Math.max(sc,3);why+=' ; occupation apparente de 25 à 50 %';}
   else if(o.r>=.8&&sc>1){sc=Math.max(1,sc-1);why+=' ; occupation apparente élevée';}
   if(o.kn>=.8)f=Math.min(4,f+1);}}
 if(sc>=1&&sc<=1&&ne>=3)f=Math.min(4,f+1);
 if(mix){f=Math.max(1,f-1);why+=' ; immeuble mixte (logements et bureaux), indice moins sûr';}
 return {c:sc<=1?1:sc,f,why,sc};
}
const vacTxt=s=>{const v=vacOf(s);if(!v.c)return '';return (v.c===6?'transformation en logements engagée':(v.sc??v.c)+'/5')+' (fiabilité '+v.f+'/5) : '+v.why;};
const burOf=s=>((BU[s]===3||TYP[s]===3)&&BL[s]===0&&!BE[s]&&nivOf(s)>=3)?1:(BL[s]>0&&BT[s]>0)?2:0;
const HT_LAB=["Moins de 6 m","6–12 m","12–16 m","16–20 m","20–25 m","25–31 m","31–50 m","50–100 m","Plus de 100 m"];
const HT_COL=["#2f4a73","#3a6a9c","#3288bd","#66c2a5","#abdda4","#fee08b","#fdae61","#f46d43","#d53e4f"];
const heightCls=A=>s=>{const v=A[s];let i=0;while(i<8&&v>=HT_LIM[i])i++;return i;};
const ARR_LAB=Array.from({length:20},(_,i)=>(i+1)+(i?"e":"er")+" arr.").concat(["Non renseigné"]);
const ARR_COL=Array.from({length:20},(_,i)=>{const h=i*18,l=(i%2?72:56);return hsl(h,62,l);}).concat([GRAY]);
function hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');}
const PC_LAB=["Avant 1990","1990–1999","2000–2009","2010–2014","2015–2019","2020 et après","Aucun connu"];
const lastCls=A=>s=>{const y=A[s];if(!y)return 6;return y<1990?0:y<2000?1:y<2010?2:y<2015?3:y<2020?4:5;};
const ORG={acc:'Ville de Paris',occ:'Calcul (Insee Sirene, Apur, CSTB)',own:'DGFiP (locaux des personnes morales)',vac:'Déduction (Insee Sirene, permis, Apur)',per:'Apur',yr:'Apur',reh:'Apur',sur:'Apur',hm:'Apur',hx:'Apur',niv:'CSTB (BDNB), Apur',typ:'Apur',ncm:'Apur',usg:'CSTB (BDNB)',log:'CSTB (BDNB)',soc:'CSTB (BDNB), RPLS',bur:'Déduction Apur et CSTB',dpe:'Ademe via CSTB',ges:'Ademe via CSTB',mur:'DGFiP via CSTB',co2:'Estimation Apur et CSTB',dos:'Ville de Paris',pc:'Ville de Paris',pd:'Ville de Paris',sf:'Ville de Paris',rc:'Ville de Paris',cvp:'Ville de Paris',pro:'Apur',pm:'DGFiP, Etalab',dv:'DGFiP, Etalab',sa:'Insee',ne:'Insee',se:'Insee',cl:'Insee',zo:'Ville de Paris',hp:'Ville de Paris',dh:'Ville de Paris',rs:'Ville de Paris',ar:'Ville de Paris',toit:'Apur',arr:'Ville de Paris',
mh:'Apur',pp:'Apur',courbe:'IGN',lcz:'Cerema',veg:'Apur',p70:'BHVP',fem:'Ville de Paris',hot:'Atout France',tcf:'IDFM',osmm:'OpenStreetMap',boa0:'bouchaudarchitectes.com',boa1:'bouchaudarchitectes.com',boa2:'bouchaudarchitectes.com',cult:'Ministère de la Culture',culte:'OpenStreetMap',osms:'OpenStreetMap',bus:'IDFM',gare:'IDFM',acc:'IDFM',cu:'Ville de Paris',abnb:'Inside Airbnb',femp:'Ville de Paris',com:'Apur',cad:'DGFiP, IGN'};
const orgOf=id=>ORG[id]||(/^at[m0-9]/.test(id)?'Michel Huard, Atlas historique de Paris':'Ville de Paris'),orgHtml=id=>'<small class="org">'+orgOf(id)+'</small>';
/* deux familles : l'ouvrage (ce qui est construit, dure et se mesure) puis l'usage et le droit (ce qui relève du papier) */
const FAM=['',"L'ouvrage","L'usage et le droit"];
const SEC_ORD=['id','bati','ener','hist','sol','usage','own','aut','pat','plu','sir','dvf'];
const SEC_FAM={bati:1,ener:1,hist:1,sol:1,usage:2,own:2,aut:2,pat:2,plu:2,sir:2,dvf:2};
/* PUB : version publique (true sur le site publié, fixé par step_site) ; sans DVF et sans noms Sirene */
const PUB=false;
/* essai : gammes dérivées de la charte (ocre pour l'ancien, gris-bleu, bleu pour le récent ; hauteurs du sombre au clair) */
if(ESSAI){const ramp=(st,n)=>Array.from({length:n},(_,i)=>{const t=n<2?0:i/(n-1)*(st.length-1),k=Math.min(st.length-2,Math.floor(t)),u=t-k,a=hexRgb(st[k]),b=hexRgb(st[k+1]);return '#'+[0,1,2].map(j=>Math.round(a[j]+(b[j]-a[j])*u).toString(16).padStart(2,'0')).join('');});
 const AGE=['#8a6a3e','#b8925c','#dcc39a','#ece4d3','#c4d3df','#86a7c2','#4f7ca3'];
 SPEC.splice(0,SPEC.length,...ramp(AGE,SPEC.length));
 const fix=(A,stops)=>{const n=A.length-(A[A.length-1]===GRAY?1:0);A.splice(0,n,...ramp(stops,n));};
 fix(HT_COL,['#2e4559','#4f7193','#86a7c2','#c4d3df','#f4f7f9']);fix(REH_COL,['#c4d3df','#86a7c2','#4f7ca3','#2f5f8a']);fix(SUR_COL,['#c4d3df','#86a7c2','#4f7ca3','#2f5f8a']);}
const CRIT=[
 {id:'neu',g:'Plan',name:'Plan neutre (aucun calque)',lab:['Bâtiment'],col:['#8b98a4'],cls:s=>0},
 {id:'hm',g:'Volume',name:'Hauteur médiane',lab:HT_LAB,col:HT_COL,cls:heightCls(HM)},
 {id:'hx',g:'Volume',name:'Hauteur maximale',lab:HT_LAB,col:HT_COL,cls:heightCls(HX)},
 {id:'niv',g:'Volume',name:'Nombre de niveaux (fichiers fonciers, sinon estimé)',lab:['1 niveau (RDC)','2 (R+1)','3 à 4 (R+2, R+3)','5 à 6 (R+4, R+5)','7 (R+6)','8 (R+7)','9 à 10 (R+8, R+9)','11 et plus'],col:['#2f4a73','#3a6a9c','#3288bd','#66c2a5','#fee08b','#fdae61','#f46d43','#d53e4f'],cls:s=>{const n=nivOf(s);return n<=1?0:n===2?1:n<=4?2:n<=6?3:n===7?4:n===8?5:n<=10?6:7;}},
 {id:'dpe',g:'Énergie et carbone',name:'DPE, étiquette énergie',lab:['Pas de DPE','A','B','C','D','E','F','G'],col:DPE_COL,cls:s=>BD[s]},
 {id:'ges',g:'Énergie et carbone',name:'DPE, étiquette climat (GES)',lab:['Pas de DPE','A','B','C','D','E','F','G'],col:GES_COL,cls:s=>BG[s]},
 {id:'mur',g:'Énergie et carbone',name:'Matériau des murs (fichiers fonciers)',lab:MAT_LAB,col:MAT_COL,cls:s=>BM[s]},
 {id:'toit',g:'Énergie et carbone',name:'Toitures',lab:["Panneaux solaires","Végétalisée (≥ 10 m²)","Terrasse","Autre ou inconnue"],col:["#ffd166","#66c2a5","#3288bd",GRAY],cls:s=>SO[s]?0:VG[s]>=10?1:TE[s]?2:3},
 {id:'co2',g:'Énergie et carbone',name:'Carbone d\'une reconstruction à neuf (ordre de grandeur)',lab:['Moins de 250 t CO₂e','250 à 500 t','500 à 1 000 t','1 000 à 2 500 t','Plus de 2 500 t'],col:['#ffffcc','#fed976','#fd8d3c','#e31a1c','#800026'],cls:s=>{const c=co2Of(s);return c<250?0:c<500?1:c<1000?2:c<2500?3:4;}},
 {id:'per',g:'Âge',name:'Période de construction',lab:PER_LAB,col:SPEC.concat([GRAY]),cls:s=>PMAP[PE[s]]??11},
 {id:'yr',g:'Âge',name:'Année de construction',lab:["Année connue","Non daté"],grad:true,col:[null,GRAY],cls:s=>AN[s]?0:1},
 {id:'reh',g:'Âge',name:'Réhabilitation',lab:REH_LAB,col:REH_COL,cls:s=>{const r=RE[s];if(r<1900)return 6;return r<1990?0:r<2000?1:r<2010?2:r<2015?3:r<2020?4:5;}},
 {id:'sur',g:'Âge',name:'Surélévation',lab:SUR_LAB,col:SUR_COL,cls:s=>{const r=SU[s];if(!r)return 4;return r<2010?0:r<2015?1:r<2020?2:3;}},
 {id:'rs',g:'Sous-sol et fouilles',name:'Risques du sous-sol',lab:['Aucun secteur','Carrières','Gypse','Zone inondable (PPRI)'],col:[GRAY,'#d4a373','#e5e5e5','#48cae4'],cls:s=>RS[s]},
 {id:'ar',g:'Sous-sol et fouilles',name:'Fouilles à moins de 40 m',lab:['Aucune','1','2 à 3','4 à 9','10 et plus'],col:[GRAY,'#3a6a9c','#66c2a5','#fee08b','#f46d43'],cls:s=>{const n=ARN[s];return n===0?0:n===1?1:n<=3?2:n<=9?3:4;}},
 {id:'typ',g:'Usages',name:'Typologie du bâti (Apur)',lab:TY_LAB,col:TY_COL,cls:s=>TYP[s]},
 {id:'ncm',g:'Usages',name:'Commerces en rez-de-chaussée (BDCOM 2017)',lab:['Aucun','1','2','3 à 5','6 et plus'],col:['#3a4652','#ffd166','#fdae61','#f46d43','#d53e4f'],cls:s=>{const n=NCM[s];return n===0?0:n===1?1:n===2?2:n<=5?3:4;}},
 {id:'usg',g:'Usages',name:'Usage principal (BDNB)',lab:USG_LAB,col:['#3a4652','#66c2a5','#abdda4','#3288bd','#c77dff','#9a9aa8'],cls:s=>BU[s]},
 {id:'log',g:'Usages',name:'Nombre de logements (BDNB)',lab:['Aucun ou inconnu','1 à 5','6 à 15','16 à 40','41 à 100','Plus de 100'],col:['#3a4652','#d9f0d3','#a6dba0','#5aae61','#1b7837','#00441b'],cls:s=>{const n=BL[s];return n===0?0:n<=5?1:n<=15?2:n<=40?3:n<=100?4:5;}},
 {id:'soc',g:'Usages',name:'Logements sociaux (RPLS)',lab:['Aucun ou inconnu','1 à 10','11 à 50','Plus de 50'],col:['#3a4652','#fde0dd','#f768a1','#ae017e'],cls:s=>{const n=BS[s];return n===0?0:n<=10?1:n<=50?2:3;}},
 {id:'vac',g:'Usages',name:'Suspicion de vacance des bureaux (indice sur 5)',lab:['Hors champ (pas de bureaux, équipement, gare, monument historique, hôtel, lieu culturel, propriétaire public)','0 à 1 : occupation apparente','2 : départs notables','3 : vacance partielle ou aucune trace d\'occupant','4 : probablement vide','5 : neuf ou restructuré, sans occupant','Transformation en logements engagée'],col:[GRAY,'#2c7bb6','#abd9e9','#ffffbf','#fdae61','#d7191c','#9e6ebd'],cls:s=>vacOf(s).c},
 {id:'occ',g:'Usages',name:'Taux d\'occupation apparent des bureaux (calcul)',lab:['Hors champ ou non calculable','Moins de 25 %','25 à 50 %','50 à 80 %','80 % et plus'],col:[GRAY,'#d7191c','#fdae61','#abd9e9','#2c7bb6'],cls:s=>{if(!vacOf(s).c||vacOf(s).c===6)return 0;const o=occOf(s);return o&&o.ok?o.c:0;}},
 {id:'own',g:'Propriété',name:'Propriétaire principal (personnes morales)',lab:OWN_LAB,col:[GRAY,'#d95fa6','#66c2a5','#fee08b','#3288bd','#f46d43','#9c8a54'],cls:s=>OWN[s]},
 {id:'acc',g:'Autorisations',name:"Autorisations accordées (nombre, toutes natures)",lab:["Aucune rattachée","1","2 à 3","4 à 6","7 à 12","13 et plus"],col:[GRAY,"#3a6a9c","#3288bd","#66c2a5","#fee08b","#f46d43"],cls:s=>{const n=NACC[s];return n===0?0:n===1?1:n<=3?2:n<=6?3:n<=12?4:5;}},
 {id:'dos',g:'Autorisations',name:"Dossiers d'urbanisme déposés (nombre, toutes décisions, refus compris)",lab:["Aucun rattaché","1","2 à 3","4 à 6","7 à 12","13 et plus"],col:[GRAY,"#3a6a9c","#3288bd","#66c2a5","#fee08b","#f46d43"],cls:s=>{const n=NT[s];return n===0?0:n===1?1:n<=3?2:n<=6?3:n<=12?4:5;}},
 {id:'pc',g:'Autorisations',name:'Dernier permis de construire accordé',lab:PC_LAB,col:REH_COL.slice(0,6).concat([GRAY]),cls:lastCls(LPC)},
 {id:'pd',g:'Autorisations',name:'Dernier permis de démolir accordé',lab:PC_LAB,col:REH_COL.slice(0,6).concat([GRAY]),cls:lastCls(LPD)},
 {id:'sf',g:'Autorisations',name:'Surface créée cumulée (indicatif)',lab:["Aucune renseignée","Moins de 20 m²","20 à 100 m²","100 à 500 m²","500 à 2 000 m²","Plus de 2 000 m²"],col:[GRAY,"#3a6a9c","#66c2a5","#fee08b","#fdae61","#d53e4f"],cls:s=>{const v=SF[s];return v===0?0:v<20?1:v<100?2:v<500?3:v<2000?4:5;}},
 {id:'rc',g:'Autorisations',name:'Dossiers récents (6 mois)',lab:["Aucun","En cours d'instruction","Accordé","Refusé"],col:[GRAY,"#fee08b","#66c2a5","#d53e4f"],cls:s=>RC[s]},
 {id:'cvp',g:'Patrimoine',name:'Commission du Vieux Paris',lab:["Jamais examiné","Examiné, vœu émis","Examiné, sans résolution"],col:[GRAY,"#f46d43","#3288bd"],cls:s=>CK[s]},
 {id:'pro',g:'Patrimoine',name:'Protection patrimoniale',lab:['Aucune','Dans un périmètre de protection','Protégé par le PLU (bâtiment, volumétrie, parcelle signalée)','Monument historique ou immeuble protégé (Apur)'],col:[GRAY,'#e9c46a','#f46d43','#d53e4f'],cls:s=>{const f=PF[s];return f&3?3:f&116?2:f&8?1:0;}},
 {id:'zo',g:'Urbanisme (PLU)',name:'Zone du PLU',lab:['Hors zone','UG : urbaine générale','UGSU : urbaine générale, services urbains','UV : urbaine verte','N : naturelle','PSMV : secteur sauvegardé','Autre'],col:[GRAY,'#4f8fd6','#7a6bd6','#3fae7a','#7a9a3a','#c9824a','#9a9aa8'],cls:s=>ZO[s]},
 {id:'hp',g:'Urbanisme (PLU)',name:'Plafond de hauteur du PLU',lab:['Pas de plafond renseigné','18 m','25 m','31 m','37 m','Autre'],col:[GRAY,'#6fc3a0','#e3d36b','#f0a24c','#d9544d','#9a9aa8'],cls:s=>{const h=HP[s];return h===0?0:h===18?1:h===25?2:h===31?3:h===37?4:5;}},
 {id:'dh',g:'Urbanisme (PLU)',name:'Marge sous le plafond (indicatif)',lab:['Pas de plafond renseigné','Dépasse le plafond','Moins de 3 m de marge','3 à 9 m de marge','9 m et plus de marge'],col:[GRAY,'#d53e4f','#f46d43','#fee08b','#66c2a5'],cls:s=>{const h=HP[s];if(!h)return 0;const m=h-HX[s]/10;return m<0?1:m<3?2:m<9?3:4;}},
 {id:'arr',g:'Urbanisme (PLU)',name:'Arrondissement',lab:ARR_LAB,col:ARR_COL,cls:s=>ARR[s]>=1&&ARR[s]<=20?ARR[s]-1:20},
 {id:'sa',g:'Occupants (Sirene)',name:'Activité dominante',lab:["Aucun établissement actif","Bureaux, conseil, finance, numérique","Immobilier","Commerce","Hôtellerie, restauration","Santé et social","Enseignement","Administration, associations, culture, loisirs","Construction, industrie, transport, services aux bâtiments","Services personnels et autres"],col:[GRAY,"#3a6a9c","#8c6bb1","#f46d43","#fdae61","#66c2a5","#abd9e9","#d95fa6","#9c8a54","#c9c9c9"],cls:s=>SAC[s]},
 {id:'ne',g:'Occupants (Sirene)',name:"Établissements actifs (nombre)",lab:["Aucun","1","2 à 5","6 à 15","16 à 40","41 à 100","Plus de 100 (domiciliations probables)"],col:[GRAY,"#3a6a9c","#3288bd","#66c2a5","#fee08b","#f46d43","#a50026"],cls:s=>{const n=SNE[s];return n===0?0:n===1?1:n<=5?2:n<=15?3:n<=40?4:n<=100?5:6;}},
 {id:'se',g:'Occupants (Sirene)',name:'Effectif salarié estimé (indicatif)',lab:["Non renseigné ou nul","1 à 9","10 à 49","50 à 199","200 à 999","1 000 et plus"],col:[GRAY,"#3a6a9c","#66c2a5","#fee08b","#fdae61","#d53e4f"],cls:s=>{const n=SEF[s];return n===0?0:n<10?1:n<50?2:n<200?3:n<1000?4:5;}},
 {id:'cl',g:'Occupants (Sirene)',name:'Établissements fermés depuis 2024',lab:["Aucun","1","2 à 3","4 à 9","10 et plus"],col:[GRAY,"#fee08b","#fdae61","#f46d43","#a50026"],cls:s=>{const n=SCL[s];return n===0?0:n===1?1:n<=3?2:n<=9?3:4;}},
 {id:'pm',g:'Marché (DVF 2021-2025)',name:'Prix médian au m² (logements)',lab:["Pas de vente de logement","Moins de 7 000 €","7 000 à 9 000 €","9 000 à 11 000 €","11 000 à 13 000 €","13 000 à 16 000 €","16 000 € et plus"],col:[GRAY,"#2c7bb6","#abd9e9","#ffffbf","#fdae61","#f46d43","#a50026"],cls:s=>{const p=PM[s];return p===0?0:p<7000?1:p<9000?2:p<11000?3:p<13000?4:p<16000?5:6;}},
 {id:'dv',g:'Marché (DVF 2021-2025)',name:'Nombre de ventes (2021-2025)',lab:["Aucune vente","1","2","3 à 5","6 à 10","11 et plus"],col:[GRAY,"#3a6a9c","#3288bd","#66c2a5","#fee08b","#f46d43"],cls:s=>{const n=DN[s];return n===0?0:n===1?1:n===2?2:n<=5?3:n<=10?4:5;}},
].filter(c=>!(PUB&&/^Marché \(DVF/.test(c.g)));
/* classes par bâtiment, calculées à la première utilisation du critère (et non toutes au démarrage : plus d'une seconde gagnée) */
for(const c of CRIT){let K_=null,C_=null,A_=null;const calc=()=>{K_=new Uint8Array(N);for(let s=0;s<N;s++)K_[s]=c.cls(s);C_=new Float64Array(c.lab.length);A_=new Float64Array(c.lab.length);for(let s=0;s<N;s++){C_[K_[s]]++;A_[K_[s]]+=area[s]/1e4;}};
 Object.defineProperty(c,'k',{get(){if(!K_)calc();return K_;},set(v){K_=v;},configurable:true});Object.defineProperty(c,'cnt',{get(){if(!K_)calc();return C_;},configurable:true});Object.defineProperty(c,'ha',{get(){if(!K_)calc();return A_;},configurable:true});
 c.pal=c.col.map(h=>h?pack(h):0);}

