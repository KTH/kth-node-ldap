'use strict'

const filters = require('../../lib/filters')

describe('Filters', () => {
  it('filter build', () => {
    expect(filters.eq('foo', 'bar').build()).toBe('(foo=bar)')
    expect(filters.ne('foo', 'bar').build()).toBe('(!(foo=bar))')
    expect(filters.gt('foo', 'bar').build()).toBe('(foo>=bar)')
    expect(filters.lt('foo', 'bar').build()).toBe('(foo<=bar)')
    expect(filters.empty.build()).toBe('')

    expect(() => filters.eq()).toThrow()
  })

  it('filter or/and', () => {
    expect(filters.eq('foo', 'bar').or(filters.eq('foo', 'baz')).build()).toBe('(|(foo=bar)(foo=baz))')
    expect(filters.eq('foo', 'bar').and(filters.eq('qux', 'bar')).build()).toBe('(&(foo=bar)(qux=bar))')
  })

  it('filter from array', () => {
    const attribute = 'foo'
    const values = ['bar', 'baz', 'qux']

    expect(filters.orAll(attribute, values).build()).toBe('(|(foo=bar)(foo=baz)(foo=qux))')
    expect(filters.andAll(attribute, values).build()).toBe('(&(foo=bar)(foo=baz)(foo=qux))')
  })

  it('filter raw', () => {
    expect(filters.raw('(foo=bar)').and(filters.eq('foo', 'baz')).build()).toBe('(&(foo=bar)(foo=baz))')
  })
})
