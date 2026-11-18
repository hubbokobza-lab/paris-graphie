# Paris-graphie

La carte des immeubles de Paris de Bouchaud Architectes : https://hubbokobza-lab.github.io/paris-graphie/

## Mise à jour automatique

Le robot GitHub Actions (`.github/workflows/maj.yml`) recalcule le site et le publie sur la branche `gh-pages`, que GitHub Pages sert.

- **Chaque lundi** : autorisations d'urbanisme, dossiers récents et Commission du Vieux Paris (Ville de Paris), adresses (BAN). Environ 2 minutes.
- **Chaque trimestre** (3 janvier, avril, juillet, octobre) : reconstruction complète, emprise bâtie et typologie Apur, PLU, patrimoine, archéologie, comptages, commerces, BDNB (dernier millésime trouvé automatiquement), cadastre, voirie. 30 à 60 minutes.
- **À la demande** : onglet *Actions* > *Mise à jour des données* > *Run workflow*, puis choisir `weekly` ou `full`.

Si une source est indisponible ou renvoie un résultat anormal, le calcul s'arrête avant publication : le site reste dans son état précédent et GitHub envoie un e-mail d'échec.

## Contenu

- `pipeline/` : les scripts (un module par famille de données, `run.py` pour l'enchaînement).
- `static/` : éléments figés, réutilisés tels quels : page (`template.html`), atlas historique de Michel Huard calé sur le plan actuel, relief (MNT, courbes, cotes NVP), données Vergue, fiches Mérimée, fonds (Seine, arrondissements, quartiers).

Pour lancer à la main : `pip install -r requirements.txt` puis `python pipeline/run.py full --out site`.
