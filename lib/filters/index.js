var AttributeFilter = require('./attribute-filter')
var OrFilter = require('./or-filter')
var AndFilter = require('./and-filter')
var EmptyFilter = require('./empty-filter')

module.exports = {
  /**
   * @see {AttributeFilter}
   */
  AttributeFilter: AttributeFilter,

  /**
   * Convenience method to create an 'equal' filter.
   * @see {AttributeFilter.eq}
   * @function
   */
  eq: AttributeFilter.eq,

  /**
   * Convenience method to create an 'not equal' filter.
   * @see {AttributeFilter.ne}
   * @function
   */
  ne: AttributeFilter.ne,

  /**
   * Convenience method to create an 'greater than or equal to' filter.
   * @see {AttributeFilter.gt}
   * @function
   */
  gt: AttributeFilter.gt,

  /**
   * Convenience method to create an 'lesser than or equal to' filter.
   * @see {AttributeFilter.lt}
   * @function
   */
  lt: AttributeFilter.lt,

  /**
   * @see {OrFilter}
   */
  OrFilter: OrFilter,

  /**
   * @see {AndFilter}
   */
  AndFilter: AndFilter,

  /**
   * Convenience method to create an 'or-equal' filter for a single attribute.
   * @param {string} attribute
   * @param {string[]} values
   * @returns {OrFilter}
   */
  orAll: function (attribute, values) {
    return values.reduce(function (filter, value) {
      return filter.or(AttributeFilter.eq(attribute, value))
    }, new EmptyFilter())
  },

  /**
   * Convenience method to create an 'and-equal' filter for a single attribute.
   * @param {string} attribute
   * @param {string[]} values
   * @returns {OrFilter}
   */
  andAll: function (attribute, values) {
    return values.reduce(function (filter, value) {
      return filter.and(AttributeFilter.eq(attribute, value))
    }, new EmptyFilter())
  },

  /**
   * The 'empty' filter.
   */
  empty: new EmptyFilter()
}
