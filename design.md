# Better Call AI — Design System
### Votre consultant juridique, propulsé par l'IA.

Système de design pour une plateforme de consultation juridique algérienne assistée par IA (6 000+ textes de loi, jurisprudence, JORA). Structure : landing page → application (sidebar + conversation) → pricing → onboarding.

---

## 00 — Positionnement & différenciation

Le but n'est pas de reproduire Claude (crème/corail éditorial) ni ChatGPT (blanc/vert plat, très minimal) ni Gemini (bleu dégradé, très "Google"). **Better Call AI** doit évoquer un **cabinet d'avocat haut de gamme rencontrant un laboratoire d'IA** : bois sombre / acajou, laiton doré, argent, cuir — pas une app "startup" pastel.

| | Ambiance | Palette | Sensation |
|---|---|---|---|
| Claude | Éditorial, chaleureux | Crème + corail | Amical, journal |
| ChatGPT | Neutre, utilitaire | Blanc/gris + vert | Outil sobre |
| Gemini | Tech, coloré | Bleu/dégradé multicolore | Produit Google |
| **Better Call AI** | **Cabinet + laboratoire** | **Marron sombre + beige + or + argent** | **Sérieux, précis, précieux** |

Deux familles d'actifs visuels distinctes :
- **Actifs marketing** : l'emblème 3D doré très détaillé (celui de vos références), utilisé en grand sur la landing page, cartes de visite, mug — reste tel quel, il a de l'impact.
- **Actifs produit (UI)** : une version **aplatie, à deux tons (or + trait)** du même emblème, pour favicon, avatar, icône de sidebar — la version 3D texturée est illisible à 24px.

---

## 01 — Palette de couleurs

### Mode sombre (par défaut)
| Token | Valeur | Usage |
|---|---|---|
| `bg-canvas-dark` | `#1B1210` | Fond général — marron acajou très sombre, pas un noir pur |
| `bg-surface-dark` | `#241A16` | Sidebar, panneaux |
| `bg-surface-dark-elevated` | `#2E211C` | Cartes, modales, bulle IA au survol |
| `hairline-dark` | `#3D2C24` | Bordures 1px sur fond sombre |
| `text-ink-dark` | `#F1E6D8` | Titres, texte principal |
| `text-body-dark` | `#C9B8A8` | Corps de texte |
| `text-muted-dark` | `#8C7A6A` | Légendes, métadonnées, timestamps |

### Mode clair
| Token | Valeur | Usage |
|---|---|---|
| `bg-canvas-light` | `#F4ECDD` | Fond général — beige clair chaud |
| `bg-surface-light` | `#EDE1CC` | Cartes, sidebar en mode clair |
| `bg-surface-light-elevated` | `#FFFDF8` | Modales, popovers |
| `hairline-light` | `#DED0B8` | Bordures 1px sur fond clair |
| `text-ink-light` | `#2B1D14` | Titres, texte principal |
| `text-body-light` | `#4A362A` | Corps de texte |
| `text-muted-light` | `#7A6A58` | Légendes, métadonnées |

### Accents de marque (identiques sur les deux modes)
| Token | Valeur | Usage |
|---|---|---|
| `gold-primary` | `#C9A24B` | CTA primaires, liens actifs, icônes de marque |
| `gold-bright` | `#E8C878` | Hover, texte doré sur fond sombre (contraste AA) |
| `gold-deep` | `#9C7A32` | État pressé |
| `silver-primary` | `#C7C9CC` | CTA secondaires, script "Call AI", éléments neutres premium |
| `silver-soft` | `#9A9C9F` | Icônes secondaires, séparateurs décoratifs |
| `success-jade` | `#5E9E82` | Statut "dossier résolu", validations |
| `alert-clay` | `#B5573C` | Erreurs, alertes (jamais utilisé pour un CTA) |

> Règle de contraste : sur `bg-canvas-dark`, ne jamais utiliser `gold-deep` pour du texte — toujours `gold-bright`. `gold-deep` est réservé aux états pressés de boutons pleins, jamais au texte.

