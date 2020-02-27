/* eslint-env mocha */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-multi-assign */

const expect = require('chai').expect
const mockery = require('mockery')
const EventEmitter = require('events')
const SearchResult = require('../lib/ldap/search-result')

const eventEmitter = new EventEmitter().setMaxListeners(20)

let unbindCount = 0

const client = {
  unbind: () => unbindCount++,
}

const mockLogger = {}
mockLogger.info = mockLogger.debug = mockLogger.error = () => {}
mockery.registerMock('kth-node-log', mockLogger)

mockery.enable({
  warnOnUnregistered: false,
  warnOnReplace: false,
})

describe('SearchResult', () => {
  it('each', done => {
    const res = new SearchResult(eventEmitter, client)

    res
      .each(async entry => {
        expect(entry).to.eql({ data: 'data' })
      })
      .then(count => {
        expect(count).to.equal(1)
        expect(unbindCount).to.equal(1)
        done()
      })

    eventEmitter.emit('searchEntry', { object: { data: 'data' } })
    eventEmitter.emit('page', {
      result: {},
      done: () => {
        eventEmitter.emit('page', { result: {} })
      },
    })
  })
})
