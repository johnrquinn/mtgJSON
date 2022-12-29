import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import _ from 'lodash';

import { typesToRemove, setsToRemove, outputSections } from './constants.js';
import { getFileDate } from './utils.js';
import { scrapeDg } from './dg-scraper.js';
import { getMtgCollection } from './mtgCollection.js';

const sampleSize = null; // Null will output all rows, otherwise all categories will be circumcized to length

async function runApp() {
  const dir = process.env.OUTPUT_DIR;

  console.log('-- Reading File');
  const jsonFile = fs.readFileSync('./oracle-cards.json');

  console.log('-- Parsing JSON');
  const parsedCards = JSON.parse(jsonFile);

  if (_.isArray(parsedCards)) {
    const regParens = new RegExp(/\(([^\)]+)\)/g);
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
      let [ type = '', subType = ''] = types;

      if (_.includes(subType, 'aura')) {
        type = `${type} ${subType}`;
        subType = '';
      }

      const name = card.name.toLowerCase();
      // stopWords is a list of words that are not useful for searching
      const stopWords = 'card this that it its a an the of and or then else for to in on at from with by as is are was were be been being have has had do does did can could should would will may might must'.split(' ');
      let oracleText = _.toLower(card.oracle_text)
                          .replace(regParens, '')
                          .replaceAll(name, '')
                          .replaceAll('\n', ' ');

      _.forEach(stopWords, (word)=> {
        oracleText = oracleText.replaceAll(` ${word} `, ' ');
      });
      // if (card.name === 'Blah') {
      //   console.log(JSON.stringify(card));
      // }
      return {
        name, //disabled
        setType: _.toLower(card.set_type), //disabled
        cmc: card.cmc, //number (integer)
        colors: card.colors?.join?.(' ') || '', //category
        oracleText, //text
        type, //category
        power: _.get(card, 'power', ''), //number (integer)
        toughness: _.get(card, 'toughness', ''), //number (integer)
        reserved: _.get(card, 'reserved', 'False'), //category
        yearReleased: _.get(card, 'released_at', '0000').match(/\d{4}/)[0], //integer
        edhrec_rank: card.edhrec_rank, //number (integer)
        rarity: _.toLower(card.rarity), //category
        set: _.toLower(card.set), //category
        usd: _.get(card, 'prices.usd', ''), //number
        usdFoil: _.get(card, 'prices.usd_foil', ''), //number
        eur: _.get(card, 'prices.eur', ''), //number
        dgUsd: '', //number
        mtgUsd: '', //number

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

    // THE SCRAPE SECTION
    let dgMatchCount = 0;
    const fileDate = getFileDate();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log('-- Scraping DG');
    const dgData = await scrapeDg();
    if (_.isArray(dgData)) {
      const fileName = `${dir}/dg_${fileDate}.json`;
      const resultJson = JSON.stringify(dgData);
      fs.writeFile(fileName, resultJson, 'utf8', function(err) {
        if (err) {
          console.log(`-- Error occured: file either not saved or corrupted file was saved. ${fileName}`, err);
        } else {
          console.log(`-- Saved: ${fileName}`);
        }
      });

      _.forEach(dgData, ({ name, dgUsd }) => {
        const match = _.find(cardsList, { name });
        if (match) {
          match.dgUsd = dgUsd;
          dgMatchCount++;
        }
      });
    }
    console.log(`-- Number of DG matches: ${dgMatchCount}`);

    let mtgMatchCount = 0;
    console.log('-- Converting MTG-Col from csv to json');
    const mtgCollection = await getMtgCollection();
    if (_.isArray(mtgCollection)) {
      _.forEach(mtgCollection, ({ name, mtgUsd }) => {
        const match = _.find(cardsList, { name });
        if (match) {
          match.mtgUsd = mtgUsd;
          mtgMatchCount++;
        }
      });
    }

    console.log(`-- Number of MTG-Col matches: ${mtgMatchCount}`);

    // THE FILTER SECTION
    cardsList = _.filter(cardsList, (card) => (
      !_.some(typesToRemove, (type) => card.type === type) && // remove bad set types
      !_.some(setsToRemove, (setType) => card.setType === setType) && // remove bad card types
      // _.some([card.usd, card.dgUsd]) && // remove cards with null usd/dgUsd value
      _.some([card.usd, card.dgUsd, card.usdFoil, card.eur, card.mtgUsd]) // remove cards with no monetary values
    ));

    _.forEach(outputSections, (sectionTypes) => {
      let filteredTypes = _.filter(cardsList, (card) => _.some(sectionTypes, (type) => _.isEqual(card.type, type)));
      if (sampleSize) {
        console.log(`-- ${sectionTypes[0]} is circumcized to `, sampleSize);
        filteredTypes = _.sampleSize(filteredTypes, sampleSize);
      }
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
    if (sampleSize) {
      console.log('-- All is circumcized to ', sampleSize);
      cardsList = _.sampleSize(cardsList, sampleSize);
    }
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
