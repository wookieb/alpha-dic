const {defaults: preset} = require('ts-jest/presets');
module.exports = {
    collectCoverage: true,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: [
        "/node_modules/"
    ],
    coverageReporters: [
        "json",
        "text",
        "lcov",
    ],
    errorOnDeprecated: true,
    moduleFileExtensions: [
        "js",
        "json",
        "ts",
    ],
    roots: [
        "<rootDir>/tests"
    ],
    transform: preset.transform,
    testEnvironment: "node",
    testRegex: ".*Test.ts$",
    setupFilesAfterEnv: [
        "./tests/bootstrap.ts"
    ],
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tests/tsconfig.json'
        }
    }
};