/** 風向上下
 * 0:自動
 */
const EoliaWindDirection = [
  0, 1, 2, 3, 4, 5
] as const;

type EoliaWindDirection = typeof EoliaWindDirection[number];

export { EoliaWindDirection };

