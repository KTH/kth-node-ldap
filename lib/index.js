const { createClient, search, searchOne } = require('./ldapts/ldaptsClient')

module.exports = {
  createClient,
  filters: require('./filters'),
  utils: require('./utils'),
  search,
  searchOne,
}
