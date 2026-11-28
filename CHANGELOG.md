# Journal des modifications

Les changements de Paris-graphie visibles par un utilisateur de la carte ou de l'API : calques, indicateurs, points d'accès, sources, corrections. Une entrée par jour de mise en ligne, la plus récente en premier.

Les mises à jour automatiques des données (chaque semaine, mois ou trimestre) ne figurent pas ici. La date d'extraction de chaque source est publiée sur [`/sources`](https://paris-graphie-api.hub-bokobza.workers.dev/sources).

Pour signaler une anomalie : h.bokobza@bouchaudarchitectes.com

## 2026-11-27

### Modifié
- Adresse propre : https://paris-graphie.bouchaudarchitectes.com/ (l'ancienne adresse github.io redirige vers elle).
- Logo de Bouchaud Architectes (vectoriel, d'après le fichier de l'agence) à la place de la mention en texte, sur l'écran d'accueil (en blanc) et en tête du panneau (couleurs de l'agence) ; un clic ouvre bouchaudarchitectes.com dans un nouvel onglet.
- Coupe, plan de repérage : poignées A et B déplaçables dans toutes les directions (Maj : dans l'axe) et trait de coupe déplaçable en bloc ; la coupe, le LiDAR et les données sont recalculés au relâcher.
- Fenêtre de coupe : un clic en dehors la ferme.
- Coupe, profil du bâti LiDAR : les débords (balcons, auvents) en bout de profil sont tracés comme une dalle fine de 25 cm au lieu d'être hachurés jusqu'au sol.
- Coupe, profil du bâti LiDAR : quand des points sont relevés sous le niveau du terrain (cour anglaise, niveau bas ouvert), une polyligne en tireté prolonge le profil sous le sol (méthode dans « Comment chaque élément est calculé »).
- Recherche d'adresse plus tolérante : adresse collée en entier (virgules, code postal, « Paris », arrondissement), abréviations (bd, av, fg, st…), type de voie ou petits mots erronés, une faute de frappe par mot.
- Tutoriel sur téléphone : chaque étape joue d'abord son animation, carte dégagée, puis la fenêtre de l'étape apparaît ; « Passer le tutoriel » en haut à droite, visible pendant l'animation.
- L'écran d'accueil s'affiche dès l'ouverture de la page et la carte se charge derrière (la barre de progression n'apparaît que si l'on clique sur un lien avant que la carte soit prête) ; une adresse tapée ou un lien choisi pendant le chargement est repris dès que la carte est prête.
- Tutoriel sur téléphone : aux étapes plan et coupe, le panneau des calques s'efface et la fenêtre du tutoriel passe en haut, pour laisser voir le rectangle et le trait de coupe.
- Aperçus du tutoriel (fiche, plan, coupe) refaits avec le nouveau design ; script tests/apercus.py pour les régénérer.
- Aides réduites à une ligne, le détail derrière un « ? » : tracé de coupe, export de plan, mesure sur la carte ; dans la fenêtre de coupe, bouton « ? » vers « Comment chaque élément est calculé », replié par défaut sur téléphone et tablette.
- Coupe : boutons zoom + et − retirés (zoom au pincement à deux doigts, ou Ctrl + molette) ; « revenir à toute la coupe » n'apparaît qu'une fois zoomé ; le dessin défile de nouveau dans les deux sens au doigt.
- Nouveau design publié par défaut (l'ancien reste accessible par `?essai=0` le temps de la transition) : accueil avec un seul champ d'adresse, charte de l'agence, typographie plus grande.
- Tutoriel : proposé sur l'accueil (« Découvrir l'outil en 4 étapes ») et lancé à la première visite quand on choisit d'explorer la carte (pas quand on cherche une adresse).
- Mini-cartes des quartiers dans le panneau : mêmes couleurs que le calque lié.
- Trottoirs et terre-pleins : sans contour, une zone à peine plus claire que le fond.
- Coupe à l'écran sur fond sombre, comme la carte (les exports PDF et DXF restent sur fond blanc) ; nuage LiDAR aux couleurs de la charte (ocre pour le sol, verts sourds, gris-bleus pour le bâti, bleu pour l'eau) ; règles des gabarits masquées par défaut une première fois, puis selon le choix de chacun ; le bandeau des règles rend sa place quand elles sont masquées.
- Coupe : barre d'outils toujours visible au-dessus du dessin (mesurer, effacer, zoom arrière, zoom avant, tout voir, DXF, PDF), au lieu du volet des calques.
- Code de la page découpé en fichiers par domaine (`static/page.html`, `static/src/style.css`, `static/src/01-socle.js` à `18-tutoriel.js`), assemblés à la publication ; comportement inchangé.
- Base graphique : variables pour les couleurs d'interface, cinq tailles de texte (les plus petites relevées à 11,5 px) et des niveaux de superposition nommés ; focus clavier visible ; animations coupées si le système le demande.
- Panneau : texte d'accueil raccourci, champs de recherche homogènes, rubrique des projets Bouchaud repliée au démarrage, source des couches placée sous leur libellé, pied réduit à une ligne (sources et méthodes s'ouvrent dans la liste).
- Barre d'outils de la carte : deux groupes (outils : Plan, Coupe, Mesure, avec icône et libellé ; navigation : zoom, recadrage, plein écran), cibles agrandies sur téléphone (zoom au pincement).
- Fiche : les lignes sans valeur ne s'affichent plus dans la fenêtre (elles restent dans le PDF).
- Coupe : règles des gabarits rangées en bandeau au-dessus du dessin, sans chevauchement, reliées à leur gabarit par un trait de rappel ; bouton « Masquer le plan » qui rend aussi la place du plan de repérage.
- Performance : classes des critères calculées à la première utilisation (démarrage environ deux fois plus rapide, plus longue tâche ramenée de 0,85 à 0,3 s) ; noms de rues et numéros (1 Mo) chargés seulement au zoom ou avant un export.
- Chaîne de mise à jour réécrite autour d'un registre d'étapes (`pipeline/run.py`, `pipeline/engine.py`) : fréquence, sorties, dépendances et version déclarées pour chaque source ; reprise automatique des sorties du site précédent en cas d'échec d'une étape secondaire, y compris les rattachements par bâtiment quand la liste des bâtiments n'a pas changé ; les marques de recalcul unique deviennent des numéros de version.
- Méthodologie des indicateurs en source unique (`static/methodes.json`), injectée dans la page et recopiée dans le README (`python pipeline/methodes.py`).
- Version publique : un drapeau `PUB` dans la page remplace les suppressions de lignes à l'assemblage (DVF et noms Sirene exclus du site public).
- Calques rangés en deux familles : « L'ouvrage » (volume, énergie et carbone, âge, histoire, sous-sol, ensoleillement : ce qui est construit, dure et se mesure) puis « L'usage et le droit » (usages, propriété, autorisations, patrimoine, PLU, occupants : comment on occupe, possède et réglemente).
- La fiche et son PDF suivent le même ordre, avec les mêmes intertitres ; la rubrique « Usages, énergie et carbone » est scindée en « Énergie et carbone » et « Usages ».
- Téléphone : la fiche d'un bâtiment s'ouvre à mi-hauteur (glisser vers le haut pour l'agrandir, vers le bas pour la réduire puis la fermer), la carte reste visible.
- Coupe sur téléphone : en portrait, les calques passent derrière un bouton « Calques » et une invitation propose de tourner le téléphone ; en paysage, la coupe occupe tout l'écran et les calques s'ouvrent en volet.
- Tutoriel : bulle réduite au titre sur téléphone (« Voir plus » pour le texte et l'aperçu) ; le rectangle du plan et la ligne de coupe sont éclairés pendant la démonstration ; le curseur se recale sur les boutons qui se déplacent (volet, fiche).
- Tutoriel sur téléphone : le volet des calques s'ouvre et se ferme au bon moment (bouton du panneau), le dossier Âge se déplie avant le choix du calque, le zoom laisse voir l'immeuble et la coupe entre la bulle et le volet ; le curseur vise exactement les boutons et un point situé dans l'emprise de l'immeuble.
- La fiche d'un bâtiment trouvé par la recherche a pour titre l'adresse recherchée (et non la première adresse du bâtiment), y compris dans le PDF.

### Corrigé
- Coupe : le profil du bâti LiDAR (et ses débords et le sous-sol) ne se dégrade plus quand on augmente la profondeur visible ; il est lu sur les points proches du plan, rechargés à pleine résolution quand la profondeur réduit le niveau de détail.
- Dépôt : les anciens fichiers produits (page, données, notice) qui traînaient à la racine de la branche principale sont retirés ; le site publié vient uniquement de la branche gh-pages. C'est là que figuraient les balises de référencement, jamais publiées par l'assemblage actuel.
- Cache des données : la version ajoutée aux adresses des fichiers dépend maintenant de leur contenu, et non de l'heure d'assemblage ; une republication de la page seule ne force plus les visiteurs à retélécharger les 7 Mo de données.
- Mesure et tracé de coupe : avec Maj, la direction verrouillée est celle du segment tel qu'il était affiché avant l'appui (et non celle du premier déplacement suivant), pour qu'un segment vertical reste vertical.
- Coupe : un bâtiment contenant le point A ou B de la coupe est désormais dessiné.

### Ajouté
- Appel à l'action « Demandez une étude de faisabilité » vers la page réhabilitation du site de l'agence, dans la fiche d'un bâtiment et en bas de la première page de la fiche PDF (lien suivi par utm_source=paris-graphie).
- Domaine propre paris-graphie.bouchaudarchitectes.com : essayé puis retiré le jour même (la page Wix qui intègre la carte ne s'affichait plus pendant la bascule) ; à reprendre plus tard.
- Mesure d'audience sans cookie ni identifiant (Cloudflare Web Analytics), limitée aux chargements de page.
- Lien partageable : l'adresse de la page suit la fiche ouverte (`?b=longitude,latitude` de l'immeuble, stable d'une mise à jour à l'autre, et `&c=` pour le calque affiché) ; bouton « Partager » dans la fiche (copie du lien, ou partage du téléphone).
- Coupe : calque « Profil du bâti (LiDAR, hachuré) » : silhouette réelle des bâtiments coupés d'après les points « bâtiment » du LiDAR HD, hachurée jusqu'au terrain, à l'écran et dans le PDF.
- Fiche PDF : « Potentiel de surélévation (indicatif) » pour chaque coupe sur rue : faîtage relevé (LiDAR HD, à défaut hauteur maximale Apur) comparé à l'enveloppe du PLU au même endroit, marge en mètres et en niveaux de 3 m ; avertissement en tête si l'immeuble est protégé.
- Référencement : description, balises de partage (Open Graph, image dédiée), données structurées et lien canonique publiés avec la page ; contenu lisible sans JavaScript ; `robots.txt` et `sitemap.xml`.
- Coupe : zoom et déplacement du dessin (boutons, Ctrl + molette ou pincement du pavé tactile, pincement à deux doigts sur téléphone et tablette, glisser une fois zoomé) ; la mesure reste à un doigt pendant que deux doigts zooment.
- Essai de design pour les clients de l'agence, activé par `?essai=1` (retiré par `?essai=0`) : accueil dépouillé avec un seul champ d'adresse, signature de l'agence, titres en minuscules et plus grands, gammes de couleurs dérivées de la charte (ocre pour l'ancien, bleus pour le récent ; hauteurs du sombre au clair), méthodes de calcul derrière un « i » dans la fiche, règles des gabarits masquées par défaut dans la coupe. Le design par défaut est inchangé.
- Batterie de tests de bout en bout (`tests/batterie.py`, 39 contrôles sur ordinateur et téléphone) à lancer avant une grosse modification.
- Mode `site` du robot : republication de la page seule sur les données en ligne, lancé automatiquement à chaque modification de l'interface.
- Contrôle du site dans un navigateur sans écran avant chaque publication (ordinateur et téléphone) : en cas d'erreur, rien n'est publié.
- Coupe : calque « Eau » schématique (voies d'eau du plan de voirie de la Ville coupées par la ligne, niveau relevé sur le profil RGE ALTI, fond non représenté), dans la fenêtre, le PDF et le DXF (calque EAU).
- Coupe : calque « PPRI (zones inondables) », masqué par défaut : zones réglementaires du PPRI de Paris en bande colorée au pied de la coupe (calque DXF PPRI_ZONES). Les cotes PHEC ne sont pas publiées en données ouvertes et ne sont pas tracées.
- Coupe : les points A et B du plan de repérage se font glisser dans l'axe de la coupe pour l'allonger ou la raccourcir (15 m minimum) ; la coupe et le LiDAR sont recalculés au relâcher.
- Mesure et tracé de coupe : Maj maintenue verrouille la direction du segment en cours (arrondie à l'horizontale, la verticale ou 45° si elle en est proche), comme dans un logiciel de dessin. Sur la carte et dans la fenêtre de coupe.
- Bouton « Plan » à la place de « DXF » : il se déplie en DXF (géoréférencé, Lambert 93) et PDF ; on choisit le format avant de tracer le rectangle.
- Plan en PDF vectoriel A3, aux couleurs de la carte (calque thématique, calques superposés affichés, Seine, limites, noms de rues et numéros), avec échelle, nord, légende et sources. Non géoréférencé.
- Fenêtre de coupe : export PDF vectoriel A3 à la place du SVG, nuage LiDAR compris (un point vectoriel par point LiDAR, opacité selon la profondeur), calques et profondeur affichés.
- Fiche PDF : les coupes sur rue sont désormais vectorielles.
- Coupe : bâtiments en blanc cassé (contour gris) au lieu de blocs gris, pour laisser voir le nuage LiDAR.
- Tutoriel avec démonstration sur le 65 bis rue La Fayette (projet de Bouchaud Architectes) : défilement et choix du calque de l'âge du bâti, zoom et ouverture de la fiche avec aperçu du PDF, plan PDF tracé avec aperçu, coupe tracée avec aperçu (LiDAR compris). La vue, le calque et la fiche d'origine sont rétablis à la fin.
- Notice pour les IA (`llms.txt`), description de la page et données structurées (WebApplication) pour les moteurs de recherche et les assistants, avec la consigne de citer Paris-graphie, Bouchaud Architectes, et les sources.

## 2026-11-26

### Ajouté
- Mesure dans la coupe : accroche aussi aux points LiDAR affichés (cercle), en tenant compte de la profondeur visible.
- Magnétisme pour la mesure et le tracé de coupe : accroche aux sommets et aux arêtes des bâtiments, et aux directions horizontale, verticale, parallèle ou perpendiculaire à la façade voisine et au segment précédent (à 5° près). Dans la fenêtre de coupe : sommets et arêtes du bâti, du terrain, des gabarits, du plan de repérage, et mesures horizontales ou verticales.
- Outil Mesure dans la barre en bas à droite : distances cumulées sur la carte, surface quand le tracé est refermé sur le premier point.
- Mesure au doigt : boutons Terminer, Effacer et Fermer dans le bandeau de mesure de la carte, et bouton Effacer dans la fenêtre de coupe (équivalents de la touche Échap sur téléphone et tablette).
- Outil Coupe : la mesure se fait en glissant d'un point à l'autre ; pendant la mesure, le dessin ne défile plus au doigt (on fait défiler la fenêtre en dehors du dessin).
- Outil Coupe : bouton Mesurer (distance, écart horizontal et vertical, pente, altitudes NVP sur la coupe ; distances sur le plan de repérage).
- Tutoriel des premières visites en 4 étapes (adresse et calques, fiche PDF, export DXF, coupe), avec un bouton Passer ; relançable depuis le lien « Tutoriel » en pied de panneau.
- Outil Coupe : gabarits-enveloppes du PLU bioclimatique en bordure de voie, selon la couleur et le type de trait des filets (ou selon la largeur de voie en l'absence de filet), plafond des hauteurs, limite de 15 m au-delà de la bande de 18 m, hauteur maximale constructible et estimation de la surface de nivellement d'îlot.
- Outil Coupe : largeur des voies mesurée perpendiculairement aux limites de parcelles, et non dans le sens de la coupe.
- Outil Coupe : arbres publics de la Ville de Paris lus en direct, avec une silhouette schématique selon le genre (fastigié, conique, parasol, pleureur, étalé, ovoïde), la hauteur et la circonférence relevées.
- Outil Coupe : légende détaillant le mode de calcul de chaque élément, et calques DXF séparés (gabarits, plafond, nivellement, voies, troncs, houppiers, essences).
- Outil Coupe : nuage de points LiDAR HD de l'IGN à 20 m de part et d'autre de la coupe, lu par morceaux directement depuis la Géoplateforme (format COPC), coloré par classe (sol, végétation, bâtiment, eau, pont), opaque à moins de 25 cm du plan de coupe puis de plus en plus transparent (50 % à 25 cm, presque rien à 20 m) et exporté en points dans le DXF, un calque par classe.
- Fiche PDF d'un bâtiment : une coupe par façade sur rue, perpendiculaire à la façade, de l'immeuble d'en face jusqu'au fond de la parcelle, avec les calques et la profondeur choisis dans la fenêtre Coupe.
- Outil Coupe : curseur de profondeur visible derrière le plan de coupe, de 10 cm à 150 m, appliqué au LiDAR, aux arbres, aux cotes et aux courbes ainsi qu'aux exports SVG et DXF ; rien n'est plus montré devant le plan (sens de vue indiqué sur le plan de repérage et sur la carte).
- Outil Coupe : plan de repérage sous la coupe, à la même échelle, trait de coupe horizontal et flèche du nord (aussi dans le DXF), et indicateur de chargement du LiDAR.
- Outil Coupe : règle de calcul écrite au-dessus de chaque gabarit (hauteur, couronnement, point d'attache).
- Outil Coupe : calques activables dans la fenêtre (terrain, bâti, arbres, cotes, voies, nivellement, gabarits, règles, plafond, etc.), mémorisés d'une coupe à l'autre ; les exports SVG et DXF ne contiennent que les calques affichés.
- Analyse d'adresses : suggestions à la saisie, y compris pour les adresses introuvables (fautes de frappe), et toutes les colonnes avec leur source. Lien GitHub à côté de l'API.
- Taux d'occupation apparent des bureaux (effectifs Sirene rapportés à la surface), intégré à l'indice de vacance. Méthodes de calcul expliquées dans la carte, l'API et le README.
- Mini-carte des statistiques par quartier.

### Modifié
- Tablettes : en portrait (jusqu'à 1024 px), mise en page à volet comme sur téléphone ; en paysage et sur ordinateur, l'immeuble recherché est centré dans l'espace libre entre le panneau et la fiche, et les boutons de zoom et de plein écran se décalent pour ne plus être cachés par la fiche ; boutons plus grands au doigt ; fenêtre de coupe avec calques sur plusieurs colonnes en largeur réduite.
- Fenêtre de coupe : calques, profondeur, outils et exports regroupés dans une barre latérale à gauche, comme sur la carte.
- Outil de mesure : icône de règle sur la carte et dans la coupe.
- Tutoriel : l'étape PDF zoome sur un immeuble, ouvre sa fiche pour montrer le bouton, puis revient à la vue d'ensemble.
- Boutons « DXF » et « Coupe » : texte plus petit et centré, qui ne déborde plus de la case.
- Calque des filets de hauteur : couleurs et hauteurs réelles en légende (au lieu des codes), type de trait dans l'infobulle, filet bleu marine (25 m) distingué.
- Indice de suspicion de vacance des bureaux : exclusion des lieux culturels, des lieux de culte, des hôtels, des propriétaires publics, des établissements publics industriels et commerciaux, des très grandes emprises (Grand Palais), des monuments historiques et des gares ferroviaires. Prise en compte des immeubles mixtes à dominante de bureaux, du retard de Sirene sur les livraisons récentes et du rattachement Sirene au numéro voisin.
- L'indice de vacance est rangé dans la section « Usages » de la fiche, où il figurait en double.
- README : démarche du projet, et section pour les IA et les développeurs.

### Retiré
- Critère « Bureaux probables », qui doublonnait de façon trompeuse la typologie Apur. La déduction reste utilisée en interne par l'indice de vacance.

## 2026-11-25

### Ajouté
- API ouverte (points d'accès `/adresse`, `/adresses`, `/voie`, `/sources`) et serveur MCP pour assistants IA, avec sources, dates d'extraction et producteur de chaque indicateur.
- Accès statique pour les IA (dossier `api/` et notice `llms.txt`).
- Analyse d'une liste d'adresses, avec export Excel.
- Mode avancé.
- Interdiction de louer selon l'étiquette DPE (loi Climat et résilience).
- Distance à pied aux stations de métro et de RER (itinéraire IGN), dans la fiche, le PDF et l'export des adresses.
- Indice de suspicion de vacance des bureaux (mode avancé), comptages Sirene par bâtiment, repérage des transformations de bureaux en logements.
- Propriétaires personnes morales (DGFiP) : fiche, critère, export, accès pour les IA.
- Fourchette de surface de plancher, histogramme des classes d'un critère, délais d'obtention des autorisations d'urbanisme.
- Mentions Bouchaud Architectes, contact et lien vers la page de présentation (carte, PDF, notice pour les IA, API, README).

### Modifié
- Projets de Bouchaud Architectes : trois calques séparés (en cours, livrés récents, livrés anciens).
- Couleurs de la carte reprises de la charte Bouchaud.
- L'histogramme n'est proposé que pour les critères ordonnés.

### Retiré
- Calque « Femmes illustres à Paris ».

## 2026-11-24

### Ajouté
- Projets de Bouchaud Architectes, relevés chaque semaine sur le site de l'agence : à Paris puis en Île-de-France (dézoom élargi), dont la Tour Légende à La Défense. Au survol : nom du projet, image de couverture, pôles du projet. Teinte selon l'état (en cours, livré, livré ancien).

## 2026-11-20

### Ajouté
- Maîtres d'ouvrage (Sitadel), avec les particuliers masqués, et architecte d'origine (Commission du Vieux Paris).

### Modifié
- Bâtiments en plusieurs parties (Arc de triomphe, tour Eiffel, etc.) : contours séparés au lieu de cours intérieures.
- Les toitures sont rangées avec les matériaux, l'arrondissement avec l'urbanisme, et la rubrique « Autres » disparaît.
- OpenStreetMap et Basilic ne sont actualisés qu'au passage trimestriel.

## 2026-11-19

### Ajouté
- « C'était Paris en 1970 » : carroyage du concours, avec lien vers les photos de chaque carré sur paris1970.fr.
- Femmes illustres à Paris : lieux, parcours et notices dans la fiche.
- Hébergement touristique : hôtels classés, meublés autorisés, densité Airbnb.
- Transports en commun (IDFM) : lignes, stations, accès, bus, et desserte dans la fiche.
- Voies réelles du métro et stations fermées, d'après OpenStreetMap.
- Lieux culturels (Basilic) et lieux de culte (OpenStreetMap).
- Recherche de calques tolérante aux fautes et aux synonymes.

## 2026-11-18

### Ajouté
- Mise à jour automatique des données par un robot GitHub Actions.
- Îlots de chaleur (LCZ, Cerema), îlots de fraîcheur (Ville de Paris) et canopée (Apur, 2021).

### Corrigé
- Emprise bâtie : le contour extérieur des bâtiments est correctement repéré.
- Cadastre : fichier Etalab récupéré en un seul téléchargement, avec repli sur l'IGN, sans bloquer la mise à jour en cas d'échec.

## 2026-11-17

### Ajouté
- Première mise en ligne de la carte sur GitHub Pages.
