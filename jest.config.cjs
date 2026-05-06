module.exports = {
  testEnvironment: 'node',
  transform: {},
  setupFiles: ['./tests/setup.env.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/db.js',
    '!src/config/socket.js'
  ],
  coverageThreshold: {
    global: { lines: 70 }
  },
  forceExit: true,
  testTimeout: 30000
};
