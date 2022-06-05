const { PROVINCES } = require('./constants')

class TenDayExcel {
  /**
   * Set the CSV's target region and provinces
   * @param {String} regionName - region name
   * @param {String[]} provinces - (Optional) provinces under the the specified region
   *    No need to include this parameter if the target region's provinces
   *    is already defined in the PROVINCES constant 
   */
  constructor ({ regionName, provinces, municipalities }) {
    if (regionName === undefined) {
      throw new Error('Missing parameter/s.')
    }

    if (provinces === undefined && PROVINCES[regionName] === undefined) {
      throw new Error('Must define province list.') 
    }    

    this.region = regionName

    this.provinces = (provinces !== undefined) 
      ? provinces
      : PROVINCES[regionName]

  // Target column keys as defined in the converted JSON excel spreadsheet and their local names
  this.columns = {
    __EMPTY: 'location',
    __EMPTY_1: 'tmin',
    __EMPTY_2: 'tmax',
    __EMPTY_3: 'tmean',
    __EMPTY_5: 'rainfall',
    __EMPTY_6: 'cover',
    __EMPTY_7: 'humidity',
    __EMPTY_8: 'wspeed',
    // __EMPTY_9 or CLIMPS-FF-1 = wind direction
    }    
  }

  /**
   * All columns (keys) exists in a row
   * @param {Object} row - Excel row converted to Object
   * @returns {Boolean} true - all defined columns exist in a row
   * @throws {Error} - Missing Excel key and local key value 
   */
  allColumnsExist (row) {
    for (let key in this.columns) {
      if (row[key] === undefined) {
        throw new Error(`Missing column ${key} - ${this.columns[key]}`)
      }
    }

    return true
  }

  /**
   * Get the forecast date
   * @param {String} string - String from a row on where to extract the forecast date
   * @returns {String} Forecast date
   * @throws {Error} - Missing FORECAST DATE
   */
  getForecastDate (string) {
    if (!string.toString().includes('FORECAST DATE')) {
      throw new Error('Missing FORECAST DATE keyword')
    }
  
    return string.substr(string.indexOf(':') + 2, string.length)    
  }

  /**
   * Get the day weather forecast's date range validity period from a string
   * Patterns include:
   * If 10 days fall within a month: "June 01-10, 2022"
   * If 10 days span across (2) months: "May 30 - June 8, 2022"
   * @param {String} string - String on where to extract the date range
   * @returns {String} Date range validity period
   * @throws {Error} Missing date range keywords if certain keywords are not found on the input string
   */
  getDateRange (string) {
    const rtemp = string.replace('–', '-')
    if (!rtemp.includes('Valid') && !rtemp.includes('-')) {
      throw new Error('Missing date range keywords')
    }
  
    // TO-DO: Include pattern parsing
    return rtemp.replace('Valid :', '').trim()
  }

  /**
   * Get the province where a municipality belongs to
   * @param {String} municipality - Municipality name
   * @returns {String} Province name
   * @returns {undefined} Returns undefined if the municipality is not associated
   *    with any of the defined provinces
   */
  getProvince (municipality) {
    return this.provinces.find(y => municipality.toString().includes(y))
  }

  /**
   * Extract the municipality name from a string following the pattern
   *    "municipalityName (provinceName)"
   * @param {String} rawString - Unprocessed string
   * @param {String} provinceName - Province name to remove from rawString
   */
  getMunicipalityName (rawString, provinceName) {
    return rawString.toString().split(`(${provinceName})`)[0].trim()
  }

  /**
   * Check if a value is a Number
   * @param {String|Number} value - String or Number value
   * @returns {Bool}
   */
  isNumber (value) {
    return !isNaN(value)
  }

  /**
   * Check if a value is a String
   * @param {String} value - String value
   * @returns {Bool}
   */
  isString (value) {
    return typeof value === typeof 'sample string'
  }

  /**
   * Check if an excel row cells (keys) contains the expected types
   * @param {Object} row - Excel row converted to Object
   * @returns {Bool}
   * @throws {Error} Cell is not a valid Number|String type
   */
  isValidRowTypes (row) {
    for (let key in this.columns) {
      switch (key) {
        case '__EMPTY_1':
        case '__EMPTY_2':
        case '__EMPTY_3':
        case '__EMPTY_7':
        case '__EMPTY_8':
          if (!this.isNumber(row[key])) {
            throw new Error(`Cell ${key} (${this.columns[key]}) is not a Number`)
          }
          break
        case '__EMPTY_5':
        case '__EMPTY_6':
        case '__EMPTY_9':
        case 'CLIMPS-FF-1':
          if (!this.isString(row[key])) {
            throw new Error(`Cell ${key} (${this.columns[key]}) is not a String`)
          }
          break
        default: break
      }
    }

    return true
  }

  /**
   * Extract and format relevant data from a row (Object)
   * @param {Object} row - Excel row converted to Object
   * @param {String} provinceName - Name of province
   * @returns {Object} { province, municipality, tmin, tmax, tmin, rainfall, cover, humidity, wspeed, wdirection }
   * @throws {Error} Errors that may be encountered while parsing a row
   */
  getData (row, provinceName) {
    let obj

    try {
      obj = {
        province: provinceName,
        municipality: this.getMunicipalityName(row.__EMPTY, provinceName),
        tmin: row.__EMPTY_1,
        tmax: row.__EMPTY_2,
        tmean: row.__EMPTY_3,
        rainfall: row.__EMPTY_5,
        cover: row.__EMPTY_6,
        humidity: row.__EMPTY_7,
        wspeed: row.__EMPTY_8,
        wdirection: row.__EMPTY_9 ? row.__EMPTY_9 : row['CLIMPS-FF-1'],
      }

      return obj
    } catch (err) {
      throw new Error(err.message)
    }
  }
}

module.exports = TenDayExcel
