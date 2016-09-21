var ldap = require('ldapjs')
var SearchResult = require('./search-result')
var FilterBase = require('../filters/filter-base')

/**
 * Adapter for the ldapjs client.
 * @param {*} options
 * @returns {Client}
 * @constructor
 */
function Client (options) {
  if (!(this instanceof Client)) {
    return new Client(options)
  }
  this._client = ldap.createClient(options)
}

/**
 * Executes an ldap search, returns a {Promise<SearchResult>} to help process the response.
 * @param {string} base
 * @param {*} query
 * @returns {Promise<SearchResult>}
 */
Client.prototype.search = function (base, query) {
  var client = this._client
  query = query || {}

  if (!query.paged) {
    query.paged = {
      pagePause: true
    }
  } else if (!query.paged.pagePause) {
    query.paged.pagePause = true
  }

  if (query.filter instanceof FilterBase) {
    query.filter = query.filter.build()
  }

  return new Promise(function (resolve, reject) {
    client.search(base, query, function (err, res) {
      if (err) {
        return reject(err)
      }

      resolve(new SearchResult(res))
    })
  })
}

/**
 * Calls unbind and clears the client reference.
 */
Client.prototype.close = function () {
  this._client.unbind()
  this._client = null
}

module.exports = Client
