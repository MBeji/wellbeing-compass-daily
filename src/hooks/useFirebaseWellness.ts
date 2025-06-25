import { useState, useEffect } from 'react';
import { firebaseWellnessService } from '@/services/firebaseWellnessService';
import { useAuth } from './useAuth';
import { getTodayKey } from '@/utils/wellnessUtils';

export const useFirebaseWellness = () => {
  const { user } = useAuth();
  const [wellnessData, setWellnessData] = useState<Record<string, any>>({});
  const [userSettings, setUserSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribeData: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;

    const setupSubscriptions = async () => {
      try {
        setLoading(true);

        // S'abonner aux données de bien-être
        unsubscribeData = firebaseWellnessService.subscribeToWellnessData((data) => {
          setWellnessData(data);
          setLoading(false);
        });

        // S'abonner aux paramètres utilisateur
        unsubscribeSettings = firebaseWellnessService.subscribeToUserSettings((settings) => {
          setUserSettings(settings);
        });

      } catch (error) {
        console.error('Erreur lors de la configuration des abonnements:', error);
        setLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeData) unsubscribeData();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [user]);
  const saveWellnessData = async (data: Record<string, number[]>) => {
    if (!user) {
      // Si pas d'utilisateur Firebase, utiliser seulement localStorage
      const existing = JSON.parse(localStorage.getItem('wellness-data') || '{}');
      const todayKey = getTodayKey();
      existing[todayKey] = data;
      localStorage.setItem('wellness-data', JSON.stringify(existing));
      return;
    }

    try {
      setSyncing(true);
      const todayKey = getTodayKey();
      await firebaseWellnessService.saveWellnessData(todayKey, data);
      
      // Aussi sauvegarder en localStorage pour la compatibilité offline
      const existing = JSON.parse(localStorage.getItem('wellness-data') || '{}');
      existing[todayKey] = data;
      localStorage.setItem('wellness-data', JSON.stringify(existing));
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde Firebase, utilisation de localStorage:', error);
      // Fallback sur localStorage en cas d'erreur Firebase
      const existing = JSON.parse(localStorage.getItem('wellness-data') || '{}');
      const todayKey = getTodayKey();
      existing[todayKey] = data;
      localStorage.setItem('wellness-data', JSON.stringify(existing));
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const saveUserSettings = async (coefficients: Record<string, number>, customQuestions: any[], customPillars: any[]) => {
    if (!user) return;

    try {
      setSyncing(true);
      await firebaseWellnessService.saveUserSettings(coefficients, customQuestions, customPillars);
      
      // Aussi sauvegarder en localStorage pour la compatibilité offline
      localStorage.setItem('pillar-coefficients', JSON.stringify(coefficients));
      localStorage.setItem('custom-questions', JSON.stringify({ customQuestions, customPillars }));
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const getWellnessData = () => {
    // Si connecté, utiliser les données Firebase, sinon localStorage
    if (user && Object.keys(wellnessData).length > 0) {
      return wellnessData;
    }
    
    // Fallback sur localStorage
    const localData = localStorage.getItem('wellness-data');
    return localData ? JSON.parse(localData) : {};
  };

  const getUserSettings = () => {
    // Si connecté, utiliser les paramètres Firebase, sinon localStorage
    if (user && userSettings) {
      return {
        coefficients: userSettings.coefficients || {},
        customQuestions: userSettings.customQuestions || [],
        customPillars: userSettings.customPillars || []
      };
    }
    
    // Fallback sur localStorage
    const localCoefficients = localStorage.getItem('pillar-coefficients');
    const localCustom = localStorage.getItem('custom-questions');
    
    return {
      coefficients: localCoefficients ? JSON.parse(localCoefficients) : {},
      customQuestions: localCustom ? JSON.parse(localCustom).customQuestions || [] : [],
      customPillars: localCustom ? JSON.parse(localCustom).customPillars || [] : []
    };
  };

  return {
    wellnessData: getWellnessData(),
    userSettings: getUserSettings(),
    loading,
    syncing,
    saveWellnessData,
    saveUserSettings,
    isOnline: !!user
  };
};
