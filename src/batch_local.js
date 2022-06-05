const parseDayForecast = require('./scripts/parse_day')
const { REGIONS } = require('./utils/tendayexcel/constants')

// Parse and extract relevant data from local Excel files to CSV files
const batchLocal = () => {
  for (let i = 1; i <= 3; i += 1) {
    parseDayForecast(`./data/local/day${i}.xlsx`, REGIONS.BICOL)
  }
}

batchLocal()
