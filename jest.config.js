module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['./index.jest.js'],
  testEnvironment: 'jest-environment-jsdom',
}
