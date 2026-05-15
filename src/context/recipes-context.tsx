import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { FAVOURITES_COOKBOOK_NAME } from '@/constants/cookbooks';
import type { Cookbook, Recipe } from '@/types/recipe';
import type { ScheduleEntry } from '@/types/schedule';
import {
  getFavouritesCookbook,
  isFavouritesCookbook,
  isRecipeFavourite,
} from '@/utils/cookbooks';
import { normalizeRecipe } from '@/utils/normalize-recipe';
import { normalizeScheduleEntry, scheduleSortKey } from '@/utils/schedule';

const STORAGE_KEY_V3 = 'app-data:v3';
const STORAGE_KEY_V2 = 'app-data:v2';
const STORAGE_KEY_V1 = 'recipes:v1';

type AppData = {
  recipes: Recipe[];
  cookbooks: Cookbook[];
  schedule: ScheduleEntry[];
};

type RecipesContextValue = {
  recipes: Recipe[];
  cookbooks: Cookbook[];
  schedule: ScheduleEntry[];
  loaded: boolean;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  updateRecipe: (id: string, patch: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  addCookbook: (name: string) => Cookbook;
  removeCookbook: (id: string) => Promise<void>;
  addSchedule: (recipeId: string, date: string, time: string) => void;
  removeSchedule: (id: string) => void;
  sortedSchedule: ScheduleEntry[];
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string) => void;
  ensureFavouritesCookbook: () => Cookbook;
};

const RecipesContext = React.createContext<RecipesContextValue | null>(null);

const EMPTY: AppData = { recipes: [], cookbooks: [], schedule: [] };

function stableSortRecipe(a: Recipe, b: Recipe) {
  return b.createdAt - a.createdAt;
}

