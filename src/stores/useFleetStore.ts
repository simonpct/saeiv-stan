/**
 * Fleet Store - Gestion de la flotte de véhicules
 *
 * État de tous les bus et leurs positions
 */

import vehicles from "@/lib/vehicles";
import type { BusInstance, BusPositionUpdate } from "@/types";
import { create } from "zustand";

interface FleetState {
  // État
  vehicles: BusInstance[];
  lastUpdate: number;

  // Actions
  initializeFleet: (vehicles: BusInstance[]) => void;
  addVehicle: (vehicle: BusInstance) => void;
  removeVehicle: (busId: string) => void;
  updatePositions: (updates: BusPositionUpdate[]) => void;
  updateVehicle: (busId: string, updates: Partial<BusInstance>) => void;

  // Sélecteurs
  getBusById: (busId: string) => BusInstance | undefined;
  getBusesByRoute: (routeId: string) => BusInstance[];
  getBusesByState: (state: BusInstance["state"]) => BusInstance[];
  getActiveBuses: () => BusInstance[];
}

export const useFleetStore = create<FleetState>((set, get) => ({
  // État initial
  vehicles,
  lastUpdate: Date.now(),

  // Initialiser la flotte
  initializeFleet: (vehicles) => {
    set({ vehicles, lastUpdate: Date.now() });
  },

  // Ajouter un véhicule
  addVehicle: (vehicle) => {
    const { vehicles } = get();
    // Vérifier que l'ID n'existe pas déjà
    if (!vehicles.find((v) => v.id === vehicle.id)) {
      set({
        vehicles: [...vehicles, vehicle],
        lastUpdate: Date.now(),
      });
    }
  },

  // Retirer un véhicule
  removeVehicle: (busId) => {
    const { vehicles } = get();
    set({
      vehicles: vehicles.filter((v) => v.id !== busId),
      lastUpdate: Date.now(),
    });
  },

  // Mettre à jour les positions (appelé depuis Worker)
  updatePositions: (updates) => {
    const { vehicles } = get();
    const updatedVehicles = vehicles.map((vehicle) => {
      const update = updates.find((u) => u.busId === vehicle.id);
      if (update) {
        const updatedVehicle: BusInstance = {
          ...vehicle,
          position: update.position,
          previousDistance: update.position.distance, // CRUCIAL: mettre à jour previousDistance
          lastUpdateTime: Date.now(),
        };

        // Merge telemetry si fourni
        if (update.telemetry && vehicle.telemetry) {
          updatedVehicle.telemetry = {
            ...vehicle.telemetry,
            ...update.telemetry,
          };
        }

        return updatedVehicle;
      }
      return vehicle;
    });

    set({
      vehicles: updatedVehicles,
      lastUpdate: Date.now(),
    });
  },

  // Mettre à jour un véhicule spécifique
  updateVehicle: (busId, updates) => {
    const { vehicles } = get();
    set({
      vehicles: vehicles.map((v) =>
        v.id === busId ? { ...v, ...updates } : v
      ),
      lastUpdate: Date.now(),
    });
  },

  // Obtenir un bus par ID
  getBusById: (busId) => {
    const { vehicles } = get();
    return vehicles.find((v) => v.id === busId);
  },

  // Obtenir tous les bus d'une ligne
  getBusesByRoute: (routeId) => {
    const { vehicles } = get();
    return vehicles.filter((v) => v.currentRoute === routeId);
  },

  // Obtenir tous les bus dans un état donné
  getBusesByState: (state) => {
    const { vehicles } = get();
    return vehicles.filter((v) => v.state === state);
  },

  // Obtenir tous les bus actifs (IN_SERVICE ou DEADHEAD)
  getActiveBuses: () => {
    const { vehicles } = get();
    return vehicles.filter(
      (v) => v.state === "IN_SERVICE" || v.state === "DEADHEAD"
    );
  },
}));
