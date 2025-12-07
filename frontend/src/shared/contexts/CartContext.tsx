import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, AddOn } from '@/shared/constants/mockData';
import { customerApi } from '@/shared/services/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateCartItem: (id: string, updates: Partial<CartItem>) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from backend when authenticated
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    if (userId && token) {
      loadCartFromBackend();
    }
  }, []);

  const loadCartFromBackend = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getCart();
      if (response.success && response.data) {
        // Transform backend cart items to frontend format
        const transformedItems = response.data.map((item: any) => ({
          id: item.id,
          vendorId: item.vendor?.id || item.vendorId,
          vendorName: item.vendor?.businessName || '',
          packageId: item.listing?.id || item.listingId,
          packageName: item.listing?.name || '',
          price: item.finalPrice?.toNumber() || item.basePrice?.toNumber() || 0,
          basePrice: item.basePrice?.toNumber() || 0,
          addOns: [], // Will be loaded from cart item add-ons
          quantity: item.quantity || 1,
          date: item.eventDate,
          eventDate: item.eventDate,
          eventTime: item.eventTime,
        }));
        setItems(transformedItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random()}`,
    };
    setItems((prev) => [...prev, newItem]);

    // Save to backend if authenticated
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    if (userId && token && item.packageId) {
      try {
        // Only send add-on IDs if they exist and are valid UUIDs
        const addOnIds = item.addOns?.filter(a => a.id && a.id.length > 0)
          .map(a => a.id)
          .filter(id => {
            // Basic UUID validation
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            return uuidRegex.test(id);
          }) || [];
        
        // Prepare customizations - only include if they exist
        let customizations = undefined;
        if (item.customizations && item.customizations.length > 0) {
          const customizationsPrice = item.customizations.reduce((sum, c) => sum + (c.price || 0), 0);
          customizations = {
            price: customizationsPrice,
            items: item.customizations,
          };
        }

        await customerApi.addToCart({
          listingId: item.packageId,
          quantity: item.quantity || 1,
          addOnIds: addOnIds.length > 0 ? addOnIds : undefined,
          customizations: customizations,
        });
      } catch (error: any) {
        console.error('Failed to save cart item to backend:', error);
        // Don't remove from local state - allow offline cart functionality
        // The error is logged but user can still proceed
      }
    }
  };

  const removeFromCart = async (id: string) => {
    const item = items.find(i => i.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));

    // Remove from backend if authenticated
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    if (userId && token && item && item.id && !item.id.startsWith('cart-')) {
      try {
        await customerApi.removeFromCart(item.id);
      } catch (error) {
        console.error('Failed to remove cart item from backend:', error);
        // Re-add to local state if backend removal failed
        if (item) setItems((prev) => [...prev, item]);
      }
    }
  };

  const updateCartItem = async (id: string, updates: Partial<CartItem>) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const updatedItem = { ...item, ...updates };
    setItems((prev) =>
      prev.map((item) => (item.id === id ? updatedItem : item))
    );

    // Update in backend if authenticated
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    if (userId && token && item.id && !item.id.startsWith('cart-')) {
      try {
        const addOnIds = updatedItem.addOns?.map(a => a.id) || [];
        await customerApi.updateCartItem(item.id, {
          quantity: updatedItem.quantity,
          addOnIds: addOnIds.length > 0 ? addOnIds : undefined,
          customizations: updatedItem.customizations,
        });
      } catch (error) {
        console.error('Failed to update cart item in backend:', error);
      }
    }
  };

  const clearCart = async () => {
    setItems([]);

    // Clear backend cart if authenticated
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('auth_token');
    if (userId && token) {
      try {
        await customerApi.clearCart();
      } catch (error) {
        console.error('Failed to clear cart in backend:', error);
      }
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const addOnsTotal = item.addOns.reduce((sum, addon) => sum + addon.price, 0);
      const customizationsTotal = item.customizations?.reduce((sum, custom) => sum + custom.price, 0) || 0;
      return total + (item.price + addOnsTotal + customizationsTotal) * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getTotalPrice,
        getItemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};


