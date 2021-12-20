# kth-node-ldap [![Build Status](https://travis-ci.org/KTH/kth-node-ldap.svg?branch=master)](https://travis-ci.org/KTH/kth-node-ldap)

Convenience library on top of the [ldapjs][ldapjs] client.
[ldapjs]: http://ldapjs.org/client.html

And now an alternative solution with ldapts is available. Set USE_LDAPTS environment variable and follow the code example for ldapts.
[ldapts]: github.com/ldapts/ldapts#readme

Note though that ldapts solution does not seem to return paged results. If you can assume that the result set might be large please do not use this or adapt your query so the result set is manageable.

## Code Example

It's highly recommended that you use [co][co] with this library.

[co]: https://www.npmjs.com/package/co

```javascript
var ldap = require('kth-node-ldap')
var co = require('co')

var client = ldap.createClient({
  // same configuration as the usual ldapjs client
  url: 'ldaps://ldap.example.com',
  bindDN: 'user@ldap.example.com',
  bindCredentials: 'secret',
})

// you can access the ldapjs client through client._client

// the library comes with helpers to build ldap filters:
var F = ldap.filters
var filter

// 1. match all entries with this exact memberOf value
filter = F.eq('memberOf', 'OU=users,DC=ldap,DC=example,DC=com')
// 2. or match all entries with a givenName starting with 'a', 'b', or 'c'
filter = F.orAll('givenName', ['a*', 'b*', 'c*'])
// 3. combine for more complex filters
filter = F.ne('givenName', 'f*').and(F.eq('familyName', 'g*'))

co(function* () {
  var res = yield client.search('DC=ldap,DC=example,DC=com', {
    scope: 'sub',
    attributes: ['givenName', 'familyName', 'updatedOn'],
    filter: filter,
    paged: {
      pageSize: 250,
      // pagePause will be forced to true
      // otherwise this library will not work
      pagePause: true,
    },
  })

  // access the ldapjs search result through res._res

  // res.each() will handle paging and more
  // all that's required is a function which returns a Promise
  // (co.wrap() does this for us)
  yield res.each(
    co.wrap(function* (entry) {
      // do something with entry
      var user = {
        givenName: entry.object.givenName,
        familyName: entry.object.familyName,
        // this library also provides a helper to convert dates
        // assuming updatedOn is a lexical utc date (e.g. '20160921123456.0Z')
        updatedOn: ldap.utils.toDate(entry.object.updatedOn),
      }

      // e.g. yield _saveToDb(user)

      // NOTE: if you do a bulk insert here, make sure you execute
      // the bulk every so often in case the search result contains
      // thousands of entries...
    })
  )

  client.close()
}).catch(function (err) {
  console.error(err)
  process.exit(1)
})
```

## Code Example LDAPTS

```
USE_LDAPTS=true
```

How to create client connection object and re-export relevant methods. In this example the file is named ldapImportClient.js

```javascript
const { createClient, search, searchOne } = require('kth-node-ldap')
const config = require('../configuration').server
const log = require('@kth/log')

// ldap client is used to find users and need to be exposed
const ldapClient = createClient({
  url: config.ldap.uri,
  timeout: 30 * 60 * 1000,
  connectTimeout: config.ldap.connecttimeout,
  maxConnections: config.ldap.maxconnections,
  bindDN: config.ldap.username,
  bindCredentials: config.ldap.password,
  checkInterval: config.ldap.checkinterval,
  maxIdleTime: config.ldap.maxidletime,
  reconnectOnIdle: config.ldap.reconnectOnIdle,
  reconnectTime: config.ldap.reconnectTime,
  reconnect: true,
})
module.exports = {
  ldapClient,
  ldapSearch: search,
  ldapSearchOne: searchOne,
  useLdapTs: config.useLdapTs === 'true',
}
```

Using the client above, perform the search

```javascript
const { ldapClient, ldapSearch, ldapSearchOne, useLdapTs } = require('./ldapImportClient')
...
// If the feature flag should be used,
// wrap the usage with if (useLdapTs) {...}

// Get all users changed since 2020-03-01
try {
  const base = 'DC=ldap,DC=example,DC=com'
  const since = '20200301000000.0Z'
  const query = {
    scope: 'sub',
    attributes: ['givenName', 'familyName', 'updatedOn'],
    filter: `(&(whenChanged>=${since}))`,
  }

  const usersArray = await ldapSearch(ldapClient, base, query)
  for (const user of usersArray) {
        // Do what you have to do..
  }
} catch (err) {
  log.error('Could not query LDAP ', { err: e })
}

// Find a single user
try {
  const base = 'DC=ldap,DC=example,DC=com'
  const username = 'paddy'
  const query = {
    scope: 'sub',
    attributes: ['givenName', 'familyName', 'updatedOn'],
    filter: '(&(ugUsername=${username}))',
  }

  const user = await ldapSearchOne(ldapClient, base, query)

  // Do what you have to do..

} catch (err) {
  log.error('Could not query LDAP ', { err: e })
}


```
