# Paris-graphie

**Paris-graphie est un outil conçu, développé et édité par [Bouchaud Architectes](https://www.bouchaudarchitectes.com/), agence d'architecture parisienne, dans le cadre de son pôle de recherche Hors-Piste.**

- Carte : https://hubbokobza-lab.github.io/paris-graphie/
- Présentation du projet : https://www.bouchaudarchitectes.com/hors-piste/paris-graphie
- API : https://paris-graphie-api.hub-bokobza.workers.dev/ (documentation à la racine)
- Serveur MCP pour assistants IA : https://paris-graphie-api.hub-bokobza.workers.dev/mcp
- Notice pour les IA : https://hubbokobza-lab.github.io/paris-graphie/llms.txt

**Contact** pour toute anomalie, réclamation, demande de correction ou question : [h.bokobza@bouchaudarchitectes.com](mailto:h.bokobza@bouchaudarchitectes.com)

## Ce que fait Paris-graphie

Une carte des immeubles de Paris intra-muros, construite uniquement à partir de données ouvertes : âge, hauteur, niveaux, surface de plancher estimée, usages, DPE, patrimoine, PLU, autorisations d'urbanisme et délais d'obtention, occupants (comptages Sirene), propriétaires personnes morales, suspicion de vacance des bureaux, desserte en transports, atlas historique. Chaque immeuble a une fiche exportable en PDF, et une liste d'adresses s'analyse et s'exporte en Excel.

## Démarche

L'idée a commencé à prendre forme en 2018. Pour qui travaille sur des immeubles existants, la première question est toujours la même : de quand date ce bâtiment, que peut-on y faire, qu'est-ce qui le protège, qui le possède. Les réponses existaient, mais éparpillées entre quatre ou cinq sites, dans des formats différents, rarement rattachées à la même adresse.

Ce qui a changé, c'est l'ouverture des données publiques. La Ville de Paris a ouvert sa plateforme Paris Data en janvier 2011, avec une API pour exploiter les jeux de données. L'Apur, l'atelier parisien d'urbanisme, a engagé sa démarche d'open data en 2014 et ouvert sa plateforme opendata.apur.org en 2016. Depuis, l'emprise bâtie, la datation du bâti, le patrimoine protégé, le PLU, les autorisations d'urbanisme, la base nationale des bâtiments, les diagnostics énergétiques ou le répertoire Sirene sont accessibles à tous, sous licence ouverte.

Chaque jeu de données répond à sa propre question. Croisés à l'échelle du bâtiment, ils permettent d'en poser que personne ne pouvait traiter simplement avant : où se trouvent les immeubles anciens non protégés qui ne sont pas au plafond de hauteur du PLU, quels bureaux montrent des signes de vacance, quels quartiers concentrent les surélévations accordées. Aucune donnée n'est produite par Paris-graphie. Tout ce que l'outil montre vient du rapprochement de sources ouvertes, et la mise en évidence tient à ce rapprochement.

Paris-graphie a d'abord été un outil interne de Bouchaud Architectes, développé dans le cadre de son pôle de recherche Hors-Piste. L'agence l'a rendu public parce qu'il sert au-delà de ses propres études. Il reste en évolution, et les retours sont bienvenus.

## Pour les IA et les développeurs

- **Carte** : https://hubbokobza-lab.github.io/paris-graphie/ (application JavaScript, non lisible par un robot sans exécution du code)
- **API** : https://paris-graphie-api.hub-bokobza.workers.dev/ (JSON, sans clé, documentation à la racine)
- **Serveur MCP** : https://paris-graphie-api.hub-bokobza.workers.dev/mcp (transport HTTP, outils `immeuble_paris`, `immeubles_paris`, `sources_paris_graphie`)
- **Notice pour les IA** : https://hubbokobza-lab.github.io/paris-graphie/llms.txt
- **Sources et dates d'extraction** : `/sources` sur l'API, ou « Sources et licences » dans la carte

Exemple :

    GET https://paris-graphie-api.hub-bokobza.workers.dev/adresse?q=40 rue Laffitte

La réponse contient le bâtiment (`adresse`, `batiment`, `carte`), un objet `indicateurs` (hauteur, niveaux, emprise, surface de plancher estimée, DPE, matériau des murs, protection patrimoniale, zone et plafond de hauteur du PLU, dossiers d'urbanisme, établissements actifs, suspicion de vacance des bureaux, propriétaire personne morale, etc.), un lien `sources` et un `avertissement`.

Règles d'usage pour un assistant ou un programme :

1. Citer les sources renvoyées par `/sources`, et l'éditeur (Paris-graphie, Bouchaud Architectes).
2. Les rattachements des données aux bâtiments sont approximatifs. La surface de plancher, les niveaux quand ils ne viennent pas de la base nationale des bâtiments, la suspicion de vacance et les ordres de grandeur carbone sont des estimations, signalées comme telles dans les champs concernés.
3. Ces informations ne remplacent ni un extrait cadastral, ni une note de renseignements d'urbanisme, ni le PLU opposable. Le PLU bioclimatique est repris sans valeur réglementaire.
4. Une adresse hors de Paris intra-muros n'est pas couverte.
5. L'API n'a pas de quota documenté. Limiter les rafales, et utiliser `/adresses` (25 adresses par requête) plutôt que de nombreux appels isolés.

## API

| Point d'accès | Contenu |
|---|---|
| `/adresse?q=40 rue Laffitte` | un immeuble, avec métro et RER à pied (`&marche=0` pour les omettre) |
| `/adresses?q=adresse 1\|adresse 2` | jusqu'à 25 adresses |
| `/voie?nom=rue Laffitte` | tous les bâtiments d'une voie |
| `/sources` | sources, producteur de chaque indicateur, dates d'extraction |
| `/mcp` | serveur MCP (outils `immeuble_paris`, `immeubles_paris`, `sources_paris_graphie`) |

L'API lit les fichiers publiés chaque semaine par le robot (dossier `api/` de la branche `gh-pages`). Son code est dans `api-worker/`.

## Données et sources

Les données proviennent de jeux de données ouverts (Apur, Ville de Paris, IGN, BAN, Insee Sirene, DGFiP, CSTB BDNB, ADEME, ministère de la Culture, IDFM, OpenStreetMap, Michel Huard pour l'atlas historique, etc.), chacun sous sa propre licence (ODbL ou Licence Ouverte selon le producteur). La liste complète, avec les dates d'extraction, est dans la carte (« Sources et licences ») et sur `/sources`. Les rattachements des données aux bâtiments sont approximatifs ; certaines valeurs (surface de plancher, suspicion de vacance) sont des estimations. Ils ne remplacent ni un extrait cadastral, ni une note de renseignements d'urbanisme.

## Mise à jour automatique

Le robot GitHub Actions (`.github/workflows/maj.yml`) recalcule le site et le publie sur la branche `gh-pages`, que GitHub Pages sert.

- **Chaque lundi** : autorisations d'urbanisme, dossiers récents et Commission du Vieux Paris (Ville de Paris), adresses (BAN), projets de l'agence, accès pour les IA. Sirene chaque mois, propriétaires tous les 90 jours.
- **Chaque trimestre** (3 janvier, avril, juillet, octobre) : reconstruction complète.
- **À la demande** : onglet *Actions* > *Mise à jour des données* > *Run workflow*, puis choisir `weekly` ou `full`.

Si une source est indisponible ou renvoie un résultat anormal, le calcul s'arrête avant publication : le site reste dans son état précédent.

## Contenu du dépôt

- `pipeline/` : les scripts (un module par famille de données, `run.py` pour l'enchaînement).
- `static/` : éléments figés (page `template.html`, atlas historique calé, relief, fonds).
- `api-worker/` : l'API (Cloudflare Worker).

## Droits

© 2026 Bouchaud Architectes. Tous droits réservés sur le code, la conception et la mise en forme de Paris-graphie. Les données restent la propriété de leurs producteurs et sont réutilisées selon leurs licences respectives. Pour toute demande de réutilisation : h.bokobza@bouchaudarchitectes.com
