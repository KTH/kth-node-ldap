const ldap = require('ldapjs')
const log = require('kth-node-log')
const SearchResult = require('./search-result')
const FilterBase = require('../filters/filter-base')

let _isOk
let _msg

function Client (options) {
  if (!options) {
    throw new Error('options required')
  }

  if (!(this instanceof Client)) {
    return new Client(options)
  }

  this.options = options
}

Client.prototype.isOk = function () {
  return _isOk
}

Client.prototype.errorMsg = function () {
  return _msg
}

/**
 * Executes an ldap search, returns a {Promise<SearchResult>} to help process the response.
 * @param {string} base
 * @param {*} query
 * @returns {Promise<SearchResult>}
 */
Client.prototype.search = function (base, query) {
  try {
    const client = initClient(this.options)

    const q = {
      paged: {
        pagePause: true
      },
      ...(query && query.filter instanceof FilterBase && { filter: query.filter.build() }),
      ...query
    }

    return sendRequest(new Promise((resolve, reject) => {
      client.search(base, q, (err, res) => {
        if (err) {
          return reject(err)
        }

        resolve(new SearchResult(res))
      })
    }), client)
  } catch (e) {
    log.error('[KTH-NODE-LDAP] Could not create LDAP client in search', { err: e })
    throw e
  }
}

/**
 * searchOne returns a Promise which resolves to one result for a base and query.
 * @param {string} base
 * @param {*} query
 * @returns {Promise<LDAP USER JSON>}
 */
Client.prototype.searchOne = function (base, query) {
  try {
    const client = initClient(this.options)

    const q = {
      ...query,
      limit: 1
    }

    return sendRequest(new Promise((resolve, reject) => {
      client.search(base, q, (err, res) => {
        if (err) {
          return reject(err)
        }

        res.on('error', e => {
          log.error('[KTH-NODE-LDAP] Connection error in LDAP searchOne', { error: err })
          reject(e)
        })

        res.on('searchEntry', entry => {
          log.debug('[KTH-NODE-LDAP] Found entry for query', { query: query })
          resolve(entry.object)
        })

        res.on('end', result => {
          if (result.status !== 0) {
            log.error('[KTH-NODE-LDAP] Bad status code for LDAP', { result })
            reject(result)
          }

          resolve({})
        })
      })
    }), client)
  } catch (e) {
    log.error('[KTH-NODE-LDAP] Could not create LDAP client in search', { err: e })
    throw e
  }
}

/**
 * Bind events to ldap client
 * @param {string} eventName
 * @param {function} callback
 * @returns {undefined}
 */
Client.prototype.testSearch = function (options) {
  const opt = {
    scope: options.scope,
    filter: options.filter.replace(options.filterReplaceHolder, options.kthId),
    sizeLimits: options.sizeLimits,
    timeLimit: options.timeLimit
  }

  return new Promise((resolve, reject) => {
    log.debug(`[KTH-NODE-LDAP] Testing to search for user (${opt.filter})`)

    this.searchOne(options.base, opt).then(res => {
      if (res && Object.keys(res).length !== 0) {
        log.debug(`[KTH-NODE-LDAP] Could lookup user, found (${res.ugAliasUsername[0].replace('.', ' ')})`)
        _isOk = true
        _msg = undefined
      } else {
        log.debug(`[KTH-NODE-LDAP] Could not lookup user, did not find (${opt.filter})`)
        _isOk = false
        _msg = 'LDAP no user found'
      }

      log.debug(`[KTH-NODE-LDAP] Finsihed testSearch for user (${opt.filter})`)

      resolve({ isOk: _isOk, msg: _msg })
    })
    .catch(e => {
      log.error({ err: e }, `[KTH-NODE-LDAP] LDAP could not search for user (${opt.filter})`)
      _isOk = false
      _msg = 'LDAP could not search for user'

      reject(e)
    })
  })
}

function initClient (options) {
  const client = ldap.createClient(options)

  client.on('open', () => {
    log.debug('[KTH-NODE-LDAP] LDAP connection OPENED')
    _isOk = true
    _msg = undefined
  })

  client.on('connect', () => {
    log.debug('[KTH-NODE-LDAP] LDAP connection CONNECTED ')
    _isOk = true
    _msg = undefined
  })

  client.on('error', err => {
    if (err.code && (err.code.includes('RESET') || err.code.includes('TIMEDOUT'))) {
      client.connect()
      log.debug('[KTH-NODE-LDAP] LDAP connection reconnect requested')
    }

    if (('' + err).indexOf('InvalidCredentialsError') === 0) {
      log.info({ err: err }, '[KTH-NODE-LDAP] LDAP connection failed, bad credentials')
    } else {
      log.debug({ err: err }, '[KTH-NODE-LDAP] LDAP connection failed, but fear not, it will reconnect OK')
    }

    _isOk = false
    _msg = err
  })

  client.on('destroy', err => {
    log.debug({ err: err }, '[KTH-NODE-LDAP] LDAP connection destroyed')
    _isOk = false
    _msg = undefined
  })

  client.on('setupError', (err) => {
    log.debug({ err: err }, '[KTH-NODE-LDAP] LDAP connection failed during setup')
    _isOk = false
    _msg = 'LDAP connection failed during setup'
  })

  client.on('connectError', err => {
    log.debug({ err: err }, '[KTH-NODE-LDAP] LDAP connect error')
    _isOk = false
    _msg = 'LDAP connection error'
  })

  client.on('timeout', err => {
    log.debug({ err: err }, '[KTH-NODE-LDAP] LDAP timeout')
    _isOk = false
    _msg = 'LDAP timeout'
  })

  client.on('close', err => {
    log.debug({ err: err }, '[KTH-NODE-LDAP] LDAP closed')
    _isOk = false
    _msg = 'LDAP closed'
  })

  return client
}

/**
 * Helper function that close client when request is done
 *
 * @param {Promise} promise
 * @param {Client} client
 */
async function sendRequest (promise, client) {
  try {
    const res = await promise
    return Promise.resolve(res)
  } catch (e) {
    return Promise.reject(e)
  } finally {
    client.unbind()
  }
}

module.exports.createClient = Client

module.exports.test = {
  initClient
}
