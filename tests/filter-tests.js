var test = require('tape')
var filters = require('../lib/filters')

test('filter build', function (t) {
  t.plan(6)
  t.equal(filters.eq('foo', 'bar').build(), '(foo=bar)')
  t.equal(filters.ne('foo', 'bar').build(), '(!(foo=bar))')
  t.equal(filters.gt('foo', 'bar').build(), '(foo>=bar)')
  t.equal(filters.lt('foo', 'bar').build(), '(foo<=bar)')
  t.equal(filters.empty.build(), '')
  t.throws(function () {
    filters.eq()
  })
})

test('filter or/and', function (t) {
  t.plan(2)
  t.equal(filters.eq('foo', 'bar').or(filters.eq('foo', 'baz')).build(), '(|(foo=bar)(foo=baz))')
  t.equal(filters.eq('foo', 'bar').and(filters.eq('qux', 'bar')).build(), '(&(foo=bar)(qux=bar))')
})

test('filter from array', function (t) {
  t.plan(2)
  var attribute = 'foo'
  var values = ['bar', 'baz', 'qux']
  t.equal(filters.orAll(attribute, values).build(), '(|(foo=bar)(foo=baz)(foo=qux))')
  t.equal(filters.andAll(attribute, values).build(), '(&(foo=bar)(foo=baz)(foo=qux))')
})

test('filter raw', function (t) {
  t.plan(1)
  t.equal(filters.raw('(foo=bar)').and(filters.eq('foo', 'baz')).build(), '(&(foo=bar)(foo=baz))')
})
