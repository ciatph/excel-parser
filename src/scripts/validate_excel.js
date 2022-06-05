const XLSX = require('xlsx')
const writeCsv = require('../utils/write_csv')

/**
 * Validates a 10-day excel file
 * Extract data defined in TenDayExcel into Object[] or CSV file
 * @param {String} excelFile - Excel file complete with full path
 * @param {TenDayExcel} ExcelDefinition - An instance of TenDayExcel initialized with a target region
 * @param {Bool} toCsv - Write processed/filtered data to a CSV file
 */
const validateExcel = async (excelFile, ExcelDefinition, toCsv = false) => {
  // SheetJS (xlsx) objects
  let workbook
  let sheets
  let data

  // Forecast date
  let fDate

  // Date range validity period
  let dateRange  

  if (ExcelDefinition === undefined) {
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
    ExcelDefinition.allColumnsExist(data[10])
  } catch (err) {
    throw new Error(`[${excelFile}] - ${err.message}`)
  }

  // Extract and validate forecast date
  try {
    fDate = ExcelDefinition.getForecastDate(Object.keys(data[0])[0])
  } catch (err) {
    throw new Error(`[${excelFile}] ${err.message}`)
  }

  // Extract and validate date range validity period
  try {
    dateRange = ExcelDefinition.getDateRange(Object.values(data[0])[0])
  } catch (err) {
    throw new Error(`[${excelFile}] ${err.message}`)
  }

  // Filter and parse all rows belonging to defined provinces in ExcelDefinition
  let temp = data.filter(x => (x.__EMPTY !== undefined && ExcelDefinition.getProvince(x.__EMPTY) !== undefined))

  // Filter to include only specified municipalities
  if (ExcelDefinition.municipalities.length > 0) {
    temp = temp.filter(x => ExcelDefinition.municipalities.find(y => x.__EMPTY.toString().includes(y)))
  }

  const filteredData = temp.map((x, index) => {
    const province = ExcelDefinition.getProvince(x.__EMPTY)

    try {
      const obj = ExcelDefinition.getData(x, province)
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
