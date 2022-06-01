const XLSX = require('xlsx')

// Check if a municipality belongs to the Bicol region
const isBicol = (municipality) => {
  if (!municipality) {
    return
  }

  const bicolProvinces = ['Albay', 'Camarines Norte', 'Camarines Sur', 'Catanduanes', 'Masbate', 'Sorsogon']
  return bicolProvinces.find(x => municipality.toString().includes(x))
}

// Callback function to downloadExcel() - parse the downloaded excel file
// Get the rainfall condition with highest count per province
const parseExcel = (excelFile = 'test.xlsx') => {
  const workbook = XLSX.readFile(excelFile)
  const sheets = workbook.SheetNames
  const stats = {}
  const rainfallList = []

  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheets[0]])

  for (let key in data) {
    const values = Object.values(data[key])
    let municipality = values[0]
    const province = isBicol(municipality)

    if (province) {
      const rainfallVal = values[5].trim()
      municipality = municipality.trim()

      // Get unique rainfall values
      if (!rainfallList.includes(rainfallVal)) {
        rainfallList.push(rainfallVal)
      }
      
      // Get unique municipalities for each province
      if (stats[province] === undefined) {
        stats[province] = { municipalities: [municipality] }
      } else {
        stats[province].municipalities.push(municipality)
      }

      // Count unique rainfall values per province
      if (stats[province][rainfallVal] === undefined) {
        stats[province][rainfallVal] = 1
      } else {
        stats[province][rainfallVal] += 1
      }
    }
  }

  // Get the highest-value rainfall condition per province
  const rainfallProvince = {}

  for (let province in stats) {
    const keys = Object.keys(stats[province])
    let highest = 0
    let hiName = ''
  
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i] !== 'municipalities') {
        if (stats[province][keys[i]] > highest) {
          highest = stats[province][keys[i]]
          hiName = keys[i]
        }      
      }
    }
  
    rainfallProvince[province] = { condition: hiName, count: highest }
  }

  // console.log(JSON.stringify(stats))
  console.log(rainfallProvince)
}

module.exports = parseExcel
