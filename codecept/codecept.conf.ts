// codecept.conf.js
exports.config = {
  tests: './*_test.ts',
  output: './output',
  helpers: {
    Playwright: {
      url: 'https://portal.unimedpalmas.coop.br/',
      show: true,
      browser: 'chromium'
    }
  },
  include: {
    I: './steps_file.ts'
  },
  bootstrap: null,
  mocha: {},
  name: 'codecept',
  require: ['ts-node/register']
};
