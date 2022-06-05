const XLSX = require('xlsx')
const TenDayExcel = require('../utils/TenDayExcel')
const writeCsv = require('../utils/write_csv')

// Callback function to downloadExcel() - parse the downloaded excel file
// Get the rainfall condition with highest count per province
const parseDayForecast = (excelFile, regionName) => {
  const bicolCSV = new TenDayExcel({ regionName })

  if (excelFile === undefined) {
    throw new Error('Missing parameter(s).')
  }

  const workbook = XLSX.readFile(excelFile)
  const sheets = workbook.SheetNames
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]])

  let fDate
  let dateRange

  // Check if target columns exist on a random data row
  try {
    bicolCSV.allColumnsExist(data[10])
  } catch (err) {
    throw new Error(`[${excelFile}] - ${err.message}`)
  }

  // Extract and validate forecast date
  try {
    fDate = bicolCSV.getForecastDate(Object.keys(data[0])[0])
  } catch (err) {
    throw new Error(`[${excelFile}] ${err.message}`)
  }

  // Extract and validate date range validity period
  try {
    dateRange = bicolCSV.getDateRange(Object.values(data[0])[0])
  } catch (err) {
    throw new Error(`[${excelFile}] ${err.message}`)
  }

  // Filter and parse all Bicol municipalities
  const filteredData = data.filter(x => (x.__EMPTY !== undefined && bicolCSV.getProvince(x.__EMPTY) !== undefined))
    .map((x, index) => {
      const province = bicolCSV.getProvince(x.__EMPTY)

      try {
        const obj = bicolCSV.getData(x, province)
        obj.date_forecast = fDate
        obj.date_range = dateRange
        return obj
      } catch (err) {
        throw new Error(`[${excelFile}], row #${index}, error extracting row object (${x.__EMPTY}) - ${err.message}`)
      }
    })

    // console.log(filteredData)
    if (filteredData.length > 0) {
      writeCsv(filteredData, excelFile.replace('.xlsx', '.csv'))
    } else {
      throw new Error(`[${excelFile}] No data are extracted.`)
    }   
}

module.exports = parseDayForecast
