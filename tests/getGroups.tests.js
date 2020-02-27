/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */

const expect = require('chai').expect
const getGroups = require('../lib/utils/getGroups')

const ldapUserWithEmptyGroups = { memberOf: undefined }
const ldapUserWithOneGroup = { memberOf: 'CN=app.testapp.user,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se' }
const ldapUserWithTwoGroups = {
  memberOf: [
    'CN=app.testapp.user,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se',
    'CN=app.testapp.teacher,OU=groups,OU=ug,DC=ref,DC=ug,DC=kth,DC=se',
  ],
}

describe('Get groups', () => {
  it('getGroupFromUserWithOneGroup', done => {
    expect(getGroups(ldapUserWithOneGroup).length).to.equal(1)
    expect(getGroups(ldapUserWithOneGroup)[0]).to.equal('app.testapp.user')
    done()
  })

  it('getGroupFromUserWithTwoGroups', done => {
    expect(getGroups(ldapUserWithTwoGroups).length).to.equal(2)
    expect(getGroups(ldapUserWithTwoGroups)[0]).to.equal('app.testapp.user')
    expect(getGroups(ldapUserWithTwoGroups)[1]).to.equal('app.testapp.teacher')
    done()
  })

  it('getGroupErrors', done => {
    let error

    try {
      getGroups(undefined)
    } catch (e) {
      error = e
    }

    expect(error).to.not.be.undefined
    expect(getGroups(ldapUserWithEmptyGroups).length).to.equal(0)
    done()
  })
})
