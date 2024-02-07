const fs = require('fs').promises;
function capitalizeName(name) {
  // Split the name into an array of words
  const words = name.split(' ');

  // Define a list of words to be made lowercase
  const lowercaseWords = ['de', 'do', 'da', 'des', 'das', 'dos'];

  // Capitalize the first letter of each word, make the rest lowercase, and handle specific words
  const transformedName = words.map(word => {
      const lowercase = lowercaseWords.includes(word.toLowerCase());
      return lowercase ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join the words back into a string
  return transformedName.join(' ');
}

(async () => {
  try {
    const fileContent = await fs.readFile('database.csv', 'utf-8');
    const lines = fileContent.trim().split('\n');
    for (const [index, line] of lines.entries()) {
      const [
        codigoGuia,
        numeroCarteirinha,
        dataExec,
        nomePaciente,
        crmMedico,
        nomeMedico,
      ] = line.trim().split(';');

      if (numeroCarteirinha.trim().length === 17) {
        // const logMessage = `Executando GUIA: ${codigoGuia}, Cartão: ${numeroCarteirinha}, Beneficiário: ${nomePaciente}, Data execução: ${dataExec}, Médico: CRM ${crmMedico} - ${nomeMedico}`;
        const transformedName = capitalizeName(nomeMedico);
        const logMessage = `${codigoGuia};${numeroCarteirinha};${dataExec};${nomePaciente};${crmMedico};${transformedName}\n`;
        // console.log(logMessage);
        await fs.appendFile('newDatabase.csv', logMessage);
        
        console.log(logMessage);
      } else {
        console.warn(`Invalid code: ${codigoGuia}`);
      }
    }
  } catch (error) {
    console.error('Error reading codes from file:', error);
  }
})();
