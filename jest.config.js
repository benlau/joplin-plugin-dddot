/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // moduleDirectories: ["node_modules", "."],
  modulePathIgnorePatterns: ["bower_components"],
  transform: {
    '^.+\.(ts|tsx|js)$': 'ts-jest',
  },
  "moduleNameMapper": {
    "^api$": "<rootDir>/api",
    "^api/types$": "<rootDir>/api/types"
  },
  "globals": {
      "joplin": true
  }  
};