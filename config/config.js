// This file is used by sequelize-cli

// Tell ts-node to run our config file
require('ts-node').register({
  compilerOptions: {
    module: 'CommonJS',
  },
});

// Export the config from our TypeScript file
module.exports = require('./database.config.ts');