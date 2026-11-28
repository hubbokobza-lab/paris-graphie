/* ---------- essai de design (?essai=1) : accueil dépouillé, chiffres sans formules, règles de la coupe masquées ---------- */
{const a=$('#acc');if(a&&(!ESSAI||/[?&](adresses|embed|q|adr|b)=/.test(location.search)||location.hash.length>1||(navigator.webdriver&&!/[?&]accueil=1/.test(location.search))))a.remove();}
if(ESSAI){
 // signature de l'agence en tête du panneau
 {const h=$('#panel header h1');if(h&&!$('#psig')){const d=document.createElement('div');d.id='psig';const t=$('#tlogo');if(t)d.append(t.content.cloneNode(true));else d.textContent='Bouchaud Architectes';h.before(d);}}
 // accueil : le titre, une phrase, un champ d'adresse ; la carte se découvre ensuite
 const direct=/[?&](adresses|embed|q|adr|b)=/.test(location.search)||location.hash.length>1||(navigator.webdriver&&!/[?&]accueil=1/.test(location.search));   // robots de contrôle : sans accueil, sauf ?accueil=1
 if(!direct&&$('#acc')){
  const a=$('#acc');a.hidden=false;a.classList.remove('wait');
  const close=()=>{a.classList.add('out');setTimeout(()=>a.remove(),350);};
  const q=$('#accq');if(document.activeElement!==q)setTimeout(()=>q.focus(),50);
  const go=()=>{const v=q.value;close();if(isMob())$('#panel').classList.remove('min');const t=$('#q');t.value=v;t.focus();t.dispatchEvent(new Event('input',{bubbles:true}));};q.addEventListener('input',go);
  /* tutoriel : à la première visite, quand on choisit d'explorer la carte (pas quand on cherche une adresse : on veut sa fiche) ; toujours proposé sur l'accueil */
  let seen=false;try{seen=!!localStorage.getItem('pg_tuto');}catch(e){seen=true;}
  $('#acce').onclick=()=>{close();if(!seen&&!navigator.webdriver)setTimeout(()=>{if(!$('#tuw'))tuto();},450);};
  $('#acct').onclick=()=>{close();setTimeout(()=>{if(!$('#tuw'))tuto();},400);};a.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  /* saisie ou clic pendant le chargement : repris maintenant */if(q.value.trim())go();else if(a.dataset.want)$('#'+a.dataset.want).click();
 }
 // fiche : le chiffre seul ; la méthode (« calcul : … ») passe derrière un « i »
 const cb=$('#cb');if(cb){let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;
  const w=document.createTreeWalker(cb,NodeFilter.SHOW_TEXT),L=[];let n;while(n=w.nextNode())if(/\(calcul[^)]*\)/.test(n.nodeValue))L.push(n);
  for(const t of L){const m=t.nodeValue.match(/\s*\((calcul[^)]*)\)/);const i=document.createElement('abbr');i.className='mi';i.textContent='i';i.title=m[1].replace(/^calcul\s*:\s*/,'Calcul : ');i.tabIndex=0;
   const rest=document.createTextNode(t.nodeValue.slice(m.index+m[0].length));t.nodeValue=t.nodeValue.slice(0,m.index)+' ';t.after(i,rest);}
  busy=false;}).observe(cb,{childList:true,subtree:true});}
 // coupe : règles des gabarits masquées par défaut (hauteurs et gabarits visibles)
 try{if(!localStorage.getItem('pg_regles_v')){CUTOFF.add('regles');localStorage.setItem('pg_regles_v','1');localStorage.setItem('pg_cutoff',[...CUTOFF].join(','));}}catch(e){CUTOFF.add('regles');}   /* une fois : ensuite le choix de chacun est gardé */
 // lien pour revenir au design actuel
}
