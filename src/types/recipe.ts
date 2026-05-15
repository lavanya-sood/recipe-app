export type RecipeSocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'youtube';

export type RecipeKind = 'manual' | RecipeSocialPlatform;

export type Cookbook = {
  id: string;
  name: string;
  createdAt: number;
};

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
};

export type RecipeInstructionStep = {
  id: string;
  order: number;
  text: string;
};

export type RecipeNutrition = {
  calories?: string;
  protein?: string;
  carbs?: string;
  fats?: string;
};

export type RecipeAdditionalInfo = {
  servings?: string;
  prepTime?: string;
  cookTime?: string;
};

export type Recipe = {
  id: string;
  createdAt: number;
  title: string;
  kind: RecipeKind;
  imageUri?: string;
  /** Cookbooks this recipe belongs to */
  cookbookIds?: string[];
  /** Source post URL for social recipes */
  url?: string;
  ingredients?: RecipeIngredient[];
  steps?: RecipeInstructionStep[];
  nutrition?: RecipeNutrition;
  additionalInfo?: RecipeAdditionalInfo;
};
