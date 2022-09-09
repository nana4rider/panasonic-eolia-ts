/** 風量
 * 0:auto
 */
const EoliaWindVolume = [
  0, 2, 3, 4, 5
] as const;

type EoliaWindVolume = typeof EoliaWindVolume[number];

export { EoliaWindVolume };

