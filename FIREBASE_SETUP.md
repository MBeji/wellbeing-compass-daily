# Configuration Firebase pour Wellbeing Compass

## 🚀 Étapes de configuration

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Nom du projet: `wellbeing-compass`
4. Activez Google Analytics (optionnel)

### 2. Configurer Firestore Database

1. Dans votre projet Firebase, allez dans "Firestore Database"
2. Cliquez "Créer une base de données"
3. Choisissez "Commencer en mode test" (ou production selon vos besoins)
4. Sélectionnez une région proche de vous

### 3. Configurer l'authentification

1. Allez dans "Authentication"
2. Onglet "Sign-in method"
3. Activez:
   - **Anonyme** ✅ (recommandé pour commencer)
   - **Email/Password** ✅ (optionnel)

### 4. Obtenir la configuration

1. Allez dans "Paramètres du projet" (icône engrenage)
2. Descendez jusqu'à "Vos applications"
3. Cliquez sur l'icône Web `</>`
4. Nom de l'app: `wellbeing-compass-web`
5. Copiez la configuration `firebaseConfig`

### 5. Mettre à jour la configuration

Remplacez le contenu de `src/config/firebase.ts` avec vos vraies clés :

\`\`\`typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_ACTUAL_APP_ID"
};
\`\`\`

### 6. Configurer les règles de sécurité Firestore

Dans Firestore > Règles, utilisez ces règles :

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre aux utilisateurs authentifiés de lire/écrire leurs propres données
    match /wellness-entries/{userId}_{date} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    match /user-settings/{userId} {
      allow read, write: if request.auth != null && userId == request.auth.uid;
    }
  }
}
\`\`\`

### 7. Installer Firebase CLI (optionnel)

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase init hosting
\`\`\`

## 🔧 Fonctionnalités activées

### ✅ Synchronisation automatique
- Les données sont synchronisées en temps réel
- Fonctionne sur tous les appareils connectés au même compte

### ✅ Mode hors ligne
- L'application fonctionne même sans connexion
- Synchronisation automatique au retour en ligne

### ✅ Authentification flexible
- **Anonyme** : Aucune inscription requise
- **Email/Password** : Pour retrouver ses données sur d'autres appareils

### ✅ Sécurité
- Données chiffrées en transit
- Règles de sécurité Firestore
- Chaque utilisateur n'a accès qu'à ses propres données

## 📊 Structure des données

### Collection : `wellness-entries`
\`\`\`
Document ID: {userId}_{date}
{
  userId: string,
  date: "2025-06-25",
  data: {
    alimentation: [80, 90, 75],
    sport: [60],
    sommeil: [85]
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

### Collection : `user-settings`
\`\`\`
Document ID: {userId}
{
  userId: string,
  coefficients: {
    alimentation: 1.2,
    sport: 1.4
  },
  customQuestions: [...],
  customPillars: [...],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
\`\`\`

## 🎯 Utilisation

1. **Connexion anonyme** : Cliquez sur l'icône cloud en haut à droite
2. **Saisie des données** : Utilisez l'onglet "Journal du jour"
3. **Synchronisation** : Automatique en arrière-plan
4. **Multi-appareils** : Connectez-vous avec le même compte

## 🔍 Dépannage

### Si l'application ne se connecte pas :
1. Vérifiez que la configuration Firebase est correcte
2. Vérifiez que Firestore est activé
3. Vérifiez que l'authentification anonyme est activée

### Si les données ne se synchronisent pas :
1. Vérifiez les règles de sécurité Firestore
2. Regardez la console du navigateur pour les erreurs
3. Vérifiez que l'utilisateur est bien connecté

## 💰 Coûts

Firebase offre un niveau gratuit généreux :
- **Firestore** : 50,000 lectures/jour, 20,000 écritures/jour
- **Auth** : Illimité pour les utilisateurs anonymes
- **Hosting** : 10 GB de stockage, 360 MB/jour de transfert

Pour une application personnelle, c'est largement suffisant !
