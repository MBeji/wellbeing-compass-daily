# Documentation - Système de Coefficients par Question

## Vue d'ensemble

La page de personnalisation a été complètement restructurée pour permettre une gestion plus fine et plus puissante des coefficients d'importance. Au lieu d'ajuster l'importance au niveau des piliers, vous pouvez maintenant ajuster l'importance de chaque question individuellement.

## Nouvelles Fonctionnalités

### 🎯 Coefficients par Question
- **Granularité Fine** : Ajustez l'importance de chaque question individuellement (coefficient de 0.1x à 2.0x)
- **Impact Direct** : Chaque question a son propre poids dans le calcul du score global
- **Visibilité** : Interface claire montrant le coefficient actuel pour chaque question

### 📝 Gestion Avancée des Questions
- **Ajout de Questions** : Créez des questions personnalisées pour n'importe quel pilier
- **Modification** : Éditez vos questions existantes directement dans l'interface
- **Suppression** : Supprimez les questions qui ne vous conviennent plus
- **Organisation** : Questions regroupées par pilier pour une meilleure lisibilité

### 🏗️ Gestion des Piliers
- **Création de Piliers** : Ajoutez de nouveaux domaines de bien-être (ex: Créativité, Finances)
- **Émojis Personnalisés** : Associez un émoji à chaque pilier pour une identification visuelle
- **Suppression** : Supprimez les piliers personnalisés (et leurs questions associées)

## Interface Utilisateur

### Navigation par Onglets
1. **Coefficients** : Ajustez l'importance de chaque question avec des sliders visuels
2. **Questions** : Gérez vos questions personnalisées (ajout, modification, suppression)
3. **Piliers** : Créez et gérez vos piliers personnalisés

### Onglet Coefficients
- **Vue par Pilier** : Questions regroupées sous chaque pilier
- **Sliders Interactifs** : Ajustement en temps réel des coefficients (0.1x à 2.0x)
- **Indicateurs Visuels** : Affichage du coefficient actuel pour chaque question
- **Réinitialisation** : Bouton pour remettre tous les coefficients à 1.0

### Onglet Questions
- **Formulaire d'Ajout** : Sélection du pilier et saisie de la question
- **Liste Interactive** : Modification et suppression directes des questions
- **Édition en Place** : Modifiez le texte des questions sans dialogue séparé

### Onglet Piliers
- **Création Simple** : Nom + Émoji pour créer un nouveau pilier
- **Gestion Visuelle** : Liste des piliers personnalisés avec actions

## Avantages du Nouveau Système

### 🎯 Précision Accrue
- **Granularité** : Coefficients au niveau des questions plutôt que des piliers entiers
- **Flexibilité** : Certaines questions d'un pilier peuvent être plus importantes que d'autres
- **Personnalisation** : Adaptation parfaite à vos priorités personnelles

### 📊 Calcul Plus Intelligent
- **Score Global** : Calcul basé sur la moyenne pondérée de toutes les questions
- **Score par Pilier** : Prend en compte les coefficients individuels des questions
- **Indicateurs d'Importance** : Affichage de l'importance moyenne par pilier

### 🎨 Expérience Utilisateur Améliorée
- **Interface Intuitive** : Navigation claire avec onglets thématiques
- **Feedback Visuel** : Indicateurs d'importance et coefficients en temps réel
- **Gestion Complète** : Tout peut être personnalisé depuis une seule page

## Migration Automatique

Le système effectue automatiquement :
- **Compatibilité** : Les anciens coefficients par pilier sont conservés pour référence
- **Initialisation** : Tous les nouveaux coefficients commencent à 1.0
- **Sauvegarde** : Persistance automatique de tous les changements

## Exemples d'Utilisation

### Exemple 1: Focus sur le Sommeil Réparateur
```
Pilier Sommeil:
- "Qualité du sommeil" → coefficient 1.8x (très important)
- "Heures de sommeil" → coefficient 1.2x (important)
- "Horaires réguliers" → coefficient 1.5x (très important)
- "Environnement de sommeil" → coefficient 1.0x (normal)
```

### Exemple 2: Personnalisation Alimentation
```
Pilier Alimentation:
- "Équilibre nutritionnel" → coefficient 1.6x (priorité)
- "Hydratation" → coefficient 1.4x (important)
- "Plaisir alimentaire" → coefficient 0.8x (secondaire)
- "Régularité des repas" → coefficient 1.2x (important)
```

## Réinitialisation

À tout moment, vous pouvez :
- **Remettre les coefficients à 1.0** : Bouton dans l'onglet Coefficients
- **Réinitialisation complète** : Bouton en bas de page pour tout remettre par défaut
- **Suppression sélective** : Supprimer uniquement certaines questions ou piliers

## Compatibilité

- ✅ **Données Existantes** : Vos scores précédents sont conservés
- ✅ **Firebase** : Synchronisation cloud complètement compatible
- ✅ **Mode Hors-ligne** : Fonctionne parfaitement sans connexion
- ✅ **Multi-appareils** : Synchronisation de tous vos réglages

Cette nouvelle approche vous donne un contrôle total sur votre évaluation de bien-être, permettant une personnalisation qui reflète vraiment vos priorités et objectifs personnels ! 🎯✨