function stableSortCookbook(a: Cookbook, b: Cookbook) {
  if (isFavouritesCookbook(a)) return -1;
  if (isFavouritesCookbook(b)) return 1;
  return a.name.localeCompare(b.name);
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function loadAppData(): Promise<AppData> {
  const rawV3 = await AsyncStorage.getItem(STORAGE_KEY_V3);
  if (rawV3) {
    const parsed = JSON.parse(rawV3) as AppData;
    return normalizeAppData(parsed);
  }

  const rawV2 = await AsyncStorage.getItem(STORAGE_KEY_V2);
  if (rawV2) {
    const parsed = JSON.parse(rawV2) as Omit<AppData, 'schedule'>;
    const data: AppData = {
      recipes: Array.isArray(parsed.recipes) ? parsed.recipes.map(normalizeRecipe).sort(stableSortRecipe) : [],
      cookbooks: Array.isArray(parsed.cookbooks) ? parsed.cookbooks.sort(stableSortCookbook) : [],
      schedule: [],
    };
    await AsyncStorage.setItem(STORAGE_KEY_V3, JSON.stringify(data));
    return data;
  }

  const rawV1 = await AsyncStorage.getItem(STORAGE_KEY_V1);
  if (rawV1) {
    const parsed = JSON.parse(rawV1) as Recipe[];
    const data: AppData = {
      recipes: Array.isArray(parsed) ? parsed.map(normalizeRecipe).sort(stableSortRecipe) : [],
      cookbooks: [],
      schedule: [],
    };
    await AsyncStorage.setItem(STORAGE_KEY_V3, JSON.stringify(data));
    return data;
  }

  return EMPTY;
}

function normalizeAppData(parsed: AppData): AppData {
  const schedule = Array.isArray(parsed.schedule)
    ? parsed.schedule.map(normalizeScheduleEntry).filter((e): e is ScheduleEntry => !!e)
    : [];
  return {
    recipes: Array.isArray(parsed.recipes) ? parsed.recipes.map(normalizeRecipe).sort(stableSortRecipe) : [],
    cookbooks: Array.isArray(parsed.cookbooks) ? parsed.cookbooks.sort(stableSortCookbook) : [],
    schedule,
  };
}

export function RecipesProvider({ children }: React.PropsWithChildren) {
  const [data, setData] = React.useState<AppData>(EMPTY);
  const [loaded, setLoaded] = React.useState(false);

  const persist = React.useCallback((next: AppData) => {
    void AsyncStorage.setItem(STORAGE_KEY_V3, JSON.stringify(next));
  }, []);

  const updateData = React.useCallback(
    (updater: (prev: AppData) => AppData) => {
      setData((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loadedData = await loadAppData();
        if (!cancelled) setData(loadedData);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ensureFavouritesCookbook = React.useCallback((): Cookbook => {
    const existing = getFavouritesCookbook(data.cookbooks);
    if (existing) return existing;

    const next: Cookbook = {
      id: newId('cookbook'),
      name: FAVOURITES_COOKBOOK_NAME,
      createdAt: Date.now(),
    };
    updateData((prev) => {
      if (getFavouritesCookbook(prev.cookbooks)) return prev;
      return { ...prev, cookbooks: [next, ...prev.cookbooks].sort(stableSortCookbook) };
    });
    return next;
  }, [data.cookbooks, updateData]);

  const addRecipe = React.useCallback(
    async (r: Omit<Recipe, 'id' | 'createdAt'>) => {
      const next: Recipe = { ...r, id: newId('recipe'), createdAt: Date.now() };
      updateData((prev) => ({
        ...prev,
        recipes: [...prev.recipes, next].sort(stableSortRecipe),
      }));
    },
    [updateData],
  );

  const updateRecipe = React.useCallback(
    async (id: string, patch: Omit<Recipe, 'id' | 'createdAt'>) => {
      updateData((prev) => ({
        ...prev,
        recipes: prev.recipes
          .map((r) => (r.id === id ? { ...r, ...patch, id: r.id, createdAt: r.createdAt } : r))
          .sort(stableSortRecipe),
      }));
    },
    [updateData],
  );

  const removeRecipe = React.useCallback(
    async (id: string) => {
      updateData((prev) => ({
        ...prev,
        recipes: prev.recipes.filter((x) => x.id !== id),
        schedule: prev.schedule.filter((s) => s.recipeId !== id),
      }));
    },
    [updateData],
  );

  const addCookbook = React.useCallback(
    (name: string): Cookbook => {
      const trimmed = name.trim();
      if (trimmed.toLowerCase() === FAVOURITES_COOKBOOK_NAME.toLowerCase()) {
        return ensureFavouritesCookbook();
      }
      const existing = data.cookbooks.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (existing) return existing;

      const next: Cookbook = { id: newId('cookbook'), name: trimmed, createdAt: Date.now() };
      updateData((prev) => {
        const dup = prev.cookbooks.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
        if (dup) return prev;
        return { ...prev, cookbooks: [...prev.cookbooks, next].sort(stableSortCookbook) };
      });
      return next;
    },
    [data.cookbooks, updateData, ensureFavouritesCookbook],
  );

  const removeCookbook = React.useCallback(
    async (id: string) => {
      const target = data.cookbooks.find((c) => c.id === id);
      if (target && isFavouritesCookbook(target)) return;
      updateData((prev) => ({
        cookbooks: prev.cookbooks.filter((c) => c.id !== id),
        recipes: prev.recipes.map((r) => ({
          ...r,
          cookbookIds: r.cookbookIds?.filter((cid) => cid !== id),
        })),
        schedule: prev.schedule,
      }));
    },
    [data.cookbooks, updateData],
  );

  const addSchedule = React.useCallback(
    (recipeId: string, date: string, time: string) => {
      updateData((prev) => ({
        ...prev,
        schedule: [
          ...prev.schedule,
          { id: newId('schedule'), recipeId, date, time },
        ],
      }));
    },
    [updateData],
  );

  const removeSchedule = React.useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        schedule: prev.schedule.filter((s) => s.id !== id),
      }));
    },
    [updateData],
  );

  const sortedSchedule = React.useMemo(
    () => [...data.schedule].sort((a, b) => scheduleSortKey(a) - scheduleSortKey(b)),
    [data.schedule],
  );

  const isFavorite = React.useCallback(
    (recipeId: string) => {
      const recipe = data.recipes.find((r) => r.id === recipeId);
      return recipe ? isRecipeFavourite(recipe, data.cookbooks) : false;
    },
    [data.recipes, data.cookbooks],
  );

  const toggleFavorite = React.useCallback(
    (recipeId: string) => {
      const fav = ensureFavouritesCookbook();
      updateData((prev) => ({
        ...prev,
        recipes: prev.recipes.map((r) => {
          if (r.id !== recipeId) return r;
          const ids = new Set(r.cookbookIds ?? []);
          if (ids.has(fav.id)) ids.delete(fav.id);
          else ids.add(fav.id);
          const nextIds = [...ids];
          return { ...r, cookbookIds: nextIds.length ? nextIds : undefined };
        }),
      }));
    },
    [ensureFavouritesCookbook, updateData],
  );

  const value = React.useMemo(
    () => ({
      recipes: data.recipes,
      cookbooks: data.cookbooks,
      schedule: data.schedule,
      loaded,
      addRecipe,
      updateRecipe,
      removeRecipe,
      addCookbook,
      removeCookbook,
      addSchedule,
      removeSchedule,
      sortedSchedule,
      isFavorite,
      toggleFavorite,
      ensureFavouritesCookbook,
    }),
    [
      data,
      loaded,
      addRecipe,
      updateRecipe,
      removeRecipe,
      addCookbook,
      removeCookbook,
      addSchedule,
      removeSchedule,
      sortedSchedule,
      isFavorite,
      toggleFavorite,
      ensureFavouritesCookbook,
    ],
  );

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const ctx = React.useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes must be used within RecipesProvider');
  return ctx;
}
