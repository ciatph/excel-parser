const https = require('https')
const fs = require('fs')
const path = require('path')
const validateExcel = require('../scripts/validate_excel')
const { DOWNLOAD_DIR } = require('../utils/constants')

const downloadValidateExcel = async ({ url, storagePath, dest = 'sample.xlsx', ExcelDefinition, tocsv = false }) => {
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

          fs.unlink(filePath, (err) => {
            if (err) console.log(err)
            else console.log(`Deleted temp file ${dest}\n`)
          })
        })
      }).on('error', (err) => {
        fs.unlink(dest)
        reject(new Error(err.message))
      })
    })    
  })
}

module.exports = downloadValidateExcel
