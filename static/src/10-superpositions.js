/* ---------- calques superposés ---------- */
const OVL=[
{g:'PLU : gabarit',items:[
 {id:'zonage',n:'Zones du PLU',k:'poly',a:.3,cols:['#4f8fd6','#7a6bd6','#3fae7a','#7a9a3a','#c9824a','#9a9aa8'],lab:['UG : urbaine générale','UGSU : urbaine générale, services urbains','UV : urbaine verte','N : naturelle','PSMV : secteur sauvegardé','Autre']},
 {id:'hauteur',n:'Plafond de hauteur',k:'poly',a:.38,cols:['#6fc3a0','#e3d36b','#f0a24c','#d9544d','#9a9aa8'],lab:['18 m','25 m','31 m','37 m','Autre']},
 {id:'hmc',n:'Hauteur max constructible (NGF)',k:'poly',a:.35,cols:['#e07fb0'],lab:['Zone concernée']},
 {id:'filet',n:'Filets de couleur (gabarit sur voie)',k:'line',cols:['#8fd3ff','#e8e8e8','#b388ff','#9aa3ad','#b0703a','#4cc96a','#b5ad5c','#ff9f43','#4f7fe0','#666666'],lab:['Bleu clair : 18 m','Noir : 20 m','Violet : 15 m','Gris : 23 m','Marron foncé : hauteur existante','Vert : 10 m','Kaki : 7 m','Orange : 12 m','Bleu marine : 25 m','Autre']},
 {id:'fuseau',n:'Fuseaux de hauteur (NGF)',k:'poly',a:.3,cols:['#e8b04a'],lab:['Fuseau']},
 {id:'ecm',n:'Emprises ECM',k:'poly',a:.35,cols:['#5ec4c4','#e6a23c'],lab:['Sans hauteur max','Avec hauteur max']},
 {id:'ecml',n:'Limites des emprises ECM',k:'line',cols:['#5ec4c4'],lab:['Limite']},
 {id:'ecbbv',n:'Emprises ECBBV',k:'poly',a:.35,cols:['#c58af9'],lab:['Emprise']},
 {id:'isri',n:'Lignes ISRI',k:'line',cols:['#f94144'],lab:['Ligne']}]},
{g:'PLU : végétal et paysage',items:[
 {id:'veg',n:'Hauteur de la végétation (canopée 2021)',k:'poly',a:.6,cols:['#c7e9a0','#74c476','#238b45','#b7e4d9','#41b6a6','#0b7a75'],lab:['Domaine privé : moins de 1 m (pelouses, massifs)','Domaine privé : 1 à 10 m (arbustes, jeunes arbres)','Domaine privé : plus de 10 m (grands arbres)','Domaine public : moins de 1 m','Domaine public : 1 à 10 m','Domaine public : plus de 10 m']},
 {id:'ebc',n:'Espaces boisés classés',k:'poly',a:.5,cols:['#1b7f3b'],lab:['EBC']},
 {id:'evp',n:'Espaces verts protégés',k:'poly',a:.45,cols:['#4cc26e'],lab:['EVP']},
 {id:'elpv',n:'ELPV',k:'poly',a:.45,cols:['#9be15d'],lab:['ELPV']},
 {id:'jpp',n:'JPP',k:'poly',a:.45,cols:['#c6e377'],lab:['JPP']},
 {id:'arbal',n:'Alignements d\'arbres',k:'line',cols:['#35c46a'],lab:['Alignement']},
 {id:'arbre',n:'Arbres remarquables',k:'pt',cols:['#35c46a'],lab:['Arbre']},
 {id:'mce',n:'Zones MCE',k:'poly',a:.4,cols:['#70d6a8'],lab:['Zone']}]},
{g:'PLU : secteurs et réserves',items:[
 {id:'logsoc',n:'Logement social (ZDLS, ZNDLS, ZHDLS)',k:'poly',a:.35,cols:['#ef767a','#49beaa','#eeb868'],lab:['ZDLS','ZNDLS','ZHDLS']},
 {id:'equidest',n:'Équidest',k:'poly',a:.4,cols:['#a78bfa'],lab:['Périmètre']},
 {id:'sectpart',n:'Secteurs SMV, SDP, SOA',k:'poly',a:.35,cols:['#f77f00','#4895ef','#7bd389'],lab:['SMV','SDP','SOA']},
 {id:'resl',n:'Réserves de logement',k:'poly',a:.55,cols:['#ff5d8f'],lab:['Réserve']},
 {id:'rese',n:'Réserves d\'équipement',k:'poly',a:.55,cols:['#ffb703'],lab:['Réserve']},
 {id:'resv',n:'Réserves de voirie',k:'poly',a:.55,cols:['#fb8500'],lab:['Réserve']},
 {id:'ploc',n:'Localisation d\'équipements',k:'poly',a:.5,cols:['#8ecae6'],lab:['Périmètre']},
 {id:'eal',n:'EAL',k:'poly',a:.45,cols:['#ffd6a5'],lab:['EAL']},
 {id:'stcal',n:'STCAL',k:'poly',a:.45,cols:['#bdb2ff'],lab:['STCAL']},
 {id:'hebt',n:'Secteur des tours',k:'poly',a:.2,cols:['#ffadad'],lab:['Secteur']},
 {id:'pai',n:'Activités productives protégées',k:'pt',cols:['#f4a261'],lab:['Point']},
 {id:'pepe',n:'Pépinières et incubateurs protégés',k:'pt',cols:['#e9c46a'],lab:['Point']},
 {id:'agri',n:'Agriculture urbaine',k:'pt',cols:['#80ed99'],lab:['Point']},
 {id:'protcom',n:'Protection du commerce (linéaires)',k:'line',cols:['#ff9f1c'],lab:['Linéaire']},
 {id:'batch',n:'BCD',k:'poly',a:.5,cols:['#ffc6ff'],lab:['Emprise']}]},
{g:'Protections patrimoniales',items:[
 {id:'mh',n:'Monuments historiques (Apur)',k:'poly',a:.7,cols:['#ff4d6d','#ff9e00','#c77dff'],hatch:['cross','diag','back'],lab:['Monument historique','Protection ACR','Autre protection']},
 {id:'pp',n:'Périmètres de protection',k:'poly',a:.18,cols:['#e76f51','#2a9d8f','#e9c46a','#8ab17d','#9a9aa8'],hatch:['diag','back','horiz','dots','diag'],hsp:15,hal:.5,lab:['Abords de monuments historiques','Site patrimonial remarquable','Site classé','Site inscrit','Autre périmètre']},
 {id:'pvp',n:'Bâtiments protégés par le PLU',k:'poly',a:.65,cols:['#ff6b6b'],hatch:['back'],lab:['Bâtiment ou élément protégé']},
 {id:'epp',n:'Éléments particuliers protégés',k:'pt',cols:['#ff6b6b'],lab:['Point']},
 {id:'ps',n:'Parcelles signalées',k:'pt',cols:['#ffd60a'],lab:['Point']},
 {id:'batmod',n:'Bâtiments modernes',k:'poly',a:.6,cols:['#4cc9f0'],lab:['Bâtiment moderne']},
 {id:'vec',n:'Volumétrie existante à conserver',k:'poly',a:.6,cols:['#f72585'],lab:['VEC']},
 {id:'gdmag',n:'Grands magasins',k:'poly',a:.6,cols:['#b5179e'],lab:['Grand magasin']}]},
{g:'Projets de l\'agence',items:[
 {id:'boa2',def:true,rr:6.5,n:'Projets en cours (clic : page du projet)',k:'pt',cols:['#D8CFB4'],lab:['En cours']},
 {id:'boa1',def:true,rr:6.5,n:'Projets livrés depuis moins de 3 ans',k:'pt',cols:['#9B8A5E'],lab:['Livré récemment']},
 {id:'boa0',def:true,rr:6.5,n:'Projets livrés depuis plus de 3 ans',k:'pt',cols:['#5E5233'],lab:['Livré il y a plus de 3 ans']}]},
{g:'Culture et cultes',items:[
 {id:'cult',n:'Lieux et équipements culturels',k:'pt',cols:['#e11d48','#a855f7','#f59e0b','#0ea5e9','#22c55e','#f472b6'],lab:['Musées et lieux de mémoire','Théâtres, scènes et opéras','Cinémas','Bibliothèques et archives','Librairies','Conservatoires et centres de création']},
 {id:'culte',n:'Lieux de culte',k:'pt',cols:['#fbbf24','#60a5fa','#34d399','#f97316','#cbd5e1','#c4b5fd'],lab:['Catholique','Juif','Musulman','Bouddhiste','Autre ou non précisé','Chrétien non catholique (protestant, orthodoxe…)']}]},
{g:'Hébergement touristique',items:[
 {id:'abnb',n:'Annonces Airbnb (densité par carré de 250 m)',k:'poly',a:.45,cols:['#fde0c5','#facba6','#f59e72','#e8604c','#b5223c'],lab:['3 à 9 annonces','10 à 29','30 à 59','60 à 99','100 et plus']},
 {id:'hot',n:'Hôtels et hébergements classés',k:'pt',cols:['#9ecae1','#4292c6','#08519c','#08306b','#c51b8a','#41ab5d'],lab:['Hôtels 1 et 2 étoiles ou non précisé','Hôtels 3 étoiles','Hôtels 4 étoiles','Hôtels 5 étoiles et palaces','Résidences de tourisme','Auberges collectives et autres']},
 {id:'cu',n:'Meublés touristiques autorisés (changement d\'usage)',k:'pt',cols:['#e6550d'],lab:['Autorisation de changement d\'usage']}]},
{g:'Paris en 1970',items:[
 {id:'p70',n:'C\'était Paris en 1970 : carrés du concours photo (clic : photos du carré)',k:'poly',a:.28,lsuf:'',lcol:'#e8eef4',cols:['#5b6770','#9ecae1','#4292c6','#08519c'],lab:['Pas de photographie numérisée','1 à 9 photographies','10 à 49 photographies','50 photographies et plus']}]},
{g:'Îlots de chaleur',items:[
 {id:'lcz',n:'Zones climatiques locales (sensibilité à la chaleur)',k:'poly',a:.42,cols:['#8c0000','#d10000','#ff0000','#bf4d00','#ff6600','#ff9955','#bcbcbc','#ffccaa','#006a00','#00aa00','#648525','#b9db79','#4a4a4a','#fbf7ae','#6a6aff'],lab:['LCZ 1 : compact, grande hauteur','LCZ 2 : compact, hauteur moyenne','LCZ 3 : compact, faible hauteur','LCZ 4 : ouvert, grande hauteur','LCZ 5 : ouvert, hauteur moyenne','LCZ 6 : ouvert, faible hauteur','LCZ 8 : grands bâtiments bas','LCZ 9 : bâti épars','LCZ A : arbres denses','LCZ B : arbres épars','LCZ C : arbustes','LCZ D : végétation basse','LCZ E : sol minéral, imperméable','LCZ F : sol nu','LCZ G : eau']},
 {id:'frais',n:'Îlots de fraîcheur : espaces verts',k:'poly',a:.5,cols:['#1a9e77','#8fd19e','#e9e29b'],lab:['Très ombragé, frais (plus de 50 % de végétation haute)','Partiellement ombragé (25 à 50 %)','Peu ombragé (moins de 25 %, frais la nuit seulement)']},
 {id:'fraiq',n:'Îlots de fraîcheur : équipements',k:'pt',cols:['#4cc9f0','#c7a6ff','#9ef01a'],lab:['Eau : piscines, baignades, bains-douches','Intérieurs frais : musées, bibliothèques, mairies, lieux de culte','Brumisateurs et ombrières']}]},
{g:'Sous-sol et risques',items:[
 {id:'carr',n:'Carrières (secteurs de risque)',k:'poly',a:.45,cols:['#d4a373'],lab:['Secteur']},
 {id:'gyps',n:'Gypse (secteurs de risque)',k:'poly',a:.45,cols:['#e5e5e5'],lab:['Secteur']},
 {id:'ppri',n:'Zones inondables (PPRI)',k:'poly',a:.4,cols:['#90e0ef','#48cae4','#0096c7','#0077b6','#e63946','#80b918'],lab:['Bleue claire','Bleue claire hors Seine','Bleue sombre','Bleue sombre hors Seine','Rouge','Verte']}]},
{g:'Archéologie',items:[
 {id:'archeo',n:'Opérations archéologiques',k:'pt',cols:['#c9a227','#e07a5f','#f2cc8f','#81b29a','#7aa2f7','#d6d6d6','#9a9aa8'],lab:['Préhistoire','Protohistoire','Antiquité','Moyen Âge','Temps modernes','Époque contemporaine','Période non précisée']}]},
{g:'Relief',items:[
 {id:'courbe',n:'Courbes de niveau (IGN, tous les 5 m)',k:'line',cols:['#b9a37a','#f1dfb4'],lw:[.7,1.5],lab:['Courbe de niveau','Courbe maîtresse (multiple de 25 m)']},
 {id:'cote',n:'Points de nivellement, cotes NVP (Ville de Paris)',k:'pt',cols:['#f1dfb4'],lab:['Cote NVP (Nivellement de la Ville de Paris), convertie depuis le NGF IGN69 : NVP ≈ NGF − 0,33 m (visibles à l\'échelle du quartier)'],r:2.2,lbl:2.2,minK:1.1}]},
{g:'Atlas historique de Paris',items:[
 {id:'atm300',src:'paris bas empire var 3c',n:'Paris gallo-romain (Bas-Empire)',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/2.html'],url:'https://paris-atlas-historique.fr/2.html'},
 {id:'atm500',src:'paris mérovingien',n:'Paris mérovingien (VIe-VIIIe s.)',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/2.html'],url:'https://paris-atlas-historique.fr/2.html'},
 {id:'at1000',src:'paris 1000',n:'Paris en 1000',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/3.html'],url:'https://paris-atlas-historique.fr/3.html'},
 {id:'at1150',src:'paris 1150',n:'Paris en 1150',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/3.html'],url:'https://paris-atlas-historique.fr/3.html'},
 {id:'at1300',src:'paris 1300a',n:'Paris en 1300',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/11.html'],url:'https://paris-atlas-historique.fr/11.html'},
 {id:'at1450',src:'paris 1450 a',n:'Paris en 1450',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/9.html'],url:'https://paris-atlas-historique.fr/9.html'},
 {id:'at1600',src:'paris 1600 a',n:'Paris en 1600',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/4.html'],url:'https://paris-atlas-historique.fr/4.html'},
 {id:'at1700',src:'paris 1700 a',n:'Paris en 1700',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/12.html'],url:'https://paris-atlas-historique.fr/12.html'},
 {id:'at1790',src:'paris 1790 a',n:'Paris en 1790',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/10.html'],url:'https://paris-atlas-historique.fr/10.html'},
 {id:'at1850',src:'paris 1850 a',n:'Paris en 1850',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/5.html'],url:'https://paris-atlas-historique.fr/5.html'},
 {id:'at1900',src:'paris 1900',n:'Paris en 1900',k:'poly',a:.5,atlas:true,cols:['#d8c48e'],lsuf:'',lcol:'#fff',lab:['Carte de Michel Huard, Atlas historique de Paris : paris-atlas-historique.fr/63.html'],url:'https://paris-atlas-historique.fr/63.html'}]},
{g:'Voirie',items:[
 {id:'ppi',n:'Passages piétons',k:'poly',a:.75,cols:['#f2f2f2'],lab:['Passage piéton'],minK:.8}]},
{g:'Cadastre',items:[
 {id:'cad',n:'Parcelles cadastrales',k:'poly',a:0,cols:['#f3e2a9'],lab:['Limite de parcelle (survol : numéro et contenance, à l\'échelle du quartier)'],minK:.6}]},
{g:'Commerces',items:[
 {id:'com',n:'Commerces en rez-de-chaussée (BDCOM 2017)',k:'pt',cols:COM_COL,lab:COM_LAB}]},
{g:'Transports en commun',items:[
 {id:'tcf',n:'Lignes de métro, RER, train et tram',k:'line',lwa:2.6,cols:['#888888'],lab:['Lignes à leur couleur officielle']},
 {id:'gare',n:'Gares et stations',k:'pt',cols:['#1d4ed8','#dc2626','#16a34a'],lab:['Métro','RER et train','Tram']},
 {id:'acc',n:'Accès des stations (entrées et sorties)',k:'pt',cols:['#f8fafc'],lab:['Accès']},
 {id:'osmm',n:'Voies réelles du métro et du RER en tunnel (OpenStreetMap)',k:'line',lw:[2.2,1.4,2.2,1.4,1.4],cols:['#f59e0b','#fb7185','#38bdf8','#a3a3a3','#a3e635'],lab:['Métro : voie principale','Métro : voie de service, garage ou raccordement','RER et train en tunnel','Voie désaffectée ou abandonnée','Voie en construction']},
 {id:'osms',n:'Stations fermées ou jamais ouvertes (OpenStreetMap)',k:'pt',cols:['#f43f5e'],lab:['Station fermée']},
 {id:'bus',n:'Lignes de bus',k:'line',lwa:1.1,cols:['#7aa6d9'],lab:['Tracé de ligne de bus']}]},
{g:'Mobilité',items:[
 {id:'mob',n:'Comptages de trafic (vélo, voiture, etc.)',k:'pt',cols:['#7fb2d6','#4cc9f0','#ffd166','#ef476f'],lab:['Moins de 500 vélos par jour ou pas de comptage vélo','500 à 1 500 vélos par jour','1 500 à 4 000 vélos par jour','Plus de 4 000 vélos par jour']}]}
];
const OVO=[];for(const g of OVL)for(const o of g.items){o.on=false;o.d=null;OVO.push(o);}
const BASEOV=[{id:'trot',n:'Trottoirs',k:'poly',a:.11,noline:true,cols:['#c3c9cf'],lab:['Emprise des trottoirs (plan de voirie)'],minK:.45,base:true},{id:'tpl',n:'Terre-pleins',k:'poly',a:.14,noline:true,cols:['#9fb59a'],lab:['Terre-plein'],minK:.45,base:true}];
for(const o of BASEOV.slice().reverse()){o.on=true;o.d=null;OVO.unshift(o);}
ORG.trot=ORG.tpl='Ville de Paris';
function decPath(p){const n=p.length>>1,a=new Float64Array(n*2);let x=p[0],y=p[1];a[0]=x/10;a[1]=y/10;for(let i=1;i<n;i++){x+=p[2*i];y+=p[2*i+1];a[2*i]=x/10;a[2*i+1]=y/10;}return a;}
const OCELL=700,ATLBG='#f2ecdd',ATLFONT='"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua","Hoefler Text",Georgia,"Times New Roman",serif';
function cellPath(d,rings,c){const a=rings[0];let x0=1e18,y0=1e18,x1=-1e18,y1=-1e18;for(const r of rings)for(let i=0;i<r.length;i+=2){const x=r[i],y=r[i+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 const key=Math.floor((x0+x1)/2/OCELL)+','+Math.floor((y0+y1)/2/OCELL);let C=d.cells.get(key);if(!C){C={b:[x0,y0,x1,y1],P:new Array(d.nc)};d.cells.set(key,C);}
 const b=C.b;if(x0<b[0])b[0]=x0;if(y0<b[1])b[1]=y0;if(x1>b[2])b[2]=x1;if(y1>b[3])b[3]=y1;return C.P[c]||(C.P[c]=new Path2D());}
function eachP(d,fn){const k=view.k,hw=W/2/k,hh=Hh/2/k,X0=view.cx-hw,X1=view.cx+hw,Y0=view.cy-hh,Y1=view.cy+hh,vis=[];
 for(const C of d.cells.values())if(C.b[2]>=X0&&C.b[0]<=X1&&C.b[3]>=Y0&&C.b[1]<=Y1)vis.push(C);
 for(let i=0;i<d.nc;i++)for(const C of vis)if(C.P[i])fn(C.P[i],i);}
async function loadOv(o){
 if(o.d)return o.d;
 const j=await getJson('ov_'+o.id+'.json');if(j.cols)o.cols=j.cols;const nc=o.cols.length;o.raw=j;
 const d={k:j.k,nc,cells:new Map(),pts:[],hit:[]};if(j.bg)d.bg=j.bg.map(v=>v/10);
 for(const f of j.f){
  const c=Math.min(f[0],nc-1);
  if(j.k==='pt'){{const n=d.pts.length;d.pts.push([f[2]/10,f[3]/10,c,f[1],j.u?j.u[n]:null,j.t?j.t[n]:null,j.im?j.im[n]:null,j.po?j.po[n]:null]);}continue;}
  if(j.L&&!d.L)d.L=j.L.map(l=>[l[0]/10,l[1]/10,l[2],l[3]]);
  const rings=f[2].map(decPath),P=cellPath(d,rings,c);
  for(const a of rings){P.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)P.lineTo(a[i],a[i+1]);if(j.k==='poly')P.closePath();}
  if(f[1]&&j.k==='poly'){let x0=1e18,y0=1e18,x1=-1e18,y1=-1e18;const a=rings[0];for(let i=0;i<a.length;i+=2){if(a[i]<x0)x0=a[i];if(a[i]>x1)x1=a[i];if(a[i+1]<y0)y0=a[i+1];if(a[i+1]>y1)y1=a[i+1];}d.hit.push({p:f[1],r:rings,b:[x0,y0,x1,y1]});}
 }
 o.d=d;return d;
}
let mark=null,ADPREF=null;
const HPC={};
function hatchPat(col,ty,k,sp,al){sp=sp||9;al=al||1;const key=col+ty+dpr+sp+al;let p=HPC[key];
 if(!p){const s=Math.round(sp*dpr),c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');x.globalAlpha=al;x.strokeStyle=col;x.fillStyle=col;x.lineWidth=(al<1?1:1.4)*dpr;x.lineCap='square';
  const ln=(a,b,c2,d)=>{x.beginPath();x.moveTo(a,b);x.lineTo(c2,d);x.stroke();};
  if(ty==='diag'||ty==='cross'){ln(-1,s+1,s+1,-1);ln(-1,1,1,-1);ln(s-1,s+1,s+1,s-1);}
  if(ty==='back'||ty==='cross'){ln(-1,-1,s+1,s+1);ln(s-1,-1,s+1,1);ln(-1,s-1,1,s+1);}
  if(ty==='horiz')ln(0,s/2,s,s/2);
  if(ty==='dots'){x.beginPath();x.arc(s/2,s/2,1.4*dpr,0,6.2832);x.fill();}
  p=HPC[key]=lx.createPattern(c,'repeat');}
 try{p.setTransform(new DOMMatrix([1/(dpr*k),0,0,-1/(dpr*k),0,0]));}catch(e){}
 return p;}
const hatchCss=(col,ty)=>{const a='transparent';const g=d=>'repeating-linear-gradient('+d+','+col+' 0 1.5px,'+a+' 1.5px 5px)';return ty==='cross'?g('45deg')+','+g('-45deg'):ty==='diag'?g('-45deg'):ty==='back'?g('45deg'):ty==='horiz'?'repeating-linear-gradient(0deg,'+col+' 0 1.5px,'+a+' 1.5px 5px)':ty==='dots'?'radial-gradient('+col+' 1.3px,'+a+' 1.6px) 0 0/5px 5px':col;};
function drawOv(){
 const k=view.k;
 lx.setTransform(dpr*k,0,0,-dpr*k,dpr*(W/2-view.cx*k),dpr*(Hh/2+view.cy*k));
 lx.lineJoin='round';
 let pts=false;
 for(const o of OVO){
  if(o.base&&o.on&&!o.d&&!o.ld&&k>=o.minK){o.ld=1;loadOv(o).then(()=>draw()).catch(()=>{});}
  if(!o.on||!o.d||(o.minK&&k<o.minK&&o.d.k!=='pt'))continue;const d=o.d;
  if(o.atlas){lx.globalAlpha=o.a;if(d.bg){const b=d.bg;lx.beginPath();lx.moveTo(b[0],b[1]);for(let i=2;i<8;i+=2)lx.lineTo(b[i],b[i+1]);lx.closePath();lx.fillStyle=ATLBG;lx.fill();}eachP(d,(P,i)=>{lx.fillStyle=o.cols[i];lx.fill(P,'evenodd');});lx.globalAlpha=1;continue;}
  if(d.k==='poly'&&o.a===0){lx.globalAlpha=Math.min(.55,.25+(k-.7)*.2);lx.lineWidth=.8/k;lx.strokeStyle=o.cols[0];eachP(d,P=>lx.stroke(P));lx.globalAlpha=1;continue;}
  if(d.k==='poly'){eachP(d,(P,i)=>{if(o.hatch){lx.globalAlpha=o.hal?.06:.13;lx.fillStyle=o.cols[i];lx.fill(P,'evenodd');lx.globalAlpha=1;lx.fillStyle=hatchPat(o.cols[i],o.hatch[i],k,o.hsp,o.hal);lx.fill(P,'evenodd');}else{lx.globalAlpha=o.a;lx.fillStyle=o.cols[i];lx.fill(P,'evenodd');}if(o.noline)return;lx.globalAlpha=Math.min(1,o.a+.4);lx.lineWidth=.9/k;lx.strokeStyle=o.cols[i];lx.stroke(P);});lx.globalAlpha=1;}
  else if(d.k==='line'){lx.globalAlpha=.95;eachP(d,(P,i)=>{lx.lineWidth=(o.lw?o.lw[i]:o.lwa||1.7)/k;lx.strokeStyle=o.cols[i];lx.stroke(P);});}
  else pts=true;
 }
 lx.globalAlpha=1;lx.setTransform(dpr,0,0,dpr,0,0);
 for(const o of OVO){if(!o.on||!o.d||!o.d.L||k<.25||(o.atlas&&k<.9))continue;const suf=o.lsuf??' m',lc=o.lcol||o.cols[1]||o.cols[0];const X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;
  lx.font=o.atlas?'italic 500 '+Math.round(Math.min(15,Math.max(11,k*6)))+'px '+ATLFONT:'600 10.5px Inter, system-ui, sans-serif';lx.textAlign='center';lx.textBaseline='middle';lx.lineJoin='round';
  const hal=o.atlas?'rgba(242,236,221,.92)':'rgba(15,26,36,.9)',fc=o.atlas?'#3a2c1c':lc;
  for(const l of o.d.L){if((k<.8||(o.atlas&&k<2))&&!l[3])continue;const sx=X(l[0]),sy=Y(l[1]);if(sx<-20||sy<-20||sx>W+20||sy>Hh+20)continue;lx.lineWidth=3.5;lx.strokeStyle=hal;lx.strokeText(l[2]+suf,sx,sy);lx.fillStyle=fc;lx.fillText(l[2]+suf,sx,sy);}}
 if(pts){
  const X=x=>(x-view.cx)*k+W/2,Y=y=>Hh/2-(y-view.cy)*k;
  for(const o of OVO){
   if(!o.on||!o.d||o.d.k!=='pt'||(o.minK&&k<o.minK))continue;
   lx.lineWidth=1.2;lx.strokeStyle='rgba(15,26,36,.9)';
   const lbl=o.lbl&&k>=o.lbl;if(lbl){lx.font='10.5px Inter, system-ui, sans-serif';lx.textAlign='left';lx.textBaseline='middle';}
   for(const p of o.d.pts){const sx=X(p[0]),sy=Y(p[1]);if(sx<-8||sy<-8||sx>W+8||sy>Hh+8)continue;lx.fillStyle=o.cols[p[2]];lx.beginPath();lx.arc(sx,sy,o.id==='mob'?4+p[2]*1.5:(o.r||o.rr||4),0,6.2832);lx.fill();if(!o.r)lx.stroke();if(lbl){lx.lineWidth=3;lx.strokeStyle='rgba(15,26,36,.85)';lx.strokeText(p[3],sx+4,sy);lx.fillText(p[3],sx+4,sy);lx.lineWidth=1.2;lx.strokeStyle='rgba(15,26,36,.9)';}}
  }
 }
 if(mark){const sx=(mark.x-view.cx)*k+W/2,sy=Hh/2-(mark.y-view.cy)*k;lx.lineWidth=2.5;lx.strokeStyle='#fff';lx.beginPath();lx.arc(sx,sy,16,0,6.2832);lx.stroke();lx.lineWidth=1.2;lx.strokeStyle='#1A486A';lx.beginPath();lx.arc(sx,sy,18.5,0,6.2832);lx.stroke();}
}
function inRings(R,x,y){let c=false;for(const a of R){for(let i=0,j=a.length-2;i<a.length;j=i,i+=2){const xi=a[i],yi=a[i+1],xj=a[j],yj=a[j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}}return c;}
const tip=$('#tip');
let tipXY=[0,0];function ovTipFit(){if(tip.hidden)return;const [x,y]=tipXY,w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.min(innerWidth-w-8,x+14)+'px';tip.style.top=Math.min(innerHeight-h-8,y+14)+'px';}
function ovTip(x,y){
 const [wx,wy]=s2w(x,y),tol=7/view.k,L=[];
 for(const o of OVO){
  if(!o.on||!o.d)continue;const d=o.d;
  if(d.k==='pt'){let best=null,bd=tol*tol;for(const p of d.pts){const dx=p[0]-wx,dy=p[1]-wy,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=p;}}if(best&&best[3])L.push(best[5]?[best[5],best[3],best[6],best[7]]:[o.n,best[3]]);}
  else if(d.k==='poly'){for(const h of d.hit){if(wx<h.b[0]||wx>h.b[2]||wy<h.b[1]||wy>h.b[3])continue;if(inRings(h.r,wx,wy)){L.push([o.n,h.p]);break;}}}
 }
 if(!L.length){tip.hidden=true;return;}
 tip.innerHTML=L.slice(0,5).map(e=>(e[2]?'<img src="'+esc(e[2])+'" alt="" style="display:block;width:200px;aspect-ratio:2/3;object-fit:cover;border-radius:3px;margin-bottom:5px;background:var(--line)" onload="ovTipFit()">':'')+'<b>'+esc(e[0])+'</b><br>'+esc(e[1])+(e[3]?'<br><span style="color:var(--ink2)">'+esc(e[3])+'</span>':'')).join('<hr>');tipXY=[x,y];tip.hidden=false;
 const w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.min(innerWidth-w-8,x+14)+'px';tip.style.top=Math.min(innerHeight-h-8,y+14)+'px';
}
{
 const DEST={'PLU : gabarit':['Volume','Gabarit du PLU'],'Protections patrimoniales':['Patrimoine','Protections patrimoniales'],'PLU : végétal et paysage':['Urbanisme (PLU)','Végétal et paysage'],'PLU : secteurs et réserves':['Urbanisme (PLU)','Secteurs et réserves'],'Sous-sol et risques':['Sous-sol et fouilles','Sous-sol et risques'],'Archéologie':['Sous-sol et fouilles','Archéologie'],'Mobilité':['Urbanisme (PLU)','Mobilité'],'Transports en commun':['Urbanisme (PLU)','Transports en commun (Île-de-France Mobilités)'],'Commerces':['Usages','Commerces (BDCOM 2017)'],'Hébergement touristique':['Usages','Hébergement touristique'],'Projets de l\'agence':['Bouchaud Architectes','Projets'],'Culture et cultes':['Usages','Lieux culturels et de culte'],'Femmes illustres':['Histoire','Femmes illustres'],'Paris en 1970':['Histoire','C\'était Paris en 1970'],'Îlots de chaleur':['Ensoleillement','Îlots de chaleur et de fraîcheur'],'Atlas historique de Paris':['Histoire','Atlas historique de Paris (de l\'Antiquité à 1900)'],'Cadastre':['Urbanisme (PLU)','Cadastre'],'Voirie':['Urbanisme (PLU)','Voirie (plan de voirie de la Ville)'],'Relief':['Sous-sol et fouilles','Relief et nivellement']};
 for(const g of OVL){
  const [sec,lab]=DEST[g.g]||['Urbanisme (PLU)',g.g];
  const box=document.querySelector('.ovslot[data-g="'+sec+'"]')||$('#ovl');
  const dt=document.createElement('details');dt.className='ovgrp';dt.dataset.g=g.g;
  dt.innerHTML='<summary title="Clic : afficher ou masquer toutes les couches du groupe. Flèche : déplier"><span class="chev"></span><input type="checkbox" class="gck" tabindex="-1" aria-hidden="true"><span class="gl">'+lab+'</span><span class="gn">'+g.items.length+'</span></summary>';
  const sm=dt.firstChild,gck=sm.querySelector('.gck'),boxes=[];
  const sync=()=>{const n=g.items.filter(o=>o.on).length;gck.checked=n===g.items.length;gck.indeterminate=n>0&&n<g.items.length;};
  sm.addEventListener('click',e=>{if(e.target.classList.contains('chev'))return;e.preventDefault();const all=g.items.every(o=>o.on);dt.open=true;for(const c of boxes)if(c.checked===all){c.checked=!all;c.onchange({target:c});}sync();});
  for(const o of g.items){
   const w=document.createElement('div');
   const l=document.createElement('label');l.className='ck';
   l.innerHTML='<input type="checkbox"><i class="sw2" style="background:'+(o.hatch?hatchCss(o.cols[0],o.hatch[0])+';box-shadow:inset 0 0 0 1px '+o.cols[0]:o.cols[0])+'"></i><span>'+o.n+'</span>'+orgHtml(o.id);
   const lg=document.createElement('div');lg.className='ovlg';lg.hidden=true;
   if(o.lab.length>1)lg.innerHTML=o.lab.map((t,i)=>'<div><i class="sw2" style="background:'+(o.hatch?hatchCss(o.cols[i],o.hatch[i]):o.cols[i])+(o.hatch?';box-shadow:inset 0 0 0 1px '+o.cols[i]:'')+'"></i>'+t+'</div>').join('');
   boxes.push(l.firstChild);
   l.firstChild.onchange=async e=>{
    o.on=e.target.checked;sync();lg.hidden=!o.on||o.lab.length<2;
    if(o.on&&!o.d){l.classList.add('ld');try{await loadOv(o);}catch(err){o.on=false;e.target.checked=false;lg.hidden=true;l.title='Chargement impossible';}l.classList.remove('ld');}
    if(!o.on)tip.hidden=true;sync();draw();
   };
   w.appendChild(l);w.appendChild(lg);dt.appendChild(w);
   if(o.def)setTimeout(()=>{const c=l.firstChild;c.checked=true;c.onchange({target:c});},0);   /* calques actifs par défaut : sans déplier leur rubrique */
  }
  if(g.items.some(o=>o.atlas)){const r=document.createElement('label');r.className='ck';r.style.cssText='display:flex;gap:8px;align-items:center;font-size:var(--fs-s);margin:6px 0 2px 4px';
   r.innerHTML='Opacité <input type="range" min="15" max="95" value="50" style="flex:1">';const ip=r.querySelector('input');
   ip.oninput=()=>{for(const o of g.items)if(o.atlas)o.a=ip.value/100;draw();};dt.appendChild(r);}
  box.appendChild(dt);
 }
}
/* rubriques repliables du panneau */
{const box=$('#crit'),kids=[...box.children];let cur=null;const LS=(()=>{try{return JSON.parse(localStorage.getItem('pg_open')||'null');}catch(e){return null;}})()||['Âge'];
 const save=()=>{try{localStorage.setItem('pg_open',JSON.stringify([...document.querySelectorAll('details.lsec[open]')].map(d=>d.dataset.g)));}catch(e){}};
 for(const k of kids){if(k.classList.contains('lfam')){cur=null;continue;}if(k.classList.contains('g')){cur=document.createElement('details');cur.className='lsec';cur.dataset.g=k.textContent;if(LS.includes(k.textContent))cur.open=true;
   cur.innerHTML='<summary><span class="chev"></span>'+esc(k.textContent)+'<span class="lsn"></span></summary>';box.insertBefore(cur,k);k.remove();cur.addEventListener('toggle',save);continue;}
  if(cur)cur.appendChild(k);}
 for(const d of document.querySelectorAll('#scroll > details.lsec'))d.addEventListener('toggle',save);
 for(const d of document.querySelectorAll('#scroll > details.lsec'))if(LS.includes(d.dataset.g))d.open=true;
 {const so=box.querySelector('details.lsec[data-g="Sous-sol et fouilles"]'),en=document.querySelector('#scroll > details.lsec[data-g="Ensoleillement"]');if(so&&en)so.after(en);}
}
/* recherche de calques, avec tolérance (accents, fautes de frappe, synonymes) */
{const nz=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
 const SYN=[['histoire','historique','patrimoine','ancien','anciens','atlas','monument','memoire','1970','photo','photos','mh','merimee','vieux'],
  ['patrimoine','protection','monument','historique','abf','unesco','pvp','inscrit'],
  ['age','construction','periode','annee','date','epoque','ancien'],
  ['hauteur','gabarit','niveaux','etages','volume','igh','surelevation','plafond'],
  ['metro','transport','transports','rer','gare','gares','station','stations','tram','bus','mobilite','tunnel','idfm','acces'],
  ['velo','mobilite','trafic','comptage','circulation','voirie'],
  ['chaleur','ilot','ilots','fraicheur','canicule','climat','lcz','ensoleillement','soleil','temperature'],
  ['vegetation','vegetal','arbre','arbres','canopee','vert','verts','espaces','jardin','jardins','ebc','paysage','nature'],
  ['eau','inondation','crue','seine','ppri','risque','risques'],
  ['sol','sous','carriere','carrieres','gypse','dissolution','fouilles','archeologie','geologie','relief','altitude','courbes','risques'],
  ['energie','dpe','carbone','co2','bdnb','chauffage','thermique','renovation','ges'],
  ['usage','usages','commerce','commerces','bureau','bureaux','logement','logements','activite','bdcom','typologie'],
  ['tourisme','touristique','hotel','hotels','airbnb','meuble','meubles','hebergement','location'],
  ['permis','autorisation','autorisations','dossier','dossiers','instruction','demolir','cvp','commission'],
  ['plu','zonage','reglement','secteur','secteurs','reserve','reserves','servitude','alignement','emplacement'],
  ['cadastre','parcelle','parcelles','foncier','section'],
  ['trottoir','trottoirs','voirie','rue','rues','chaussee','terre','plein'],
  ['carte','cartes','plan','plans','fond','affichage']];
 const lev=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}return d[a.length][b.length];};
 const near=(q,w)=>w.startsWith(q)||(q.length>=6&&w.includes(q))||(q.length>=5&&w.length>=4&&lev(q,w.slice(0,Math.min(w.length,q.length+1)))<=(q.length>=10?2:1));
 const expand=q=>{const out=new Set([q]);for(const g of SYN)if(g.some(w=>near(q,w)))for(const w of g)out.add(w);return [...out];};
 const tm=(q,words)=>expand(q).some(e=>words.some(w=>near(e,w)));const tm0=(q,words)=>words.some(w=>near(q,w));
 const scroll=$('#scroll'),inp=$('#lq'),cnt=$('#lqn');let saved=null;
 const rows=()=>[...scroll.querySelectorAll('#crit button[data-id]')].map(b=>({el:b,t:b.textContent})).concat([...scroll.querySelectorAll('.ovgrp label.ck')].filter(l=>l.querySelector('input[type=checkbox]')).map(l=>({el:l.parentElement,t:l.textContent})));
 const run=()=>{const q=nz(inp.value),Q=q?q.split(' ').filter(x=>x.length>1):[];document.body.classList.toggle('lqon',Q.length>0);const secs=[...scroll.querySelectorAll('details.lsec')],grps=[...scroll.querySelectorAll('details.ovgrp')];
  scroll.querySelectorAll('.lqh').forEach(e=>e.classList.remove('lqh'));
  if(!Q.length){if(saved){for(const [d,o] of saved)d.open=o;saved=null;}cnt.textContent='';return;}
  if(!saved)saved=[...secs,...grps].map(d=>[d,d.open]);
  const W=t=>nz(t).split(' ');let n=0;
  const secOk=new Map(secs.map(d=>[d,Q.every(x=>tm(x,W(d.dataset.g+' '+(d.querySelector('summary')||{}).textContent)))]));
  const grpOk=new Map(grps.map(d=>[d,Q.every(x=>tm0(x,W(d.querySelector('summary').textContent)))]));
  for(const r of rows()){const sec=r.el.closest('details.lsec'),grp=r.el.closest('details.ovgrp');
   const ctx=(sec?sec.dataset.g+' ':'')+(grp?grp.querySelector('summary').textContent+' ':'');
   const ok=(sec&&secOk.get(sec))||(grp&&grpOk.get(grp))||Q.every(x=>tm(x,W(r.t))||tm0(x,W(ctx)));r.el.classList.toggle('lqh',!ok);if(ok)n++;r.ok=ok;}
  for(const g of grps){const any=[...g.querySelectorAll('label.ck')].some(l=>l.querySelector('input[type=checkbox]')&&!l.parentElement.classList.contains('lqh'));g.classList.toggle('lqh',!any);if(any)g.open=true;}
  for(const d of secs){const any=secOk.get(d)||d.querySelector('button[data-id]:not(.lqh), details.ovgrp:not(.lqh)');d.classList.toggle('lqh',!any);if(any)d.open=true;}
  cnt.textContent=n?n+' calque'+(n>1?'s':'')+' trouvé'+(n>1?'s':''):'Aucun calque ne correspond';};
 let tmr=0;inp.addEventListener('input',()=>{clearTimeout(tmr);tmr=setTimeout(run,120);});
 inp.addEventListener('keydown',e=>{if(e.key==='Escape'){inp.value='';run();}});
}
{const f=setCrit;setCrit=function(c){f(c);openActive();};document.addEventListener('change',e=>{if(e.target.closest&&e.target.closest('.ovgrp'))setTimeout(openActive,0);});}
function openActive(){const b=document.querySelector('#crit button.on');if(b){const d=b.closest('details.lsec');if(d)d.open=true;}
 document.querySelectorAll('details.lsec').forEach(d=>{const n=d.querySelectorAll('button.on').length+[...d.querySelectorAll('.ovgrp input[type=checkbox]:not(.gck)')].filter(c=>c.checked).length;const s=d.querySelector('.lsn');if(s)s.textContent=n?n+' actif'+(n>1?'s':''):'';});}


const INFRAME=(()=>{try{return window.top!==window.self;}catch(e){return true;}})();
async function savePdf(blob,nm,show){
 let dls=null;try{dls=window.claude&&claude.use?await claude.use('downloads'):null;}catch(_){}
 if(dls){try{await dls.save({filename:nm,data:blob});show('PDF enregistré.');}catch(er){show(er&&er.code==='declined'?'Enregistrement annulé.':'Enregistrement impossible ('+((er&&er.code)||'erreur')+').');}return;}
 const url=URL.createObjectURL(blob);
 try{const a=document.createElement('a');a.href=url;a.download=nm;document.body.appendChild(a);a.click();a.remove();}catch(e){}
 const full='https://hubbokobza-lab.github.io/paris-graphie/';
 show((nm.endsWith('.dxf')?'DXF prêt':'PDF généré')+' : <a href="'+url+'" download="'+esc(nm)+'">enregistrer</a> · <a href="#" data-open="1">ouvrir</a>'+(INFRAME?'<br><span style="font-size:var(--fs-xs);opacity:.85">Si rien ne se passe, votre navigateur bloque le téléchargement dans le cadre de la page : <a href="'+full+'" target="_blank" rel="noopener">ouvrir la carte en plein écran</a>.</span>':''),u=>{
  const o=u.querySelector('[data-open]');if(o)o.onclick=ev=>{ev.preventDefault();const w=window.open(url,'_blank');if(!w){location.href=url;}};});
}