---

## 02 — Typographie

Aucune police reprise de Claude (Copernicus/Garamond) ou ChatGPT (Söhne). Identité propre : gravité juridique + précision technique.

| Rôle | Police | Pourquoi |
|---|---|---|
| Display / titres | **Fraunces** (serif, graisse 400–600) | Serif contemporaine, caractère éditorial mais moins "littéraire" que Garamond — convient à un cabinet |
| Interface / corps | **General Sans** (400–600) | Grotesque géométrique neutre, très lisible en petit corps, différent d'Inter/StyreneB |
| Citations / réf. légales | **IBM Plex Mono** | Pour "Art. 124, Code Civil", numéros de dossier, JORA n° — donne un côté "acte officiel" |
| Arabe (mode bilingue) | **El Messiri** (display) + **Noto Kufi Arabic** (corps) | Support natif FR/AR, cohérent visuellement avec Fraunces/General Sans |

| Style | Taille / graisse / interligne |
|---|---|
| `display-xl` | 60px / 500 / 1.08 — Hero landing |
| `display-lg` | 44px / 500 / 1.12 — Titres de section |
| `display-md` | 32px / 500 / 1.15 — Titres de carte, pricing |
| `title-lg` | 20px / 600 / 1.3 — Titre de dossier/chat |
| `title-md` | 17px / 600 / 1.4 — Éléments de sidebar |
| `body-md` | 15.5px / 400 / 1.6 — Corps de conversation |
| `body-sm` | 13.5px / 400 / 1.5 — Métadonnées |
| `mono-citation` | 13px / 500 / 1.5 — Références légales |
| `caption-uppercase` | 11px / 600 / 1.4px — Étiquettes de domaine (CIVIL, PÉNAL...) |

---

## 03 — Emblème & icône de marque

- **Version marketing** : l'emblème doré 3D (balance + cerveau-circuit + marteau + puce "AI") — utilisé uniquement sur landing page, supports imprimés, écran de démarrage. Fond toujours sombre pour faire ressortir l'or.
- **Version produit** (à créer, réduction vectorielle) : silhouette à deux tons — trait `gold-primary` sur fond transparent, cerveau simplifié en 4-5 courbes, balance en traits fins. Utilisée pour : favicon, avatar de l'IA dans le chat (24–32px), icône de sidebar repliée, spinner de chargement court.
- **Wordmark produit** : "Better" en `General Sans` semi-bold + "Call AI" en script réservé au marketing uniquement — dans l'app, utiliser une version non-script du wordmark (General Sans, tracking large) pour la lisibilité en 14–16px dans la sidebar.

Iconographie UI : set cohérent type **Phosphor Icons**, poids "duotone", trait `silver-soft` + remplissage `gold-primary` sur les icônes actives. Pas d'emoji dans l'interface produit (réservé, si besoin, à la landing page uniquement) — le ton reste sobre.

---

## 04 — Landing page (motion-first)

Objectif : présenter l'agent, installer la confiance, un seul CTA clair → redirige vers l'app.

**Structure des sections :**

