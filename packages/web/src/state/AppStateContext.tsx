import { createContext, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import {
  DEFAULT_LANGUAGE_ID,
  DEFAULT_MIN_CONDITION,
  DEFAULT_PRICING_METHOD,
} from '@tradr/shared';
import type { CardEntry, CardFilterOverrides, GlobalFilters, ListMode, ProductSummary } from '@tradr/shared';

export type ListKey = 'A' | 'B';

interface AppState {
  mode: ListMode;
  defaults: GlobalFilters;
  lists: Record<ListKey, CardEntry[]>;
}

const initialFilters: GlobalFilters = {
  gameId: 1,
  minCondition: DEFAULT_MIN_CONDITION,
  languageId: DEFAULT_LANGUAGE_ID,
  sellerCountry: null,
  foil: false,
  signed: false,
  altered: false,
  playset: false,
  pricingMethod: DEFAULT_PRICING_METHOD,
};

const initialState: AppState = {
  mode: 'buy',
  defaults: initialFilters,
  lists: { A: [], B: [] },
};

type Action =
  | { type: 'SET_MODE'; mode: ListMode }
  | { type: 'SET_DEFAULTS'; patch: Partial<GlobalFilters> }
  | { type: 'ADD_CARD'; list: ListKey; product: ProductSummary; overrides: CardFilterOverrides }
  | { type: 'UPDATE_QUANTITY'; list: ListKey; id: string; quantity: number }
  | { type: 'UPDATE_OVERRIDES'; list: ListKey; id: string; overrides: CardFilterOverrides }
  | { type: 'BULK_UPDATE_OVERRIDES'; list: ListKey; overrides: CardFilterOverrides }
  | { type: 'REMOVE_CARD'; list: ListKey; id: string }
  | { type: 'CLEAR_LIST'; list: ListKey };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_DEFAULTS':
      return { ...state, defaults: { ...state.defaults, ...action.patch } };

    case 'ADD_CARD': {
      const entry: CardEntry = {
        id: crypto.randomUUID(),
        product: action.product,
        quantity: 1,
        overrides: action.overrides,
      };
      return { ...state, lists: { ...state.lists, [action.list]: [...state.lists[action.list], entry] } };
    }

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        lists: {
          ...state.lists,
          [action.list]: state.lists[action.list].map((entry) =>
            entry.id === action.id ? { ...entry, quantity: Math.max(1, action.quantity) } : entry,
          ),
        },
      };

    case 'UPDATE_OVERRIDES':
      return {
        ...state,
        lists: {
          ...state.lists,
          [action.list]: state.lists[action.list].map((entry) =>
            entry.id === action.id ? { ...entry, overrides: { ...entry.overrides, ...action.overrides } } : entry,
          ),
        },
      };

    case 'BULK_UPDATE_OVERRIDES':
      return {
        ...state,
        lists: {
          ...state.lists,
          [action.list]: state.lists[action.list].map((entry) => ({
            ...entry,
            overrides: { ...entry.overrides, ...action.overrides },
          })),
        },
      };

    case 'REMOVE_CARD':
      return {
        ...state,
        lists: { ...state.lists, [action.list]: state.lists[action.list].filter((entry) => entry.id !== action.id) },
      };

    case 'CLEAR_LIST':
      return { ...state, lists: { ...state.lists, [action.list]: [] } };

    default:
      return state;
  }
}

interface AppStateContextValue {
  state: AppState;
  setMode: (mode: ListMode) => void;
  setDefaults: (patch: Partial<GlobalFilters>) => void;
  addCard: (list: ListKey, product: ProductSummary, overrides: CardFilterOverrides) => void;
  updateQuantity: (list: ListKey, id: string, quantity: number) => void;
  updateOverrides: (list: ListKey, id: string, overrides: CardFilterOverrides) => void;
  bulkUpdateOverrides: (list: ListKey, overrides: CardFilterOverrides) => void;
  removeCard: (list: ListKey, id: string) => void;
  clearList: (list: ListKey) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
      setDefaults: (patch) => dispatch({ type: 'SET_DEFAULTS', patch }),
      addCard: (list, product, overrides) => dispatch({ type: 'ADD_CARD', list, product, overrides }),
      updateQuantity: (list, id, quantity) => dispatch({ type: 'UPDATE_QUANTITY', list, id, quantity }),
      updateOverrides: (list, id, overrides) => dispatch({ type: 'UPDATE_OVERRIDES', list, id, overrides }),
      bulkUpdateOverrides: (list, overrides) => dispatch({ type: 'BULK_UPDATE_OVERRIDES', list, overrides }),
      removeCard: (list, id) => dispatch({ type: 'REMOVE_CARD', list, id }),
      clearList: (list) => dispatch({ type: 'CLEAR_LIST', list }),
    }),
    [state],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}

