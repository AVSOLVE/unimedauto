const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  credentials:{
    login: process.env.LOGIN,
    password: process.env.PASSWORD
  },
  urls: {
    loginPage: 'https://portal.unimedpalmas.coop.br/',
    targetPage: 'https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
  },
  paths: {
    outputFile: 'guiasFaturar.csv',
  },
  dataPositions: [1, 29, 2, 3, 17, 5, 16],
  retrySettings: {
    defaultTimeout: 5000,
    maxRetries: 3,
    delayBetweenRetries: 3000,
  },
};
