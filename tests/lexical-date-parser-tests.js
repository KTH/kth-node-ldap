var test = require('tape')
var parser = require('../lib/utils/lexical-date-parser')

test('date parser, from date', function (t) {
  t.plan(2)
  t.equal(parser.fromDate(new Date(0)), '19700101000000.0Z')
  t.throws(function () {
    parser.fromDate(null)
  })
})

test('date parser, to date', function (t) {
  t.plan(8)
  var actual = parser.toDate('19700101000000.0Z')
  var expected = new Date(0)
  t.equal(actual.getUTCFullYear(), expected.getUTCFullYear())
  t.equal(actual.getUTCMonth(), expected.getUTCMonth())
  t.equal(actual.getUTCDate(), expected.getUTCDate())
  t.equal(actual.getUTCHours(), expected.getUTCHours())
  t.equal(actual.getUTCMinutes(), expected.getUTCMinutes())
  t.equal(actual.getUTCSeconds(), expected.getUTCSeconds())
  t.equal(actual.getUTCMilliseconds(), expected.getUTCMilliseconds())
  t.throws(function () {
    parser.toDate()
  })
})
