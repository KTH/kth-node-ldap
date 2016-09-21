var FilterBase = require('./filter-base')
var util = require('util')

/**
 * Compound filter that combines multiple other filters.
 * @constructor
 */
function CompoundFilterBase () {
  FilterBase.call(this)
  this.filters = Array.prototype.reduce.call(arguments, function (out, filter) {
    out += filter.toString()
    return out
  }, '')
}
util.inherits(CompoundFilterBase, FilterBase)

module.exports = CompoundFilterBase
