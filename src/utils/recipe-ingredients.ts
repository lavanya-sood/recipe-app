import type { RecipeIngredient } from '@/types/recipe';

export function formatIngredientLine(item: RecipeIngredient): string {
  const qty = item.quantity?.trim();
  const unit = item.unit?.trim();
  const parts: string[] = [];
  if (qty) parts.push(qty);
  if (unit) parts.push(unit);
  parts.push(item.name);
  return parts.join(' ');
}
