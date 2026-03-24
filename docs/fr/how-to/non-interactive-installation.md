---
title: Installation non-interactive
description: Installer BMad en utilisant des options de ligne de commande pour les pipelines CI/CD et les déploiements automatisés
sidebar:
  order: 2
---

Utilisez les options de ligne de commande pour installer BMad de manière non-interactive. Cela est utile pour :

## Quand utiliser cette méthode

- Déploiements automatisés et pipelines CI/CD
- Installations scriptées
- Installations rapides avec des configurations connues

:::note[Prérequis]
Nécessite [Node.js](https://nodejs.org) v20+ et `npx` (inclus avec npm).
:::

## Options disponibles

| Option | Description |
|------|-------------|
| `--force` | Écraser l'installation existante |
| `--debug` | Activer la sortie de débogage pendant l'installation |

## Installation

BMad s'installe globalement dans `~/.claude/skills/bmad/` sans aucune invite :

```bash
bmad install
```

Ou avec des options :

```bash
bmad install --force --debug
```

Si vous n'avez pas installé le package globalement, utilisez npx :

```bash
npx bmad-method install --force
```

## Exemples

### Installation dans un pipeline CI/CD

```bash
#!/bin/bash
# install-bmad.sh

npm install -g bmad-method
bmad install --force
```

### Mettre à jour une installation existante

```bash
bmad install --force
```

## Ce que vous obtenez

- Un répertoire `~/.claude/skills/bmad/` entièrement configuré avec les agents, workflows et modules
- Un fichier `~/.claude/skills/bmad/manifest.yaml` pour suivre l'installation
- Un dossier `_bmad-output/` local au projet, créé automatiquement par les workflows lors de la génération des artefacts

## Désinstallation

Pour supprimer BMad entièrement :

```bash
bmad uninstall
```

Pour ignorer la confirmation :

```bash
bmad uninstall --force
```

Cela supprime entièrement `~/.claude/skills/bmad/`.

:::tip[Bonnes pratiques]
- Utilisez `--force` pour des installations vraiment sans surveillance
- Utilisez `--debug` si vous rencontrez des problèmes lors de l'installation
:::

## Résolution des problèmes

### L'installation échoue

- Assurez-vous d'avoir les permissions d'écriture sur `~/.claude/skills/bmad/`
- Exécutez avec `--debug` pour une sortie détaillée

:::note[Toujours bloqué ?]
Exécutez avec `--debug` pour une sortie détaillée, ou signalez-le à <https://github.com/bmad-code-org/BMAD-METHOD/issues>.
:::
