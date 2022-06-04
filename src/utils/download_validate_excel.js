const https = require('https')
const fs = require('fs')
const validateExcel = require('../scripts/validate_excel')

const downloadValidateExcel = async (url, dest = 'sample.xlsx', regionName) => {
  return new Promise ((resolve, reject) => {
    const file = fs.createWriteStream(dest)

    https.get(url, (res) => {
      res.pipe(file)
  
      file.on('finish', () => {
        file.close(async () => {
          try {
            let extracted = []
            extracted = await validateExcel(dest, regionName)

            if (extracted.length > 0) {
              console.log(`[${dest}] download complete`)  
              resolve(extracted)
            } else {
              reject(new Error('Failed to extract data from rows.'))
            }
          } catch (err) {
            reject(new Error(err.message))
          }

          fs.unlink(dest, (err) => {
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
