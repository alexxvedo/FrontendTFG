import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Crear un almacenamiento seguro que funcione tanto en el cliente como en el servidor
const createSafeStorage = () => {
  // Verificar si estamos en el navegador
  if (typeof window !== "undefined") {
    return localStorage;
  }
  
  // Implementación de almacenamiento nulo para SSR
  return {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user: user }),
    }),
    {
      name: "user-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => createSafeStorage()), // Usar nuestro almacenamiento seguro
      skipHydration: true, // Evitar hidratación automática durante SSR
    }
  )
);
