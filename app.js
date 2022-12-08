const fs = require('fs');
const _ = require('lodash');

console.log('-- Reading File');
const jsonFile = fs.readFileSync('oracle-cards.json');

console.log('-- Parsing JSON');
const parsedCards = JSON.parse(jsonFile);

if (parsedCards && Array.isArray(parsedCards)) {
  let cardsList = parsedCards.map((card) => {
    const [ type = '', subType = '' ] = card.type_line ? card.type_line.split(' — ') : ['', ''];
        return {
      name: card.name || '', //disable
      cmc: card.cmc || '', //number (integer)
      oracleText: card.oracle_text || '', //text
      type, //category
      power: card.power || '', //number (integer)
      toughness: card.toughness || '', //number (integer)
      setType: card.set_type || '', //category
      reserved: card.reserved || 'False', //category
      edhrec_rank: card.edhrec_rank || '', //number (integer)
      rarity: card.rarity || '', //category
      usd: card.prices.usd || '', //number
      usdFoil: card.prices.usd_foil || '', //number
      eur: card.prices.eur || '', //number
      //colors: card.colors || '', //!!Causes error on Akkio upload. How do we import arrays from the JSON?!!\\

      //OTHER OPTIONS
      //manaCost: card.mana_cost || '',
      //typeLine: card.type_line || '',
      //subType,
      //keywords: card.keywords && Array.isArray(card.keywords) ? card.keywords.join(',') : '',
      //set: card.set || '',
      //set_type: card.set_type || '',
      //border_color: card.border_color || '',
      //frame: card.frame || '',
      //full_art: card.full_art || 'False',
      //textless: card.textless || 'False',
      //standard: card.legalities.standard || 'False',
      //modern: card.legalities.modern || 'False',
      //legacy: card.legalities.legacy || 'False',
      //vintage: card.legalities.vintage || 'False',
      //commander: card.legalities.commander|| 'False',
      //pauper: card.legalities.pauper || 'False',
      //reprint: card.reprint || 'False',
    };
  });

  // https://stackoverflow.com/questions/38244285/how-to-convert-json-array-to-csv-using-node-js
  // prepending column titles to the .csv
  // cardsList.unshift([
  //   'ID',
  //   'Name',
  //   'CMC',
  //   'Oracle Text',
  //   'Keywords',
  //   'Rarity',
  //   'USD',
  //   'USD Foil',
  // ]);

  // put in new code here
  // const csv = `"${cardsList.join('"\n"').split(',').join('","')}"`;
  console.log('-- Generating JSON');
  const resultJson = JSON.stringify(cardsList);

  console.log('-- Writing JSON File');
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const fileDate = `${month}-${day}-${hour}:${minute}`;
  fs.writeFile(`oracle-cards-${fileDate}.json`, resultJson, 'utf8', function(err) {
    if (err) {
      console.log('-- Error occured: file either not saved or corrupted file was saved.', err);
    } else {
      console.log(`-- Saved: oracle-cards-${fileDate}.json`);
    }
  });
} else {
  console.log('-- Error: Parsed structure was not an array');
}