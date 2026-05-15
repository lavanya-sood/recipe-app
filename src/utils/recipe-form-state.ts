import type {
  Recipe,
  RecipeAdditionalInfo,
  RecipeIngredient,
  RecipeInstructionStep,
  RecipeNutrition,
} from '@/types/recipe';

export type ManualFormState = {
  title: string;
  imageUri: string | null;
  cookbookId: string | null;
  ingredients: RecipeIngredient[];
  steps: RecipeInstructionStep[];
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  servings: string;
  prepTime: string;
  cookTime: string;
};

export function emptyManualFormState(): ManualFormState {
  return {
    title: '',
    imageUri: null,
    cookbookId: null,
    ingredients: [],
    steps: [],
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    servings: '',
    prepTime: '',
    cookTime: '',
  };
}

export function manualFormStateFromRecipe(recipe: Recipe): ManualFormState {
  return {
    title: recipe.title,
    imageUri: recipe.imageUri ?? null,
    cookbookId: recipe.cookbookIds?.[0] ?? null,
    ingredients: recipe.ingredients ?? [],
    steps: recipe.steps ?? [],
    calories: recipe.nutrition?.calories ?? '',
    protein: recipe.nutrition?.protein ?? '',
    carbs: recipe.nutrition?.carbs ?? '',
    fats: recipe.nutrition?.fats ?? '',
    servings: recipe.additionalInfo?.servings ?? '',
    prepTime: recipe.additionalInfo?.prepTime ?? '',
    cookTime: recipe.additionalInfo?.cookTime ?? '',
  };
}

function pruneNutrition(state: ManualFormState): RecipeNutrition | undefined {
  const n: RecipeNutrition = {};
  if (state.calories.trim()) n.calories = state.calories.trim();
  if (state.protein.trim()) n.protein = state.protein.trim();
  if (state.carbs.trim()) n.carbs = state.carbs.trim();
  if (state.fats.trim()) n.fats = state.fats.trim();
  return Object.keys(n).length ? n : undefined;
}

function pruneAdditional(state: ManualFormState): RecipeAdditionalInfo | undefined {
  const a: RecipeAdditionalInfo = {};
  if (state.servings.trim()) a.servings = state.servings.trim();
  if (state.prepTime.trim()) a.prepTime = state.prepTime.trim();
  if (state.cookTime.trim()) a.cookTime = state.cookTime.trim();
  return Object.keys(a).length ? a : undefined;
}

export function manualFormStateToRecipePatch(state: ManualFormState, kind: Recipe['kind'] = 'manual') {
  return {
    kind,
    title: state.title.trim(),
    imageUri: state.imageUri ?? undefined,
    cookbookIds: state.cookbookId ? [state.cookbookId] : undefined,
    ingredients: state.ingredients.length > 0 ? state.ingredients : undefined,
    steps: state.steps.length > 0 ? state.steps : undefined,
    nutrition: pruneNutrition(state),
    additionalInfo: pruneAdditional(state),
  };
}
