var CompoundFilterBase = require('./compound-filter-base')
var AndFilter = require('./and-filter')
var util = require('util')

/**
 * A compound 'or' filter.
 * @constructor
 */
function OrFilter () {
  CompoundFilterBase.apply(this, arguments)
}
util.inherits(OrFilter, CompoundFilterBase)

OrFilter.prototype.build = function () {
  return `(|${this.filters})`
}

OrFilter.prototype.or = function (filter) {
  return new OrFilter(this.filters, filter)
}

OrFilter.prototype.and = function (filter) {
  return new AndFilter(this.filters, filter)
}

module.exports = OrFilter
