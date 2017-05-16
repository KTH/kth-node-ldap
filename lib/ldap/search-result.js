var async = require('async')

/**
 * Adapter for the ldapjs client search response.
 * @param {*} res - ldapjs client search response
 * @constructor
 */
function SearchResult (res) {
  this._res = res
}

/**
 * Process each search result entry, resolves to the number of entries.
 * @param {Function} iterator - a function that takes an entry and returns a promise
 * @returns {Promise<number>}
 */
SearchResult.prototype.each = function (iterator) {
  var res = this._res
  delete this._res

  return new Promise(function (resolve, reject) {
    var entries = []
    var count = 0

    res.once('error', function (err) {
      res.removeAllListeners('searchEntry')
      res.removeAllListeners('page')
      res = null
      entries = []
      reject(err)
    })

    res.on('searchEntry', function (entry) {
      entries.push(entry.object)
    })

    res.on('page', function (result, done) {
      async.eachSeries(entries, function (entry, done) {
        iterator(entry)
          .then(function () {
            done()
          })
          .catch(done)
      }, function (err) {
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
      })
    })
  })
}

module.exports = SearchResult
