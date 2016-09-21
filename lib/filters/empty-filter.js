var FilterBase = require('./filter-base')
var util = require('util')

/**
 * A placeholder filter that builds into an empty string.
 * @constructor
 */
function EmptyFilter () {
  FilterBase.call(this)
}
util.inherits(EmptyFilter, FilterBase)

EmptyFilter.prototype.build = function () {
  return ''
}

EmptyFilter.prototype.or = function (filter) {
  return filter
}

EmptyFilter.prototype.and = function (filter) {
  return filter
}

module.exports = EmptyFilter
