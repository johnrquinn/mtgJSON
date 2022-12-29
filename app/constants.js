
const typesToRemove = [
  'plane',
  'scheme',
  'vanguard',
  'token',
  'token creature',
  'emblem',
  'card // card',
  'phenomenon',
  'card',
  'legendary enchantment — background',
  'basic land',
  'token artifact creature',
  'token legendary creature',
];
const setsToRemove = [
  'memorabilia',
  'funny',
  'token',
  //'masters' if we're using oracle cards we cant filter out masters because it may be the only version of a card
];
const setToScrape = [
  'one'
]
const outputSections = [
  [
    'creature',
    'artifact creature',
    'enchantment creature',
    'legendary creature',
  ],
  [
    'enchantment',
    'enchantment aura',
  ],
  ['sorcery'],
  ['instant'],
  ['artifact'],
  ['land'],
  ['planeswalker'],
];

export {
  typesToRemove,
  setsToRemove,
  setToScrape,
  outputSections,
};
