const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth() {
  let retries = 3;
  while (retries > 0) {
    try {
      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      await page.setViewportSize({ width: 800, height: 600 });
      await page.goto('https://portal.unimedpalmas.coop.br/', {
        waitUntil: 'domcontentloaded',
      });

      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#tipoUsuario')
        .selectOption('P');
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#nmUsuario')
        .click();
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#nmUsuario')
        .fill(login);
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#dsSenha')
        .click();
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#dsSenha')
        .fill(password);
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .getByRole('button', { name: 'Entrar' })
        .click();

      console.log(logColors.bgGreenBright(`LOGIN ACEITO! AGUARDE...`));

      return { page, browser };
    } catch (error) {
      retries--;
      if (page) await page.close();
      if (browser) await browser.close();

      console.error(
        logColors.bgYellowBright(
          `A TENTATIVA DE LOGIN FALHOU! ERRO: ${error.name}!`
        )
      );
      console.log(
        logColors.bgWhiteBright(
          `TENTATIVAS DE LOGIN RESTANTES: ${retries}! AGUARDE...`
        )
      );
    }
  }
}

async function loginAndRedirect() {
  const { page, browser } = await loginAuth();

  try {
    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('frame >> nth=0')
      .getByText('Execução da requisição')
      .click();
    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('frame >> nth=0')
      .getByText('» Executar requisição')
      .click();

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

async function procuraGuia(page, codigoBeneficiario, nomeBeneficiario) {
  try {
    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .locator('#CD_USUARIO_PLANO')
      .type(codigoBeneficiario);

    const codigoBenef = await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .locator('#CD_USUARIO_PLANO')
      .inputValue();

    if ((codigoBenef && codigoBenef !== codigoBeneficiario) || !codigoBenef) {
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .locator('#CD_USUARIO_PLANO')
        .type(codigoBeneficiario);

      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .locator('#CD_USUARIO_PLANO')
        .clear();

      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .locator('#CD_USUARIO_PLANO')
        .type(codigoBeneficiario);
    }

    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .locator('#CD_USUARIO_PLANO')
      .press('Tab');

    nomeBeneficiario = await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .locator('#NM_SEGURADO')
      .inputValue();

    if (!nomeBeneficiario) {
      throw new Error('Beneficiário não encontrado!');
    } else {
      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .getByRole('button', { name: 'Consultar' })
        .click();

      let req = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .getByRole('cell')
        .nth(23)
        .innerText();
      let qtdAp = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .getByRole('cell')
        .nth(29)
        .innerText();
      let qtdEx = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .getByRole('cell')
        .nth(30)
        .innerText();
      let qtdRes = await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .getByRole('cell')
        .nth(31)
        .innerText();

      console.log(
        logColors.bgWhiteBright(
          `BENEFICIÁRIO: ${codigoBeneficiario}:  ${nomeBeneficiario.toUpperCase()} \nREQUISIÇÃO ${req} \nQTD APROVADA: ${qtdAp} \nQTD EXECUTADA: ${qtdEx} `
        ) + logColors.bgYellowBright(`\nQTD RESTANTE: ${qtdRes} `)
      );

      await page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .locator('input[type="checkbox"]')
        .first()
        .click();
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
  console.clear();
  const fileContent = await fs.readFile('guiasExecutar.txt', 'utf-8');
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

        if ((await procuraGuia(page, codigoBeneficiario, '***')) === false) {
          await page
            .frameLocator('iframe >> nth=0')
            .frameLocator('#principal')
            .frameLocator('td iframe')
            .frameLocator('#paginaPrincipal')
            .getByRole('button', { name: 'Nova consulta' })
            .click();

          console.log(logColors.bgWhiteBright('PRÓXIMO! AGUARDE...'));

          continue;
        } else {
          await page
            .frameLocator('iframe >> nth=0')
            .frameLocator('#principal')
            .frameLocator('td iframe')
            .frameLocator('#paginaPrincipal')
            .getByRole('button', { name: 'Gerar guia' })
            .click();
          await page
            .frameLocator('iframe >> nth=0')
            .frameLocator('#principal')
            .frameLocator('td iframe')
            .frameLocator('#paginaPrincipal')
            .locator('select')
            .selectOption('3');
          await page
            .frameLocator('iframe >> nth=0')
            .frameLocator('#principal')
            .frameLocator('td iframe')
            .frameLocator('#paginaPrincipal')
            .locator('input[type="text"]')
            .fill('1');
          await page
            .frameLocator('iframe >> nth=0')
            .frameLocator('#principal')
            .frameLocator('td iframe')
            .frameLocator('#paginaPrincipal')
            .getByRole('button', { name: 'Confirmar geração de guias' })
            .click();
          await page
            .frameLocator('iframe >> nth=0')
            .frameLocator('#principal')
            .frameLocator('td iframe')
            .frameLocator('#paginaPrincipal')
            .getByRole('button', { name: 'Voltar' })
            .click();
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
