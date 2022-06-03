
const downloadExcel = require('./utils/download_excel')
const parseExcel = require('./scripts/dominant_condition')

// Download and parse a remote Daily Weather Forecast excel file
// Print the dominant weather condition of certain Bicol provinces to console
downloadExcel(
  'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook/day1.xlsx',
  'test.xlsx', 'bicol', parseExcel)
