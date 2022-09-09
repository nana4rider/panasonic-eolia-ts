/** 切タイマー */
const EoliaTimerValue = [
  0, 30, 60, 90, 120
] as const;

type EoliaTimerValue = typeof EoliaTimerValue[number];

export { EoliaTimerValue };

