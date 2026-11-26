# Journal des modifications

Les changements de Paris-graphie visibles par un utilisateur de la carte ou de l'API : calques, indicateurs, points d'accès, sources, corrections. Une entrée par jour de mise en ligne, la plus récente en premier.

Les mises à jour automatiques des données (chaque semaine, mois ou trimestre) ne figurent pas ici. La date d'extraction de chaque source est publiée sur [`/sources`](https://paris-graphie-api.hub-bokobza.workers.dev/sources).

Pour signaler une anomalie : h.bokobza@bouchaudarchitectes.com

## 2026-11-26

### Ajouté
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
