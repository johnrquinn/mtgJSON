
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
  'basic snow land',
  'token artifact creature',
  'token legendary creature',
  'land', // testing All Cards without any lands
  'legendary land',
];
const setsToRemove = [
  'memorabilia',
  'funny',
  'token',
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
  ['legendary planeswalker'],
];

export {
  typesToRemove,
  setsToRemove,
  setToScrape,
  outputSections,
};
