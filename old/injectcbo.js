const { chromium } = require('playwright');
const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const timeout = 5000;

  page.setDefaultTimeout(timeout);
  await page.setViewportSize({ width: 1024, height: 680 });
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
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0')
    .getByText('Digitação de contas médicas')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0')
    .getByText('» Digitar conta médica')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .getByRole('link', { name: 'Utilizar' })
    .click();

  console.log('Logged in!');

  return { page, browser };
}

(async () => {
  console.clear();
  const { page, browser } = await loginAuth();
  console.log(await page.content());
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .getByRole('row', { name: '6372670 11299950 09/04/2024' })
    .getByRole('link')
    .nth(1)
    .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .getByRole('button', { name: 'Proc/Mat' })
  //   .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .locator('#linha_1 > td:nth-child(6)')
  //   .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .frameLocator('#frameParticipantes_1')
  //   .getByRole('link', { name: 'Detalhes' })
  //   .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .frameLocator('#frameParticipantes_1')
  //   .locator('#nr_seq_cbo_saude')
  //   .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .frameLocator('#frameParticipantes_1')
  //   .locator('#nr_seq_cbo_saude')
  //   .fill('445');

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .frameLocator('#frameParticipantes_1')
  //   .locator('#nr_seq_cbo_saude')
  //   .press('Tab');

  // page.once('dialog', (dialog) => {
  //   console.log(`Dialog message: ${dialog.message()}`);
  //   dialog.dismiss().catch(() => {});
  // });

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .frameLocator('#frameParticipantes_1')
  //   .getByRole('button', { name: 'Salvar' })
  //   .click();

  // page.once('dialog', (dialog) => {
  //   console.log(`Dialog message: ${dialog.message()}`);
  //   dialog.dismiss().catch(() => {});
  // });

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .getByRole('button', { name: 'Consistir' })
  //   .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .getByRole('button', { name: 'Voltar' })
  //   .click();

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .getByRole('button', { name: 'Voltar' })
  //   .click();

  // browser.close();
})();
