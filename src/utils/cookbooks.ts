import {
  FAVOURITES_COOKBOOK_NAME,
  UNCATAGORISED_COOKBOOK_ID,
  UNCATAGORISED_COOKBOOK_NAME,
} from '@/constants/cookbooks';
import type { Cookbook, Recipe } from '@/types/recipe';

export function isFavouritesCookbook(cookbook: Cookbook): boolean {
  return cookbook.name.toLowerCase() === FAVOURITES_COOKBOOK_NAME.toLowerCase();
}

export function getFavouritesCookbook(cookbooks: Cookbook[]): Cookbook | undefined {
  return cookbooks.find(isFavouritesCookbook);
}

export function isRecipeFavourite(recipe: Recipe, cookbooks: Cookbook[]): boolean {
  const fav = getFavouritesCookbook(cookbooks);
  if (!fav) return false;
  return recipe.cookbookIds?.includes(fav.id) ?? false;
}

export function isUncategorised(recipe: Recipe): boolean {
  return !recipe.cookbookIds?.length;
}

export function getUncategorisedRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.filter(isUncategorised);
}

export type CookbookListItem =
  | { type: 'virtual'; id: typeof UNCATAGORISED_COOKBOOK_ID; name: typeof UNCATAGORISED_COOKBOOK_NAME }
  | { type: 'cookbook'; cookbook: Cookbook };

export function buildCookbookList(cookbooks: Cookbook[], recipes: Recipe[]): CookbookListItem[] {
  const items: CookbookListItem[] = [];
  const fav = getFavouritesCookbook(cookbooks);
  if (fav) {
    items.push({ type: 'cookbook', cookbook: fav });
  }
  const uncategorisedCount = getUncategorisedRecipes(recipes).length;
  if (uncategorisedCount > 0) {
    items.push({
      type: 'virtual',
      id: UNCATAGORISED_COOKBOOK_ID,
      name: UNCATAGORISED_COOKBOOK_NAME,
    });
  }
  for (const c of cookbooks) {
    if (!isFavouritesCookbook(c)) {
      items.push({ type: 'cookbook', cookbook: c });
    }
  }
  return items;
}

export function recipeCountForListItem(item: CookbookListItem, recipes: Recipe[]): number {
  if (item.type === 'virtual') {
    return getUncategorisedRecipes(recipes).length;
  }
  return recipes.filter((r) => r.cookbookIds?.includes(item.cookbook.id)).length;
}