1. **Hero** — fond `bg-canvas-dark`, motif de fines lignes de circuit doré qui dérivent lentement en arrière-plan (parallax léger). Emblème centré avec une "respiration" (pulsation de lueur douce, 4s loop) et un léger tangage du fléau de la balance (spring physics, amplitude ±3°). Titre `display-xl` : *"Votre consultant juridique, propulsé par l'IA."* Sous-titre en `body-md` `text-body-dark`. CTA principal doré *"Commencer une consultation →"* avec effet **magnétique** (suit le curseur dans un rayon de 40px) et un reflet lumineux qui balaie le bouton au survol. CTA secondaire fantôme *"Voir comment ça marche"*.
2. **Bande de couverture** — compteur animé qui s'incrémente à l'entrée dans le viewport : *"6 248 textes juridiques algériens indexés"*. En dessous, un bandeau-ticker qui défile en continu (Code Civil · Code Pénal · Code de Commerce · Code du Travail · Code de la Famille · Code de Procédure Civile · JORA...).
3. **Comment ça marche** — 3 étapes en frise horizontale, reliées par une ligne dorée en SVG qui **se dessine** au scroll (`stroke-dashoffset`).
4. **Pour qui** — 3 cartes (Avocats / Entreprises / Particuliers) avec léger tilt 3D au survol (suivi de la position du curseur, amplitude faible — élégant, pas gadget).
5. **Confidentialité** — bande sombre, rassure sur le fait que les dossiers restent privés et chiffrés.
6. **Témoignages** — carrousel en défilement automatique, pause au survol.
7. **Aperçu des tarifs** — 3 cartes condensées, lien vers la page pricing complète.
8. **CTA final** — bande pleine largeur en dégradé `bg-canvas-dark → gold-deep`, un seul bouton crème/beige.
9. **Footer** — sombre, liens légaux, réseaux, mentions.

