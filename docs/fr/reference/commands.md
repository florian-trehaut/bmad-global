---
title: Skills
description: Référence des skills BMad — ce qu'ils sont, comment ils fonctionnent et où les trouver.
sidebar:
  order: 3
---

Les skills sont des prompts pré-construits qui chargent des agents, exécutent des workflows ou lancent des tâches dans votre IDE. L'installateur BMad les génère automatiquement à partir des modules intégrés (core + bmm) lors de l'installation dans `~/.claude/skills/bmad/`. Si vous mettez à jour BMad, relancez l'installateur pour garder les skills synchronisés (voir [Dépannage](#dépannage)).

## Skills vs. Déclencheurs du menu Agent

BMad offre deux façons de démarrer un travail, chacune ayant un usage différent.

| Mécanisme | Comment l'invoquer | Ce qui se passe |
| --- | --- | --- |
| **Skill** | Tapez le nom du skill (ex. `bmad-help`) dans votre IDE | Charge directement un agent, exécute un workflow ou lance une tâche |
| **Déclencheur du menu agent** | Chargez d'abord un agent, puis tapez un code court (ex. `DS`) | L'agent interprète le code et démarre le workflow correspondant tout en préservant son persona |

Les déclencheurs du menu agent nécessitent une session agent active. Utilisez les skills lorsque vous savez quel workflow vous voulez. Utilisez les déclencheurs lorsque vous travaillez déjà avec un agent et souhaitez changer de tâche sans quitter la conversation.

## Comment les skills sont générés

Lorsque vous exécutez `npx bmad-method install`, l'installateur lit les manifests des modules intégrés (core + bmm) et écrit un skill par agent, workflow, tâche et outil. Chaque skill est un répertoire contenant un fichier `SKILL.md` qui indique à l'IA de charger le fichier source correspondant et de suivre ses instructions.

L'installateur utilise des modèles pour chaque type de skill :

| Type de skill | Ce que fait le fichier généré |
| --- | --- |
| **Lanceur d'agent** | Charge le fichier de persona de l'agent, active son menu et reste en caractère |
| **Skill de workflow** | Charge la configuration du workflow et suit ses étapes |
| **Skill de tâche** | Charge un fichier de tâche autonome et suit ses instructions |
| **Skill d'outil** | Charge un fichier d'outil autonome et suit ses instructions |

:::note[Relancer l'installateur]
Si vous mettez à jour BMad, relancez l'installateur. Il régénère tous les fichiers de skill.
:::

## Emplacement des fichiers de skill

L'installateur écrit les fichiers de skill dans le répertoire global `~/.claude/skills/bmad/`.

Chaque skill est un répertoire contenant un fichier `SKILL.md`. Par exemple :

```text
~/.claude/skills/bmad/
├── bmad-help/
│   └── SKILL.md
├── bmad-create-prd/
│   └── SKILL.md
├── bmad-analyst/
│   └── SKILL.md
└── ...
```

Le nom du répertoire détermine le nom du skill dans votre IDE. Par exemple, le répertoire `bmad-analyst/` enregistre le skill `bmad-analyst`.

## Comment découvrir vos skills

Tapez le nom du skill dans votre IDE pour l'invoquer. Certaines plateformes nécessitent d'activer les skills dans les paramètres avant qu'ils n'apparaissent.

Exécutez `bmad-help` pour obtenir des conseils contextuels sur votre prochaine étape.

:::tip[Découverte rapide]
Les répertoires de skills générés dans votre projet sont la liste de référence. Ouvrez-les dans votre explorateur de fichiers pour voir chaque skill avec sa description.
:::

## Catégories de skills

### Skills d'agent

Les skills d'agent chargent une persona[^2] IA spécialisée avec un rôle défini, un style de communication et un menu de workflows. Une fois chargé, l'agent reste en caractère et répond aux déclencheurs du menu.

| Exemple de skill | Agent | Rôle |
| --- | --- | --- |
| `bmad-analyst` | Mary (Analyste) | Brainstorming de projets, recherche, création de briefs |
| `bmad-architect` | Winston (Architecte) | Conçoit l'architecture système |
| `bmad-ux-designer` | Sally (Designer UX) | Crée les designs UX |
| `bmad-tech-writer` | Paige (Rédacteur Technique) | Documente les projets, rédige des guides, génère des diagrammes |

Consultez [Agents](./agents.md) pour la liste complète des agents par défaut et leurs déclencheurs.

### Skills de workflow

Les skills de workflow exécutent un processus structuré en plusieurs étapes sans charger d'abord une persona d'agent. Ils chargent une configuration de workflow et suivent ses étapes.

| Exemple de skill | Objectif |
| --- | --- |
| `bmad-create-prd` | Créer un PRD[^1] |
| `bmad-create-architecture` | Concevoir l'architecture système |
| `bmad-create-epics-and-stories` | Créer des epics et des stories |
| `bmad-dev-story` | Implémenter une story |
| `bmad-code-review` | Effectuer une revue de code |
| `bmad-quick-dev` | Flux rapide unifié — clarifier l'intention, planifier, implémenter, réviser, présenter |

Consultez la [Carte des workflows](./workflow-map.md) pour la référence complète des workflows organisés par phase.

### Skills de tâche et d'outil

Les tâches et outils sont des opérations autonomes qui ne nécessitent pas de contexte d'agent ou de workflow.

**BMad-Help : Votre guide intelligent**

`bmad-help` est votre interface principale pour découvrir quoi faire ensuite. Il inspecte votre projet, comprend les requêtes en langage naturel et recommande la prochaine étape requise ou optionnelle en fonction de vos modules installés.

:::note[Exemple]
```
bmad-help
bmad-help J'ai une idée de SaaS et je connais toutes les fonctionnalités. Par où commencer ?
bmad-help Quelles sont mes options pour le design UX ?
```
:::

**Autres tâches et outils principaux**

Le module principal inclut 11 outils intégrés — revues, compression, brainstorming, gestion de documents, et plus. Consultez [Outils principaux](./core-tools.md) pour la référence complète.

## Convention de nommage

Tous les skills utilisent le préfixe `bmad-` suivi d'un nom descriptif (ex. `bmad-analyst`, `bmad-create-prd`, `bmad-help`). Consultez [Modules](./modules.md) pour les modules disponibles.

## Dépannage

**Les skills n'apparaissent pas après l'installation.** Certaines plateformes nécessitent d'activer explicitement les skills dans les paramètres. Consultez la documentation de votre IDE ou demandez à votre assistant IA comment activer les skills. Vous devrez peut-être aussi redémarrer votre IDE ou recharger la fenêtre.

**Des skills attendus sont manquants.** Exécutez à nouveau `npx bmad-method install` pour régénérer les skills. Vérifiez que les fichiers de skill existent dans `~/.claude/skills/bmad/`.

**Des skills obsolètes apparaissent encore.** Supprimez les répertoires obsolètes de `~/.claude/skills/bmad/`, ou supprimez tout le répertoire et relancez l'installateur pour obtenir un ensemble propre.

## Glossaire

[^1]: PRD (Product Requirements Document) : document de référence qui décrit les objectifs du produit, les besoins utilisateurs, les fonctionnalités attendues, les contraintes et les critères de succès, afin d’aligner les équipes sur ce qui doit être construit et pourquoi.
[^2]: Persona : dans le contexte de BMad, une persona désigne un agent IA avec un rôle défini, un style de communication et une expertise spécifiques (ex. Mary l'analyste, Winston l'architecte). Chaque persona garde son "caractère" pendant les interactions.
