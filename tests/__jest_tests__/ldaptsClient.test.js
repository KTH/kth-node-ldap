/* eslint no-multi-assign:0 */
/* eslint no-empty:0 */
const { Client } = require('ldapts')
const { InvalidCredentialsError } = require('ldapts/errors')
const { createClient, searchOne, search } = require('../../lib/ldapts/ldaptsClient')
const FilterBase = require('../../lib/filters/filter-base')

const mockLogger = {}
mockLogger.info = mockLogger.debug = mockLogger.error = () => {}

/* Test data */
const testOptions = {
  url: 'ldaps://ldap.jumpcloud.com',
  timeout: 1,
  connectTimeout: 2,
  maxIdleTime: 3,
  tlsOptions: {
    minVersion: 'TLSv1.2',
  },
  strictDN: true,
  bindDN: 'uid=tony.stark,ou=Users,o=5be4c382c583e54de6a3ff52,dc=jumpcloud,dc=com',
  bindCredentials: 'MyRedSuitKeepsMeWarm',
  log: mockLogger,
}

const ldapOptions = {
  url: testOptions.url,
  timeout: testOptions.timeout,
  connectTimeout: testOptions.connectTimeout,
  tlsOptions: {
    minVersion: 'TLSv1.2',
  },
  strictDN: testOptions.strictDN,
}
const peterParker = {
  dn: 'uid=peter.parker,ou=Users,o=5be4c382c583e54de6a3ff',
  gidNumber: '5004',
  mail: 'peter.parker@marvel.com',
}
const peterParker1 = {
  dn: 'uid=peter.parker,ou=Users,o=5be4c382c583e54de6a3ffxxx',
  gidNumber: '5005',
  mail: 'peter.parker1@marvel.com',
}

const queryPeterParker = {
  scope: 'sub',
  filter: '(mail=peter.parker@marvel.com)',
}
const queryNonExistentUser = {
  scope: 'sub',
  filter: '(mail=gone@nomore.com)',
}
const searchPeterParkerDN = 'ou=Users,o=5be4c382c583e54de6a3ff52,dc=jumpcloud,dc=com'

/*
 * Mock functions
 */
const mockBind = jest.fn().mockImplementation(async (dn, pw) => {
  if (dn !== testOptions.bindDN || pw !== testOptions.bindCredentials) {
    throw new InvalidCredentialsError()
  }
  return 0
})

const mockUnbind = jest.fn().mockImplementation(async () => {
  return 0
})

const mockSearch = jest.fn().mockImplementation(async (baseDN, searchOptions) => {
  if (searchOptions.filter === queryNonExistentUser.filter) {
    return { searchEntries: [] }
  }
  if (searchOptions.sizeLimits === 1) {
    return { searchEntries: [peterParker] }
  }
  return { searchEntries: [peterParker, peterParker1] }
})

jest.mock('ldapts', () => {
  return {
    Client: jest.fn().mockImplementation(options => {
      if (!options || !options.url) {
        throw new TypeError()
      }
      const rval = {
        bind: mockBind,
        unbind: mockUnbind,
        search: mockSearch,
      }
      return rval
    }),
  }
})

describe(`LDAPTS tests`, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => jest.resetAllMocks())

  test('Create client with no option should fail', async () => {
    let aClient
    try {
      aClient = createClient()
    } catch (ex) {}
    expect(Client).not.toHaveBeenCalled()
    expect(aClient).toBeFalsy()
    expect(createClient).toThrow(new Error('No options given'))
  })

  test('Create client with standard options should succeed', async () => {
    let aClient
    try {
      aClient = createClient(testOptions)
    } catch (ex) {}
    expect(Client).toHaveBeenCalledTimes(1)
    expect(aClient).toBeTruthy()
  })

  test('Create client with standard options to return a Client object ', async () => {
    const client = createClient(testOptions)
    expect(client.client).toBeTruthy()
  })

  test('Create client with options to be passed as ldaptions to Client object ', async () => {
    const client = createClient(testOptions)
    expect(Client).toHaveBeenCalledTimes(1)
    expect(Client).toHaveBeenNthCalledWith(1, ldapOptions)
    expect(client.client).toBeTruthy()
  })
  test('InvalidCredentialsError handled when bind is called', async () => {
    let aClient
    let optionWithWrongPW
    try {
      optionWithWrongPW = { ...testOptions }
      optionWithWrongPW.bindCredentials = 'hoppsan'
      aClient = await createClient(optionWithWrongPW)
      await searchOne(aClient, searchPeterParkerDN, queryPeterParker)
    } catch (ex) {
      expect(ex).toEqual(new InvalidCredentialsError())
    }
    expect(mockBind).toHaveBeenNthCalledWith(1, optionWithWrongPW.bindDN, optionWithWrongPW.bindCredentials)
  })
  test('Search one to return one', async () => {
    const query1 = {
      ...queryPeterParker,
      sizeLimits: 1,
    }
    let aClient
    let aResult

    try {
      aClient = await createClient(testOptions)
      aResult = await searchOne(aClient, searchPeterParkerDN, queryPeterParker)
    } catch (ex) {}

    expect(mockBind).toHaveBeenNthCalledWith(1, testOptions.bindDN, testOptions.bindCredentials)
    expect(mockSearch).toHaveBeenNthCalledWith(1, searchPeterParkerDN, query1)

    expect(aResult).toBeTruthy()
    expect(aResult).toEqual(peterParker)
    expect(mockUnbind).toHaveBeenCalled()
  })
  test('Search one to return null when no user is found', async () => {
    const query1 = {
      ...queryNonExistentUser,
      sizeLimits: 1,
    }
    let aClient
    let aResult

    try {
      aClient = await createClient(testOptions)
      aResult = await searchOne(aClient, searchPeterParkerDN, queryNonExistentUser)
    } catch (ex) {}

    expect(mockBind).toHaveBeenNthCalledWith(1, testOptions.bindDN, testOptions.bindCredentials)
    expect(mockSearch).toHaveBeenNthCalledWith(1, searchPeterParkerDN, query1)

    expect(aResult).toBeFalsy()
    expect(aResult).toEqual(null)
    expect(mockUnbind).toHaveBeenCalled()
  })

  test('Search to return an array', async () => {
    const searchQuery = {
      paged: {
        pageSize: 1000,
        pagePause: true,
      },
      ...(queryPeterParker && queryPeterParker.filter instanceof FilterBase && { filter: queryPeterParker.filter.build() }),
      ...queryPeterParker,
    }
    let aClient
    let aResult

    try {
      aClient = await createClient(testOptions)
      aResult = await search(aClient, searchPeterParkerDN, searchQuery)
    } catch (ex) {}

    expect(mockBind).toHaveBeenNthCalledWith(1, testOptions.bindDN, testOptions.bindCredentials)
    expect(mockSearch).toHaveBeenNthCalledWith(1, searchPeterParkerDN, searchQuery)
    expect(aResult).toBeTruthy()
    expect(aResult).toHaveLength(2)
    expect(aResult[0]).toEqual(peterParker)
    expect(mockUnbind).toHaveBeenCalled()
  })
})
