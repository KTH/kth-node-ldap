const { Client } = require('ldapts')
const { InvalidCredentialsError } = require('ldapts/errors')
const NodeLog = require('@kth/log')
const FilterBase = require('../filters/filter-base')

// This is default value from kth-node-configuration
// Copied for now to avoid introducing new dependency
const ldapDefaults = {
  connectTimeout: 3000, // ms
  timeout: 3000, // ms
  strictDN: true,
  tlsOptions: {
    minVersion: 'TLSv1.2',
  },
}

//
// Utility function:
// Remove attributes if the value returned is an empty array
//
//
const removeEmptyArrays = entries => {
  for (const entry of entries) {
    for (const attr in entry) {
      if (Array.isArray(entry[attr]) && entry[attr].length === 0) {
        delete entry[attr]
      }
    }
  }
}
/**
 * Executes an ldap search
 * @param {client, options}  object returned by createClient
 * @param {string} base
 * @param {*} query
 * @returns an array of result entries
 */
const search = async ({ client, options }, base, query) => {
  const log = options.log || NodeLog || console
  try {
    const { bindDN, bindCredentials } = options

    await client.bind(bindDN, bindCredentials)

    // Note size limit and paging seem not to have any effect on with ldapts + KTH AD..?!
    const searchQuery = {
      paged: {
        pageSize: 1000,
        pagePause: true,
      },
      ...(query && query.filter instanceof FilterBase && { filter: query.filter.build() }),
      ...query,
    }

    const { searchEntries } = await client.search(base, searchQuery)

    if (searchEntries && searchEntries.length >= 1) {
      log.debug(`search returning ${searchEntries.length} ${JSON.stringify(searchEntries[0])}`)
      removeEmptyArrays(searchEntries)
      return searchEntries
    }
    log.debug(`kth-node-ldap.search: nothing  found to return `)

    return []
  } catch (err) {
    log.error(`kth-node-ldap.search: Failed to search `, { err })
    throw err
  } finally {
    await client.unbind()
  }
}

/**
 * searchOne returns an entry based on search with base and query.
 * @param {client, options}  object returned by createClient 
 * @param {string} base
 * @param {*} query
 * @returns {LDAP USER JSON}
 
 */
const searchOne = async ({ client, options }, base, query) => {
  const log = options.log || NodeLog || console
  try {
    const { bindDN, bindCredentials } = options

    await client.bind(bindDN, bindCredentials)
    const searchQuery = {
      ...query,
      sizeLimits: 1,
    }

    const { searchEntries } = await client.search(base, searchQuery)

    if (searchEntries && searchEntries.length === 1) {
      removeEmptyArrays(searchEntries)
      return searchEntries[0]
    }
    log.debug(`kth-node-ldap.searchOne: nothing found to return `)
    return null
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      throw new InvalidCredentialsError()
    }
    log.error(`kth-node-ldap.searchOne: Failed to search `, { err })

    throw err
  } finally {
    await client.unbind()
  }
}

function initClient(options) {
  if (!options) {
    throw new Error('No options given')
  }
  if (!options.url) {
    throw new Error('No url to LDAP server is given')
  }
  const log = options.log || NodeLog || console

  try {
    const ldapOptions = Object.assign(ldapDefaults, {
      url: options.url,
      timeout: options.timeout,
      connectTimeout: options.connectTimeout,
    })
    const client = new Client(ldapOptions)

    return { client, options }
  } catch (err) {
    log.error(`kth-node-ldap.initClient: Failed to create client`, { err })
    throw err
  }
}

module.exports = {
  createClient: initClient,
  searchOne,
  search,
}
