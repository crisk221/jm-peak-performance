import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ClientDraft, PlanDraft, WizardState } from '@/types/wizard';

interface WizardStore extends WizardState {
  setClientDraft: (partial: Partial<ClientDraft>) => void;
  setPlanDraft: (partial: Partial<PlanDraft>) => void;
  setClientId: (id: string | undefined) => void;
  reset: () => void;
}

const initialClientDraft: ClientDraft = {
  fullName: '',
  gender: '',
  age: null,
  heightCm: null,
  weightKg: null,
  activity: '',
  goal: '',
  allergies: [],
  cuisines: [],
  dislikes: [],
  includeMeals: [],
};

const initialPlanDraft: PlanDraft = {};

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      clientDraft: initialClientDraft,
      planDraft: initialPlanDraft,
      
      setClientDraft: (partial) =>
        set((state) => ({
          clientDraft: { ...state.clientDraft, ...partial },
        })),
      
      setPlanDraft: (partial) =>
        set((state) => ({
          planDraft: { ...state.planDraft, ...partial },
        })),
      
      setClientId: (id) => {
        if (id) {
          set({ clientId: id });
        } else {
          set((state) => {
            const { clientId, ...rest } = state;
            return rest;
          });
        }
      },
      
      reset: () =>
        set({
          clientDraft: initialClientDraft,
          planDraft: initialPlanDraft,
        }),
    }),
    {
      name: 'trainer-wizard-v1',
      storage: createJSONStorage(() => {
        // SSR-safe localStorage
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);
