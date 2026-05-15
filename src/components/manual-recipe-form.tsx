import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CookbookPicker } from '@/components/cookbook-picker';
import { IngredientEditor } from '@/components/ingredient-editor';
import { InstructionStepEditor } from '@/components/instruction-step-editor';
import { RecipeImagePicker } from '@/components/recipe-image-picker';
import { Text } from '@/components/ui/text';
import { useRecipes } from '@/context/recipes-context';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useFormInputStyle } from '@/hooks/use-form-input-style';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';
import {
  emptyManualFormState,
  manualFormStateFromRecipe,
  manualFormStateToRecipePatch,
  type ManualFormState,
} from '@/utils/recipe-form-state';

type Props = {
  recipe?: Recipe;
  onSaved?: () => void;
  contentPaddingBottom?: number;
};

export function ManualRecipeForm({ recipe, onSaved, contentPaddingBottom }: Props) {
  const theme = useTheme();
  const inputStyle = useFormInputStyle();
  const { addRecipe, updateRecipe, cookbooks, addCookbook } = useRecipes();
  const isEdit = !!recipe;

  const [form, setForm] = React.useState<ManualFormState>(() =>
    recipe ? manualFormStateFromRecipe(recipe) : emptyManualFormState(),
  );
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  function patch<K extends keyof ManualFormState>(key: K, value: ManualFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(emptyManualFormState());
    setError(null);
  }

  async function onSave() {
    setError(null);
    setSaving(true);
    try {
      const t = form.title.trim();
      if (!t) {
        setError('Add a title for your recipe.');
        return;
      }

      const payload = manualFormStateToRecipePatch(form, recipe?.kind ?? 'manual');

      if (isEdit && recipe) {
        await updateRecipe(recipe.id, payload);
        router.back();
      } else {
        await addRecipe(payload);
        resetForm();
        onSaved?.();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.form,
        { paddingBottom: contentPaddingBottom ?? BottomTabInset + Spacing.six },
      ]}>
      <Text variant="bodySmallBold">Title</Text>
      <TextInput
        value={form.title}
        onChangeText={(v) => patch('title', v)}
        placeholder="e.g. Weeknight dal"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, inputStyle]}
        accessibilityLabel="Recipe title"
      />

      <RecipeImagePicker imageUri={form.imageUri} onChange={(v) => patch('imageUri', v)} />

      <CookbookPicker
        cookbooks={cookbooks}
        selectedId={form.cookbookId}
        onChange={(v) => patch('cookbookId', v)}
        onCreateCookbook={addCookbook}
      />

      <IngredientEditor items={form.ingredients} onChange={(v) => patch('ingredients', v)} />

      <InstructionStepEditor steps={form.steps} onChange={(v) => patch('steps', v)} />

      <View style={styles.section}>
        <Text variant="bodySmallBold">Nutritional info</Text>
        <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
          Optional — per serving or total, however you track it.
        </Text>
        <View style={styles.grid}>
          {(
            [
              ['Calories', 'calories', 'e.g. 420', 'numeric'],
              ['Protein', 'protein', 'e.g. 28g', 'default'],
              ['Carbs', 'carbs', 'e.g. 45g', 'default'],
              ['Fats', 'fats', 'e.g. 12g', 'default'],
            ] as const
          ).map(([label, key, placeholder, keyboard]) => (
            <View key={key} style={styles.gridCell}>
              <Text variant="bodySmall" themeColor="textSecondary">
                {label}
              </Text>
              <TextInput
                value={form[key]}
                onChangeText={(v) => patch(key, v)}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                keyboardType={keyboard === 'numeric' ? 'numeric' : 'default'}
                style={[styles.input, inputStyle]}
                accessibilityLabel={label}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="bodySmallBold">Additional info</Text>
        <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
          Optional — servings and timing.
        </Text>
        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <Text variant="bodySmall" themeColor="textSecondary">
              Servings
            </Text>
            <TextInput
              value={form.servings}
              onChangeText={(v) => patch('servings', v)}
              placeholder="e.g. 4"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              style={[styles.input, inputStyle]}
              accessibilityLabel="Servings"
            />
          </View>
          <View style={styles.gridCell}>
            <Text variant="bodySmall" themeColor="textSecondary">
              Prep time
            </Text>
            <TextInput
              value={form.prepTime}
              onChangeText={(v) => patch('prepTime', v)}
              placeholder="e.g. 15 min"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, inputStyle]}
              accessibilityLabel="Prep time"
            />
          </View>
          <View style={[styles.gridCell, styles.gridCellWide]}>
            <Text variant="bodySmall" themeColor="textSecondary">
              Cooking time
            </Text>
            <TextInput
              value={form.cookTime}
              onChangeText={(v) => patch('cookTime', v)}
              placeholder="e.g. 30 min"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, inputStyle]}
              accessibilityLabel="Cooking time"
            />
          </View>
        </View>
      </View>

      {error && (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      )}

      <Pressable
        disabled={saving}
        onPress={() => void onSave()}
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: theme.text, opacity: saving ? 0.5 : 1 },
          pressed && !saving && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={isEdit ? 'Save changes' : 'Save recipe'}>
        <Text variant="bodySmallBold" style={{ color: theme.background }}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save recipe'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  hint: {
    lineHeight: 20,
    marginTop: -Spacing.one,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  gridCell: {
    width: '47%',
    gap: Spacing.one,
  },
  gridCellWide: {
    width: '100%',
  },
  error: {
    color: '#d32f2f',
  },
  saveBtn: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
