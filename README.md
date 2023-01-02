# mtgJSON

## Installation

Requires a .env file be created in the root folder with these lines:

OUTPUT_DIR="./output"

Requires the Oracle Cards file from this site (https://scryfall.com/docs/api/bulk-data) saved as 'oracle-cards.json'.

Before running for the first time, need to run `npm install` in a Terminal.

## Running

To run the script, `npm run start`, to scrape data for the set you want to test for, `npm run scrape`. Set to be scraped is hardcoded in constants.js.
