const { loginAuth } = require('../shared/loginAuth');
const { logMessage, retry } = require('../shared/helper');

async function loginAndNavigate() {
  const { page, browser } = await loginAuth();
  const execute = async () => {
    const frame = page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe');
    await frame
      .frameLocator('frame >> nth=0')
      .getByText('Digitação de contas médicas')
      .click();
    await frame
      .frameLocator('frame >> nth=0')
      .getByText('» Digitar conta médica')
      .click();
    await frame
      .frameLocator('#paginaPrincipal')
      .getByRole('link', { name: 'Utilizar' })
      .first()
      .click();
  };
  try {
    await retry(execute);
    console.clear();
    logMessage('green', 'REDIRECIONANDO! AGUARDE...');
    return { page, browser };
  } catch (error) {
    logMessage('yellow', `O REDIRECIONAMENTO FALHOU! ERRO: ${error.message}!`);
    throw error;
  }
}

async function getFrame(page) {
  return page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal');
}

(async () => {
  const { page, browser } = await loginAndNavigate();
  const frame = await getFrame(page);
  while (true) {
    try {
      const condition = await frame
        .getByRole('cell', { name: 'Possui inconsistências' })
        .first();

      if (condition) {
        await frame
          .locator('tr:has-text("Possui inconsistências") > td:nth-child(9)')
          .first()
          .click();

        await frame.locator('#btnExcluir').click();
      }
    } catch (error) {
      break;
    }
  }
  browser.close();
})();
