var CompoundFilterBase = require('./compound-filter-base')
var OrFilter = require('./or-filter')
var util = require('util')

/**
 * A compound 'and' filter.
 * @constructor
 */
function AndFilter () {
  CompoundFilterBase.apply(this, arguments)
}
util.inherits(AndFilter, CompoundFilterBase)

AndFilter.prototype.build = function () {
  return `(&${this.filters})`
}

AndFilter.prototype.or = function (filter) {
  return new OrFilter(this.filters, filter)
}

AndFilter.prototype.and = function (filter) {
  return new AndFilter(this.filters, filter)
}

module.exports = AndFilter
