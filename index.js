const { createClient, search, searchOne } =
  process.env.USE_LDAPTS === 'true' ? require('./lib/ldapts/ldaptsClient') : require('./lib/ldap/client')

module.exports = {
  createClient,
  filters: require('./lib/filters'),
  utils: require('./lib/utils'),
  getSessionUserHelpers: require('./lib/session.js'),
  search,
  searchOne,
}
