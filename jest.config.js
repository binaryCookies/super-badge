const { jestConfig } = require("@salesforce/sfdx-lwc-jest/config");

module.exports = {
  ...jestConfig,
  modulePathIgnorePatterns: ["<rootDir>/.localdevserver"]
};

// module.exports = {
//     moduleNameMapper: {
//       '^c/boatSearchForm$': '<rootDir>/force-app/main/default/lwc/boatSearchForm/boatSearchForm',
//       '^lwc$': 'lwc-jest',
//     },
//     // rest of the config
//   };
