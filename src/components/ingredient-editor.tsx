import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ThemedView } from '@/components/themed-view';
import { INGREDIENT_SUGGESTIONS, QUANTITY_UNITS } from '@/constants/ingredient-suggestions';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RecipeIngredient } from '@/types/recipe';

type Props = {
  items: RecipeIngredient[];
  onChange: (items: RecipeIngredient[]) => void;
};

const SUGGESTION_LIMIT = 8;

function newIngredientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function IngredientEditor({ items, onChange }: Props) {
  const theme = useTheme();
  const [query, setQuery] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [unit, setUnit] = React.useState('');
  const [focused, setFocused] = React.useState(false);

  const inputStyle = React.useMemo(
    () => ({
      color: theme.text,
      borderColor: theme.backgroundSelected,
      backgroundColor: theme.backgroundElement,
    }),
    [theme],
  );

  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const existing = new Set(items.map((i) => i.name.toLowerCase()));
    return INGREDIENT_SUGGESTIONS.filter(
      (name) => name.includes(q) && !existing.has(name),
    ).slice(0, SUGGESTION_LIMIT);
  }, [query, items]);

  const showSuggestions = focused && query.trim().length > 0;

  function addIngredient(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([
      ...items,
      {
        id: newIngredientId(),
        name: trimmed,
        quantity: quantity.trim() || undefined,
        unit: unit.trim() || undefined,
      },
    ]);
    setQuery('');
    setQuantity('');
    setUnit('');
    setFocused(false);
  }

  function updateItem(id: string, patch: Partial<Pick<RecipeIngredient, 'quantity' | 'unit'>>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function renderRow({ item }: { item: RecipeIngredient }) {
    const row = (
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.rowFields}>
          <TextInput
            value={item.quantity ?? ''}
            onChangeText={(text) => updateItem(item.id, { quantity: text || undefined })}
            placeholder="Qty"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            style={[styles.qtyInput, inputStyle]}
            accessibilityLabel={`Quantity for ${item.name}`}
          />
          <TextInput
            value={item.unit ?? ''}
            onChangeText={(text) => updateItem(item.id, { unit: text || undefined })}
            placeholder="Unit"
            placeholderTextColor={theme.textSecondary}
            style={[styles.unitInput, inputStyle]}
            accessibilityLabel={`Unit for ${item.name}`}
          />
          <Text variant="bodyReg" style={styles.rowName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>
        {Platform.OS === 'web' && (
          <Button
            variant="ghost"
            accessibilityLabel={`Remove ${item.name}`}
            hitSlop={8}
            onPress={() => removeItem(item.id)}
            style={styles.webRemove}>
            Remove
          </Button>
        )}
      </ThemedView>
    );

    if (Platform.OS === 'web') return row;

    return (
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <Pressable
            accessibilityLabel={`Remove ${item.name}`}
            onPress={() => removeItem(item.id)}
            style={({ pressed }) => [styles.deleteAction, pressed && styles.pressed]}>
            <Text style={styles.deleteLabel}>Delete</Text>
          </Pressable>
        )}>
        {row}
      </Swipeable>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text variant="bodySmallBold">Ingredients</Text>
      <Text variant="bodySmall" themeColor="textSecondary" style={styles.hint}>
        Search or type a name, set quantity and unit, then add. Swipe left on a row to remove.
      </Text>

      <View style={styles.addRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 150);
          }}
          placeholder="Search ingredients…"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, inputStyle]}
          accessibilityLabel="Ingredient search"
          returnKeyType="done"
          onSubmitEditing={() => addIngredient(query)}
        />
        <View style={styles.metaRow}>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Qty"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            style={[styles.qtyInput, inputStyle]}
            accessibilityLabel="Quantity for new ingredient"
          />
          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="Unit"
            placeholderTextColor={theme.textSecondary}
            style={[styles.unitInput, inputStyle]}
            accessibilityLabel="Unit for new ingredient"
          />
          <Button
            variant="primary"
            size="sm"
            accessibilityLabel="Add ingredient"
            disabled={!query.trim()}
            onPress={() => addIngredient(query)}
            style={styles.addBtn}>
            Add
          </Button>
        </View>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <ThemedView type="backgroundElement" style={styles.suggestions}>
          {suggestions.map((name) => (
            <Button
              key={name}
              variant="ghost"
              fullWidth
              contentAlign="start"
              onPress={() => addIngredient(name)}
              style={styles.suggestionRow}>
              <Text variant="bodySmall">{name}</Text>
            </Button>
          ))}
        </ThemedView>
      )}

      {showSuggestions &&
        query.trim() &&
        !suggestions.some((s) => s.toLowerCase() === query.trim().toLowerCase()) && (
        <Button variant="ghost" onPress={() => addIngredient(query)} style={styles.customAdd}>
          <Text variant="bodySmall" themeColor="textSecondary">
            Add “{query.trim()}”
          </Text>
        </Button>
      )}

      <View style={styles.unitChips}>
        {QUANTITY_UNITS.map((u) => (
          <Button key={u} variant="chip" selected={unit === u} onPress={() => setUnit(u)}>
            {u}
          </Button>
        ))}
      </View>

      {items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.xxxsmall }} />}
          renderItem={renderRow}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.xxxsmall,
  },
  hint: {
    lineHeight: 20,
    marginTop: -Spacing.xxxxsmall,
  },
  addRow: {
    gap: Spacing.xxxsmall,
  },
  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxsmall,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxxsmall,
  },
  qtyInput: {
    width: 56,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xxxsmall,
    paddingVertical: Spacing.xxxsmall,
    fontSize: 15,
    textAlign: 'center',
  },
  unitInput: {
    width: 72,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xxxsmall,
    paddingVertical: Spacing.xxxsmall,
    fontSize: 15,
    textAlign: 'center',
  },
  addBtn: {
    flex: 1,
  },
  suggestions: {
    borderRadius: Spacing.xxxsmall,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: Spacing.xsmall,
    paddingVertical: Spacing.xxsmall,
  },
  customAdd: {
    paddingVertical: Spacing.xxxxsmall,
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xxxxsmall,
  },
  list: {
    marginTop: Spacing.xxxxsmall,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xxxsmall,
    paddingHorizontal: Spacing.xxxsmall,
    borderRadius: Spacing.xxxsmall,
    gap: Spacing.xxxsmall,
  },
  rowFields: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxxsmall,
  },
  rowName: {
    flex: 1,
    fontWeight: '500',
  },
  webRemove: {
    paddingHorizontal: Spacing.xxxsmall,
  },
  deleteAction: {
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    borderRadius: Spacing.xxxsmall,
    marginLeft: Spacing.xxxsmall,
  },
  deleteLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.75,
  },
});
