const downloadValidateExcel = require('./utils/download_validate_excel')
const { REGIONS } = require('./utils/tendaycsv/constants')

// Download all 10 Daily Weather Forecast excel files
// Parse and validate relevant data
// Return validated data as Object[]
const main = async () => {
  const baseUrl = 'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook'
  const files = []
  const max = 10
  let response = []

  for (let i = 1; i <= max; i += 1) {
    files.push(downloadValidateExcel(`${baseUrl}/day${i}.xlsx`, `day${i}.xlsx`, REGIONS.BICOL))
  }

  try {
    response = await Promise.all(files)
  } catch (err) {
    console.log(`[ERROR]: ${err.message}`)
  }

  if (response.length === max) {
    console.log('Done')
    console.log('Download and validation done.')
  } else {
    console.log(`Something went wrong. Files parsed: ${response.length}`)
    process.exit(1)
  }
}

main()
