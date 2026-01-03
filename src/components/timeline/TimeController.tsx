'use client';

/**
 * Time Controller Component
 * Contrôle du temps virtuel (Time Warp)
 */

import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTimeStore } from '@/stores/useTimeStore';
import type { SpeedFactor } from '@/types';

const SPEED_OPTIONS: { value: SpeedFactor; label: string }[] = [
  { value: 1, label: 'x1' },
  { value: 2, label: 'x2' },
  { value: 5, label: 'x5' },
  { value: 10, label: 'x10' },
  { value: 30, label: 'x30' },
  { value: 60, label: 'x60' },
  { value: 100, label: 'x100' },
];

export function TimeController() {
  const {
    isPaused,
    speedFactor,
    togglePause,
    setSpeed,
    reset,
    getFormattedTime,
  } = useTimeStore();

  const formattedTime = getFormattedTime();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Play/Pause Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePause}
              variant={isPaused ? 'default' : 'secondary'}
              size="icon"
              title={isPaused ? 'Lecture' : 'Pause'}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>

            <Button
              onClick={reset}
              variant="outline"
              size="icon"
              title="Réinitialiser (8h00)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Center: Time Display */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                Temps Virtuel
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* Right: Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Vitesse:</span>
            <Select
              value={speedFactor.toString()}
              onValueChange={(value) => setSpeed(parseInt(value) as SpeedFactor)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPEED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Speed Indicator (visual feedback) */}
        {!isPaused && speedFactor > 1 && (
          <div className="mt-2 text-center">
            <span className="text-xs text-muted-foreground">
              Vitesse accélérée: {speedFactor}x plus rapide
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
