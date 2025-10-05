module.exports = {
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "server.ts",
    "routes/**/*.ts",
    "!**/node_modules/**"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  },
  "testMatch": [
    "**/__tests__/**/*.test.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  "setupFilesAfterEnv": [
    "./test/setup.ts"
  ],
  "preset": "ts-jest"
};