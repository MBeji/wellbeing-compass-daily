import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface WellnessEntry {
  id?: string;
  userId: string;
  date: string;
  data: Record<string, number[]>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSettings {
  id?: string;
  userId: string;
  coefficients: Record<string, number>;
  customQuestions: any[];
  customPillars: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class FirebaseWellnessService {
  private userId: string | null = null;

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Sauvegarder les données quotidiennes
  async saveWellnessData(date: string, data: Record<string, number[]>) {
    if (!this.userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'wellness-entries', `${this.userId}_${date}`);
    const now = Timestamp.now();

    const entry: WellnessEntry = {
      userId: this.userId,
      date,
      data,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, entry, { merge: true });
  }

  // Récupérer les données d'une date spécifique
  async getWellnessData(date: string): Promise<Record<string, number[]> | null> {
    if (!this.userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'wellness-entries', `${this.userId}_${date}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().data;
    }
    return null;
  }

  // Récupérer toutes les données utilisateur
  async getAllWellnessData(): Promise<Record<string, any>> {
    if (!this.userId) throw new Error('User not authenticated');

    return new Promise((resolve, reject) => {
      const q = query(
        collection(db, 'wellness-entries'),
        where('userId', '==', this.userId),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data: Record<string, any> = {};
        querySnapshot.forEach((doc) => {
          const entry = doc.data() as WellnessEntry;
          data[entry.date] = entry.data;
        });
        resolve(data);
      }, reject);

      // Retourner la fonction de désabonnement si nécessaire
      return unsubscribe;
    });
  }

  // Sauvegarder les paramètres utilisateur
  async saveUserSettings(coefficients: Record<string, number>, customQuestions: any[], customPillars: any[]) {
    if (!this.userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'user-settings', this.userId);
    const now = Timestamp.now();

    const settings: UserSettings = {
      userId: this.userId,
      coefficients,
      customQuestions,
      customPillars,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, settings, { merge: true });
  }

  // Récupérer les paramètres utilisateur
  async getUserSettings(): Promise<UserSettings | null> {
    if (!this.userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'user-settings', this.userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserSettings;
    }
    return null;
  }

  // Synchroniser avec localStorage (pour compatibilité)
  async syncWithLocalStorage() {
    try {
      // Migrer données localStorage vers Firebase
      const localData = localStorage.getItem('wellness-data');
      if (localData) {
        const parsed = JSON.parse(localData);
        for (const [date, data] of Object.entries(parsed)) {
          await this.saveWellnessData(date, data as Record<string, number[]>);
        }
      }

      // Migrer paramètres localStorage vers Firebase
      const localCoefficients = localStorage.getItem('pillar-coefficients');
      const localCustom = localStorage.getItem('custom-questions');
      
      if (localCoefficients || localCustom) {
        const coefficients = localCoefficients ? JSON.parse(localCoefficients) : {};
        const custom = localCustom ? JSON.parse(localCustom) : { customQuestions: [], customPillars: [] };
        
        await this.saveUserSettings(coefficients, custom.customQuestions, custom.customPillars);
      }

      console.log('✅ Synchronisation localStorage → Firebase terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }

  // Écouter les changements en temps réel
  subscribeToWellnessData(callback: (data: Record<string, any>) => void) {
    if (!this.userId) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'wellness-entries'),
      where('userId', '==', this.userId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const data: Record<string, any> = {};
      querySnapshot.forEach((doc) => {
        const entry = doc.data() as WellnessEntry;
        data[entry.date] = entry.data;
      });
      callback(data);
    });
  }

  // Écouter les changements des paramètres
  subscribeToUserSettings(callback: (settings: UserSettings | null) => void) {
    if (!this.userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'user-settings', this.userId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserSettings);
      } else {
        callback(null);
      }
    });
  }
}

// Instance singleton
export const firebaseWellnessService = new FirebaseWellnessService();

export default FirebaseWellnessService;
