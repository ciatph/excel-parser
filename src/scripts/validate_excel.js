const XLSX = require('xlsx')
const TenDayCsv = require('../utils/tendaycsv')
const writeCsv = require('../utils/write_csv')
const fs = require('fs')

// Callback function to downloadExcel() - parse the downloaded excel file
// Get the rainfall condition with highest count per province
const validateExcel = async (excelFile, regionName, toCsv = false) => {
  const bicolCSV = new TenDayCsv({ regionName })

  // SheetJS (xlsx) objects
  let workbook
  let sheets
  let data

  // Forecast date
  let fDate

  // Date range validity period
  let dateRange  

  if (excelFile === undefined) {
    throw new Error('Missing parameter(s).')
  }

  try {
    workbook = XLSX.readFile(excelFile)
    sheets = workbook.SheetNames
    data = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]])
  } catch (err) {
    throw new Error(`Error reading file [${excelFile}] - ${err.message}`)
  }

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
      if (toCsv) {
        await writeCsv(filteredData, excelFile.replace('.xlsx', '.csv'))
      }

      return filteredData
    } else {
      throw new Error(`[${excelFile}] No data are extracted.`)
    }   
}

module.exports = validateExcel
