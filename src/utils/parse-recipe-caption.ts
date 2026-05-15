import type { RecipeAdditionalInfo, RecipeIngredient, RecipeInstructionStep } from '@/types/recipe';
import { newStepId } from '@/utils/normalize-recipe';

export type ParsedCaption = {
  title?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeInstructionStep[];
  additionalInfo?: RecipeAdditionalInfo;
};

function newIngredientId(index: number) {
  return `parsed-ing-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

type Section = 'none' | 'ingredients' | 'steps';

const INGREDIENT_HEADERS = /^(ingredients?|what you(?:'|’)ll need|you will need)\s*:?\s*$/i;
const STEP_HEADERS =
  /^(instructions?|directions?|method|steps?|how to (?:make|cook)|preparation)\s*:?\s*$/i;

function parseIngredientLine(line: string, index: number): RecipeIngredient | null {
  const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
  if (!cleaned || cleaned.length < 2) return null;

  const match = cleaned.match(/^([\d./]+)\s*([a-zA-Z]+)?\s+(.+)$/);
  if (match) {
    return {
      id: newIngredientId(index),
      quantity: match[1],
      unit: match[2],
      name: match[3].trim(),
    };
  }
  return { id: newIngredientId(index), name: cleaned };
}

function extractTitle(lines: string[]): { title?: string; rest: string[] } {
  if (lines.length === 0) return { rest: [] };
  const first = lines[0].trim();
  if (first.length > 0 && first.length <= 80 && !INGREDIENT_HEADERS.test(first) && !STEP_HEADERS.test(first)) {
    return { title: first, rest: lines.slice(1) };
  }
  return { rest: lines };
}

function parseServingsAndTimes(text: string): RecipeAdditionalInfo | undefined {
  const info: RecipeAdditionalInfo = {};
  const servings = text.match(/(?:serves?|servings?|yield)\s*:?\s*(\d+(?:\s*-\s*\d+)?)/i);
  const prep = text.match(/prep(?:\s*time)?\s*:?\s*([\d.]+\s*(?:min(?:utes)?|hrs?|hours?)?)/i);
  const cook = text.match(/cook(?:\s*time)?\s*:?\s*([\d.]+\s*(?:min(?:utes)?|hrs?|hours?)?)/i);
  if (servings) info.servings = servings[1];
  if (prep) info.prepTime = prep[1];
  if (cook) info.cookTime = cook[1];
  return Object.keys(info).length ? info : undefined;
}

/** Best-effort parser for caption / description text from social posts. */
export function parseRecipeCaption(raw: string): ParsedCaption {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const { title, rest } = extractTitle(lines);
  let section: Section = 'none';
  const ingredientLines: string[] = [];
  const stepLines: string[] = [];

  for (const line of rest) {
    if (INGREDIENT_HEADERS.test(line)) {
      section = 'ingredients';
      continue;
    }
    if (STEP_HEADERS.test(line)) {
      section = 'steps';
      continue;
    }
    if (section === 'ingredients') ingredientLines.push(line);
    else if (section === 'steps') stepLines.push(line);
  }

  if (ingredientLines.length === 0 && stepLines.length === 0) {
    const bullets = rest.filter((l) => /^[-•*]/.test(l) || /^\d+[.)]/.test(l));
    if (bullets.length >= 2) {
      const mid = Math.ceil(bullets.length / 2);
      ingredientLines.push(...bullets.slice(0, mid));
      stepLines.push(...bullets.slice(mid));
    }
  }

  const ingredients = ingredientLines
    .map((line, i) => parseIngredientLine(line, i))
    .filter((x): x is RecipeIngredient => !!x);

  const steps = stepLines.map((text, index) => ({
    id: newStepId(),
    order: index + 1,
    text: text.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim(),
  }));

  return {
    title,
    ingredients,
    steps,
    additionalInfo: parseServingsAndTimes(raw),
  };
}
