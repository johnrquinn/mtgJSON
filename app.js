require('dotenv').config();

const fs = require('fs');
const _ = require('lodash');

const utils = require('./utils');

const dir = process.env.OUTPUT_DIR;

console.log('-- Reading File');
const jsonFile = fs.readFileSync('oracle-cards.json');

console.log('-- Parsing JSON');
const parsedCards = JSON.parse(jsonFile);

if (parsedCards && Array.isArray(parsedCards)) {
  const regParens = new RegExp(/\(([^\)]+)\)/g);
  let cardsList = parsedCards.map((card) => {
    let typeLine = card.type_line.toLowerCase();
    let types = [];
    if (_.includes(typeLine, ' - ')) {
      types = (types && typeLine.split(' - ')) || ['', ''];
    } else {
      types = (types && typeLine.split(' — ')) || ['', ''];
    }
    let [ type, subType ] = types;
    if (_.includes(subType, 'aura')) type = `${type} ${subType}`;

    return {
      name: card.name ? card.name.toLowerCase() : '', //disable
      cmc: card.cmc, //number (integer)
      oracleText: card.oracle_text ? card.oracle_text.toLowerCase().replace(regParens, '').replaceAll('\n', ' ') : '', //text
      type, //category
      power: card.power || '', //number (integer)
      toughness: card.toughness || '', //number (integer)
      set: card.set ? card.set.toLowerCase() : '', //category
      setType: card.set_type ? card.set_type.toLowerCase() : '', //category
      reserved: card.reserved || 'False', //category
      edhrec_rank: card.edhrec_rank || '', //number (integer)
      rarity: card.rarity ? card.rarity.toLowerCase() : '', //category
      usd: card.prices.usd || '', //number

      //colors: card.colors || '', //!!Causes error on Akkio upload. How do we import arrays from the JSON?!!\\
      // can turn an array into a string joining on a character like space or comma or both
      // ['apple', 'banana', 'orange'].join(', ') === 'apple, banana, orange'

      /* OTHER OPTIONS
      usdFoil: card.prices.usd_foil || '', //number
      eur: card.prices.eur || '', //number
      manaCost: card.mana_cost || '',
      typeLine: card.type_line || '',
      subType,
      keywords: card.keywords && Array.isArray(card.keywords) ? card.keywords.join(',') : '',
      border_color: card.border_color || '',
      frame: card.frame || '',
      full_art: card.full_art || 'False',
      textless: card.textless || 'False',
      standard: card.legalities.standard || 'False',
      modern: card.legalities.modern || 'False',
      legacy: card.legalities.legacy || 'False',
      vintage: card.legalities.vintage || 'False',
      commander: card.legalities.commander|| 'False',
      pauper: card.legalities.pauper || 'False',
      reprint: card.reprint || 'False', */
    };
  });

// THE FILTER SECTION
  // const removeName = ['plains', 'island','swamp','mountain','forest'];
  const removeType = ['plane','scheme','vanguard','token','token creature','emblem','card // card','phenomenon','card','legendary enchantment — background','basic land']
  const removeSetType = ['memorabilia', 'funny', 'token']
  cardsList = cardsList.filter((card) => (
    //_.some(removeName, (name) => card.name !== name) ||
    _.some(removeType, (type) => card.type !== type) ||
    _.some(removeSetType, (setType) => card.setType !== setType)
  ));

  const typeOutput = ['instant', 'sorcery','creature','planeswalker','land','enchantment'];
  console.log('-- Generating JSON');
  const resultJson = JSON.stringify(cardsList);

  console.log('-- Writing JSON File');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const fileDate = utils.getFileDate();
  fs.writeFile(`${dir}/oracle-cards-${fileDate}.json`, resultJson, 'utf8', function(err) {
    if (err) {
      console.log('-- Error occured: file either not saved or corrupted file was saved.', err);
    } else {
      console.log(`-- Saved: ${dir}/oracle-cards-${fileDate}.json`);
    }
  });
} else {
  console.log('-- Error: Parsed structure was not an array');
}
