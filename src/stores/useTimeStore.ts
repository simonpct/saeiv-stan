/**
 * Time Store - Gestion du temps virtuel
 *
 * Contrôle le moteur temporel de l'application (Time Warp)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SpeedFactor } from '@/types';

interface TimeState {
  // État du temps
  virtualTimestamp: number; // Unix timestamp en ms
  speedFactor: SpeedFactor; // Multiplicateur de vitesse
  isPaused: boolean;
  realStartTime: number; // Timestamp réel de démarrage (pour sync)

  // Actions
  setTime: (timestamp: number) => void;
  setSpeed: (factor: SpeedFactor) => void;
  togglePause: () => void;
  play: () => void;
  pause: () => void;
  updateTime: (deltaMs: number) => void;
  reset: () => void;

  // Utilitaires
  getFormattedTime: () => string;
  setTimeFromDate: (date: Date) => void;
}

// Valeur par défaut: aujourd'hui à 8h00
const getDefaultTime = () => {
  const now = new Date();
  now.setHours(8, 0, 0, 0);
  return now.getTime();
};

export const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => ({
      // État initial
      virtualTimestamp: getDefaultTime(),
      speedFactor: 1,
      isPaused: true, // Démarre en pause
      realStartTime: Date.now(),

      // Définir le temps virtuel
      setTime: (timestamp) => {
        set({ virtualTimestamp: timestamp, realStartTime: Date.now() });
      },

      // Changer la vitesse
      setSpeed: (factor) => {
        set({ speedFactor: factor });
      },

      // Toggle pause/play
      togglePause: () => {
        const { isPaused } = get();
        set({ isPaused: !isPaused, realStartTime: Date.now() });
      },

      // Lecture
      play: () => {
        set({ isPaused: false, realStartTime: Date.now() });
      },

      // Pause
      pause: () => {
        set({ isPaused: true });
      },

      // Mise à jour du temps (appelé dans RAF loop)
      updateTime: (deltaMs) => {
        const { isPaused, speedFactor, virtualTimestamp } = get();
        if (!isPaused) {
          set({
            virtualTimestamp: virtualTimestamp + deltaMs * speedFactor,
          });
        }
      },

      // Reset à l'heure par défaut
      reset: () => {
        set({
          virtualTimestamp: getDefaultTime(),
          speedFactor: 1,
          isPaused: true,
          realStartTime: Date.now(),
        });
      },

      // Obtenir l'heure formatée (HH:MM:SS)
      getFormattedTime: () => {
        const { virtualTimestamp } = get();
        const date = new Date(virtualTimestamp);
        return date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
      },

      // Définir depuis un objet Date
      setTimeFromDate: (date) => {
        set({ virtualTimestamp: date.getTime(), realStartTime: Date.now() });
      },
    }),
    {
      name: 'saeiv-time-store', // Nom dans localStorage
      partialize: (state) => ({
        // Persister seulement certaines valeurs
        virtualTimestamp: state.virtualTimestamp,
        speedFactor: state.speedFactor,
      }),
    }
  )
);
