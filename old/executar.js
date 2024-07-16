const fs = require('fs').promises;
const bot = require('./bot.js');

(async () => {
  try {
    const fileContent = await fs.readFile('guiasExecutar.txt', 'utf-8');
    const lines = fileContent.trim().split('\n');

    // Iterate through each code and perform actions
    for (const line of lines) {
      const [codigoGuia, nomePaciente] = line.trim().split(';');

      if (codigoGuia.trim().length === 17) {
        const logMessage = `Executando GUIA: ${codigoGuia} -  ${nomePaciente}`;
        console.log(logMessage);

        await bot(codigoGuia, nomePaciente);

      } else {
        console.warn(`Invalid code: ${codigoGuia}`);
      }
    }
  } catch (error) {
    console.error('Error reading codes from file:', error);
  }
})();
