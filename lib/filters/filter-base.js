/**
 * Acts as a base for all filters. Implementations are required to
 * implement the 'build', 'and', and 'or' methods.
 * @interface
 */
function FilterBase () {}

/**
 * Simply calls 'build' for convenience.
 * @returns {string}
 */
FilterBase.prototype.toString = function () {
  return this.build()
}

/**
 * Builds the filter into a string that can be used in an LDAP search.
 * @returns {string}
 */
FilterBase.prototype.build = function () {
  throw new Error('Not implemented')
}

/**
 * Combines this filter with the param and returns an 'and' filter.
 * @param {FilterBase} filter
 * @returns {FilterBase}
 */
FilterBase.prototype.and = function (filter) {
  throw new Error('Not implemented')
}

/**
 * Combines this filter with the param and returns an 'or' filter.
 * @param {FilterBase} filter
 * @returns {FilterBase}
 */
FilterBase.prototype.or = function (filter) {
  throw new Error('Not implemented')
}

module.exports = FilterBase
