/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: ['bin/index.mjs'],
  coverageDirectory: 'coverage',
  clearMocks: true,
  watchman: false,
};
