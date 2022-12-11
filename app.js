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
      subType,
      power: card.power || '', //number (integer)
      toughness: card.toughness || '', //number (integer)
      set: card.set ? card.set.toLowerCase() : '', //category
      setType: card.set_type ? card.set_type.toLowerCase() : '', //disabled
      reserved: card.reserved || 'False', //category
      released_at: card.released_at || '0', //date
      edhrec_rank: card.edhrec_rank, //number (integer)
      rarity: card.rarity ? card.rarity.toLowerCase() : '', //category
      usd: card.prices.usd || '', //number
      usdFoil: card.prices.usd_foil || '', //number
      eur: card.prices.eur || '', //number

      //colors: card.colors || '', //!!Causes error on Akkio upload. How do we import arrays from the JSON?!!\\
      // can turn an array into a string joining on a character like space or comma or both
      // ['apple', 'banana', 'orange'].join(', ') === 'apple, banana, orange'

      /* OTHER OPTIONS
      typeLine: card.type_line || '',
      manaCost: card.mana_cost || '',
      keywords: card.keywords && Array.isArray(card.keywords) ? card.keywords.join(',') : '',
      border_color: card.border_color || '',
      frame: card.frame || '',
      penny_rank: card.penny_rank, //number (integer)
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
  const removeType = ['plane','scheme','vanguard','token','token creature','emblem','card // card','phenomenon','card','legendary enchantment — background','basic land','token artifact creature','token legendary creature']
  const removeSetType = ['memorabilia','funny','token']
  cardsList = cardsList.filter((card) => (
    !_.some(removeType, (type) => card.type === type) && // remove bad set types
    !_.some(removeSetType, (setType) => card.setType === setType) // remove bad card types
  ));
  //cardsList = cardsList.filter((card) => (card.usd)); // remove cards with no value for usd
  //cardsList = cardsList.filter((card) => (card.usdFoil)); // remove cards with no value for usd
  //cardsList = cardsList.filter((card) => (card.eur)); // remove cards with no value for usd

  // THE OUTPUT SECTION
  const instantSorcery = ['instant','sorcery']
  const creatures = ['creature','artifact creature','enchantment creature','legendary creature']
  const planeswalkers = ['planeswalker']
  const lands = ['land']
  const enchantments = ['enchantment','enchantment aura']
  const artifacts = ['artifact']

  console.log('-- Generating JSON');
  const resultJson = JSON.stringify(cardsList);

    /* JQ ATTEMPT HERE
    const instantSorceryJson = cardsList.filter((card) => (
    _.some(instantSorcery, (type) => card.type === type)
  )); */


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
