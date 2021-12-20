/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */

const ldap = require('ldapjs')
const log = require('@kth/log')
const SearchResult = require('./search-result')
const FilterBase = require('../filters/filter-base')

let _isOk
let _msg

function Client(options) {
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
        pagePause: true,
      },
      ...(query && query.filter instanceof FilterBase && { filter: query.filter.build() }),
      ...query,
    }

    return new Promise((resolve, reject) => {
      client.search(base, q, (err, res) => {
        if (err) {
          return reject(err)
        }

        resolve(new SearchResult(res, client))
      })
    })
  } catch (e) {
    log.error('kth-node-ldap: Could not create LDAP client in search', {
      err: e,
    })
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
      limit: 1,
    }

    return sendRequest(
      new Promise((resolve, reject) => {
        client.search(base, q, (err, res) => {
          if (err) {
            return reject(err)
          }

          res.on('error', e => {
            log.error('kth-node-ldap: Connection error in LDAP searchOne', {
              error: e,
            })
            reject(e)
          })

          res.on('searchEntry', entry => {
            log.debug('kth-node-ldap: Found entry for query', { query: query })
            resolve(entry.object)
          })

          res.on('end', result => {
            if (result.status !== 0) {
              log.error('kth-node-ldap: Bad status code for LDAP', { result })
              reject(result)
            }

            resolve({})
          })
        })
      }),
      client
    )
  } catch (e) {
    log.error('kth-node-ldap: Could not create LDAP client in searchOne', {
      err: e,
    })
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
    timeLimit: options.timeLimit,
  }

  return new Promise((resolve, reject) => {
    log.debug(`kth-node-ldap: Testing to search for user (${opt.filter})`)

    this.searchOne(options.base, opt)
      .then(res => {
        if (res && Object.keys(res).length !== 0) {
          log.debug(`kth-node-ldap: Could lookup user, found (${res.ugAliasUsername[0].replace('.', ' ')})`)
          _isOk = true
          _msg = undefined
        } else {
          log.debug(`kth-node-ldap: Could not lookup user, did not find (${opt.filter})`)
          _isOk = false
          _msg = 'LDAP no user found'
        }

        log.debug(`kth-node-ldap: Finsihed testSearch for user (${opt.filter})`)

        resolve({ isOk: _isOk, msg: _msg })
      })
      .catch(e => {
        log.error({ err: e }, `kth-node-ldap: LDAP could not search for user (${opt.filter})`)
        _isOk = false
        _msg = 'LDAP could not search for user'

        reject(e)
      })
  })
}

function initClient(options) {
  const client = ldap.createClient(options)

  client.on('open', () => {
    log.debug('kth-node-ldap: LDAP connection OPENED')
    _isOk = true
    _msg = undefined
  })

  client.on('connect', () => {
    log.debug('kth-node-ldap: LDAP connection CONNECTED ')
    _isOk = true
    _msg = undefined
  })

  client.on('error', err => {
    try {
      if (err.toString().includes('RESET') || err.toString().includes('TIMEDOUT')) {
        client.connect()
        log.debug('kth-node-ldap: LDAP connection reconnect requested')
      }
    } catch (e) {
      log.error('Could not execute toString on error', { err })
    }

    if (('' + err).indexOf('InvalidCredentialsError') === 0) {
      log.error('kth-node-ldap: LDAP connection failed, bad credentials')
    } else {
      log.debug('kth-node-ldap: LDAP connection failed, but fear not, it will reconnect OK')
    }

    _isOk = false
    _msg = err
  })

  client.on('destroy', () => {
    log.debug('kth-node-ldap: LDAP connection destroyed')
    _isOk = false
    _msg = undefined
  })

  client.on('setupError', () => {
    log.error('kth-node-ldap: LDAP connection failed during setup')
    _isOk = false
    _msg = 'LDAP connection failed during setup'
  })

  client.on('connectError', () => {
    log.error('kth-node-ldap: LDAP connect error')
    _isOk = false
    _msg = 'LDAP connection error'
  })

  client.on('connectionError', () => {
    log.error('kth-node-ldap: LDAP connection error')
    _isOk = false
    _msg = 'LDAP connection error'
  })

  client.on('timeout', () => {
    log.error('kth-node-ldap: LDAP timeout')
    _isOk = false
    _msg = 'LDAP timeout'
  })

  client.on('close', () => {
    log.debug('kth-node-ldap: LDAP closed')
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

module.exports.createClient = Client

module.exports.test = {
  initClient,
}
