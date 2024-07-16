const { chromium } = require('playwright');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const login = process.env.LOGIN;
const password = process.env.PASSWORD;

if (!login || !password) {
  console.error('Environment variables LOGIN and PASSWORD are required');
  process.exit(1);
}
async function loginAuth() {
  console.clear();
  console.log('INICIANDO LOGIN...');
  let retries = 3;
  while (retries > 0) {
    let browser;
    let page;
    try {
      browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      page = await context.newPage();
      page.setDefaultTimeout(5000);
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.goto('https://portal.unimedpalmas.coop.br/', {
        waitUntil: 'domcontentloaded',
      });

      const frame = page
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal');

      await frame.locator('#tipoUsuario').selectOption('P');
      await frame.locator('#nmUsuario').click();
      await frame.locator('#nmUsuario').fill(login);
      await frame.locator('#dsSenha').click();
      await frame.locator('#dsSenha').fill(password);
      await frame.getByRole('button', { name: 'Entrar' }).click();

      console.clear();
      console.log('LOGIN ACEITO! AGUARDE...');

      return { page, browser };
    } catch (error) {
      console.error(`A TENTATIVA DE LOGIN FALHOU! ERRO: ${error}!`);
      console.log(`TENTATIVAS DE LOGIN RESTANTES: ${retries - 1}! AGUARDE...`);

      if (page) await page.close();
      if (browser) await browser.close();
    }
    retries--;
  }
  throw new Error('Login failed after 3 attempts');
}

module.exports = { loginAuth };
