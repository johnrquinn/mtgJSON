# mtgJSON

## Installation

Requires a .env file be created in the root folder with these lines:

OUTPUT_DIR="./output"

DG_STANDARD="https://mtg.dawnglare.com/?p=standard"
DG_MODERN="https://mtg.dawnglare.com/?p=modern"
DG_PIONEER="https://mtg.dawnglare.com/?p=pioneer"
DG_LEGACY="https://mtg.dawnglare.com/?p=legacy"
DG_OTHER="https://mtg.dawnglare.com/?p=bsets"

Requires the Oracle Cards file from this site (https://scryfall.com/docs/api/bulk-data) saved as 'oracle-cards.json'.

Requires an export from MTG Collection Builder (https://mtgcollectionbuilder.com/export) saved as 'mtgCollection.csv'.

Before running for the first time, need to run `npm install` in a Terminal.

## Running

To run the script, `npm run start`, to scrape data for the set you want to test for, `npm run scrape`. Set to be scraped is hardcoded in constants.js.
