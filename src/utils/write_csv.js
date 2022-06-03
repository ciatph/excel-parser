const CSV = require('fast-csv')
const fs = require('fs')

/**
 * Write a JavaScript object to a CSV file.
 * @param {Object} data - simple 1-level key-value pairs JavaScript Object 
 * @param {*} filename - CSV filename
 */
const writeCsv = (data, filename) => {
  const csvOut = fs.createWriteStream(filename)
  const csvStream = CSV.format({ headers: true })
  csvStream.pipe(csvOut)

  data.forEach(item => {
    csvStream.write(item)
  })

  csvStream.end()
  console.log('Write to CSV success.')
}

module.exports = writeCsv
