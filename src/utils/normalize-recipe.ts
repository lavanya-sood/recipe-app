import type {
  Recipe,
  RecipeIngredient,
  RecipeInstructionStep,
  RecipeNutrition,
  RecipeAdditionalInfo,
} from '@/types/recipe';

export { formatIngredientLine } from '@/utils/recipe-ingredients';

export function normalizeRecipeIngredients(
  ingredients: Recipe['ingredients'] | string | undefined,
): RecipeIngredient[] | undefined {
  if (!ingredients) return undefined;
  if (Array.isArray(ingredients)) {
    return ingredients.length > 0 ? ingredients : undefined;
  }
  if (typeof ingredients === 'string') {
    const lines = ingredients
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return undefined;
    return lines.map((name, index) => ({
      id: `legacy-ing-${index}`,
      name,
    }));
  }
  return undefined;
}

function normalizeSteps(
  steps: Recipe['steps'] | string | undefined,
  legacyInstructions?: string,
): RecipeInstructionStep[] | undefined {
  if (Array.isArray(steps) && steps.length > 0) {
    return [...steps]
      .sort((a, b) => a.order - b.order)
      .map((step, index) => ({ ...step, order: index + 1 }));
  }
  const text = typeof legacyInstructions === 'string' ? legacyInstructions : undefined;
  if (!text?.trim()) return undefined;
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return undefined;
  return lines.map((line, index) => ({
    id: `legacy-step-${index}`,
    order: index + 1,
    text: line,
  }));
}

function pruneRecord<T extends Record<string, string | undefined>>(obj: T | undefined): T | undefined {
  if (!obj) return undefined;
  const entries = Object.entries(obj).filter(([, v]) => v?.trim());
  return entries.length > 0 ? (Object.fromEntries(entries) as T) : undefined;
}

export function normalizeRecipe(
  recipe: Recipe & {
    ingredients?: Recipe['ingredients'] | string;
    instructions?: string;
    steps?: Recipe['steps'] | string;
    cookbookId?: string;
  },
): Recipe {
  const ingredients = normalizeRecipeIngredients(recipe.ingredients);
  const legacyInstructions =
    typeof (recipe as { instructions?: string }).instructions === 'string'
      ? (recipe as { instructions?: string }).instructions
      : undefined;
  const steps = normalizeSteps(recipe.steps, legacyInstructions);

  let cookbookIds = recipe.cookbookIds;
  if (!cookbookIds?.length && recipe.cookbookId) {
    cookbookIds = [recipe.cookbookId];
  }

  const nutrition = pruneRecord(recipe.nutrition as RecipeNutrition | undefined);
  const additionalInfo = pruneRecord(recipe.additionalInfo as RecipeAdditionalInfo | undefined);

  const { instructions: _i, cookbookId: _c, ...rest } = recipe as Recipe & {
    instructions?: string;
    cookbookId?: string;
  };

  return {
    ...rest,
    ingredients,
    steps,
    cookbookIds: cookbookIds?.length ? cookbookIds : undefined,
    nutrition,
    additionalInfo,
  };
}

export function reindexSteps(steps: RecipeInstructionStep[]): RecipeInstructionStep[] {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}

export function newStepId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
