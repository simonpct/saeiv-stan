/**
 * Animation Loop Hook
 * Boucle requestAnimationFrame pour mettre à jour le temps virtuel
 */

'use client';

import { useEffect, useRef } from 'react';
import { useTimeStore } from '@/stores/useTimeStore';

interface AnimationLoopOptions {
  onFrame?: (deltaTime: number) => void;
  enabled?: boolean;
}

export function useAnimationLoop(options: AnimationLoopOptions = {}) {
  const { onFrame, enabled = true } = options;
  const rafIdRef = useRef<number>(undefined);
  const lastTimeRef = useRef<number>(0);
  const updateTime = useTimeStore((state) => state.updateTime);
  const isPaused = useTimeStore((state) => state.isPaused);

  useEffect(() => {
    if (!enabled) return;

    let running = true;

    const loop = (timestamp: number) => {
      if (!running) return;

      // Calculer le delta time
      const deltaTime = lastTimeRef.current
        ? timestamp - lastTimeRef.current
        : 0;

      lastTimeRef.current = timestamp;

      // Mettre à jour le temps virtuel (si pas en pause)
      if (!isPaused) {
        updateTime(deltaTime);
      }

      // Callback custom si fourni
      if (onFrame && deltaTime > 0) {
        onFrame(deltaTime);
      }

      // Prochaine frame
      rafIdRef.current = requestAnimationFrame(loop);
    };

    // Démarrer la boucle
    rafIdRef.current = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      running = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled, isPaused, updateTime, onFrame]);
}
