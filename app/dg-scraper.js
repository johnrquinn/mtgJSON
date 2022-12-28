import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import _ from 'lodash';
import axios from 'axios';
import * as cheerio from 'cheerio';

const urls = [
  process.env.DG_STANDARD,
  process.env.DG_MODERN,
  process.env.DG_PIONEER,
  process.env.DG_LEGACY,
  process.env.DG_OTHER,
];

function transformPage(data) {
  const $ = cheerio.load(data);
  const namesList = $('.cN a').map((i, el) => $(el).text()).toArray().map((text) => _.toLower(text));
  const pricesList = $('.cP').map((i, el) => $(el).text()).toArray().map((text) => _.replace(text, '$', ''));

  if (namesList.length !== pricesList.length) console.log(`Error: lists of names and prices do not match up from ${url}`);

  const zippedList = _.map(_.zip(namesList, pricesList), (pair) => {
    const [name, dgUsd] = pair;
    return { name, dgUsd };
  });
  return zippedList;
}

async function scrapeDg() {
  try {
    if (!_.every(urls)) {
      console.log('Error: missing urls');
      return;
    }

    const dataPromises = _.map(urls, async (url) => {
      const { data } = await axios.get(url, { headers: { "Accept-Encoding": "gzip,deflate,compress" } });
      if (!data) {
        console.log(`Error: no data retrieved from ${url}`);
        return [];
      }
      return transformPage(data);
    });
    const scrapedData = await Promise.all(dataPromises);
    return _.flatten(scrapedData);
  } catch (err) {
    console.log(err);
  }
}

export { scrapeDg };
