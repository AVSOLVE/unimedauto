module.exports = {
  urls: {
    loginPage: 'https://portal.unimedpalmas.coop.br/login.jsp',
    targetPage: 'https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
  },
  paths: {
    outputFile: 'guiasFaturar.csv',
  },
  dataPositions: [1, 29, 2, 3, 17, 5, 16],
  logging: {
    level: 'info',
    transports: [
      {
        type: 'console',
        options: {
          colorize: true,
        },
      },
      {
        type: 'file',
        options: {
          filename: 'app.log',
          maxsize: 1048576, // 1 MB
          maxFiles: 5,
          tailable: true,
        },
      },
    ],
  },
  retrySettings: {
    maxRetries: 3,
    delayBetweenRetries: 1000, // in milliseconds
  },
};
