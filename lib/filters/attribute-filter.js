var FilterBase = require('./filter-base')
var AndFilter = require('./and-filter')
var OrFilter = require('./or-filter')
var assert = require('assert')
var util = require('util')

/**
 * An attribute filter that can be used on its own or combined with
 * other filters.
 * @param {string} attribute
 * @param {string} value
 * @param {string} operator
 * @param {boolean} [inverse=false]
 * @constructor
 */
function AttributeFilter (attribute, value, operator, inverse) {
  FilterBase.call(this)
  assert.ok(attribute !== undefined)
  assert.ok(value !== undefined)
  assert.ok(operator === '=' || operator === '<=' || operator === '>=')
  this.attribute = attribute
  this.value = value
  this.operator = operator
  this.inverse = !!inverse
}
util.inherits(AttributeFilter, FilterBase)

AttributeFilter.prototype.build = function () {
  var out = '(' + this.attribute + this.operator + this.value + ')'
  if (this.inverse) {
    out = '(!' + out + ')'
  }
  return out
}

AttributeFilter.prototype.or = function (filter) {
  return new OrFilter(this, filter)
}

AttributeFilter.prototype.and = function (filter) {
  return new AndFilter(this, filter)
}

/**
 * Creates an 'equal' attribute filter.
 * @param {string} attribute
 * @param {string} value
 * @returns {AttributeFilter}
 */
AttributeFilter.eq = function (attribute, value) {
  return new AttributeFilter(attribute, value, '=')
}

/**
 * Creates a 'not equal' attribute filter.
 * @param {string} attribute
 * @param {string} value
 * @returns {AttributeFilter}
 */
AttributeFilter.ne = function (attribute, value) {
  return new AttributeFilter(attribute, value, '=', true)
}

/**
 * Creates an 'lesser than or equal to' attribute filter.
 * @param {string} attribute
 * @param {string} value
 * @returns {AttributeFilter}
 */
AttributeFilter.lt = function (attribute, value) {
  return new AttributeFilter(attribute, value, '<=')
}

/**
 * Creates an 'greater than or equal to' attribute filter.
 * @param {string} attribute
 * @param {string} value
 * @returns {AttributeFilter}
 */
AttributeFilter.gt = function (attribute, value) {
  return new AttributeFilter(attribute, value, '>=')
}

module.exports = AttributeFilter
