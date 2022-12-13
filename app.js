import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as _ from 'lodash';

import * as constants from './constants';
import * as utils from './utils';
import * as dgScraper from './dg-scraper.js';

const dir = process.env.OUTPUT_DIR;

console.log('-- Reading File');
const jsonFile = fs.readFileSync('oracle-cards.json');

console.log('-- Parsing JSON');
const parsedCards = JSON.parse(jsonFile);

if (_.isArray(parsedCards)) {
  const regParens = new RegExp(/\(([^\)]+)\)/g);
  let cardsList = _.map(parsedCards, (card) => {
    let typeLine = _.lowerCase(card.type_line);
    let types = [];
    if (_.includes(typeLine, ' - ')) {
      types = (types && typeLine.split(' - ')) || ['', ''];
    } else {
      types = (types && typeLine.split(' — ')) || ['', ''];
    }
    let [ type, subType ] = types;

    if (_.includes(subType, 'aura') || _.includes(subType, 'creature')) {
      type = `${type} ${subType}`;
      subType = '';
    }

    const name = _.lowerCase(card.name);
    return {
      name, //disable
      cmc: card.cmc, //number (integer)
      oracleText: _.lowerCase(card.oracle_text).replace(regParens, '').replace(name, '').replaceAll('\n', ' '), //text
      type, //category
      power: _.get(card, 'power', ''), //number (integer)
      toughness: _.get(card, 'toughness', ''), //number (integer)
      set: _.lowerCase(card.set), //category
      setType: _.lowerCase(card.set_type), //disabled
      reserved: _.get(card, 'reserved', 'False'), //category
      released_at: _.get(card, 'released_at', '0'), //date
      edhrec_rank: card.edhrec_rank, //number (integer)
      rarity: _.lowerCase(card.rarity), //category
      usd: _.get(card, 'prices.usd', ''), //number
      usdFoil: _.get(card, 'prices.usd_foil', ''), //number
      eur: _.get(card, 'prices.eur', ''), //number

      //colors: card.colors || '', //!!Causes error on Akkio upload. How do we import arrays from the JSON?!!\\
      // can turn an array into a string joining on a character like space or comma or both
      // ['apple', 'banana', 'orange'].join(', ') === 'apple, banana, orange'

      /* OTHER OPTIONS
      typeLine: card.type_line || '',
      subType,
      manaCost: card.mana_cost || '',
      keywords: card.keywords && Array.isArray(card.keywords) ? card.keywords.join(',') : '',
      border_color: card.border_color || '',
      frame: card.frame || '',
      penny_rank: card.penny_rank, //number (integer)
      standard: card.legalities.standard || 'False',
      modern: card.legalities.modern || 'False',
      legacy: card.legalities.legacy || 'False',
      vintage: card.legalities.vintage || 'False',
      commander: card.legalities.commander|| 'False',
      pauper: card.legalities.pauper || 'False',
      full_art: card.full_art || 'False',
      textless: card.textless || 'False',
      reprint: card.reprint || 'False', */
    };
  });

  if (_.isArray(dgData)) {
    _.forEach(dgData, ({ name, dgUsd }) => {
      const match = _.find(cardsList, { name });
      match.dgUsd = dgUsd;
    });
  }

  // THE FILTER SECTION
  cardsList = _.filter(cardsList, (card) => (
    !_.some(typesToRemove, (type) => card.type === type) && // remove bad set types
    !_.some(setsToRemove, (setType) => card.setType === setType) && // remove bad card types
    _.some([card.usd, card.usdFoil, card.eur]) // remove cards with no monetary values
  ));

  // THE OUTPUT SECTION
  // const instantSorcery = ['instant', 'sorcery'];
  // const creatures = ['creature', 'artifact creature', 'enchantment creature', 'legendary creature'];
  // const planeswalkers = ['planeswalker'];
  // const lands = ['land'];
  // const enchantments = ['enchantment', 'enchantment aura'];
  // const artifacts = ['artifact'];

  /* JQ ATTEMPT HERE
  const instantSorceryJson = cardsList.filter((card) => (
    _.some(instantSorcery, (type) => card.type === type)
    )); */
    
  console.log('-- Writing JSON File');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const fileDate = getFileDate();

  _.forEach(outputSections, (sectionTypes) => {
    const filteredTypes = _.filter(cardsList, (card) => _.some(sectionTypes, (type) => card.type));
    const resultJson = JSON.stringify(filteredTypes);
    const fileName = `${dir}/${sectionTypes.join('_')}_${fileDate}.json`;
    fs.writeFile(fileName, resultJson, 'utf8', function(err) {
      if (err) {
        console.log(`-- Error occured: file either not saved or corrupted file was saved. ${fileName}`, err);
      } else {
        console.log(`-- Saved: ${fileName}`);
      }
    });
  });

  const fileName = `${dir}/all_${fileDate}.json`;
  const resultJson = JSON.stringify(cardsList);
  fs.writeFile(fileName, resultJson, 'utf8', function(err) {
    if (err) {
      console.log(`-- Error occured: file either not saved or corrupted file was saved. ${fileName}`, err);
    } else {
      console.log(`-- Saved: ${fileName}`);
    }
  });
} else {
  console.log('-- Error: Parsed structure was not an array');
}
