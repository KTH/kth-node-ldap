# kth-node-ldap

Convenience library on top of the [ldapts](https://www.npmjs.com/package/ldapts) client.

## Code Example LDAPTS

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
  bindDN: config.ldap.username,
  bindCredentials: config.ldap.password,
})
module.exports = {
  ldapClient,
  ldapSearch: search,
  ldapSearchOne: searchOne,
}
```

Using the client above, perform the search

```javascript
const { ldapClient, ldapSearch, ldapSearchOne } = require('./ldapImportClient')

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
