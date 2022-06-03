## excel-parser

Testing downloading and parsing excel files.

### Requirements

1. NodeJS v14.18.3

## Installation

1. Clone this repository.  
`https://github.com/ciatph/excel-parser.git`

2. Install dependencies.  
`npm install`

## Available Scripts

### `npm start`

Download and parse a remote excel file (listed in `/src/main.js`) using a custom callback in `/src/scripts/dominant_condition.js`. Prints output to console.

### `npm run parse`

Parse a local excel file (`/data/day1.xlsx`) using a custom callback in `/src/scripts/dominant_condition.js`. Prints output to console.

### `npm run batch:download`

Download multiple excel files defined in (`/src/batch.js`) and write relevant data to CSV files.

### `npm run batch:local`

Parse and extract relevant data from multiple local Excel files in (`/data/local/*.xlsx`) to CSV files.

@ciatph  
20220601
