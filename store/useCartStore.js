import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PEXCOVER_PRICE = 350;

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Adds a new pack to the cart
      addPack: (pack) => set((state) => ({
        cart: [...state.cart, { 
          ...pack, 
          learnerName: pack.learnerName || '', 
          wantsPexcover: pack.wantsPexcover || false 
        }]
      })),

      // Modifies a specific pack's details without mutating or deleting others
      updatePackDetails: (packId, learnerName, wantsPexcover) => set((state) => ({
        cart: state.cart.map((pack) => 
          pack.id === packId 
            ? { 
                ...pack, 
                learnerName: learnerName !== undefined ? learnerName : (pack.learnerName || ''), 
                wantsPexcover: wantsPexcover !== undefined ? wantsPexcover : (pack.wantsPexcover || false) 
              } 
            : pack
        )
      })),

      // Removes a pack from the cart
      removePack: (packId) => set((state) => ({
        cart: state.cart.filter((pack) => pack.id !== packId)
      })),

      // Clears the cart
      clearCart: () => set({ cart: [] }),

      // Dynamically calculates the cart total including Pexcover fees
      getCartTotal: () => {
        return get().cart.reduce((total, pack) => {
          // Safeguard against undefined totalPrice or wantsPexcover
          const basePrice = Number(pack.totalPrice) || 0;
          const pexcoverFee = pack.wantsPexcover ? PEXCOVER_PRICE : 0;
          return total + basePrice + pexcoverFee;
        }, 0);
      },

      // Helper to get total number of items/packs in the cart
      getCartCount: () => get().cart.length
    }),
    { name: 'pexpacks-cart-storage' }
  )
);
