/* ---------- essai de design (?essai=1) : accueil dépouillé, chiffres sans formules, règles de la coupe masquées ---------- */
if(ESSAI){
 // signature de l'agence en tête du panneau
 {const h=$('#panel header h1');if(h&&!$('#psig')){const d=document.createElement('div');d.id='psig';d.textContent='Bouchaud Architectes';h.before(d);}}
 // accueil : le titre, une phrase, un champ d'adresse ; la carte se découvre ensuite
 const direct=/[?&](adresses|embed|q|adr)=/.test(location.search)||location.hash.length>1;
 if(!direct){
  const a=document.createElement('div');a.id='acc';a.setAttribute('role','dialog');a.setAttribute('aria-label','Accueil');
  a.innerHTML='<div class="accb"><div class="accs">Bouchaud Architectes</div><h2>Paris-graphie</h2><p>Les immeubles de Paris, un par un : âge, hauteurs, règles d\'urbanisme, patrimoine.</p>'
   +'<div class="acci"><input id="accq" type="search" placeholder="Saisissez une adresse" aria-label="Rechercher une adresse" autocomplete="off" spellcheck="false"></div>'
   +'<button id="acce" type="button">Explorer la carte</button></div>';
  document.body.appendChild(a);
  const close=()=>{a.classList.add('out');setTimeout(()=>a.remove(),350);};
  const q=$('#accq');setTimeout(()=>q.focus(),50);
  q.addEventListener('input',()=>{const v=q.value;close();if(isMob())$('#panel').classList.remove('min');const t=$('#q');t.value=v;t.focus();t.dispatchEvent(new Event('input',{bubbles:true}));});
  $('#acce').onclick=close;a.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
 }
 // fiche : le chiffre seul ; la méthode (« calcul : … ») passe derrière un « i »
 const cb=$('#cb');if(cb){let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;
  const w=document.createTreeWalker(cb,NodeFilter.SHOW_TEXT),L=[];let n;while(n=w.nextNode())if(/\(calcul[^)]*\)/.test(n.nodeValue))L.push(n);
  for(const t of L){const m=t.nodeValue.match(/\s*\((calcul[^)]*)\)/);const i=document.createElement('abbr');i.className='mi';i.textContent='i';i.title=m[1].replace(/^calcul\s*:\s*/,'Calcul : ');i.tabIndex=0;
   const rest=document.createTextNode(t.nodeValue.slice(m.index+m[0].length));t.nodeValue=t.nodeValue.slice(0,m.index)+' ';t.after(i,rest);}
  busy=false;}).observe(cb,{childList:true,subtree:true});}
 // coupe : règles des gabarits masquées par défaut (hauteurs et gabarits visibles)
 try{if(!sessionStorage.getItem('pg_essai_r')){CUTOFF.add('regles');sessionStorage.setItem('pg_essai_r','1');}}catch(e){}
 // lien pour revenir au design actuel
 {const f=$('#ftr');if(f){const s=document.createElement('div');s.className='essl';s.innerHTML='Essai de design · <a href="?essai=0">revenir au design actuel</a>';f.after(s);}}
}
