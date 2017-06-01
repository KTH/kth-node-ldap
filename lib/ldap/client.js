const log = require('kth-node-log')
var ldap = require('ldapjs')
var SearchResult = require('./search-result')
var FilterBase = require('../filters/filter-base')

var _isOk
function _initEvents () {
  this.on('open', function () {
    log.debug('LDAP connection OPENED')
    _isOk = true
  })

  this.on('connect', function () {
    log.debug('LDAP connection CONNECTED ')
    _isOk = true
  })

  this.on('error', function (err) {
    if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
      this.connect()
      log.debug('LDAP connection reconnect requested')
    }

    if (('' + err).indexOf('InvalidCredentialsError') === 0) {
      log.info({ err: err }, 'LDAP connection failed, bad credentials')
    } else {
      log.debug({ err: err }, 'LDAP connection failed, but fear not, it will reconnect OK')
    }

    _isOk = false
  })

  this.on('destroy', function (err) {
    log.debug({ err: err }, 'LDAP connection destroyed')
    _isOk = false
  })

  this.on('setupError', function (err) {
    log.debug({ err: err }, 'LDAP connection failed during setup')
    _isOk = false
  })

  this.on('connectError', function (err) {
    log.debug({ err: err }, 'LDAP connect error')
    _isOk = false
  })

  this.on('timeout', function (err) {
    _isOk = false
    log.debug({ err: err }, 'LDAP timeout')
  })

  this.on('close', function (err) {
    _isOk = false
    log.debug({ err: err }, 'LDAP closed')
  })
}

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
  _initEvents.call(this._client)
}

/**
 * Bind events to ldap client
 * @param {string} eventName
 * @param {function} callback
 * @returns {undefined}
 */
Client.prototype.on = function (eventName, callback) {
  this._client.on(eventName, callback)
}

/**
 * Bind events to ldap client
 * @param {string} eventName
 * @param {function} callback
 * @returns {undefined}
 */
Client.prototype.isOk = function () {
  return _isOk
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
 * searchOne returns a Promise which resolves to one result for a base and query.
 * @param {string} base
 * @param {*} query
 * @returns {Promise<LDAP USER JSON>}
 */
Client.prototype.searchOne = function (base, query) {
  var client = this._client
  query = query || {}
  query.limit = 1
  return new Promise((resolve, reject) => {
    client.search(base, query, function (err, res) {
      if (err) reject(err)
      res.on('error', function (err) {
        log.error('Connection error in LDAP searchOne', { error: err })
        reject(err)
      })
      res.on('searchEntry', function (entry) {
        log.debug('Found entry for query', { query: query })
        resolve(entry.object)
      })
      res.on('end', function (result) {
        if (result.status !== 0) {
          log.error('Bad status code for LDAP', { result: result })
          reject(result)
        }
        resolve({})
      })
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
