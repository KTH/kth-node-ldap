var test = require('tape')
var getGroups = require('../lib/utils/getGroups')

const ldapUserWithEmptyGroups = { memberOf: undefined }
const ldapUserWithOneGroup = { memberOf: 'CN=app.testapp.user,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se' }
const ldapUserWithTwoGroups = { memberOf: ['CN=app.testapp.user,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se', 'CN=app.testapp.teacher,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se'] }

test('getGroupFromUserWithOneGroup', function (t) {
  t.plan(2)
  t.equal(getGroups(ldapUserWithOneGroup).length, 1)
  t.equal(getGroups(ldapUserWithOneGroup)[0], 'app.testapp.user')
})

test('getGroupFromUserWithTwoGroups', function (t) {
  t.plan(3)
  t.equal(getGroups(ldapUserWithTwoGroups).length, 2)
  t.equal(getGroups(ldapUserWithTwoGroups)[0], 'app.testapp.user')
  t.equal(getGroups(ldapUserWithTwoGroups)[1], 'app.testapp.teacher')
})

test('getGroupErrors', function (t) {
  t.plan(2)
  t.throws(() => {
    getGroups(undefined)
  })
  t.equal(getGroups(ldapUserWithEmptyGroups).length, 0)
})
