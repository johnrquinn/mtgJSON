require('dotenv').config();

const fs = require('fs');
const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');

const utils = require('./utils');

const url = process.env.DG_URL;
const dir = process.env.OUTPUT_DIR;

async function scrapeData() {
  try {
    if (!url) {
      console.log('Error: missing url');
      return;
    }
    const { data } = await axios.get(url, { headers: { "Accept-Encoding": "gzip,deflate,compress" } });
    if (!data) {
      console.log('Error: no data retrieved');
      return;
    }

    const $ = cheerio.load(data);
    const namesList = $('.cN a').map((i, el) => $(el).text()).toArray();
    const pricesList = $('.cP').map((i, el) => $(el).text()).toArray();

    if (namesList.length !== pricesList.length) console.log('Error: lists of names and prices do not match up');

    const zippedList = _.map(_.zip(namesList, pricesList), (pair) => {
      const [name, usd] = pair;
      return { name, usd };
    });
    const resultJson = JSON.stringify(zippedList);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    console.log('-- Writing JSON File');
    const fileDate = utils.getFileDate();
    fs.writeFile(`${dir}/dg-scrape-${fileDate}.json`, resultJson, 'utf8', function(err) {
      if (err) {
        console.log('-- Error occured: file either not saved or corrupted file was saved.', err);
      } else {
        console.log(`-- Saved: ${dir}/dg-scrape-${fileDate}.json`);
      }
    });
  } catch (err) {
    console.log(err);
  }
}

scrapeData();
