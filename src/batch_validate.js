const path = require('path')
const fs = require('fs')
const downloadValidateExcel = require('./utils/download_validate_excel')
const TendayExcel = require('./utils/tendayexcel')
const { REGIONS } = require('./utils/tendayexcel/constants')
const { DOWNLOAD_DIR } = require('./utils/constants')

// Download all 10 Daily Weather Forecast excel files
// Parse and validate relevant data and (optional) write processed data to CSV
// Return validated data as Object[]
const main = async () => {
  const baseUrl = 'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook'
  const files = []
  const max = 10
  let extractedData = []

  // Initialize the excel file definition
  const municipalities = ['Mandaon', 'Capalonga', 'Gigmoto', 'Pamplona', 'Castilla', 'Tiwi', 'Paracale', 'Pio Duran', 'Viga', 'Uson', 'Prieto Diaz']
  const BicolExcel = new TendayExcel({ regionName: REGIONS.BICOL, municipalities })

  // Create a temporary download directory
  const now = new Date()
  const tempDir = `${Math.random().toString(36).replace(/[0-9]/g, '').substr(2)}${now.getMilliseconds()}`
  const dirPath = path.resolve(__dirname, '..', DOWNLOAD_DIR, tempDir)

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }

  // Download excel, validate and extract data
  for (let i = 1; i <= max; i += 1) {
    files.push(downloadValidateExcel({
      url: `${baseUrl}/day${i}.xlsx`,
      storagePath: dirPath,
      dest: `day${i}.xlsx`,
      ExcelDefinition: BicolExcel,
      tocsv: true
    }))
  }

  // Process the extracted, validated data
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

  /*
  // Delete temporary download directory
  try {
    fs.rmdir(dirPath, { recursive: true, force: true }, (err) => {
      if (err) console.log(`Error deleting temp dir - ${err}`)
      else console.log('Deleted temp dir')
    })
  } catch (err) {
    console.log(err.message)
  }
  */
}

main()
