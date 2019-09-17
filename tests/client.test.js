/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect
const mockery = require('mockery')
const ldap = require('ldapjs')
const EventEmitter = require('events')

const eventEmitter = new EventEmitter().setMaxListeners(20)
const resultEmitter = new EventEmitter().setMaxListeners(20)

let unbindCount = 0

mockery.registerMock('ldapjs', {
  createClient: options => {
    if (!options) {
      throw new Error('options required')
    }

    eventEmitter.connect = () => {}
    eventEmitter.unbind = () => unbindCount++
    eventEmitter.search = (base, query, cb) => cb(null, resultEmitter)

    return eventEmitter
  }
})

const mockLogger = {}
mockLogger.info = mockLogger.debug = mockLogger.error = () => {}
mockery.registerMock('kth-node-log', mockLogger)

mockery.enable({
  warnOnUnregistered: false,
  warnOnReplace: false
})

const { createClient, test } = require('../lib/ldap/client')

describe('Client', () => {
  it('Create client', done => {
    let error

    try {
      createClient()
    } catch (e) {
      error = e
    }

    const client = createClient({ test: 'test' })

    expect(error).to.not.be.undefined
    expect(client).to.not.be.undefined
    done()
  })

  it('Connect event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({})

    eventEmitter.emit('connect')

    expect(client.isOk()).to.equal(true)
    expect(client.errorMsg()).to.be.undefined
    done()
  })

  it('Open event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('open')

    expect(client.isOk()).to.equal(true)
    expect(client.errorMsg()).to.be.undefined

    done()
  })

  it('Error event (ECONNRESET)', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('error', new ldap.TimeoutError('ECONNRESET'))

    expect(client.isOk()).to.equal(false)
    expect(client.errorMsg().message).to.equal('ECONNRESET')

    done()
  })

  it('Error event (ETIMEDOUT) ', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('error', new ldap.TimeoutError('ETIMEDOUT'))

    expect(client.isOk()).to.equal(false)
    expect(client.errorMsg().message).to.equal('ETIMEDOUT')

    done()
  })

  it('Error event (ESOCKETTIMEDOUT) ', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('error', new ldap.TimeoutError('ESOCKETTIMEDOUT'))

    expect(client.isOk()).to.equal(false)
    expect(client.errorMsg().message).to.equal('ESOCKETTIMEDOUT')

    done()
  })

  it('Error event (InvalidCredentialsError) ', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('error', new ldap.InvalidCredentialsError())

    expect(client.isOk()).to.equal(false)
    expect(client.errorMsg().message).to.equal('InvalidCredentialsError')

    done()
  })

  it('Setup error event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('setupError', {})

    expect(client.isOk()).to.be.false
    expect(client.errorMsg()).to.equal('LDAP connection failed during setup')

    done()
  })

  it('Connect error event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('connectError', {})

    expect(client.isOk()).to.be.false
    expect(client.errorMsg()).to.equal('LDAP connection error')

    done()
  })

  it('Timeout event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('timeout', {})

    expect(client.isOk()).to.be.false
    expect(client.errorMsg()).to.equal('LDAP timeout')

    done()
  })

  it('Destroy event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('destroy', {})

    expect(client.isOk()).to.be.false
    expect(client.errorMsg()).to.be.undefined

    done()
  })

  it('Close event', done => {
    test.initClient({ test: 'test' })
    const client = createClient({ test: 'test' })

    eventEmitter.emit('close', {})

    expect(client.isOk()).to.be.false
    expect(client.errorMsg()).to.equal('LDAP closed')

    done()
  })

  it('searchOne - result', done => {
    const client = createClient({ test: 'test' })

    client.searchOne().then(res => {
      expect(res.data).to.equal('data')
      expect(unbindCount).to.equal(1)
      done()
    })

    resultEmitter.emit('searchEntry', { object: { data: 'data' } })
  })

  it('searchOne - error', done => {
    const client = createClient({ test: 'test' })

    client.searchOne().catch(e => {
      expect(e).to.equal('error')
      expect(unbindCount).to.equal(2)
      done()
    })

    resultEmitter.emit('error', 'error')
  })

  it('searchOne - end', done => {
    const client = createClient({ test: 'test' })

    client.searchOne().then(res => {
      expect(res).to.not.be.undefined
      expect(unbindCount).to.equal(3)
      done()
    })

    resultEmitter.emit('end', { status: 0 })
  })

  it('searchOne - end error', done => {
    const client = createClient({ test: 'test' })

    client.searchOne().catch(e => {
      expect(e).to.not.be.undefined
      expect(unbindCount).to.equal(4)
      done()
    })

    resultEmitter.emit('end', { status: 1 })
  })

  it('search', done => {
    const client = createClient({ test: 'test' })

    client.search().then(res => {
      expect(res.constructor.name).to.equal('SearchResult')
      expect(unbindCount).to.equal(4)
      done()
    })
  })

  it('testSearch', done => {
    const client = createClient({ test: 'test' })

    const opts = {
      scope: 'scope',
      filter: '',
      sizeLimits: 0,
      timeLimit: 0,
      filterReplaceHolder: '',
      kthId: ''
    }

    client.testSearch(opts).then(res => {
      expect(res.isOk).to.be.true
      expect(res.msg).to.be.undefined
      expect(unbindCount).to.equal(5)
      done()
    })

    resultEmitter.emit('searchEntry', { object: { ugAliasUsername: ['username.username'] } })
  })

  it('testSearch - error', done => {
    const client = createClient({ test: 'test' })

    const opts = {
      scope: 'scope',
      filter: '',
      sizeLimits: 0,
      timeLimit: 0,
      filterReplaceHolder: '',
      kthId: ''
    }

    client.testSearch(opts).catch(e => {
      expect(e).to.equal('error')
      expect(unbindCount).to.equal(6)
      done()
    })

    resultEmitter.emit('error', 'error')
  })
})
