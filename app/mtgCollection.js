import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import csvToJson from 'convert-csv-to-json';
import _ from 'lodash';

async function getMtgCollection() {
  const mtgJson = await csvToJson.fieldDelimiter(',').getJsonFromCsv('./mtgCollection.csv');

  const result = _.map(mtgJson, (card) => ({
    name: _.trim(_.toLower(_.get(card, 'Name', ''))).replaceAll('"', ''),
    mtgUsd: _.get(card, '"MyPrice"', ''),
  }));

  return result;
}

export { getMtgCollection };
