/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */

const expect = require('chai').expect
const parser = require('../../lib/utils/lexical-date-parser')

describe('Lexical date parser', () => {
  it('date parser, from date', done => {
    let error

    try {
      parser.fromDate(null)
    } catch (e) {
      error = e
    }

    expect(error).to.not.be.undefined
    expect(parser.fromDate(new Date(0))).to.equal('19700101000000.0Z')
    done()
  })

  it('date parser, to date', done => {
    const actual = parser.toDate('19700101000000.0Z')
    const expected = new Date(0)

    let error

    try {
      parser.toDate()
    } catch (e) {
      error = e
    }

    expect(error).to.not.be.undefined
    expect(actual.getUTCFullYear()).to.equal(expected.getUTCFullYear())
    expect(actual.getUTCMonth()).to.equal(expected.getUTCMonth())
    expect(actual.getUTCDate()).to.equal(expected.getUTCDate())
    expect(actual.getUTCHours()).to.equal(expected.getUTCHours())
    expect(actual.getUTCMinutes()).to.equal(expected.getUTCMinutes())
    expect(actual.getUTCSeconds()).to.equal(expected.getUTCSeconds())
    expect(actual.getUTCMilliseconds()).to.equal(expected.getUTCMilliseconds())
    done()
  })
})