**Principes de motion :**
- Easing : `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutExpo) partout — sensation précise, jamais "rebondissante" (le rebond casse le sérieux attendu d'un outil juridique).
- Durées : micro-interactions 150–250ms, transitions de section 400–600ms.
- Une seule exception ludique autorisée : l'animation d'assemblage de l'emblème en fin d'onboarding (voir §07) — un moment signature, volontairement rare.
- Respect de `prefers-reduced-motion` : toutes les animations de scroll basculent en simple fondu.

---

## 05 — Application principale (agent + conversation)

```
┌───────────────┬──────────────────────────────────────────────┐
│  [Emblème]    │  Titre du dossier ✎     [Mode ▾]   ⤓ ⇪ ⋯     │
│  Better Call  ├──────────────────────────────────────────────┤
│               │                                                │
│ + Nouveau     │        (zone de conversation)                 │
│   dossier     │                                                │
│ + Nouvelle    │   IA : réponse structurée…                    │
│   discussion  │        [Art. 124, Code Civil] [JORA n°45]     │
│               │                                                │
│ 🔎 Rechercher │                          Utilisateur : … ⬤    │
│               │                                                │
│ Dossiers      │                                                │
│  actifs       │                                                │
│  · Litige X   ├──────────────────────────────────────────────┤
│  · Contrat Y  │  📎  [ Décrivez votre situation... ]      ➤   │
│               │  Better Call AI peut faire des erreurs.       │
│ Aujourd'hui   │  Vérifiez les informations importantes.       │
│  · …          │                                                │
│               │                                                │
│ ⚙ Paramètres  │                                                │
│ ↑ Passer Pro  │                                                │
│ 👤 John D.    │                                                │
└───────────────┴──────────────────────────────────────────────┘
```

### Sidebar gauche (264px, repliable à 72px en icônes seules)
- Logo compact en haut (emblème produit + wordmark, se réduit au monogramme seul si repliée)
- **`+ Nouveau dossier`** — bouton plein `gold-primary` : crée un espace de travail structuré (pièces jointes, historique, statut) pour un cas juridique suivi dans le temps
- **`+ Nouvelle discussion`** — bouton fantôme : question rapide, sans structure de dossier
- Barre de recherche des discussions/dossiers
- Liste groupée : *Dossiers actifs* → *Aujourd'hui* → *7 derniers jours* → *Plus ancien*, chaque item avec une étiquette de domaine (`CIVIL`, `PÉNAL`, `COMMERCIAL`, `TRAVAIL`, `FAMILLE`) en `caption-uppercase`, pastille contour or
- Pied de sidebar : Paramètres, pastille **"Passer à Pro"** (dégradé doré, léger effet de brillance en boucle lente pour attirer l'œil sans être criard), avatar utilisateur + badge de plan

### Barre supérieure de la zone de conversation
- Titre du dossier, éditable inline
- **Sélecteur de mode** (équivalent du "model picker") — menu déroulant en pilule, 3 options avec icône distincte :
  - ⚡ **Standard** — réponses rapides, questions générales
  - 🔍 **Recherche Approfondie** — fouille les 6 000 textes, plus lent, affiche les sources
  - ✎ **Rédaction** — génère/relit des actes, contrats, mises en demeure
- Icônes : partager, exporter (PDF/Word), archiver

### Zone de conversation
- Messages utilisateur : alignés à droite, bulle arrondie, fond `bg-surface-dark-elevated` (mode sombre) ou `bg-surface-light` (mode clair)
- Messages IA : alignés à gauche, **pas de bulle** (pleine largeur, comme une page de recherche), titres internes en `Fraunces` quand la réponse est structurée, corps en `General Sans`
- Citations en fin de réponse : petites puces `mono-citation` (ex. *Art. 124, Code Civil algérien* · *JORA n°45, 2019*) — cliquables, ouvrent un tiroir latéral avec l'extrait exact et le lien vers le texte source
- Indicateur "en cours de réflexion" → voir §06 (remplace les trois petits points génériques)

### Barre de saisie
- Textarea multi-ligne auto-expansive, placeholder *"Décrivez votre situation juridique…"*
- Icône trombone à gauche : joindre un contrat, PDF, ou **image d'un document scanné** (OCR automatique FR/AR)
- Vignettes des fichiers joints au-dessus du champ, avec suppression rapide
- Bouton d'envoi circulaire doré à droite, grisé tant que le champ est vide
- Micro-disclaimer sous le champ, en `text-muted`, discret

---

## 06 — Animation de chargement : "La Bibliothèque Défilante"

L'élément signature demandé : une rangée de codes juridiques qui défile horizontalement, utilisée à deux endroits.

**Écran de démarrage (plein écran)**
Emblème centré avec pulsation douce de lueur dorée. En dessous, une rangée de dos de livres stylisés, dorés à chaud sur tranche marron (*Code Civil · Code Pénal · Code de Commerce · Code du Travail · Code de la Famille · Code de Procédure · JORA*), qui défile en boucle continue de droite à gauche (~40s par cycle), avec un léger parallax (rangée avant plus rapide que l'arrière-plan) — évoque "toute la bibliothèque juridique consultée en un instant".

**Indicateur "en train de répondre" (inline, dans la conversation)**
Version compacte (≈320×36px), même défilement de dos de livres mais plus rapide (~8s), accompagnée d'un message qui change toutes les 2,5s avec fondu :
- *"Consultation du Code Civil…"*
- *"Analyse de la jurisprudence…"*
- *"Vérification du JORA…"*
- *"Rédaction de la réponse…"*

**Micro-indicateur (attentes < 2s, ex. renommer un chat)**
Juste le fléau de la balance de l'emblème qui bascule doucement de gauche à droite (spring physics), sans la bibliothèque — réservé aux actions très courtes.

---

## 07 — Questionnaire d'onboarding

Style "une question par écran", inspiré de la clarté de Claude mais avec l'identité de la marque.

- Barre de progression fine dorée en haut (se remplit à chaque étape)
- Une question par carte plein écran, gros boutons tactiles avec icône + libellé (pas de petits boutons radio)
- Lien *"Passer"* en haut à droite, bouton *"Continuer"* doré en bas
- Flèche retour en haut à gauche

**Questions suggérées :**
1. *Vous êtes ?* — Avocat / Notaire / Entreprise / Particulier
2. *Domaine principal ?* — Civil / Pénal / Commercial / Travail / Famille / Autre
3. *Langue préférée ?* — Français / العربية / Les deux
4. *Wilaya* (optionnel) — champ de recherche
5. *Que cherchez-vous aujourd'hui ?* — Poser une question / Rédiger un document / Analyser un contrat / Rechercher une jurisprudence

**Transition finale (moment signature)** : à la dernière étape, l'emblème se **recompose à partir de particules dorées éparses** qui convergent vers la forme complète — seule animation "spectaculaire" du système, volontairement rare pour garder son impact.

---

## 08 — Page tarifs (style Claude, identité propre)

Bascule **Mensuel / Annuel** (annuel affiche un badge *"-20%"*).

| Plan | Prix | Pour | Points clés |
|---|---|---|---|
| **Découverte** | 0 DA | Essayer | Questions limitées/jour, mode Standard, pas d'historique long terme |
| **Professionnel** | ~1 900 DA/mois | Avocats indépendants, particuliers exigeants | Usage étendu, mode Recherche Approfondie, export PDF/Word, dossiers illimités |
| **Cabinet** | ~3 900 DA/utilisateur | Cabinets, PME | Sièges multiples, facturation centralisée, dossiers partagés en équipe, réponses prioritaires |
| **Entreprise** | Sur devis | Grands comptes, institutions | SSO, hébergement dédié, SLA, intégration API |

- Cartes avec coche dorée pour chaque fonctionnalité, bouton fantôme si plan courant, bouton plein doré sinon
- Tableau comparatif dépliable sous les cartes ("Comparer tous les plans")

---

## 09 — Zones d'upload d'images/documents

- **Composer** : icône trombone → sélecteur fichier + glisser-déposer direct dans la zone de saisie
- **Modale "Nouveau dossier"** : grande zone en pointillés dorés sur fond `bg-surface`, *"Glissez vos documents ici ou cliquez pour parcourir"*, formats PDF/JPG/PNG/DOCX, badge *"OCR"* si un scan est détecté
- **Panneau "Pièces jointes"** dans la sidebar du dossier : liste des fichiers avec vignette, nom, date d'ajout, suppression

---

## 10 — Échelles

**Espacement** — `xxs 4` · `xs 8` · `sm 12` · `md 16` · `lg 24` · `xl 32` · `xxl 48` · `section 96`

**Rayons** — `xs 4` · `sm 8` · `md 12` (boutons, champs) · `lg 16` (cartes) · `xl 24` (modales) · `full` (avatars, pastilles)

**Élévation** — contraste de couleur d'abord (`canvas` vs `surface` vs `surface-elevated`), ombre portée réservée aux modales/popovers uniquement : `0 12px 32px rgba(0,0,0,0.35)` en mode sombre, `rgba(43,29,20,0.12)` en mode clair.

---

## 11 — Accessibilité & bilinguisme

- Toujours utiliser `gold-bright` (pas `gold-primary`) pour du texte doré sur fond sombre afin de respecter le contraste AA
- Mode Arabe : mise en page miroir (RTL) — sidebar bascule à droite, alignement des bulles inversé, chiffres au choix (occidentaux ou indo-arabes)
- Anneau de focus : `3px gold-primary à 20% d'opacité` sur tous les éléments interactifs
- `prefers-reduced-motion` : désactive parallax, tilt 3D, ticker infini → remplacés par des états statiques ou fondus simples

---

## 12 — Comportement responsive

| Nom | Largeur | Changements clés |
|---|---|---|
| Mobile | < 768px | Sidebar devient un tiroir plein écran (swipe ou bouton menu) ; hero `display-xl` 60→32px ; bibliothèque défilante réduite à une seule rangée |
| Tablette | 768–1024px | Sidebar repliable en rail d'icônes par défaut ; cartes "Pour qui" en 2 colonnes |
| Desktop | 1024–1440px | Sidebar fixe 264px ; layout complet |
| Wide | > 1440px | Contenu de conversation plafonné à 760px de large pour la lisibilité, marges latérales additionnelles |

---

*Ce document définit l'identité visuelle et les composants de Better Call AI — distincte de Claude, ChatGPT et Gemini par sa palette (marron/or/argent vs crème/blanc/bleu), sa typographie (Fraunces/General Sans), et son motif signature de bibliothèque juridique défilante.*
