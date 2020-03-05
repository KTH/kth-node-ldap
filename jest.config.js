module.exports = {
  ...require('./tests/jest-common'),
  projects: ['./tests/jest.server.js'],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/', '/__mocha_tests__/'],
}
