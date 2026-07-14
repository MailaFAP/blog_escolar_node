module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/application/usecases/**/*.ts',
    'src/domain/**/*.ts'
  ],
  coverageReporters: ['text', 'lcov'],
  coverageReporters: ['text', 'lcov']
};
