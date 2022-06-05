const downloadExcel = require('./utils/download_excel')
const parseDayForecast = require('../src/scripts/parse_day')
const { REGIONS } = require('./utils/tendayexcel/constants')

// Download all 10 Daily Weather Forecast excel files
// Parse and extract relevant data to CSV files
const main = async () => {
  const baseUrl = 'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook'

  for (let i = 1; i <= 10; i += 1) {
    downloadExcel(`${baseUrl}/day${i}.xlsx`, `day${i}.xlsx`, REGIONS.BICOL, parseDayForecast)
  }
}

main()
