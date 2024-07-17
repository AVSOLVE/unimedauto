const { chromium } = require('playwright');
const { credentials, urls, retrySettings } = require('./config');
const { logMessage, retry } = require('./helper');

async function loginAuth() {
  let browser, page;

  const execute = async () => {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    page = await context.newPage();
    page.on('dialog', async (dialog) => {
      logMessage('cyan', `DIALOG: ${dialog.message()}`);
      await dialog.accept();
    });
    page.setDefaultTimeout(retrySettings.defaultTimeout);
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto(urls.loginPage, {
      waitUntil: 'domcontentloaded',
    });

    const frame = page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal');

    await frame.locator('#tipoUsuario').selectOption('P');
    await frame.locator('#nmUsuario').click();
    await frame.locator('#nmUsuario').fill(credentials.login);
    await frame.locator('#dsSenha').click();
    await frame.locator('#dsSenha').fill(credentials.password);
    await frame.getByRole('button', { name: 'Entrar' }).click();
  };

  try {
    await retry(execute);
    console.clear();
    logMessage('green', 'USUÁRIO LOGADO!');
    return { page, browser };
  } catch (error) {
    logMessage('red', 'Falha ao processar dados do usuário: ' + error.message);
    throw error;
  }
}

module.exports = { loginAuth };
