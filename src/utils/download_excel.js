const https = require('https')
const fs = require('fs')

const downloadExcel = async (url, dest = 'sample.xlsx', regionName, cb, municipalities = []) => {
  const file = fs.createWriteStream(dest)

  https.get(url, (res) => {
    res.pipe(file)

    file.on('finish', () => {
      // close() is async, call cb after close completes.
      file.close(cb(dest, regionName, municipalities))
      console.log(`[${dest}] download complete`)
    }).on('error', (err) => {
      // Delete the file async. (But we don't check the result)
      fs.unlink(dest)
      if (cb) {
        cb(err.message)
      }
    })
  })
}

module.exports = downloadExcel
