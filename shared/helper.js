const logColors = require('ansi-colors');
const { retrySettings } = require('./config');

module.exports = {
  logMessage: (level, message) => {
    const colorFunctions = {
      black: logColors.bgBlack,
      red: logColors.bgRed,
      green: logColors.bgGreen,
      yellow: logColors.bgYellow,
      blue: logColors.bgBlue,
      magenta: logColors.bgMagenta,
      cyan: logColors.bgCyan,
      white: logColors.bgWhite,
    };
    const colorFunction = colorFunctions[level] || logColors.white;
    console.log(colorFunction(message));
  },
  getElapsedTime: (startTime) => {
    const timeInSeconds = Math.floor((new Date() - startTime) / 1000);
    if (timeInSeconds < 60) {
      return timeInSeconds + ' segundo' + (timeInSeconds !== 1 ? 's' : '');
    } else {
      const minutes = Math.floor(timeInSeconds / 60);
      const remainingSeconds = Math.floor(timeInSeconds % 60);

      if (remainingSeconds === 0) {
        return minutes + ' minuto' + (minutes !== 1 ? 's' : '');
      } else {
        return (
          minutes +
          ' minuto' +
          (minutes !== 1 ? 's' : '') +
          ' e ' +
          remainingSeconds +
          ' segundo' +
          (remainingSeconds !== 1 ? 's' : '')
        );
      }
    }
  },
  formatElapsedTime: (elapsedTime) => {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  },
  isAMonthOlder: (dateString) => {
    const [day, month, year] = dateString
      .split(';')[2]
      .split(' ')[0]
      .split('/');
    const inputDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    const diffInDays = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24));
    return diffInDays >= 31;
  },
  retry: async (fn) => {
    const retries = retrySettings.maxRetries;
    const delay = retrySettings.delayBetweenRetries;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt < retries) {
          module.exports.logMessage(
            'yellow',
            `Tentativa ${attempt} falhou. Nova tentativa em ${delay / 1000}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          module.exports.logMessage(
            'red',
            `Todas as ${retries} tentativas falharam.`
          );
          throw error;
        }
      }
    }
  },
};
