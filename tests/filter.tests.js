/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect
const filters = require('../lib/filters')

describe('Filters', () => {
  it('filter build', done => {
    expect(filters.eq('foo', 'bar').build()).to.equal('(foo=bar)')
    expect(filters.ne('foo', 'bar').build()).to.equal('(!(foo=bar))')
    expect(filters.gt('foo', 'bar').build()).to.equal('(foo>=bar)')
    expect(filters.lt('foo', 'bar').build()).to.equal('(foo<=bar)')
    expect(filters.empty.build()).to.equal('')

    let error

    try {
      filters.eq()
    } catch (e) {
      error = e
    }

    expect(error).to.not.be.undefined

    done()
  })

  it('filter or/and', done => {
    expect(filters.eq('foo', 'bar').or(filters.eq('foo', 'baz')).build()).to.equal('(|(foo=bar)(foo=baz))')
    expect(filters.eq('foo', 'bar').and(filters.eq('qux', 'bar')).build()).to.equal('(&(foo=bar)(qux=bar))')
    done()
  })

  it('filter from array', done => {
    const attribute = 'foo'
    const values = ['bar', 'baz', 'qux']

    expect(filters.orAll(attribute, values).build()).to.equal('(|(foo=bar)(foo=baz)(foo=qux))')
    expect(filters.andAll(attribute, values).build()).to.equal('(&(foo=bar)(foo=baz)(foo=qux))')
    done()
  })

  it('filter raw', done => {
    expect(filters.raw('(foo=bar)').and(filters.eq('foo', 'baz')).build()).to.equal('(&(foo=bar)(foo=baz))')
    done()
  })
})
