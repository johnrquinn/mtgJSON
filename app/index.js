import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import _ from 'lodash';

import { typesToRemove, setsToRemove, outputSections } from './constants.js';
import { getFileDate } from './utils.js';

async function runApp() {
  const dir = process.env.OUTPUT_DIR;

  console.log('-- Reading File');
  const jsonFile = fs.readFileSync('./oracle-cards.json');

  console.log('-- Parsing JSON');
  const parsedCards = JSON.parse(jsonFile);

  if (_.isArray(parsedCards)) {
      const regParens = new RegExp(/\(([^\)]+)\)/g);
      const stopWords = '. , card this that it its a an the of and or then else for to in on at from with by as are was were be been being have has had do does did can could should would will may might must'.split(' ');

      let cardsList = _.map(parsedCards, (card) => {

        let typeLine = _.toLower(card.type_line);
        let types = [typeLine];
        if (_.includes(typeLine, ' - ')) {
          types = typeLine.split(' - ');
        } else if (_.includes(typeLine, ' — ')) {
          types = typeLine.split(' — ');
        } else if (_.includes(typeLine, 'creature ')) {
          types = typeLine.replace('creature ', 'creature!!!').split('!!!');
        } else if (_.includes(typeLine, 'planeswalker ')) {
          types = typeLine.replace('planeswalker ', 'planeswalker!!!').split('!!!');
        }
        let [ type = '', subType = 'None'] = types;

        if (_.includes(subType, 'aura')) {
          type = `${type} ${subType}`;
          subType = '';
        }

      const name = card.name.toLowerCase();
      let oracleText = _.toLower(card.oracle_text)
                          .replace(regParens, '')
                          .replaceAll(name, 'cardname')
                          .replaceAll('\n', ' ');
      /*
      _.forEach(stopWords, (word)=> {
        oracleText = oracleText.replaceAll(` ${word} `, ' ');
      });

      testing without removing stopwords */

      return {
        name, //disabled
        set: _.toLower(card.set), //disabled
        setType: _.toLower(card.set_type), //disabled
        typeLine: _.toLower(card.type_line), //disabled
        manaCost: card.mana_cost || '', //text
        cmc: card.cmc, //number (integer)
        colors: card.colors?.join?.(' ') || 'Colorless', //category
        oracleText, //text
        loyalty: card.loyalty || 'None', //number (integer)
        keywords: Array.isArray(card.keywords) && card.keywords.length > 0 ? card.keywords.join(',') : 'None', //text
        type, //category
        subType, //text
        power: _.get(card, 'power', 'None'), //number (integer)
        toughness: _.get(card, 'toughness', 'None',), //number (integer)
        yearReleased: _.get(card, 'released_at', '0000').match(/\d{4}/)[0], //number (integer)
        rarity: _.toLower(card.rarity), //category
        usd: _.get(card, 'prices.usd', ''), //number
        eur: _.get(card, 'prices.eur', ''), //number

        /* OTHER OPTIONS
        reserved: _.get(card, 'reserved', 'False'), //category
        edhrec_rank: card.edhrec_rank, //number (integer)
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

    // THE FILTER SECTION
    cardsList = _.filter(cardsList, (card) => (
      !_.some(typesToRemove, (type) => card.type === type) && // remove bad set types
      !_.some(setsToRemove, (setType) => card.setType === setType) && // remove bad card types
      _.some([card.usd, card.eur]) // remove cards with no monetary values
      // card.yearReleased >= 2004 // attempting to filter only newer cards but it doesn't seem to help?
    ));

    const fileDate = getFileDate();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    _.forEach(outputSections, (sectionTypes) => {
      const filteredTypes = _.filter(cardsList, (card) => _.some(sectionTypes, (type) => _.isEqual(card.type, type)));
      const resultJson = JSON.stringify(filteredTypes);
      const fileName = `${dir}/${sectionTypes[0].replace(' ', '_')}_${fileDate}.json`;
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
}

runApp();