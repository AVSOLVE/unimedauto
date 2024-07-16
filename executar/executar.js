const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { loginAuth } = require('../shared/loginAuth');

async function loginAndRedirect() {
  const { page, browser } = await loginAuth();

  const frame = page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0');

  try {
    await frame.getByText('Execução da requisição').click();

    await frame.getByText('» Executar requisição').click();
    
    console.clear();
    console.log(logColors.bgGreenBright(`REDIRECIONANDO! AGUARDE...`));
    return { page, browser };
  } catch (error) {
    console.error(
      logColors.bgYellowBright(
        `O REDIRECIONAMENTO FALHOU! ERRO: ${error.name}!`
      )
    );
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
        console.log(
          logColors.bgRedBright(`QTD DE GUIAS: ${qtdGuia} \nVERIFIQUE!`)
        );
      }

      console.log(
        logColors.whiteBright(
          `*******************************************************\n`
        ) +
          logColors.bgWhiteBright(
            `REQUISIÇÃO ${req} \nQTD APROVADA: ${qtdAp} `
          ) +
          logColors.bgYellowBright(`\nQTD RESTANTE: ${qtdRes - 1} `)
      );

      await frame.locator('input[type="checkbox"]').first().click();
      return true;
    }
  } catch (error) {
    console.warn(
      logColors.bgWhiteBright(
        `${nomeBeneficiario.toUpperCase()} ==> SEM GUIAS PARA EXECUTAR!`
      )
    );
    return false;
  }
}

(async () => {
  const fileContent = await fs.readFile('guiasExecutar.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');
  try {
    const { page, browser } = await loginAndRedirect();
    for (const line of lines) {
      const [codigoBeneficiario, nomePaciente] = line.trim().split(';');
      if (codigoBeneficiario.trim().length === 17) {
        console.log(
          logColors.bgGreenBright(
            `Executando GUIA: ${codigoBeneficiario} -  ${nomePaciente.toUpperCase()}`
          )
        );
        const frame = page
          .frameLocator('iframe >> nth=0')
          .frameLocator('#principal')
          .frameLocator('td iframe')
          .frameLocator('#paginaPrincipal');

        if ((await procuraGuia(frame, codigoBeneficiario, '***')) === false) {
          await frame.getByRole('button', { name: 'Nova consulta' }).click();

          console.log(logColors.bgWhiteBright('PRÓXIMO! AGUARDE...'));

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
        console.warn(
          logColors.bgYellowBright(`Invalid code: ${codigoBeneficiario}`)
        );
      }
    }
    await browser.close();
  } catch (error) {
    console.error('Error processing guide codes:', error);
  }
})();
