---
title: "Comment installer BMad"
description: Guide étape par étape pour installer BMad dans votre projet
sidebar:
  order: 1
---

Utilisez la commande `bmad install` pour configurer BMad globalement sur votre machine.

## Quand l'utiliser

- Configurer BMad pour la première fois
- Mettre à jour une installation BMad existante

:::note[Prérequis]
- **Node.js** 20+ (requis pour l'installateur)
- **Outil d'IA** (Claude Code, Cursor, ou similaire)
:::

## Étapes

### 1. Installer le package

```bash
npm install -g bmad-method
```

Ou exécuter directement sans installation globale :

```bash
npx bmad-method install
```

### 2. Lancer l'installateur

```bash
bmad install
```

L'installateur s'exécute sans aucune invite et installe tous les skills BMad globalement dans `~/.claude/skills/bmad/`.

Pour forcer une nouvelle installation (écrasement des fichiers existants) :

```bash
bmad install --force
```

Pour voir la sortie détaillée pendant l'installation :

```bash
bmad install --debug
```

## Ce que vous obtenez

```text
~/.claude/skills/bmad/
├── bmm/            # Module BMad Method
│   └── config.yaml # Paramètres du module
├── core/           # Module core requis
├── manifest.yaml   # Manifeste d'installation
└── ...

votre-projet/
└── _bmad-output/       # Artefacts générés (local au projet)
```

## Vérifier l'installation

Exécutez `bmad-help` pour vérifier que tout fonctionne et voir quoi faire ensuite.

**BMad-Help est votre guide intelligent** qui va :
- Confirmer que votre installation fonctionne
- Afficher ce qui est disponible en fonction de vos modules installés
- Recommander votre première étape

Vous pouvez aussi lui poser des questions :
```
bmad-help Je viens d'installer, que dois-je faire en premier ?
bmad-help Quelles sont mes options pour un projet SaaS ?
```

## Résolution de problèmes

**L'installateur affiche une erreur** — Copiez-collez la sortie dans votre assistant IA et laissez-le résoudre le problème.

**L'installateur a fonctionné mais quelque chose ne fonctionne pas plus tard** — Votre IA a besoin du contexte BMad pour vous aider. Consultez [Comment obtenir des réponses à propos de BMad](./get-answers-about-bmad.md) pour savoir comment diriger votre IA vers les bonnes sources.
