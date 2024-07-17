const fs = require('fs').promises;
const { loginAuth } = require('../shared/loginAuth');
const { logMessage, retry } = require('../shared/helper');

async function getFrame(page) {
  return page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0');
}

async function loginAndNavigate() {
  const { page, browser } = await loginAuth();

  const execute = async () => {
    const frame = await getFrame(page);
    await frame.getByText('Execução da requisição').click();
    await frame.getByText('» Executar requisição').click();
  };
  try {
    await retry(execute);
    console.clear();
    logMessage('green', 'REDIRECIONANDO! AGUARDE...');
    return { page, browser };
  } catch (error) {
    logMessage('yellow', `O REDIRECIONAMENTO FALHOU! ERRO: ${error.message}!`);
    await browser.close();
    throw error;
  }
}

async function procuraGuia(frame, codigoBeneficiario, nomeBeneficiario) {
  try {
    await frame.locator('#CD_USUARIO_PLANO').type(codigoBeneficiario);

    const codigoBenef = await frame.locator('#CD_USUARIO_PLANO').inputValue();

    if ((codigoBenef && codigoBenef !== codigoBeneficiario) || !codigoBenef) {
      await frame.locator('#CD_USUARIO_PLANO').clear();
      await frame.locator('#CD_USUARIO_PLANO').type(codigoBeneficiario);
    }

    await frame.locator('#CD_USUARIO_PLANO').press('Tab');

    nomeBeneficiario = await frame.locator('#NM_SEGURADO').inputValue();

    if (!nomeBeneficiario) {
      throw new Error('Beneficiário não encontrado!');
    } else {
      await frame.getByRole('button', { name: 'Consultar' }).click();
      let validadeGuia = await frame.getByRole('cell').nth(19).innerText();
      let req = await frame.getByRole('cell').nth(23).innerText();
      let qtdAp = await frame.getByRole('cell').nth(29).innerText();
      let qtdRes = await frame.getByRole('cell').nth(31).innerText();
      let qtdGuia = await frame
        .getByRole('cell', { name: 'Procedimento' })
        .count();

      if (qtdGuia > 1) {
        logMessage('red', `QTD DE GUIAS: ${qtdGuia} \nVERIFIQUE!`);
      }

      logMessage(
        'white',
        `*******************************************************\n`
      ) +
        logMessage('white', `REQUISIÇÃO ${req} \nQTD APROVADA: ${qtdAp} `) +
        logMessage('yellow', `\nQTD RESTANTE: ${qtdRes - 1} `);

      await frame.locator('input[type="checkbox"]').first().click();
      return true;
    }
  } catch (error) {
    logMessage(
      'white',
      `${nomeBeneficiario.toUpperCase()} ==> SEM GUIAS PARA EXECUTAR!`
    );

    return false;
  }
}

(async () => {
  const fileContent = await fs.readFile('guiasExecutar.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');
  try {
    const { page, browser } = await loginAndNavigate();
    for (const line of lines) {
      const [codigoBeneficiario, nomePaciente] = line.trim().split(';');
      if (codigoBeneficiario.trim().length === 17) {
        logMessage(
          'green',
          `Executando GUIA: ${codigoBeneficiario} -  ${nomePaciente.toUpperCase()}`
        );

        const frame = await getFrame(page);

        if ((await procuraGuia(frame, codigoBeneficiario, '***')) === false) {
          await frame.getByRole('button', { name: 'Nova consulta' }).click();
          logMessage('white', 'PRÓXIMO! AGUARDE...');
          continue;
        } else {
          await frame.getByRole('button', { name: 'Gerar guia' }).click();
          await frame.locator('select').selectOption('3');
          await frame.locator('input[type="text"]').fill('1');
          await frame
            .getByRole('button', { name: 'Confirmar geração de guias' })
            .click();
          await frame.getByRole('button', { name: 'Voltar' }).click();
        }
      } else {
        logMessage('yellow', `Invalid code: ${codigoBeneficiario}`);
      }
    }
    await browser.close();
  } catch (error) {
    logMessage('red', 'Error processing guide codes:', error);
  }
})();