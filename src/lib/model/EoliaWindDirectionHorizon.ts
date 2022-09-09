/** 風向き左右*/
const EoliaWindDirectionHorizon = [
  'auto', 'nearby_left', 'to_left', 'to_right', 'nearby_right', 'front'
] as const;

type EoliaWindDirectionHorizon = typeof EoliaWindDirectionHorizon[number];

export { EoliaWindDirectionHorizon };

