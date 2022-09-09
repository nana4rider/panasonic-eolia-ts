/** AIコントロール
 * AIオフ | AI 快適 | AI エコナビ
 */
const EoliaAiControl = [
  'off', 'comfortable', 'comfortable_econavi'
] as const;

type EoliaAiControl = typeof EoliaAiControl[number];

export { EoliaAiControl };

