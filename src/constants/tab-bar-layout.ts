import { Spacing } from "@/constants/theme";

/** Matches `ADD_FAB_SIZE` in custom-tab-bar. */
export const ADD_FAB_SIZE = 70;

/** Matches `fabContainer` `top` in custom-tab-bar (negative = pulls FAB up). */
export const FAB_CONTAINER_TOP_OFFSET = ADD_FAB_SIZE / 4;

const TAB_MIN_HEIGHT = 48;
const TAB_PADDING_VERTICAL = Spacing.xxxsmall;

function tabBarPaddingBottom(insetBottom: number): number {
  return Math.max(insetBottom, Spacing.xxxsmall);
}

function tabBarBodyHeight(): number {
  return TAB_MIN_HEIGHT + TAB_PADDING_VERTICAL * 2;
}

/** Distance from screen bottom to the FAB's bottom edge (aligns with tab bar FAB). */
export function fabBottomFromScreen(insetBottom: number): number {
  const paddingBottom = tabBarPaddingBottom(insetBottom);
  const barHeight = tabBarBodyHeight();
  // FAB top is `-FAB_CONTAINER_TOP_OFFSET` from the bar's top; bottom is the rest of the circle.
  const fabBottomFromBarTop = ADD_FAB_SIZE - FAB_CONTAINER_TOP_OFFSET;
  return paddingBottom + barHeight - fabBottomFromBarTop;
}

/** Distance from screen bottom to the FAB center. */
export function fabCenterBottom(insetBottom: number): number {
  return fabBottomFromScreen(insetBottom) + ADD_FAB_SIZE / 2;
}

/** Distance from screen bottom to the popover anchor (caret tip). */
export function addMenuBottom(insetBottom: number): number {
  return fabBottomFromScreen(insetBottom) + ADD_FAB_SIZE + Spacing.xxxsmall;
}
