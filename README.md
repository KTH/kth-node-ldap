# kth-node-ldap [![Build Status](https://travis-ci.org/KTH/kth-node-ldap.svg?branch=master)](https://travis-ci.org/KTH/kth-node-ldap)

Convenience library on top of the [ldapjs][ldapjs] client.

[ldapjs]: http://ldapjs.org/client.html

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
  bindCredentials: 'secret'
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
filter = F.ne('givenName', 'f*')
  .and(F.eq('familyName', 'g*'))

co(function * () {
  var res = yield client.search('DC=ldap,DC=example,DC=com', {
    scope: 'sub',
    attributes: [ 'givenName', 'familyName', 'updatedOn' ],
    filter: filter,
    paged: {
      pageSize: 250,
      // pagePause will be forced to true
      // otherwise this library will not work
      pagePause: true
    }
  })
  
  // access the ldapjs search result through res._res
  
  // res.each() will handle paging and more
  // all that's required is a function which returns a Promise
  // (co.wrap() does this for us)
  yield res.each(co.wrap(function * (entry) {
    // do something with entry
    var user = {
      givenName: entry.object.givenName,
      familyName: entry.object.familyName,
      // this library also provides a helper to convert dates
      // assuming updatedOn is a lexical utc date (e.g. '20160921123456.0Z')
      updatedOn: ldap.utils.toDate(entry.object.updatedOn)
    }
    
    // e.g. yield _saveToDb(user)
    
    // NOTE: if you do a bulk insert here, make sure you execute
    // the bulk every so often in case the search result contains
    // thousands of entries...
  }))
  
  client.close()
}).catch(function (err) {
  console.error(err)
  process.exit(1)
})
```
