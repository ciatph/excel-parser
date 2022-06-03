const parseDayForecast = require('../src/scripts/parse_day')
const { REGIONS } = require('./utils/tendaycsv/constants')

// Parse and extract relevant data from local Excel files to CSV files
const batchLocal = () => {
  for (let i = 1; i <= 10; i += 1) {
    parseDayForecast(`./data/local/day${i}.xls`, REGIONS.BICOL)
  }
}

batchLocal()
