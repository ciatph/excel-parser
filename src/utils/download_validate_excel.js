const https = require('https')
const fs = require('fs')
const path = require('path')
const validateExcel = require('../scripts/validate_excel')
const { DOWNLOAD_DIR } = require('../utils/constants')

/**
 * Download, validate and return the processed contents of an excel file
 * @param {Object} params - Settings process
 * @param {String} params.url - Excel file's downlod URL
 * @param {String} params.storagePath - Full path to a local download directory
 * @param {String} params.dest - Excel file name (ends in .xlsx)
 * @param {TendayExcel} params.ExcelDefinition - An instance of a TendayExcel class
 * @param {Bool} params.tocsv - Save extracted data to a CSV file
 * @param {Bool} params.deleteExcel - Delete the downloaded excel file
 * @returns {Promise} Returns an Array of Object[], containing extracted data from an excel file
 * @throws {Error} Miscellaneous processing and data validation errors
 */
const downloadValidateExcel = async (params) => {
  const { url, storagePath, dest = 'sample.xlsx', ExcelDefinition, tocsv = false, deleteExcel = true } = params

  return new Promise ((resolve, reject) => {
    const filePath = (storagePath !== undefined)
      ? path.resolve(storagePath, dest)
      : path.resolve(__dirname, '..', '..', DOWNLOAD_DIR, dest)

    const file = fs.createWriteStream(filePath)

    https.get(url, (res) => {
      res.pipe(file)
  
      file.on('finish', () => {
        file.close(async () => {
          try {
            let extracted = []
            extracted = await validateExcel(filePath, ExcelDefinition, tocsv)

            if (extracted.length > 0) {
              console.log(`[${dest}] download complete`)  
              resolve(extracted)
            } else {
              reject(new Error('Failed to extract data from rows.'))
            }
          } catch (err) {
            reject(new Error(err.message))
          }

          if (deleteExcel) {
            fs.unlink(filePath, (err) => {
              if (err) console.log(err)
              else console.log(`Deleted temp file ${dest}\n`)
            })
          }
        })
      }).on('error', (err) => {
        fs.unlink(dest)
        reject(new Error(err.message))
      })
    })    
  })
}

module.exports = downloadValidateExcel
