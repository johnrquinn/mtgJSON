
const typesToRemove: [
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
const setsToRemove: [
      'memorabilia',
      'funny',
      'token',
    ];
const outputSections: [
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
      [
        'instant',
        'sorcery',
      ],
      ['artifact'],
      ['land'],
      ['planeswalker'],
    ];

module.exports = {
  typesToRemove,
  setsToRemove,
  outputSections,
};
