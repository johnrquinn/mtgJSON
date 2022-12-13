import * as fs from 'fs';
import * as _ from 'lodash';
import * as axios from 'axios';
import * as cheerio from 'cheerio';

const urls = [
  process.env.DG_STANDARD,
  process.env.DG_MODERN,
  process.env.DG_PIONEER,
  process.env.DG_LEGACY,
];

async function scrapeDg() {
  try {
    if (!urls) {
      console.log('Error: missing urls');
      return;
    }
    const scrapedData = _.reduce(urls, (result, url) => {
      const { data } = await axios.get(url, { headers: { "Accept-Encoding": "gzip,deflate,compress" } });
      if (!data) {
        console.log(`Error: no data retrieved from ${url}`);
        return result;
      }

      const $ = cheerio.load(data);
      const namesList = $('.cN a').map((i, el) => $(el).text()).toArray().map((text) => _.lowerCase(text));
      const pricesList = $('.cP').map((i, el) => $(el).text()).toArray();

      if (namesList.length !== pricesList.length) console.log(`Error: lists of names and prices do not match up from ${url}`);

      const zippedList = _.map(_.zip(namesList, pricesList), (pair) => {
        const [name, dgUsd] = pair;
        return { name, dgUsd };
      });
      return result.concat(zippedList);
    }, []);
  } catch (err) {
    console.log(err);
  }
}

module.exports = { scrapeDg };
