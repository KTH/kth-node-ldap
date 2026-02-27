'use strict'

const getGroups = require('../../lib/utils/getGroups')

const ldapUserWithEmptyGroups = { memberOf: undefined }
const ldapUserWithOneGroup = { memberOf: 'CN=app.testapp.user,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se' }
const ldapUserWithTwoGroups = {
  memberOf: [
    'CN=app.testapp.user,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se',
    'CN=app.testapp.teacher,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se',
  ],
}

describe('Get groups', () => {
  it('getGroupFromUserWithOneGroup', () => {
    expect(getGroups(ldapUserWithOneGroup).length).toBe(1)
    expect(getGroups(ldapUserWithOneGroup)[0]).toBe('app.testapp.user')
  })

  it('getGroupFromUserWithTwoGroups', () => {
    expect(getGroups(ldapUserWithTwoGroups).length).toBe(2)
    expect(getGroups(ldapUserWithTwoGroups)[0]).toBe('app.testapp.user')
    expect(getGroups(ldapUserWithTwoGroups)[1]).toBe('app.testapp.teacher')
  })

  it('getGroupErrors', () => {
    expect(() => getGroups(undefined)).toThrow()
    expect(getGroups(ldapUserWithEmptyGroups).length).toBe(0)
  })
})
