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

### Brancher Paris-graphie dans un assistant IA (connecteur MCP)

**Claude** (claude.ai, application de bureau ou mobile) :

1. Ouvrir les réglages, rubrique **Connecteurs**, puis **Ajouter un connecteur personnalisé**. Attention à ne pas utiliser la liste des « domaines autorisés » des réglages Capacités, qui ne sert pas à cela et n'accepte qu'un nom de domaine.
2. Nom : `Paris-graphie`.
3. Adresse du serveur, en entier, avec `https://` (sans quoi le bouton d'ajout reste grisé) : `https://paris-graphie-api.hub-bokobza.workers.dev/mcp`
4. Laisser vides les champs OAuth : le serveur ne demande pas d'authentification.
5. Dans une conversation, activer le connecteur et poser une question, par exemple : « Que sais-tu du 40 rue Laffitte à Paris ? »

Le connecteur n'est visible que dans le compte qui l'a ajouté. Pour une équipe, un administrateur de l'organisation peut l'ajouter pour tous.

**Autres assistants et outils compatibles MCP** (ChatGPT en mode développeur, Claude Code, Cursor, etc.) : déclarer un serveur MCP distant de type HTTP (« streamable HTTP ») à la même adresse, sans authentification. Par exemple avec Claude Code :

    claude mcp add --transport http paris-graphie https://paris-graphie-api.hub-bokobza.workers.dev/mcp

Outils proposés : `immeuble_paris` (une adresse, avec métro et RER à pied), `immeubles_paris` (jusqu'à 15 adresses), `sources_paris_graphie` (sources, méthodes et dates d'extraction).

Règles d'usage pour un assistant ou un programme :

1. Citer les sources renvoyées par `/sources`, et l'éditeur (Paris-graphie, Bouchaud Architectes).
2. Les rattachements des données aux bâtiments sont approximatifs. La surface de plancher, les niveaux quand ils ne viennent pas de la base nationale des bâtiments, la suspicion de vacance et les ordres de grandeur carbone sont des estimations, signalées comme telles dans les champs concernés.
3. Ces informations ne remplacent ni un extrait cadastral, ni une note de renseignements d'urbanisme, ni le PLU opposable. Le PLU bioclimatique est repris sans valeur réglementaire.
4. Une adresse hors de Paris intra-muros n'est pas couverte.
5. L'API n'a pas de quota documenté. Limiter les rafales, et utiliser `/adresses` (15 adresses par requête) plutôt que de nombreux appels isolés.

## API

| Point d'accès | Contenu |
|---|---|
| `/adresse?q=40 rue Laffitte` | un immeuble, avec métro et RER à pied (`&marche=0` pour les omettre) |
| `/adresses?q=adresse 1\|adresse 2` | jusqu'à 15 adresses |
| `/voie?nom=rue Laffitte` | tous les bâtiments d'une voie |
| `/sources` | sources, producteur de chaque indicateur, dates d'extraction |
| `/mcp` | serveur MCP (outils `immeuble_paris`, `immeubles_paris`, `sources_paris_graphie`) |

L'API lit les fichiers publiés chaque semaine par le robot (dossier `api/` de la branche `gh-pages`). Son code est dans `api-worker/`.

## Données et sources

Les données proviennent de jeux de données ouverts (Apur, Ville de Paris, IGN, BAN, Insee Sirene, DGFiP, CSTB BDNB, ADEME, ministère de la Culture, IDFM, OpenStreetMap, Michel Huard pour l'atlas historique, etc.), chacun sous sa propre licence (ODbL ou Licence Ouverte selon le producteur). La liste complète, avec les dates d'extraction, est dans la carte (« Sources et licences ») et sur `/sources`. Les rattachements des données aux bâtiments sont approximatifs ; certaines valeurs (surface de plancher, suspicion de vacance) sont des estimations. Ils ne remplacent ni un extrait cadastral, ni une note de renseignements d'urbanisme.

## Méthodes de calcul

Les indicateurs suivants sont calculés par Paris-graphie (ils figurent aussi dans la carte, rubrique « Méthodes de calcul », et sur `/sources` de l'API). Ce sont des ordres de grandeur, à vérifier.

- **Rattachement des adresses et des données aux bâtiments.** Chaque adresse de la Base Adresse Nationale est rattachée au bâtiment Apur qui contient son point, ou au plus proche dans un rayon de quelques mètres. Pour Sirene, un établissement dont le numéro est absent de la BAN est rattaché au numéro voisin du même côté de la voie (±2 ou ±4). Les données publiées par adresse (autorisations d'urbanisme, Sirene, DPE) suivent ce rattachement ; les données par parcelle (propriétaires) passent par la parcelle cadastrale de l'adresse. Un bâtiment peut ainsi recevoir les données d'un voisin, ou en manquer.
- **Nombre de niveaux.** Nombre de niveaux des fichiers fonciers (CSTB, BDNB) quand il est cohérent avec la hauteur (au plus 5,5 m par niveau) ; sinon, hauteur médiane Apur divisée par 3 m, arrondie.
- **Surface de plancher estimée.** Emprise au sol du bâtiment (polygone Apur) multipliée par le nombre de niveaux, puis réduite de 20 à 40 % pour tenir compte des murs, des circulations, des vides et des locaux non comptés. Le résultat est donné en fourchette ; les calculs qui ont besoin d'une valeur unique prennent le milieu (moins 30 %). Ce n'est pas une surface de plancher au sens du code de l'urbanisme.
- **Carbone d'une reconstruction à neuf.** Surface de plancher estimée (milieu de fourchette) multipliée par 650 kg CO₂e par m², ordre de grandeur d'un bâtiment neuf. Sert à comparer, pas à évaluer un projet.
- **Marge sous le plafond du PLU.** Plafond de hauteur du PLU bioclimatique moins la hauteur maximale Apur du bâtiment. Indicatif : ne tient compte ni des gabarits-enveloppes, ni des règles de prospect, ni des protections.
- **Délai d'obtention des autorisations.** Pour les permis de construire, déclarations préalables et permis de démolir accordés : date de décision moins date de dépôt, en jours. La médiane parisienne est calculée sur les dossiers déposés depuis 5 ans. Les dossiers refusés, retirés ou en cours sont exclus.
- **Surface créée cumulée.** Somme des surfaces créées lues dans le descriptif des autorisations accordées (Ville de Paris). Lecture automatique du texte, donc indicative.
- **Transformation de bureaux en logements.** Permis de construire des 6 dernières années dont le descriptif mentionne le passage de bureaux à de l'habitation ou du logement (lecture automatique du texte).
- **Interdiction de louer (loi Climat et résilience).** D'après l'étiquette DPE du logement représentatif (ADEME, via la BDNB) : G interdit à la location depuis 2025, F à partir de 2028, E à partir de 2034. Un immeuble contient des logements d'étiquettes différentes : à vérifier logement par logement.
- **Effectif salarié estimé.** Somme, pour les établissements actifs rattachés au bâtiment (Insee Sirene), du milieu de leur tranche d'effectif (par exemple 35 pour « 20 à 49 salariés »). Les établissements sans tranche renseignée ne comptent pas.
- **Taux d'occupation apparent des bureaux.** Effectif salarié estimé multiplié par 20 m² de surface de plancher par salarié, divisé par la surface de bureaux estimée (surface de plancher, milieu de fourchette, moins 65 m² par logement). Calculé seulement si l'effectif est connu pour au moins la moitié des établissements de l'immeuble. Limites : tranches d'effectif larges, effectifs déclarés au siège mais travaillant ailleurs, prestataires non comptés, télétravail, surface elle-même estimée. À lire comme un ordre de grandeur.
- **Suspicion de vacance des bureaux (note sur 5).** Concerne les immeubles tertiaires (Apur ou CSTB) sans logement ni équipement, de 3 niveaux et plus, ainsi que les immeubles mixtes à dominante de bureaux (au moins 40 % de la surface une fois retirés 65 m² par logement, fiabilité abaissée d'un point), hors lieux culturels, lieux de culte, hôtels, propriétaires publics (y compris établissements publics industriels et commerciaux), monuments historiques, gares ferroviaires et bâtiments de plus de 12 000 m² d'emprise (grands équipements). Note 5 : neuf ou restructuré récemment (construit depuis 2018, réhabilité depuis 2021 ou permis depuis 2020) sans établissement actif ; si la livraison date de moins d'un an, fiabilité 2 car Sirene enregistre les emménagements avec plusieurs mois de retard. Note 4 : aucun établissement actif et des fermetures depuis 2024, ou occupation apparente inférieure à 25 %. Note 3 : aucun établissement déclaré, ou plus de la moitié des établissements fermés depuis 2024, ou occupation apparente de 25 à 50 %. Note 2 : départs notables. Notes 0 à 1 : occupation apparente. Plus de 100 établissements : adresse de domiciliation, non significatif. La fiabilité (sur 5) baisse quand l'information est indirecte (aucune trace d'occupant, petit nombre d'établissements) et monte quand l'effectif est bien connu. Indice de repérage, à vérifier sur place.
- **Propriétaire principal.** Parmi les personnes morales propriétaires des locaux de la ou des parcelles du bâtiment (DGFiP, situation au 1er janvier), celle qui détient le plus de locaux, en écartant le syndicat des copropriétaires s'il y a d'autres propriétaires. Les particuliers ne figurent pas dans ce fichier. Le type (public, bailleur social, société civile, société commerciale…) vient du groupe et de la forme juridique déclarés.
- **Distance à pied au métro et au RER.** Itinéraire piéton calculé par le service de l'IGN (Géoplateforme) depuis le centre du bâtiment jusqu'aux quatre stations de métro ou de RER les plus proches à vol d'oiseau (IDFM) ; on garde les trois plus courtes. Temps à 4,5 km/h. Si le service ne répond pas : distance à vol d'oiseau multipliée par 1,3, signalée comme estimation.
- **Projets Bouchaud Architectes.** Projets publiés sur bouchaudarchitectes.com, localisés à partir de leur titre ou de leur adresse (Base Adresse Nationale) ; les appartements sont placés sur la rue. Livré depuis plus de 3 ans, livré récemment ou en cours selon l'année de livraison indiquée.
- **Statistiques par quartier (mini-carte).** Chaque bâtiment est rattaché au quartier administratif (80 quartiers, Ville de Paris) qui contient son centre. La statistique est calculée sur les bâtiments du quartier : part de surface, part d'immeubles, médiane ou total selon le critère (le titre de la mini-carte le précise). Les couleurs vont du 5e au 95e centile des quartiers ; un quartier gris n'a pas assez de données (par exemple moins de 20 000 m² de bureaux pour la vacance). Elle n'est proposée que pour les critères où un agrégat par quartier a un sens.
- **Repères de marché (Immostat).** Immostat, le groupement des quatre grands conseils en immobilier d'entreprise, ne publie pas ses données en open data. Les chiffres affichés sous la mini-carte de la vacance sont ceux que les conseils publient dans leurs communiqués trimestriels, recopiés à la main avec leur source et leur date. Ils portent sur l'offre commercialisée en surface utile, ce qui diffère de notre estimation (bureaux sans occupant, en surface de plancher).
- **Coupe.** Ligne A-B tracée sur la carte. Terrain : profil altimétrique RGE ALTI de l'IGN le long de la ligne, converti en NVP (NGF − 0,33 m) ; à défaut, interpolation des points de nivellement et des courbes de niveau. Bâtiments : intersections avec les emprises Apur, hauteur médiane (plein) et maximale (pointillé), posés au point bas du terrain. Arbres : jeu « Les arbres » de la Ville de Paris lu en direct à moins de 20 m de la ligne (hauteur relevée, ou 3 m + 0,08 × circonférence en cm ; diamètre du tronc déduit de la circonférence ; port schématique selon le genre : fastigié, conique, parasol, pleureur, étalé ou ovoïde) ; arbres privés déduits de la canopée Apur 2021 (16 m ou 7 m). Voies : intervalles de la ligne hors des parcelles cadastrales ; largeur mesurée perpendiculairement aux limites (longueur coupée × sinus de l'angle entre la coupe et la limite, moyenne des deux rives). Surface de nivellement d'îlot estimée : cote du trottoir prise sur le terrain IGN à chaque limite de voie, interpolée entre les deux rives de l'îlot et arrondie au mètre NGF supérieur (le PLU utilise tout le périmètre de l'îlot). Gabarits-enveloppes du PLU bioclimatique (UG.3.2.4) attachés sur cette surface : voie sans filet, H = 1,25 × P (28 m au plus) puis quart de cercle r = 0,25 × P (3 à 7 m) ; filet de couleur, H selon la couleur (kaki 7 m à bleu marine 25 m, marron = façade existante) et couronnement selon le trait ; sur 18 m de profondeur, longueurs divisées par le sinus de l'angle de coupe. Plafond des hauteurs (18 à 37 m) au-dessus de la surface de nivellement, 15 m au-delà de la bande de 18 m, hauteur maximale constructible (NGF). Pas de gabarit en zones UV, N et PSMV. Points et courbes de niveau à moins de 20 m projetés. Échelle verticale égale à l'échelle horizontale. Export SVG et DXF par calques (X : distance depuis A, Y : altitude NVP). Estimation sans valeur réglementaire. Nuage de points LiDAR HD de l'IGN : dalles trouvées par le catalogue de la Géoplateforme, seuls les blocs du format COPC qui recoupent la bande de 20 m de part et d'autre de la ligne sont téléchargés (requêtes partielles) et décompressés dans le navigateur ; points classés (sol, végétation, bâtiment, eau, pont, sursol) projetés sur la coupe, altitudes IGN69 converties en NVP, points virtuels et artefacts écartés. Au-delà de 1,5 million de points, le niveau de détail est réduit. Plan de repérage sous la coupe, à la même échelle horizontale : la ligne A-B est ramenée à l'horizontale par rotation et une flèche indique le nord ; parcelles, bâtiments (coupés en foncé), arbres publics et noms de rues.

## Mise à jour automatique

Le robot GitHub Actions (`.github/workflows/maj.yml`) recalcule le site et le publie sur la branche `gh-pages`, que GitHub Pages sert.

- **Chaque lundi** : autorisations d'urbanisme, dossiers récents et Commission du Vieux Paris (Ville de Paris), adresses (BAN), projets de l'agence, accès pour les IA. Sirene chaque mois, propriétaires tous les 90 jours.
- **Chaque trimestre** (3 janvier, avril, juillet, octobre) : reconstruction complète.
- **À la demande** : onglet *Actions* > *Mise à jour des données* > *Run workflow*, puis choisir `weekly` ou `full`.

Si une source est indisponible ou renvoie un résultat anormal, le calcul s'arrête avant publication : le site reste dans son état précédent.

## Journal des modifications

Les changements visibles pour les utilisateurs de la carte et de l'API sont consignés dans [CHANGELOG.md](CHANGELOG.md).

## Contenu du dépôt

- `pipeline/` : les scripts (un module par famille de données, `run.py` pour l'enchaînement).
- `static/` : éléments figés (page `template.html`, atlas historique calé, relief, fonds).
- `api-worker/` : l'API (Cloudflare Worker).

## Droits

Bibliothèques tierces publiées avec le site : [copc.js](https://github.com/connormanning/copc.js) (licence MIT) et [laz-perf](https://github.com/hobuinc/laz-perf) (licence Apache 2.0), pour lire le LiDAR HD dans l'outil Coupe.

© 2026 Bouchaud Architectes. Tous droits réservés sur le code, la conception et la mise en forme de Paris-graphie. Les données restent la propriété de leurs producteurs et sont réutilisées selon leurs licences respectives. Pour toute demande de réutilisation : h.bokobza@bouchaudarchitectes.com
