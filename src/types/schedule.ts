export type ScheduleEntry = {
  id: string;
  recipeId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm (24h) */
  time: string;
};
