import React from 'react';
import { useCartStore } from '../../store/useCartStore';

const PEXCOVER_PRICE = 350;

export function GlobalCartDrawer({ isOpen, onClose, onCheckout }) {
  const cart = useCartStore((state) => state.cart);
  const updatePackDetails = useCartStore((state) => state.updatePackDetails);
  const removePack = useCartStore((state) => state.removePack);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  if (!isOpen) return null;

  const totalCartAmount = getCartTotal();

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
      {/* Overlay click area */}
      <div className="absolute inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Drawer Panel */}
      <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out translate-x-0">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#000080]">Your Order</h2>
            <p className="text-xs text-gray-500 font-medium">Review your school packs & details</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center text-lg transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length > 0 ? (
            cart.map((pack) => {
              const wantsPexcover = pack.wantsPexcover || false;
              const basePrice = Number(pack.totalPrice) || 0;
              const packLineTotal = basePrice + (wantsPexcover ? PEXCOVER_PRICE : 0);

              return (
                <div key={pack.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 mb-4 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-semibold text-teal-600 tracking-wide uppercase">
                        {pack.schoolName || pack.school || 'School Pack'}
                      </span>
                      <h3 className="font-extrabold text-gray-800 text-base">
                        {pack.packName || pack.grade || 'Grade Pack'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePack(pack.id)}
                      className="text-gray-400 hover:text-red-500 text-sm transition-colors cursor-pointer p-1"
                      title="Remove pack"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Learner Name Input */}
                  <div className="mt-3">
                    <label htmlFor={`learner-${pack.id}`} className="block text-xs font-bold text-gray-600 mb-1">
                      Who is this pack for?
                    </label>
                    <input 
                      id={`learner-${pack.id}`}
                      type="text" 
                      placeholder="Learner's First & Last Name"
                      value={pack.learnerName || ''}
                      className="w-full p-2.5 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#000080] focus:border-transparent bg-white transition"
                      onChange={(e) => updatePackDetails(pack.id, e.target.value, wantsPexcover)}
                    />
                  </div>

                  {/* Pexcover Upsell Toggle */}
                  <label className="flex items-center gap-3 mt-4 bg-white p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#000080] transition">
                    <input 
                      type="checkbox" 
                      checked={wantsPexcover}
                      className="w-5 h-5 accent-[#000080] cursor-pointer"
                      onChange={(e) => updatePackDetails(pack.id, pack.learnerName, e.target.checked)}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[#000080]">Add Pexcover (+R {PEXCOVER_PRICE})</p>
                      <p className="text-xs text-gray-500">We cover books & print name labels</p>
                    </div>
                  </label>

                  {/* Dynamic Line-Item Total */}
                  <div className="flex justify-between items-baseline mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500 font-semibold">
                      {pack.items ? `${pack.items.length} items` : ''}
                    </span>
                    <p className="font-extrabold text-[#FF6B57] text-right text-lg">
                      Total: R {packLineTotal}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Your cart is empty.</p>
              <button 
                type="button" 
                onClick={onClose} 
                className="mt-3 text-sm text-[#000080] font-bold hover:underline"
              >
                Go find a school pack
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-sm font-bold text-gray-700">Combined Total:</span>
              <span className="text-2xl font-black text-[#FF6B57]">R {totalCartAmount}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full bg-[#FF6B57] text-white py-3.5 rounded-full font-bold text-base hover:bg-[#ff553d] transition-all transform active:scale-95 shadow-md shadow-coral-100 cursor-pointer"
            >
              Checkout & Pay Securely
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
