"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TrayPackLineItem = {
  id: string;
  itemId?: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  isRemoved?: boolean;
};

export type TrayPackItem = {
  id: string;
  packId: string;
  basePackId: string;
  packName: string;
  schoolId?: string;
  schoolSlug?: string;
  schoolName?: string;
  grade?: string;
  gradeSlug?: string;
  learnerName?: string;
  packMode: "full" | "customised";
  items: TrayPackLineItem[];
  modifications?: Record<string, number>;
  addOns?: TrayPackLineItem[];
  subtotal: number;
  totalPrice: number;
  wantsPexcover?: boolean;
  sourcePath?: string;
  createdAt: string;
  updatedAt: string;
};

type PackTrayState = {
  packs: TrayPackItem[];
  isTrayOpen: boolean;
  showSavedToast: boolean;
};

type PackTrayActions = {
  addPack: (pack: TrayPackItem) => void;
  updatePack: (id: string, changes: Partial<TrayPackItem>) => void;
  updatePackDetails: (packId: string, learnerName: string, wantsPexcover: boolean) => void;
  removePack: (id: string) => void;
  clearPacks: () => void;
  retainPublicSchoolPacks: (visibleSchoolSlugs: string[]) => void;
  openTray: () => void;
  closeTray: () => void;
  toggleTray: () => void;
  dismissSavedToast: () => void;
  getTotal: () => number;
  getPackCount: () => number;
  hasPacks: () => boolean;
};

export const usePackTrayStore = create<PackTrayState & PackTrayActions>()(
  persist(
    (set, get) => ({
      packs: [],
      isTrayOpen: false,
      showSavedToast: false,

      addPack: (pack) => {
        set((state) => ({
          packs: [...state.packs, pack],
          showSavedToast: true,
        }));
      },

      updatePack: (id, changes) => {
        set((state) => ({
          packs: state.packs.map((p) =>
            p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      updatePackDetails: (packId, learnerName, wantsPexcover) => {
        set((state) => ({
          packs: state.packs.map((pack) =>
            pack.id === packId
              ? {
                  ...pack,
                  learnerName,
                  wantsPexcover,
                  updatedAt: new Date().toISOString(),
                }
              : pack
          ),
        }));
      },

      removePack: (id) => {
        set((state) => ({
          packs: state.packs.filter((p) => p.id !== id),
        }));
      },

      clearPacks: () => {
        set({ packs: [] });
      },

      retainPublicSchoolPacks: (visibleSchoolSlugs) => {
        const visible = new Set(visibleSchoolSlugs);
        set((state) => {
          const packs = state.packs.filter(
            (pack) => !pack.schoolSlug || visible.has(pack.schoolSlug),
          );
          return packs.length === state.packs.length ? state : { packs };
        });
      },

      openTray: () => {
        set({ isTrayOpen: true, showSavedToast: false });
      },

      closeTray: () => {
        set({ isTrayOpen: false });
      },

      toggleTray: () => {
        set((state) => ({ isTrayOpen: !state.isTrayOpen }));
      },

      dismissSavedToast: () => {
        set({ showSavedToast: false });
      },

      getTotal: () => {
        const PEXCOVER_PRICE = 350;
        return get().packs.reduce(
          (sum, p) => sum + p.totalPrice + (p.wantsPexcover ? PEXCOVER_PRICE : 0),
          0
        );
      },

      getPackCount: () => {
        return get().packs.length;
      },

      hasPacks: () => {
        return get().packs.length > 0;
      },
    }),
    {
      name: "pexpacks-order-tray",
      partialize: (state) => ({
        packs: state.packs,
      }),
    }
  )
);
