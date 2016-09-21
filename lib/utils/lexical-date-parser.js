var assert = require('assert')

/**
 * Converts an UTC lexical date string to a date instance.
 * @param {string} value
 * @returns {Date}
 */
function toDate (value) {
  assert.ok(typeof value === 'string')
  assert.ok(_rgx.test(value))

  var matches = value.match(_rgx)

  return new Date(Date.UTC(
    parseInt(matches[ 1 ], 10),
    parseInt(matches[ 2 ], 10) - 1,
    parseInt(matches[ 3 ], 10),
    parseInt(matches[ 4 ], 10),
    parseInt(matches[ 5 ], 10),
    parseInt(matches[ 6 ], 10),
    _parseMS(matches[ 7 ])
  ))
}

/**
 * Converts a date instance to an UTC lexical date string.
 * @param {Date} date
 * @returns {string}
 */
function fromDate (date) {
  assert.ok(date instanceof Date)
  return date.getUTCFullYear() +
    _zeroPad(date.getUTCMonth() + 1) +
    _zeroPad(date.getUTCDate()) +
    _zeroPad(date.getUTCHours()) +
    _zeroPad(date.getUTCMinutes()) +
    _zeroPad(date.getUTCSeconds()) +
    '.0Z'
}

/**
 * Left-pads an integer less than 10 (ten) with a 0 (zero).
 * @param {number} num
 * @returns {string}
 * @private
 */
function _zeroPad (num) {
  if (num < 10) {
    return '0' + num
  }

  return String(num)
}

/**
 * Regular expression to match a lexical UTC date.
 * @type {RegExp}
 * @private
 */
var _rgx = /^([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})\.([0-9]+)[zZ]$/

/**
 * Parses the millisecond value to ensure it's correctness.
 * @param {string} ms
 * @returns {number}
 * @private
 */
function _parseMS (ms) {
  while (ms.length < 3) {
    ms += '0'
  }

  if (ms.length > 3) {
    ms = ms.substr(0, 3)
  }

  return parseInt(ms, 10)
}

module.exports = {
  toDate: toDate,
  fromDate: fromDate
}
