const path = require('path')

module.exports = {
  rootDir: path.join(__dirname, '..'),
  moduleDirectories: ['node_modules', path.join(__dirname, '../lib')],
  testEnvironment: 'jest-environment-jsdom',
  verbose: true,
}
