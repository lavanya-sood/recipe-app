import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CookbookPicker } from '@/components/cookbook-picker';
import { IngredientEditor } from '@/components/ingredient-editor';
import { InstructionStepEditor } from '@/components/instruction-step-editor';
import { RecipeImagePicker } from '@/components/recipe-image-picker';
import { ThemedText } from '@/components/themed-text';
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
};

export function ManualRecipeForm({ recipe, onSaved }: Props) {
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
      contentContainerStyle={[styles.form, { paddingBottom: BottomTabInset + Spacing.six }]}>
      <ThemedText type="smallBold">Title</ThemedText>
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
        <ThemedText type="smallBold">Nutritional info</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Optional — per serving or total, however you track it.
        </ThemedText>
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
              <ThemedText type="small" themeColor="textSecondary">
                {label}
              </ThemedText>
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
        <ThemedText type="smallBold">Additional info</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Optional — servings and timing.
        </ThemedText>
        <View style={styles.grid}>
          <View style={styles.gridCell}>
            <ThemedText type="small" themeColor="textSecondary">
              Servings
            </ThemedText>
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
            <ThemedText type="small" themeColor="textSecondary">
              Prep time
            </ThemedText>
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
            <ThemedText type="small" themeColor="textSecondary">
              Cooking time
            </ThemedText>
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
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
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
        <ThemedText type="smallBold" style={{ color: theme.background }}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save recipe'}
        </ThemedText>
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
