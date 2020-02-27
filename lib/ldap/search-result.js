/* eslint-disable no-var */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable consistent-return */

var async = require('async')

/**
 * Adapter for the ldapjs client search response.
 * @param {*} res - ldapjs client search response
 * @constructor
 */
function SearchResult(res, client) {
  this._res = res
  this._client = client
}

/**
 * Process each search result entry, resolves to the number of entries.
 * @param {Function} iterator - a function that takes an entry and returns a promise
 * @returns {Promise<number>}
 */
SearchResult.prototype.each = function(iterator) {
  var res = this._res
  delete this._res

  return sendRequest(
    new Promise(function(resolve, reject) {
      var entries = []
      var count = 0

      res.once('error', function(err) {
        res.removeAllListeners('searchEntry')
        res.removeAllListeners('page')
        res = null
        entries = []
        reject(err)
      })

      res.on('searchEntry', function(entry) {
        entries.push(entry.object)
      })

      res.on('page', function(result, done) {
        async.eachSeries(
          entries,
          function(entry, done) {
            iterator(entry)
              .then(function() {
                done()
              })
              .catch(done)
          },
          function(err) {
            if (err) {
              return reject(err)
            }

            count += entries.length
            entries = []

            if (typeof done === 'function') {
              done()
            } else {
              resolve(count)
            }
          }
        )
      })
    }),
    this._client
  )
}

/**
 * Helper function that close client when request is done
 *
 * @param {Promise} promise
 * @param {Client} client
 */
async function sendRequest(promise, client) {
  try {
    const res = await promise
    return Promise.resolve(res)
  } catch (e) {
    return Promise.reject(e)
  } finally {
    await client.unbind()
  }
}

module.exports = SearchResult
