var FilterBase = require('./filter-base')
var OrFilter = require('./or-filter')
var AndFilter = require('./and-filter')
var util = require('util')

/**
 * A placeholder filter that builds into an empty string.
 * This assumes the raw text is a correct ldap filter and
 * does not validate it!
 * @constructor
 */
function RawFilter (text) {
  FilterBase.call(this)
  this.text = text
}
util.inherits(RawFilter, FilterBase)

RawFilter.prototype.build = function () {
  return this.text
}

RawFilter.prototype.or = function (filter) {
  return new OrFilter(this, filter)
}

RawFilter.prototype.and = function (filter) {
  return new AndFilter(this, filter)
}

module.exports = RawFilter
