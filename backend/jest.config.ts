module.exports = {
  "testEnvironment": "node",
  "collectCoverageFrom": [
    "server.js",
    "src/**/*.js"
  ],
  "coverageDirectory": "coverage",
  "testMatch": [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js"
  ],
  "setupFilesAfterEnv": [
    "<rootDir>/jest.setup.js"
  ],
  "preset": "ts-jest"
};