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
    logMessage('yellow', `O REDIRECIONAMENTO FALHOU! ${error.message}!`);
    throw error;
  }
}

async function getMainFrame(page) {
  return page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal');
}

(async () => {
  const { page, browser } = await loginAndNavigate();
  const frame = await getMainFrame(page);
  let limit = 90;
  while (limit > 0) {
    try {
      await frame.getByRole('cell', { name: 'Detalhe' }).first().click();
      await frame.locator('#btnExcluir').click();
    } catch (error) {
      break;
    }
    limit--;
  }
  await browser.close();
})();
