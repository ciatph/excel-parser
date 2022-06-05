const downloadValidateExcel = require('./utils/download_validate_excel')
const TendayExcel = require('./utils/tendayexcel')
const { REGIONS } = require('./utils/tendayexcel/constants')

// Download all 10 Daily Weather Forecast excel files
// Parse and validate relevant data and (optional) write processed data to CSV
// Return validated data as Object[]
const main = async () => {
  const baseUrl = 'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook'
  const files = []
  const max = 10
  let extractedData = []

  const municipalities = ['Mandaon', 'Capalonga', 'Gigmoto', 'Pamplona', 'Castilla', 'Tiwi', 'Paracale', 'Pio Duran', 'Viga', 'Uson', 'Prieto Diaz']
  const BicolExcel = new TendayExcel({ regionName: REGIONS.BICOL, municipalities })

  for (let i = 1; i <= max; i += 1) {
    files.push(downloadValidateExcel(`${baseUrl}/day${i}.xlsx`, `day${i}.xlsx`, BicolExcel, true))
  }

  try {
    extractedData = await Promise.all(files)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
  }

  if (extractedData.length === max) {
    console.log('Done')
    console.log('Download and validation done.')
  } else {
    console.log(`Something went wrong. Files parsed: ${extractedData.length}`)
    process.exit(1)
  }
}

main()
