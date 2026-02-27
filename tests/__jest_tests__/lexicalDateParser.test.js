'use strict'

const parser = require('../../lib/utils/lexical-date-parser')

describe('Lexical date parser', () => {
  it('date parser, from date', () => {
    expect(() => parser.fromDate(null)).toThrow()
    expect(parser.fromDate(new Date(0))).toBe('19700101000000.0Z')
  })

  it('date parser, to date', () => {
    const actual = parser.toDate('19700101000000.0Z')
    const expected = new Date(0)

    expect(() => parser.toDate()).toThrow()
    expect(actual.getUTCFullYear()).toBe(expected.getUTCFullYear())
    expect(actual.getUTCMonth()).toBe(expected.getUTCMonth())
    expect(actual.getUTCDate()).toBe(expected.getUTCDate())
    expect(actual.getUTCHours()).toBe(expected.getUTCHours())
    expect(actual.getUTCMinutes()).toBe(expected.getUTCMinutes())
    expect(actual.getUTCSeconds()).toBe(expected.getUTCSeconds())
    expect(actual.getUTCMilliseconds()).toBe(expected.getUTCMilliseconds())
  })
})
