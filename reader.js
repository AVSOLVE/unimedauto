const fs = require('fs').promises;
const bot = require('./bot.js');

(async () => {
  const logFilePath = 'log.txt';
  try {
    // Read the file containing 17-digit codes, assuming one code per line
    const codes = (await fs.readFile('./codes.txt', 'utf-8')).split('\n');

    // Iterate through each code and perform actions
    for (const code of codes) {
      if (code.trim().length === 17) {
        console.log(`Performing actions for code: ${code.trim()}`);
        await bot(code.trim());
      } else {
        console.warn(`Invalid code: ${code.trim()}`);
      }
    }
  } catch (error) {
    console.error('Error reading codes from file:', error);
  }
})();