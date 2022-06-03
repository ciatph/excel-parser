const XLSX = require('xlsx')
const TenDayCsv = require('../utils/tendaycsv')
const writeCsv = require('../utils/write_csv')

// Callback function to downloadExcel() - parse the downloaded excel file
// Get the rainfall condition with highest count per province
const parseDayForecast = (excelFile, regionName) => {
  const bicolCSV = new TenDayCsv({ regionName })

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
      
      // Check cell types
      try {
        bicolCSV.isValidRowTypes(x)
      } catch (err) {
        throw new Error(`[${excelFile}], row #${index} ${err.message}`)
      }

      let obj

      try {
        obj = {
          province,
          municipality: bicolCSV.getMunicipalityName(x.__EMPTY, province),
          tmin: x.__EMPTY_1,
          tmax: x.__EMPTY_2,
          tmean: x.__EMPTY_3,
          rainfall: x.__EMPTY_5,
          cover: x.__EMPTY_6,
          humidity: x.__EMPTY_7,
          wspeed: x.__EMPTY_8,
          wdirection: x.__EMPTY_9 ? x.__EMPTY_9 : x['CLIMPS-FF-1'],
          date_forecast: fDate,
          date_range: dateRange
        }
      } catch (err) {
        throw new Error(`[${excelFile}], row #${index}, error parsing object (${municipality}) - ${err.message}`)
      }

      return obj
    })

    // console.log(filteredData)
    if (filteredData.length > 0) {
      writeCsv(filteredData, excelFile.replace('.xlsx', '.csv'))
    } else {
      throw new Error(`[${excelFile}] No data are extracted.`)
    }   
}

module.exports = parseDayForecast
