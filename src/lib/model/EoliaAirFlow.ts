/** 風量オプション
 * 通常 | パワフル | ロング | 静か
 */
const EoliaAirFlow = [
  'not_set', 'powerful', 'long', 'quiet'
] as const;

type EoliaAirFlow = typeof EoliaAirFlow[number];

export { EoliaAirFlow };

