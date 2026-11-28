/* appel à l'action : page « réhabilitation » du site de l'agence (bouton « Demander une étude de faisabilité ») */
const CTA_URL='https://www.bouchaudarchitectes.com/welcome/architecte-rehabilitation-paris?utm_source=paris-graphie',CTA_TXT='Demandez une étude de faisabilité',CTA_SUB='Un projet sur cet immeuble ? Bouchaud Architectes, réhabilitation et restructuration à Paris.';
const TNAME={PC:'Permis de construire',PD:'Permis de démolir',PA:"Permis d'aménager",DP:'Déclaration préalable',DT:'Déclaration de travaux',RV:'Ravalement'};
const fdate=d=>d?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'';
const NAFD={"01": "Culture et production animale", "02": "Sylviculture", "03": "Pêche et aquaculture", "05": "Extraction de houille", "06": "Extraction d'hydrocarbures", "07": "Extraction de minerais métalliques", "08": "Autres industries extractives", "09": "Soutien aux industries extractives", "10": "Industries alimentaires", "11": "Fabrication de boissons", "12": "Produits à base de tabac", "13": "Fabrication de textiles", "14": "Industrie de l'habillement", "15": "Cuir et chaussure", "16": "Travail du bois", "17": "Papier et carton", "18": "Imprimerie", "19": "Cokéfaction et raffinage", "20": "Industrie chimique", "21": "Industrie pharmaceutique", "22": "Caoutchouc et plastiques", "23": "Produits minéraux non métalliques", "24": "Métallurgie", "25": "Produits métalliques", "26": "Informatique, électronique, optique", "27": "Équipements électriques", "28": "Machines et équipements", "29": "Industrie automobile", "30": "Autres matériels de transport", "31": "Fabrication de meubles", "32": "Autres industries manufacturières", "33": "Réparation et installation de machines", "35": "Électricité, gaz, vapeur", "36": "Eau", "37": "Eaux usées", "38": "Déchets", "39": "Dépollution", "41": "Construction de bâtiments", "42": "Génie civil", "43": "Travaux de construction spécialisés", "45": "Commerce et réparation automobile", "46": "Commerce de gros", "47": "Commerce de détail", "49": "Transports terrestres", "50": "Transports par eau", "51": "Transports aériens", "52": "Entreposage et auxiliaires de transport", "53": "Poste et courrier", "55": "Hébergement", "56": "Restauration", "58": "Édition", "59": "Cinéma, vidéo, télévision, musique", "60": "Programmation et diffusion", "61": "Télécommunications", "62": "Programmation et conseil informatique", "63": "Services d'information", "64": "Services financiers", "65": "Assurance", "66": "Auxiliaires financiers et d'assurance", "68": "Activités immobilières", "69": "Juridique et comptable", "70": "Sièges sociaux, conseil de gestion", "71": "Architecture et ingénierie", "72": "Recherche-développement", "73": "Publicité et études de marché", "74": "Autres activités spécialisées et techniques", "75": "Vétérinaires", "77": "Location et location-bail", "78": "Activités liées à l'emploi", "79": "Agences de voyage", "80": "Enquêtes et sécurité", "81": "Services aux bâtiments, paysagisme", "82": "Soutien administratif aux entreprises", "84": "Administration publique", "85": "Enseignement", "86": "Santé humaine", "87": "Hébergement médico-social", "88": "Action sociale sans hébergement", "90": "Arts et spectacle", "91": "Bibliothèques, musées", "92": "Jeux d'argent", "93": "Sport, loisirs", "94": "Organisations associatives", "95": "Réparation d'ordinateurs et biens personnels", "96": "Autres services personnels", "97": "Ménages employeurs", "98": "Ménages, activités indifférenciées", "99": "Extra-territoriales"},TRN={"NN": "effectif non renseigné", "00": "0 salarié", "01": "1 à 2 salariés", "02": "3 à 5 salariés", "03": "6 à 9 salariés", "11": "10 à 19 salariés", "12": "20 à 49 salariés", "21": "50 à 99 salariés", "22": "100 à 199 salariés", "31": "200 à 249 salariés", "32": "250 à 499 salariés", "41": "500 à 999 salariés", "42": "1 000 à 1 999 salariés", "51": "2 000 à 4 999 salariés", "52": "5 000 à 9 999 salariés", "53": "10 000 salariés et plus"},GNM=["Autre", "Bureaux, conseil, finance, numérique", "Immobilier", "Commerce", "Hôtellerie, restauration", "Santé et social", "Enseignement", "Administration, associations, culture, loisirs", "Construction, industrie, transport, services aux bâtiments", "Services personnels et autres"];
const SIRD={};function loadSir(a){if(PUB)return Promise.resolve(null);if(!SIRD[a])SIRD[a]=getJson('sir_'+String(a).padStart(2,'0')+'.json').catch(()=>null);return SIRD[a];}
const ARRD={};let CVPD=null;
function loadArr(a){if(!ARRD[a])ARRD[a]=getJson('arr_'+String(a).padStart(2,'0')+'.json').catch(()=>null);return ARRD[a];}
function loadCvp(){if(!CVPD)CVPD=getJson('cvp.json').catch(()=>null);return CVPD;}
const card=$('#card'),cb=$('#cb');let cardFor=-1;
const eur=v=>nf.format(Math.round(v))+' €';
const dur=d=>d<60?d+' jours':(Math.round(d/30.44*10)/10).toString().replace('.',',')+' mois';
const m2f=v=>nf.format(Math.round(v*10)/10)+' m²';
function baseInfo(s,A,P){
 const per=PER_LAB[PMAP[PE[s]]??11];
 const row=(k,v)=>v==='—'?'':'<div><span class="k">'+k+' : </span>'+v+'</div>';   /* valeur inconnue : ligne masquée dans la fenêtre (gardée dans le PDF) */
 const toit=SO[s]?'panneaux solaires':VG[s]>=10?'végétalisée':TE[s]?'terrasse':'—';
 const niv=nivOf(s),shon=SPL(s);
 const ad=A&&A[s];
 let head;
 if(ad&&ad.length){head='<div class="t">'+esc(ad[0])+'</div>'+(ad.length>1?'<div class="k adl">'+(ad.length<=6?'Aussi : '+ad.slice(1).map(esc).join(' · '):ad.length+' adresses : '+ad.slice(0,6).map(esc).join(' · ')+' …')+'</div>':'');}
 else if(A===undefined)head='<div class="t">Adresse…</div>';
 else head='<div class="t">Pas d\'adresse rattachée</div><div class="k adl">Annexe, cour ou bâtiment sans numéro dans la Base Adresse Nationale</div>';
 const pl=P&&P[s];
 return head+'<div class="sb">'+(AN[s]?'Construit en '+AN[s]:'Date de construction inconnue')+' · Paris '+(ARR[s]?ARR[s]+'e':'')+'</div>'+legendHtml(s)
  +row('Période APUR',per)+row('Réhabilitation',RE[s]>=1900?RE[s]:'—')+row('Surélévation',SU[s]?SU[s]:'—')
  +row('Hauteur médiane / max',(HM[s]/10).toFixed(1).replace('.',',')+' m / '+(HX[s]/10).toFixed(1).replace('.',',')+' m')
  +row('Niveaux',niv+(nivFF(s)?' (fichiers fonciers)':' (estimé : hauteur médiane ÷ 3 m)'))
  +row('Emprise au sol',nf.format(Math.round(area[s]))+' m²')+row('Surface de plancher estimée',sdpTxt(s))
  +(TYP[s]?row('Typologie (Apur)',TY_LAB[TYP[s]]):'')+(vacOf(s).c?row('Suspicion de vacance',vacTxt(s)):'')+(vacOf(s).c&&vacOf(s).c<6&&occOf(s)?row('Occupation apparente',occTxt(s)):'')+row('Toiture',toit)+(IG[s]?row('Immeuble de grande hauteur','oui'):'')
  +(pl&&pl.length?row('Parcelle'+(pl.length>1?'s':'')+' cadastrale'+(pl.length>1?'s':''),pl.slice(0,4).map(x=>esc(x.slice(8,10)+' '+x.slice(10).replace(/^0+/,''))).join(', ')+(pl.length>4?' …':'')):'')
  +(ad&&ad.length?'<div style="margin-top:5px"><a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(ad[0]+', Paris')+'" target="_blank" rel="noopener">Voir sur Google Maps</a></div>':'');
}
function dvfHtml(L,lim,pin){
 return L.slice(0,lim).map(e=>{
  const [mid,dt,nat,v,parts,nr,how]=e;
  let pm='';
  const res=parts.filter(p=>p[0]==='Appartement'||p[0]==='Maison');
  const sm=res.reduce((a,p)=>a+(p[3]>0?p[3]:p[1]),0);
  if(nat==='Vente'&&v>0&&nr<=6&&how<=2&&sm>=9)pm=' <span class="pm">≈ '+eur(v/sm)+'/m²</span>';
  const pl=parts.map(p=>{let x=esc(p[0]);const b=[];if(p[1]>0)b.push(p[1]+' m² bâtis');if(p[3]>0)b.push('Carrez '+nf.format(p[3])+' m²');if(p[2]>0)b.push(p[2]+' p.');if(p[4]>0&&p[0].startsWith('Terrain'))b.push(nf.format(p[4])+' m² de terrain');return x+(b.length?' : '+b.join(', '):'');}).join('<br>');
  return '<div class="dsr"><div class="hd"><span class="ty">'+esc(nat)+'</span><span class="dtt">'+fdate(dt)+'</span><span class="val">'+(v>0?eur(v):'Valeur non renseignée')+'</span>'+pm+'</div>'
   +(pl?'<div class="ds">'+pl+'</div>':'')
   +'<div class="dm">'+(nr>1?'Transaction de '+nr+' lots ou biens : valeur pour l’ensemble. ':'')+(how>1?'Rattachement approximatif ('+(how===2?'parcelle':'localisation')+'). ':'')+'<span>'+esc(mid)+'</span></div></div>';}).join('')
  +(L.length>lim?'<div class="k" style="padding-top:4px">'+(pin?(L.length-lim)+' ventes plus anciennes non affichées.':'+ '+(L.length-lim)+' autres : cliquer pour la fiche complète.')+'</div>':'');
}
const REGL='https://regles-urbanisme.paris.fr/plu-bioclimatique/jsp/site/Portal.jsp?document_id=198&portlet_id=45',CARTO='https://regles-urbanisme.paris.fr/plu-bioclimatique/jsp/site/Portal.jsp?page_id=3',gpuUrl=(lo,la)=>'https://www.geoportail-urbanisme.gouv.fr/map/#tile=1&lon='+lo.toFixed(5)+'&lat='+la.toFixed(5)+'&zoom=18';
const ZL=['','UG','UGSU','UV','N','PSMV','Autre'];
let MHD=null,MHDP=null;function loadMhd(){if(!MHDP)MHDP=getJson('mhd.json').then(j=>{MHD=j;return j;}).catch(()=>null);return MHDP;}
function mhUniq(L){const s=new Set();return (L||[]).filter(m=>{const k=m[2]||m[0];if(s.has(k))return false;s.add(k);return true;});}
function mhDetail(ref){const d=MHD&&MHD[ref];if(!d)return null;return {titre:d[0],prec:d[1],date:d[2],typ:d[3],hist:d[4],siecle:d[5],statut:d[6],adr:d[7]};}
function bdnbRows(s,B){
 const R=[];if(!B)return R;
 const [gid,ng,usg,nniv,nlog,nsoc,nter,ntot,mur,toit,dpe,ges,gesm2,dpedt,a21,dpet,gest,gestm2,dptdt,chauf,anff,topo,nat]=B;
 if(topo||nat)R.push(['Équipement',(topo||'')+(nat?(topo?' · ':'')+nat:''),'bdnb']);
 if(usg)R.push(['Usage principal',usg,'bdnb']);
 if(nlog)R.push(['Logements',nlog+(nsoc?' dont '+nsoc+' logements sociaux (RPLS)':''),'bdnb']);
 if(ntot)R.push(['Copropriété',ntot+' lots'+(nter?', dont '+nter+' lots d\'activité':''),'bdnb']);
 if(mur&&!/^INDET/.test(mur))R.push(['Murs (déclaration fiscale)',mur.toLowerCase(),'bdnb']);
 if(toit&&!/^INDET/.test(toit))R.push(['Toiture (déclaration fiscale)',toit.toLowerCase(),'bdnb']);
 if(dpe&&LOC_BAN[dpe])R.push(['Location (loi Climat et résilience)',LOC_BAN[dpe],'dpe']);
 if(dpe)R.push(['DPE logement représentatif',dpe+' énergie, '+(ges||'?')+' climat'+(gesm2?' ('+Math.round(+gesm2)+' kg CO₂e/m²/an)':'')+(dpedt?', établi le '+dpedt.split('/').reverse().join('/'):'')+(a21==='0'?' (ancienne méthode)':''),'dpe']);
 if(dpet)R.push(['DPE tertiaire',dpet+' énergie, '+(gest||'?')+' climat'+(gestm2?' ('+Math.round(+gestm2)+' kg CO₂e/m²/an)':'')+(dptdt?', '+dptdt.split('/').reverse().join('/'):''),'dpe']);
 if(chauf)R.push(['Chauffage (DPE)',chauf,'dpe']);
 if(ng>1)R.push(['Ensemble bâti BDNB',ng+' emprises Apur regroupées ; logements et lots sont comptés pour l\'ensemble','bdnb']);
 return R;}
function co2Txt(s){const c=co2Of(s);return '≈ '+nf.format(Math.round(c/10)*10)+' t CO₂e pour reconstruire à neuf '+nf.format(SDPm(s))+' m² de plancher (milieu de la fourchette) (à '+CO2R+' kg CO₂e/m², seuil RE2020 2025 des logements collectifs). Réhabiliter en évite une large part.';}
function bdnbHtml(s,B,pin){
 const R=bdnbRows(s,B);if(!R.length&&!pin)return '';
 const row=(k,v)=>'<div><span class="k">'+k+' : </span>'+esc(String(v))+'</div>';
 return '<h3>Usages, énergie et carbone</h3>'+R.map(r=>row(r[0],r[1])).join('')+'<div class="mot"><span class="k">Carbone d\'une reconstruction (ordre de grandeur) : </span>'+co2Txt(s)+'</div><div class="k" style="font-size:var(--fs-xs);margin-top:4px">BDNB (CSTB), millésime 2026-02 : fichiers fonciers, DPE de l\'Ademe, RPLS, registre des copropriétés.</div>';}
function urbHtml(s,U,pin){
 if(!ZO[s]&&!HP[s]&&!PF[s]&&!RS[s]&&!ARN[s])return '';
 const row=(k,v)=>v==='—'?'':'<div><span class="k">'+k+' : </span>'+v+'</div>';   /* valeur inconnue : ligne masquée dans la fenêtre (gardée dans le PDF) */
 const f=PF[s],bd=[];
 if(f&1)bd.push(['Monument historique','#d53e4f']);else if(f&2)bd.push(['Immeuble protégé','#d53e4f']);
 if(f&4)bd.push(['Protégé par le PLU','#f46d43']);
 if(f&16)bd.push(['Bâtiment moderne','#3288bd']);if(f&32)bd.push(['Volumétrie à conserver','#3288bd']);if(f&64)bd.push(['Parcelle signalée','#b07d1a']);
 if(f&8)bd.push(['Périmètre de protection','#b07d1a']);
 if(RS[s]===1)bd.push(['Carrières','#8a5a2b']);if(RS[s]===2)bd.push(['Gypse','#6b6b6b']);if(RS[s]===3)bd.push(['Zone inondable','#0077b6']);
 let o='<h3>Urbanisme et patrimoine</h3>';
 if(ZO[s])o+=row('Zone du PLU',ZL[ZO[s]]);
 if(HP[s]){const hx=HX[s]/10,m=HP[s]-hx;o+=row('Plafond de hauteur du PLU',HP[s]+' m <span class="k">(hauteur max existante '+hx.toFixed(1).replace('.',',')+' m, '+(m<0?'dépasse de '+(-m).toFixed(1).replace('.',',')+' m':'marge '+m.toFixed(1).replace('.',',')+' m')+', indicatif)</span>');}
 if(bd.length)o+='<div class="up">'+bd.map(b=>'<span class="bdg" style="color:'+b[1]+'">'+esc(b[0])+'</span>').join('')+'</div>';
 if(ARN[s])o+=row('Fouilles archéologiques à moins de 40 m',ARN[s]);
 if(pin){const [lo,la]=bldLonLat(s),a=(u,x)=>'<div class="dm" style="margin:2px 0"><a href="'+u+'" target="_blank" rel="noopener">'+x+'</a></div>';
  o+=a(REGL,'Règlement du PLU bioclimatique (texte, portail de la Ville de Paris)')+a(gpuUrl(lo,la),'Plan de zonage sur le Géoportail de l\'urbanisme, centré sur le bâtiment')+a(CARTO,'Cartographie des règles à l\'adresse (portail de la Ville de Paris, saisir l\'adresse ou la parcelle)');}
 if(!pin)return o;
 if(!U&&(f||RS[s]||ARN[s]))return o+'<div class="k">Détail en cours de chargement…</div>';
 if(!U)return o;
 if(U.mh)for(const m of mhUniq(U.mh)){const D=m[2]?mhDetail(m[2]):null;
  o+='<div class="dsr"><div class="hd"><span class="ty">'+(m[3]==='MH'?'Monument historique':'Immeuble protégé')+'</span>'+(D&&D.typ?'<span class="dtt">'+esc(D.typ)+'</span>':m[1]?'<span class="dtt">protégé en '+m[1]+'</span>':'')+'</div><div class="ds">'+esc(D&&D.titre||m[0])+'</div>'
   +(D&&D.prec?'<div class="mot"><span class="k">Motif de protection : </span>'+esc(D.prec)+'</div>':'')
   +(D&&D.date?'<div class="dm">'+esc(D.date.replace(/ ; /g,' · '))+(D.siecle?' · '+esc(D.siecle):'')+(D.statut?' · '+esc(D.statut):'')+'</div>':'')
   +(D&&D.hist?'<details class="hist"><summary>Historique (notice Mérimée)</summary><div class="dm">'+esc(D.hist)+'</div></details>':'')
   +(m[2]?'<div class="dm"><a href="https://www.pop.culture.gouv.fr/notice/merimee/'+encodeURIComponent(m[2])+'" target="_blank" rel="noopener">Notice Mérimée '+esc(m[2])+'</a></div>':'')+'</div>';}
 if(U.pl)for(const m of U.pl)o+='<div class="dsr"><div class="hd"><span class="ty">'+esc(m[0])+'</span><span class="dtt">PLU</span></div>'+(m[2]?'<div class="ds">'+esc(m[2])+'</div>':'')+(m[1]?'<div class="mot"><span class="k">Motif de protection : </span>'+esc(m[1])+'</div>':'')+'</div>';
 if(U.pp)o+='<div class="dm" style="margin:3px 0">'+U.pp.map(esc).join(' · ')+'</div>';
 if(U.fl)o+=U.fl.map(x=>'<div class="dm">'+esc(x)+'</div>').join('');
 if(U.ar){o+='<h3>Fouilles archéologiques proches</h3>';for(const a of U.ar)o+='<div class="dsr"><div class="hd"><span class="ty">'+esc(a[2]||'Opération')+'</span><span class="dtt">'+esc(a[1])+'</span><span class="k">à '+a[5]+' m</span></div><div class="ds">'+esc(a[0])+(a[4].length?' <span class="k">('+a[4].join(', ')+')</span>':'')+'</div>'+(a[3]?'<div class="dm">'+esc(a[3])+'</div>':'')+'</div>';}
 return o;
}

let ATL=null;function loadAtl(){if(!ATL)ATL=getJson('atlas.json').catch(()=>[]);return ATL;}
function inQuad(q,x,y){let c=false;for(let i=0,j=3;i<4;j=i++){const xi=q[2*i],yi=q[2*i+1],xj=q[2*j],yj=q[2*j+1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;}
function atlasOf(s,L){if(!L)return [];const x=(bbox[4*s]+bbox[4*s+2])/2,y=(bbox[4*s+1]+bbox[4*s+3])/2;return L.filter(m=>inQuad(m.q,x,y));}
const cadUrl=id=>'https://cadastre.data.gouv.fr/map?style=ortho&parcelleId='+id;
const cadTxt=c=>c[0].slice(2,5)+' '+c[0].slice(8,10).replace(/^0/,'')+' '+c[0].slice(10).replace(/^0+/,'')+' ('+nf.format(c[1])+' m²)';
function cadHtml(C){if(!C||!C.length)return '';return '<h3>Cadastre</h3><div class="dm">'+(C.length>1?'Parcelles : ':'Parcelle : ')+C.map(c=>'<a href="'+cadUrl(c[0])+'" target="_blank" rel="noopener">'+esc(cadTxt(c))+'</a>').join(' · ')+'</div><div class="k" style="margin-top:2px">Plan cadastral DGFiP (IGN, Parcellaire Express). Arrondissement, section, numéro, contenance.</div>';}
const atlName=m=>{let n=m.n.replace(/[_]/g,'-').replace(/\s+(\d|[a-z])$/,'').replace(/(\d{4})[a-z]$/,'$1').replace(/\s+\d{4}(-\d{4})?$/,'').replace(/^Fg /,'Faubourg ').replace(/^St /,'Saint ').replace(/ St /,' Saint ').replace(/^paris\s?/i,'Paris ').trim();return n.charAt(0).toUpperCase()+n.slice(1);};
function atlHtml(M,pin){if(!M.length)return '';const yl=m=>m.y?(m.y<1000?'vers '+m.y:String(m.y)):'',D=M.filter(m=>!m.g),G=M.filter(m=>m.g),n=pin?D.length:4;
 let h='<h3>Atlas historique de Paris</h3><div class="k" style="margin:-2px 0 6px">Cartes de Michel Huard couvrant cet immeuble, calées automatiquement sur le plan actuel (précision indicative)</div>';
 if(D.length)h+='<div class="dm" style="margin:2px 0"><b>Cartes du quartier ('+D.length+')</b></div>'+D.slice(0,n).map(m=>'<div class="dm" style="margin:2px 0 2px 8px">'+(m.y?yl(m)+' · ':'')+'<a href="'+m.p[0][1]+'" target="_blank" rel="noopener">'+esc(atlName(m))+'</a> <span class="k">(page « '+esc(m.p[0][0])+' »)</span>'+(m.p.length>1?' (aussi : '+m.p.slice(1).map(p=>'<a href="'+p[1]+'" target="_blank" rel="noopener">'+esc(p[0])+'</a>').join(', ')+')':'')+' · <a href="'+m.pdf+'" target="_blank" rel="noopener">carte PDF</a></div>').join('')+(D.length>n?'<div class="k" style="margin-left:8px">… et '+(D.length-n)+' autres (cliquer l\'immeuble pour tout voir)</div>':'');
 if(G.length){const seen=new Set(),U=[];for(const m of G){const k=m.p[0][1]+'|'+m.y;if(seen.has(k))continue;seen.add(k);U.push(m);}
  h+='<div class="dm" style="margin:6px 0 2px"><b>Plans d\'ensemble et cartes thématiques ('+U.length+')</b></div><div class="dm" style="margin-left:8px;line-height:1.5">'+U.map(m=>'<a href="'+m.p[0][1]+'" target="_blank" rel="noopener">'+esc(m.p[0][0])+(m.y&&!m.p[0][0].includes(String(m.y))?' ('+yl(m)+')':'')+'</a>').join(' · ')+'</div>';}
 return h;}
/* ---------- fiche : un seul modèle pour la fenêtre et pour le PDF ---------- */
const SEC_OPEN=new Set(['bati']);
function inPts(r,x,y){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function quartierOf(s){if(!BASE||!BASE.q)return '';const x=(bbox[4*s]+bbox[4*s+2])/2,y=(bbox[4*s+1]+bbox[4*s+3])/2;for(const q of BASE.q)for(const r of q.rings)if(inPts(r,x,y))return q.n;return '';}
function cardModel(s,c){
 const {A,P,D,C,SR,AT}=c,U=D&&D.u&&D.u[s],ad=(A&&A[s])||[],[lo,la]=bldLonLat(s),f5=v=>v.toFixed(5),S=[];
 const row=(k,v)=>v==='—'?'':'<div><span class="k">'+k+' : </span>'+v+'</div>';   /* valeur inconnue : ligne masquée dans la fenêtre (gardée dans le PDF) */
 const lk=(u,x,note)=>'<div class="dm lkr"><a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(x)+'</a>'+(note?'<div class="k" style="font-size:var(--fs-xs)">'+esc(note)+'</div>':'')+'</div>';
 const it=(t,k,u)=>({t,s:k?srcLabel(k):'',u:u||(k?SRC[k][1]:'')});
 const L_=(t,u,note)=>({t:t+(note?' ('+note+')':''),s:'',u});
 const sub=x=>'<div class="sub2">'+x+'</div>';
 const sec=(id,h,html,items,n)=>{if(html||items.length)S.push({id,h,html,items,n:n||0});};
 const dm=v=>(v/10).toFixed(1).replace('.',',');
 const q0=ad[0]?'ce site n\'a pas de lien direct vers un lieu : chercher « '+ad[0]+' » ou se repérer sur la carte':'';
 // 1. Adresse et parcelle
 {const q=quartierOf(s),Cc=D&&D.c&&D.c[s],pl=P&&P[s]||[];
  let h=row('Arrondissement',ARR[s]?ARR[s]+'e':'—')+(q?row('Quartier administratif',esc(q)):'');
  if(ad.length>1)h+=row('Adresses ('+ad.length+')',ad.map(esc).join(' · '));
  if(Cc&&Cc.length)h+=row(Cc.length>1?'Parcelles cadastrales':'Parcelle cadastrale',Cc.map(c=>'<a href="'+cadUrl(c[0])+'" target="_blank" rel="noopener">'+esc(cadTxt(c))+'</a>').join(' · '));
  else if(pl.length)h+=row('Parcelle'+(pl.length>1?'s':''),pl.slice(0,4).map(x=>esc(x.slice(8,10)+' '+x.slice(10).replace(/^0+/,''))).join(', '));
  const gm='https://www.google.com/maps/search/?api=1&query='+(ad[0]?encodeURIComponent(ad[0]+', Paris'):f5(la)+','+f5(lo)),osm='https://www.openstreetmap.org/?mlat='+f5(la)+'&mlon='+f5(lo)+'#map=19/'+f5(la)+'/'+f5(lo);
  h+=sub('Voir le lieu')+lk(gm,'Google Maps')+lk(osm,'OpenStreetMap');
  const items=[it('Adresse'+(ad.length>1?'s':'')+' : '+(ad.length?ad.join(' ; '):'aucune adresse rattachée'),'ban',ad.length?banUrl(ad[0],ARR[s]):''),it('Arrondissement : '+(ARR[s]?ARR[s]+'e':'—'),'apur')];
  if(q)items.push(it('Quartier administratif : '+q,'quart'));
  if(Cc&&Cc.length)items.push(...Cc.map(c=>it('Parcelle cadastrale '+cadTxt(c),'cad',cadUrl(c[0]))));
  items.push(L_('Voir le lieu sur Google Maps',gm),L_('Voir le lieu sur OpenStreetMap',osm));
  if(GARES){const wx=(bbox[4*s]+bbox[4*s+2])/2,wy=(bbox[4*s+1]+bbox[4*s+3])/2;const N=GARES.map(g=>[Math.hypot(g[0]-wx,g[1]-wy),g]).filter(x=>x[0]<=800).sort((a,b)=>a[0]-b[0]).slice(0,4);
   const WK=WALK[s]||[];if(WK.length){h+=sub('Métro et RER à pied');for(const w of WK.slice(0,3)){const t=walkTxt(w);h+='<div class="dm">'+esc(t)+'</div>';items.push(it('Station '+t,'tcf'));}}
   if(N.length){h+=sub('Desserte en transports en commun (à vol d\'oiseau)');for(const [d,g] of N){const t=g[2]+' : '+(Math.round(d/10)*10)+' m à vol d\'oiseau';h+='<div class="dm">'+esc(t)+'</div>';items.push(it('Station '+t,'tcf'));}}}
  sec('id','Adresse et parcelle',h,items);}
 // 2. Bâtiment
 {const per=PER_LAB[PMAP[PE[s]]??11],toit=SO[s]?'panneaux solaires':VG[s]>=10?'végétalisée':TE[s]?'terrasse':'—',niv=nivOf(s);
  const h=row('Année de construction',AN[s]||'inconnue')+row('Période (Apur)',per)+row('Réhabilitation',RE[s]>=1900?RE[s]:'—')+row('Surélévation',SU[s]?SU[s]:'—')
   +row('Hauteur médiane / max',dm(HM[s])+' m / '+dm(HX[s])+' m')+row('Niveaux',niv+(nivFF(s)?' (fichiers fonciers)':' (estimé : hauteur médiane ÷ 3 m)'))
   +row('Emprise au sol',nf.format(Math.round(area[s]))+' m²')+row('Surface de plancher estimée',sdpTxt(s))
   +(TYP[s]?row('Typologie (Apur)',TY_LAB[TYP[s]]):'')+(vacOf(s).c?row('Suspicion de vacance',vacTxt(s)):'')+(vacOf(s).c&&vacOf(s).c<6&&occOf(s)?row('Occupation apparente',occTxt(s)):'')+row('Toiture',toit)+(IG[s]?row('Immeuble de grande hauteur','oui'):'');
  const items=[it('Année de construction : '+(AN[s]||'inconnue')+' (dates parfois approximatives)','apur'),it('Période : '+per,'apur'),
   it('Réhabilitation : '+(RE[s]>=1900?RE[s]:'—')+' ; surélévation : '+(SU[s]||'—'),'apur'),it('Hauteur médiane / maximale : '+dm(HM[s])+' m / '+dm(HX[s])+' m','apur'),
   it('Emprise au sol : '+nf.format(Math.round(area[s]))+' m²','apur'),
   it('Niveaux : '+niv+(nivFF(s)?' (fichiers fonciers, via la BDNB)':' (estimé : hauteur médiane ÷ 3 m)')+' ; surface de plancher estimée : '+sdpTxt(s),'calc'),
   ...(TYP[s]?[it('Typologie : '+TY_LAB[TYP[s]],'typ')]:[]),...(vacOf(s).c?[it('Suspicion de vacance des bureaux : '+vacTxt(s)+'. Indice indicatif, à vérifier sur place.','sir')]:[]),...(vacOf(s).c&&vacOf(s).c<6&&occOf(s)?[it('Occupation apparente des bureaux : '+occTxt(s)+'. Calcul indicatif (voir méthodes).','sir')]:[]),
   it('Toiture : '+(SO[s]?'panneaux solaires':VG[s]>=10?'végétalisée':TE[s]?'terrasse':'autre ou inconnue')+(IG[s]?' ; immeuble de grande hauteur':''),'apur')];
  sec('bati','Bâtiment',h,items);}
 // 3. Usages, énergie et carbone
 {const B=D&&D.n&&D.n[s],RA=bdnbRows(s,B),K=D&&D.k&&D.k[s],EN=r=>/^(Murs|Toiture|DPE|Chauffage)/.test(r[0]),RE_=RA.filter(EN),R=RA.filter(r=>!EN(r));
  {const h=RE_.map(r=>row(r[0],esc(String(r[1])))).join('')+'<div class="mot"><span class="k">Carbone d\'une reconstruction (ordre de grandeur) : </span>'+co2Txt(s)+'</div>';
   sec('ener','Énergie et carbone',h,[...RE_.map(r=>it(r[0]+' : '+r[1],r[2])),it('Carbone d\'une reconstruction à neuf (ordre de grandeur) : '+co2Txt(s),'co2')]);}
  let h=R.map(r=>row(r[0],esc(String(r[1])))).join('');
  const items=R.map(r=>it(r[0]+' : '+r[1],r[2]));
  if(K&&K.length){h+=sub('Commerces en rez-de-chaussée ('+K.length+')')+'<div class="k" style="margin:-2px 0 6px">Base des commerces de l\'Apur (BDCOM), relevé de 2017</div>'+K.slice(0,40).map(e=>'<div class="dm" style="margin:3px 0"><i class="sw2" style="display:inline-block;vertical-align:-1px;margin-right:6px;background:'+COM_COL[Math.max(0,(e[0]||7)-1)]+'"></i><b>'+esc(e[1])+'</b><span class="k">'+(e[5]?' · '+esc(e[5]):'')+(e[2]?' · '+esc(e[2]):'')+(e[4]?' · '+esc(e[4]):'')+'</span></div>').join('')+(K.length>40?'<div class="k">… et '+(K.length-40)+' autres</div>':'');
   items.push(...K.slice(0,60).map(e=>it('Commerce : '+e[1]+(e[5]?', '+e[5]:'')+(e[2]?', '+e[2]:'')+(e[3]?', '+e[3]:'')+(e[4]?', '+e[4]:''),'com')));}
  for(const [,tt,X] of XTRA){const T=X&&X[s];if(T&&T.length){h+=sub(tt);for(const [k,l] of T){h+='<div class="dm">'+esc(l)+'</div>';items.push(it(l,k));}}}
  sec('usage','Usages',h,items);}
 // 4. Autorisations d'urbanisme
 {const L=D&&D.b&&D.b[s];let h='',items=[];
  if(NT[s]&&L){h=L.slice(0,60).map(e=>{const dec=e[3]>=0?D.d[e[3]]:'En instruction';const cl=/^(Favorable|Accord)/.test(dec)?'ok':/^(Défavorable|Rejet|Irrecevable)/.test(dec)?'no':'nt';
    return '<div class="dsr"><div class="hd"><span class="ty">'+esc(TNAME[D.t[e[2]]])+'</span><span class="dtt">'+fdate(e[1])+'</span><span class="dec '+cl+'">'+esc(dec)+'</span></div>'+(e[6]>0?'<div class="k">Obtenu en '+dur(e[6])+(D.med&&D.med[D.t[e[2]]]?' (médiane à Paris sur 5 ans : '+dur(D.med[D.t[e[2]]])+')':'')+'</div>':'')
     +(e[4]?'<div class="ds">'+esc(e[4])+'</div>':'')+'<div class="dm"><a href="'+esc(dossUrl(e[0]))+'" target="_blank" rel="noopener">'+esc(e[0])+'</a>'+(e[5]?' · maître d\'ouvrage : '+esc(e[5]):'')+'</div></div>';}).join('')+(L.length>60?'<div class="k" style="padding-top:4px">'+nf.format(L.length-60)+' dossiers plus anciens non affichés.</div>':'');
   items=L.slice(0,60).map(e=>{const dec=e[3]>=0?D.d[e[3]]:'En instruction';return it(TNAME[D.t[e[2]]]+', '+fdate(e[1])+', '+dec+(e[6]>0?', obtenu en '+dur(e[6]):'')+(e[4]?' : '+e[4]:'')+' (dossier '+e[0]+(e[5]?', maître d\'ouvrage : '+e[5]:'')+')','urb',dossUrl(e[0]));});}
  else h='<div class="k">Aucun dossier rattaché à ce bâtiment depuis 1990.</div>';
  if(ad[0]){const u=archTopo(ad[0]);h+=sub('Dossiers plus anciens')+lk(u,'Archives de Paris, recherche à l\'adresse : permis de construire anciens, casier sanitaire, calepins du cadastre, sommier foncier','résultats à trier, la recherche inclut des adresses voisines');
   items.push(L_('Archives de Paris, recherche à l\'adresse « '+ad[0]+' » : permis de construire anciens, casier sanitaire, calepins du cadastre, sommier foncier',u,'résultats à trier'));}
  sec('aut','Autorisations d\'urbanisme',h,items,NT[s]);}
 // 5. Patrimoine
 {const f=PF[s],bd=[];let h='',items=[];
  if(f&1)bd.push(['Monument historique','#d53e4f']);else if(f&2)bd.push(['Immeuble protégé','#d53e4f']);
  if(f&4)bd.push(['Protégé par le PLU','#f46d43']);if(f&16)bd.push(['Bâtiment moderne','#3288bd']);if(f&32)bd.push(['Volumétrie à conserver','#3288bd']);if(f&64)bd.push(['Parcelle signalée','#b07d1a']);if(f&8)bd.push(['Périmètre de protection','#b07d1a']);
  if(bd.length)h+='<div class="up">'+bd.map(b=>'<span class="bdg" style="color:'+b[1]+'">'+esc(b[0])+'</span>').join('')+'</div>';
  if(U){
   if(U.mh)for(const m of mhUniq(U.mh)){const M=m[2]?mhDetail(m[2]):null,mu=m[2]?'https://www.pop.culture.gouv.fr/notice/merimee/'+encodeURIComponent(m[2]):'';
    h+='<div class="dsr"><div class="hd"><span class="ty">'+(m[3]==='MH'?'Monument historique':'Immeuble protégé')+'</span>'+(M&&M.typ?'<span class="dtt">'+esc(M.typ)+'</span>':m[1]?'<span class="dtt">protégé en '+m[1]+'</span>':'')+'</div><div class="ds">'+esc(M&&M.titre||m[0])+'</div>'
     +(M&&M.prec?'<div class="mot"><span class="k">Motif de protection : </span>'+esc(M.prec)+'</div>':'')+(M&&M.date?'<div class="dm">'+esc(M.date.replace(/ ; /g,' · '))+(M.siecle?' · '+esc(M.siecle):'')+(M.statut?' · '+esc(M.statut):'')+'</div>':'')
     +(M&&M.hist?'<details class="hist"><summary>Historique (notice Mérimée)</summary><div class="dm">'+esc(M.hist)+'</div></details>':'')+(m[2]?'<div class="dm"><a href="'+mu+'" target="_blank" rel="noopener">Notice Mérimée '+esc(m[2])+'</a></div>':'')+'</div>';
    items.push(it((m[3]==='MH'?'Monument historique':'Immeuble protégé')+' : '+(M&&M.titre||m[0])+(M&&M.typ?' ('+M.typ+')':m[1]?', protégé en '+m[1]:'')+(m[2]?', Mérimée '+m[2]:''),'pat',mu));
    if(M&&M.prec)items.push(it('Motif de protection : '+M.prec,'mer',mu));if(M&&M.date)items.push(it('Arrêtés : '+M.date+(M.statut?' ; '+M.statut:''),'mer',mu));if(M&&M.hist)items.push(it('Historique : '+M.hist,'mer',mu));}
   if(U.pl)for(const m of U.pl){h+='<div class="dsr"><div class="hd"><span class="ty">'+esc(m[0])+'</span><span class="dtt">PLU</span></div>'+(m[2]?'<div class="ds">'+esc(m[2])+'</div>':'')+(m[1]?'<div class="mot"><span class="k">Motif de protection : </span>'+esc(m[1])+'</div>':'')+'</div>';
    items.push(it(m[0]+' (PLU)'+(m[2]?' : '+m[2]:'')+(m[1]?'. Motif de protection : '+m[1]:''),'plu',OPD+'plub_pvp/'));}
   if(U.pp){h+=row('Périmètres',U.pp.map(esc).join(' · '));items.push(it('Périmètres : '+U.pp.join(' ; '),'pat'));}
   for(const x of (U.fl||[]).filter(x=>!/^(Secteur de risque|Plan de prévention)/.test(x))){h+='<div class="dm">'+esc(x)+'</div>';items.push(it(x,'plu'));}
  }
  const L=C&&C.b&&C.b[s];
  if(CN[s]&&L){const ar=L.find(e=>e[7]);if(ar){const t=ar[7]+(ar[8]?' ('+ar[8]+')':'');h+='<div><span class="k">Architecte d\'origine : </span>'+esc(t)+' <span class="k">(d\'après la Commission du Vieux Paris)</span></div>';items.push(it('Architecte d\'origine : '+t+', d\'après la Commission du Vieux Paris','cvp'));}
   h+=sub('Commission du Vieux Paris ('+CN[s]+')')+L.slice(0,20).map(e=>'<div class="dsr"><div class="hd"><span class="ty">'+esc(e[1]||'Sans résolution')+'</span><span class="dtt">'+fdate(e[0])+'</span>'+(e[2]?'<span class="k">'+esc(e[2])+'</span>':'')+'</div>'
    +(e[3]&&e[3]!=='Aucune'?'<div class="dm">'+esc(e[3])+'</div>':'')+(e[4]?'<div class="ds">'+esc(e[4])+'</div>':'')+(e[5]?'<div class="dm"><a href="'+esc(e[5])+'" target="_blank" rel="noopener">Compte rendu de séance (PDF)</a></div>':'')+'</div>').join('');
   items.push(...L.slice(0,20).map(e=>it('Commission du Vieux Paris, '+fdate(e[0])+', '+(e[1]||'sans résolution')+(e[2]?', '+e[2]:'')+(e[3]&&e[3]!=='Aucune'?', '+e[3]:'')+(e[4]?' : '+e[4]:''),'cvp',e[5]||'')));}
  const cvph='https://fnp.huma-num.fr/adws/app/515ec27b-90ce-11ec-a660-af5a22dfde2b/';
  h+=sub('Photographies')+lk(cvph,'Photographies de la Commission du Vieux Paris depuis 1916, carte interactive',q0);items.push(L_('Photographies de la Commission du Vieux Paris depuis 1916, carte interactive',cvph,q0));
  sec('pat','Patrimoine',bd.length||U||CN[s]?h:h,items,(f&3?1:0)+(CN[s]||0));}
 // 6. Urbanisme (PLU)
 {let h='',items=[];
  if(ZO[s]){h+=row('Zone du PLU',ZL[ZO[s]]);items.push(it('Zone du PLU : '+ZL[ZO[s]],'plu',OPD+'plub_zonage/'));}
  if(HP[s]){const hx=HX[s]/10,m=HP[s]-hx;h+=row('Plafond de hauteur du PLU',HP[s]+' m <span class="k">(hauteur max existante '+hx.toFixed(1).replace('.',',')+' m, '+(m<0?'dépasse de '+(-m).toFixed(1).replace('.',',')+' m':'marge '+m.toFixed(1).replace('.',',')+' m')+', indicatif)</span>');
   items.push(it('Plafond de hauteur du PLU : '+HP[s]+' m (hauteur maximale existante '+dm(HX[s])+' m ; comparaison indicative)','plu',OPD+'plub_hauteur/'));}
  h+=sub('Règles applicables')+lk(REGL,'Règlement du PLU bioclimatique (texte, portail de la Ville de Paris)')+lk(gpuUrl(lo,la),'Plan de zonage sur le Géoportail de l\'urbanisme, centré sur le bâtiment')+lk(CARTO,'Cartographie des règles à l\'adresse (portail de la Ville de Paris)','saisir l\'adresse ou la parcelle');
  items.push(it('Règlement du PLU bioclimatique (texte)','reg',REGL),it('Plan de zonage sur le Géoportail de l\'urbanisme, centré sur le bâtiment','gpu',gpuUrl(lo,la)),it('Cartographie des règles à l\'adresse : saisir l\'adresse ou la parcelle','reg',CARTO));
  sec('plu','Urbanisme (PLU)',h,items);}
 // 7. Sous-sol, risques et fouilles
 {let h='',items=[];const rk=(U&&U.fl||[]).filter(x=>/^(Secteur de risque|Plan de prévention)/.test(x));
  for(const x of rk){h+='<div class="dm">'+esc(x)+'</div>';items.push(it(x,'plu',OPD+['','plub_carriere/','plub_gypse/','plub_pprizone/'][RS[s]]||''));}
  if(!rk.length&&RS[s]){const x='Secteur de risque : '+['','carrières','gypse','zone inondable (PPRI)'][RS[s]];h+='<div class="dm">'+x+'</div>';items.push(it(x,'plu',OPD+['','plub_carriere/','plub_gypse/','plub_pprizone/'][RS[s]]));}
  if(U&&U.ar){h+=sub('Fouilles archéologiques à moins de 40 m ('+U.ar.length+')')+U.ar.map(a=>'<div class="dsr"><div class="hd"><span class="ty">'+esc(a[2]||'Opération')+'</span><span class="dtt">'+esc(a[1])+'</span><span class="k">à '+a[5]+' m</span></div><div class="ds">'+esc(a[0])+(a[4].length?' <span class="k">('+a[4].join(', ')+')</span>':'')+'</div>'+(a[3]?'<div class="dm">'+esc(a[3])+'</div>':'')+'</div>').join('');
   items.push(...U.ar.map(a=>it('Fouille : '+(a[2]||'opération')+', '+a[1]+', à '+a[5]+' m : '+a[0]+(a[4].length?' ('+a[4].join(', ')+')':'')+(a[3]?'. '+a[3]:''),'arch')));}
  if(!h)h='<div class="k">Aucun secteur de risque ni fouille recensée à proximité.</div>';
  sec('sol','Sous-sol, risques et fouilles',h,items,(RS[s]?1:0)+(U&&U.ar?U.ar.length:0));}
 // 8. Histoire : cartes et photos anciennes
 {let h='',items=[];const M=atlasOf(s,AT);
  if(M.length){h+=sub('Atlas historique de Paris (Michel Huard)')+atlHtml(M,true).replace(/^<h3>[^<]*<\/h3>/,'');
   items.push(...M.filter(m=>!m.g).map(m=>it('Atlas historique : '+(m.y?(m.y<1000?'vers '+m.y:m.y)+', ':'')+atlName(m)+' (page « '+m.p[0][0]+' »)','atl',m.p[0][1])));}
  const vn=vergNear(lo,la);
  h+=sub('Photographies anciennes');
  if(vn.length)for(const d of vn){const t='Photographie ancienne (Vergue) : '+vergTitle(d[1][3])+(d[1][2]>=1800?', '+d[1][2]:'')+', prise à '+Math.round(d[0])+' m',u='https://vergue.com/post/'+d[1][3]+'.html';h+=lk(u,t);items.push(L_(t,u));}
  else{h+=lk('https://vergue.com/carto-vergue-paris/','Photographies du Paris du XIXe siècle (Vergue), carte','aucune photographie à moins de 80 m du bâtiment');}
  if(FEM){const wx=(bbox[4*s]+bbox[4*s+2])/2,wy=(bbox[4*s+1]+bbox[4*s+3])/2,rr=Math.max(35,Math.hypot(bbox[4*s+2]-bbox[4*s],bbox[4*s+3]-bbox[4*s+1])/2+15);
   const F=FEM.map(f=>[Math.hypot(f[0]-wx,f[1]-wy),f]).filter(x=>x[0]<=rr).sort((a,b)=>a[0]-b[0]);
   if(F.length){h+=sub('Femmes illustres');for(const [,f] of F){const t='Femme illustre : '+f[2]+' ('+f[3].replace('77 Illustres Parisiennes','illustre Parisienne').toLowerCase()+'), '+f[4];h+='<div class="dm"><b>'+esc(f[2])+'</b> · '+esc(f[4])+'<div class="k" style="font-size:var(--fs-s);margin-top:2px">'+esc(f[5])+'</div></div>';items.push(it(t+' : '+f[5],'fem','https://opendata.paris.fr/explore/dataset/femmes-illustres-a-paris-portraits/'));}}}
  {const q=p70Of(lo,la);if(q){const n=q[0],c=q[3],u='https://paris1970.jeantho.eu/carres/'+n+'.html',t='C\'était Paris en 1970 : carré '+n+(c?', '+c+' photographie'+(c>1?'s':'')+' numérisée'+(c>1?'s':''):', pas de photographie numérisée');
   const u0='https://paris1970.fr/carre/'+n;h+=lk(u0,t,'concours photo amateur de 1970 (Bibliothèque historique de la Ville de Paris) ; carroyage approché à ± 50 m, vérifier sur le plan du carré');items.push(L_(t,u0));
   const t2='Même carré sur paris1970.jeantho.eu (planche du plan de 1970)';h+=lk(u,t2);items.push(L_(t2,u));}}
  const voie=ad[0]?ad[0].replace(/^\d+\s*(bis|ter|quater|[a-z])?\s+/i,''):'';
  if(voie){const u=archPhoto(voie);h+=lk(u,'Archives de Paris, photographies de la voie « '+voie+' »');items.push(L_('Archives de Paris, photographies de la voie « '+voie+' »',u));}
  const P2=[['Remonter le temps (IGN) : cartes et photos aériennes anciennes','https://remonterletemps.ign.fr/comparer?lon='+f5(lo)+'&lat='+f5(la)+'&z=18'],
   ['Cassini | Grand Paris (Apur) : plans historiques de 1728 à nos jours','https://www.apur.org/fr/geo-data/cassini-grand-paris-plans-historiques-1728-nos-jours'],
   ['Plan parcellaire de Paris en ligne (Ville de Paris, Vasserot et plans modernes)','https://www.paris.fr/pages/plans-donnees-et-documents-d-urbanisme-3708'],
   ['Plans cadastraux des immeubles de Paris 1809-1856 (Archives nationales)','https://www.data.gouv.fr/datasets/plans-cadastraux-des-immeubles-de-paris-1809-1856'],
   ['Plans d\'îlots Vasserot, projet Paris Time Machine','https://paris-timemachine.huma-num.fr/en/old-parcel-plans/']];
  h+=sub('Cartes et plans anciens');for(const [t,u] of P2){h+=lk(u,t);items.push(L_(t,u));}
  sec('hist','Histoire : cartes et photos anciennes',h,items,M.filter(m=>!m.g).length);}

 // ventes et occupants (version interne seulement)
 {const V=D&&D.v&&D.v[s],sec2=[];const add=(h_,items)=>{sec2.push({h:h_,items});};
 if(V)add('Ventes DVF 2021-2025 ('+DN[s]+')'+(PM[s]?', médiane '+eur(PM[s])+'/m²':''),V.slice(0,30).map(e=>{const [mid,dt,nat,v,parts,nr,how]=e;return it(nat+', '+fdate(dt)+' : '+(v>0?eur(v):'valeur non renseignée')+(nr>1?' (transaction de '+nr+' biens, valeur pour l\'ensemble)':'')+' ; '+parts.map(p=>p[0]+(p[1]>0?' '+p[1]+' m² bâtis':'')+(p[3]>0?', Carrez '+nf.format(p[3])+' m²':'')+(p[2]>0?', '+p[2]+' p.':'')).join(' ; ')+(how>1?' ; rattachement approximatif':'')+' (mutation '+mid+')','dvf');}));
 const R=SR&&SR.b&&SR.b[s];
 if(R)add('Occupants, Sirene ('+nf.format(SNE[s])+' établissements actifs)',[it('Effectif salarié estimé : '+(R[1]>0?'≈ '+nf.format(R[1]):'non renseigné')+' ; établissements fermés depuis 2024 : '+(R[2]||0)+(SNE[s]>=30?' ; domiciliation probable (nombreuses entreprises déclarées)':''),'sir'),...R[4].slice(0,30).map(e=>it(e[0]+' : '+(NAFD[(e[1]||'').slice(0,2)]||'activité inconnue')+(e[1]?' ('+e[1]+')':'')+(e[2]?', créé en '+e[2]:'')+', '+(TRN[e[3]]||'effectif non renseigné'),'sir',/^\d{14}$/.test(e[5]||'')?'https://annuaire-entreprises.data.gouv.fr/etablissement/'+e[5]:''))]);

  if(DN[s]){const x=sec2.find(z=>z.h.startsWith('Ventes'));sec('dvf','Ventes (DVF 2021-2025)'+(PM[s]?', médiane '+eur(PM[s])+'/m²':''),V?dvfHtml(V,30,true):'<div class="k">Détail indisponible.</div>',x?x.items:[],DN[s]);}
 if(SNE[s]||SCL[s]){const x=sec2.find(z=>z.h.startsWith('Occupants'));
  const R=SR&&SR.b[s];
  let out='';
  if(R){
   const eff=R[1];
   out+='<div class="dm" style="margin-bottom:3px">'+(eff>0?'Effectif salarié estimé ≈ '+nf.format(eff)+' (tranches Sirene, indicatif). ':'Effectifs non renseignés. ')+(R[2]?R[2]+' établissement'+(R[2]>1?'s':'')+' fermé'+(R[2]>1?'s':'')+' depuis 2024. ':'')+'</div>';
   if(SNE[s]>=30)out+='<div class="dm" style="color:#b3303f;margin-bottom:3px">Domiciliation probable : beaucoup d\'entreprises déclarées à cette adresse, sans activité forcément sur place.</div>';
   if(R[3]&&R[3].length)out+='<div class="dm" style="margin-bottom:3px">'+R[3].map(g=>esc(GNM[g[0]])+' ('+g[1]+')').join(' · ')+'</div>';
   out+=R[4].slice(0,30).map(e=>{const dv=NAFD[(e[1]||'').slice(0,2)]||'';return '<div class="dsr"><div class="hd"><span class="ty">'+esc(e[0])+'</span>'+'</div><div class="ds">'+esc(dv)+(e[1]?' <span class="k">('+esc(e[1])+')</span>':'')+'</div><div class="dm">'+(e[2]?'Créé en '+e[2]+' · ':'')+esc(TRN[e[3]]||'effectif non renseigné')+'</div></div>';}).join('');
   if(SNE[s]>30)out+='<div class="k" style="padding-top:4px">'+(pin?nf.format(SNE[s]-30)+' autres établissements non listés (30 plus importants affichés).':'+ '+nf.format(SNE[s]-4)+' autres : cliquer pour la fiche complète.')+'</div>';
  }else out+='<div class="k">Détail indisponible.</div>';
 
   sec('sir','Occupants (Sirene)',out,x?x.items:[],SNE[s]);}
 }
 // propriétaires personnes morales
 {const O=D&&D.o&&D.o[s];if(O&&O.length){let h='',items=[];
   for(const o of O){if(!o[4]){h+='<div class="k">'+esc(o[0])+'</div>';continue;}const u=o[2]?'https://annuaire-entreprises.data.gouv.fr/entreprise/'+o[2]:'';
    const t=o[0]+(o[1]?' ('+o[1]+')':'')+' : '+o[4]+' local'+(o[4]>1?'ux':'')+' ; '+OWN_LAB[o[3]].replace(/ \(.*$/,'');
    h+='<div class="dm"><b>'+esc(o[0])+'</b>'+(o[1]?' <span class="k">'+esc(o[1])+'</span>':'')+'<div class="k" style="font-size:var(--fs-s)">'+o[4]+' local'+(o[4]>1?'ux':'')+' · '+esc(OWN_LAB[o[3]].replace(/ \(.*$/,''))+(u?' · <a href="'+u+'" target="_blank" rel="noopener">fiche entreprise (siège, dirigeants, SIREN '+esc(o[2])+')</a>':'')+'</div></div>';
    items.push(it('Propriétaire : '+t+(o[2]?' (SIREN '+o[2]+')':''),'own',u));}
   h+='<div class="k" style="margin-top:4px">Personnes morales propriétaires au 1er janvier '+(D.oan||'')+' (DGFiP). Les particuliers n\'y figurent pas. Aucune adresse électronique ni téléphone n\'est publié : la fiche entreprise donne le siège et les dirigeants.</div>';
   sec('own','Propriétaires',h,items,O.filter(o=>o[4]).length);}}
 S.forEach(x=>{x.f=SEC_FAM[x.id]||0;});S.sort((a,b)=>SEC_ORD.indexOf(a.id)-SEC_ORD.indexOf(b.id));
 return S;
}
/* lien partageable : ?b=longitude,latitude de l'immeuble (stable d'une mise à jour à l'autre) et &c=calque affiché */
function permalink(s){try{const u=new URL(location.href);u.searchParams.delete('adresses');u.searchParams.delete('accueil');
 if(s<0){u.searchParams.delete('b');u.searchParams.delete('c');}else{const [lo,la]=bldLonLat(s);u.searchParams.set('b',lo.toFixed(6)+','+la.toFixed(6));if(st.crit&&st.crit.id!=='neu')u.searchParams.set('c',st.crit.id);else u.searchParams.delete('c');}
 const q=u.searchParams.toString().replace(/%2C/g,','),t=u.pathname+(q?'?'+q:'')+u.hash;if(t!==location.pathname+location.search+location.hash)history.replaceState(null,'',t);}catch(e){}}
async function showCard(s,pin){
 if(s<0){card.hidden=true;cardFor=-1;document.body.classList.remove('cardon','cardv');permalink(-1);return;}
 if(pin)permalink(s);
 card.hidden=false;if(cardFor!==s)card.classList.remove('big');document.body.classList.toggle('cardv',!isMob());card.classList.toggle('pin',!!pin);cardFor=s;
 if(isMob()){document.body.classList.add('cardon');card.scrollTop=0;if(pin){const bx=(bbox[4*s]+bbox[4*s+2])/2,by=(bbox[4*s+1]+bbox[4*s+3])/2,[,sy]=w2s(bx,by);if(sy>innerHeight*.34||sy<40){view.cx=bx;view.cy=by-innerHeight*.31/view.k;draw();}}}
 const lim=pin?60:3;
 const body=h=>{if(cardFor!==s)return;cb.innerHTML=h;};
 body(baseInfo(s,undefined,null)+'<div class="k" style="margin-top:8px">Chargement…</div>');
 const [D,C,SR,,AT]=await Promise.all([loadArr(ARR[s]),CN[s]?loadCvp():null,(SNE[s]||SCL[s])?loadSir(ARR[s]):null,(PF[s]&3)?loadMhd():null,loadAtl(),Promise.race([walkFor(s),new Promise(r=>setTimeout(r,3500))])]);
 if(cardFor!==s)return;
 const A=D?D.a:{},P=D?D.p:{};
 // l'adresse recherchée passe en tête (titre de la fiche et du PDF)
 if(ADPREF&&ADPREF.s===s&&A&&A[s]){const i=A[s].findIndex(a=>nz(a)===nz(ADPREF.t));if(i>0)A[s]=[A[s][i],...A[s].filter((_,k)=>k!==i)];}
 const M=cardModel(s,{A,P,D,C,SR,AT}),ad=A&&A[s]||[];
 PCTX={s,A,P,D,C,SR,atl:AT,M};
 let out=(ad.length?'<div class="t">'+esc(ad[0])+'</div>':'<div class="t">Pas d\'adresse rattachée</div><div class="k adl">Annexe, cour ou bâtiment sans numéro dans la Base Adresse Nationale</div>')
  +'<div class="sb">'+(AN[s]?'Construit en '+AN[s]:'Date de construction inconnue')+' · Paris '+(ARR[s]?ARR[s]+'e':'')+(ad.length>1?' · '+ad.length+' adresses':'')+'</div>'+legendHtml(s)
  +'<div class="pdfrow"><button id="pdfb" type="button" class="pdfb">Exporter la fiche en PDF</button><button id="shb" type="button" class="shb" title="Copier un lien vers cette fiche">Partager</button> <span id="pdfm" class="k"></span></div>'+'<a class="ctaf" href="'+CTA_URL+'&utm_medium=fiche" target="_blank" rel="noopener"><b>'+CTA_TXT+' →</b><span>'+CTA_SUB+'</span></a>';
 out+=M.map((x,i)=>(x.f&&x.f!==(M[i-1]||{}).f?'<div class="ffam">'+FAM[x.f]+'</div>':'')+'<details class="fsec" data-id="'+x.id+'"'+(SEC_OPEN.has(x.id)?' open':'')+'><summary><span class="chev"></span>'+esc(x.h)+(x.n?'<span class="gn">'+nf.format(x.n)+'</span>':'')+'</summary><div class="fbody">'+x.html+'</div></details>').join('');
 body(out);
 cb.querySelectorAll('details.fsec').forEach(d=>d.addEventListener('toggle',()=>{d.open?SEC_OPEN.add(d.dataset.id):SEC_OPEN.delete(d.dataset.id);}));
}
