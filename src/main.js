
const downloadExcel = require('./utils/download_excel')
const parseExcel = require('./utils/parse_excel')

// Download excel and parse a remote excel file
downloadExcel(
  'https://pubfiles.pagasa.dost.gov.ph/pagasaweb/files/climate/tendayweatheroutlook/day1.xlsx',
  'test.xlsx', parseExcel)
