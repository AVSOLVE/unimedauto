const fs = require('fs').promises;
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto('https://portal.unimedpalmas.coop.br/', {
    waitUntil: 'load',
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
    .getByText('Execução da requisição')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0')
    .getByText('» Executar requisição')
    .click();

  console.log('Logged in!');

  return page;
}

(async () => {
  console.clear();
  const page = await loginAuth();

  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_USUARIO_PLANO')
    .type('02222507000017002');

  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('#CD_USUARIO_PLANO')
    .press('Tab');

  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .getByRole('button', { name: 'Consultar' })
    .click();

  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .locator('input[type="checkbox"]')
    .first()
    .click();

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
    
  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .locator('div')
  //   .filter({ hasText: 'Requisição Dt requisição Dt' })
  //   .click();

  // Intercepting HTTP request
  // page.route('**/*', (route) => {
  //   console.log('Intercepted URL:', route.request().url());
  //   route.continue();
  // });

  // // Navigate to a page
  // await page.goto('https://example.com');

  // // Ensure that all route handlers are removed
  // page.off('route');

  // let counter = 0;
  // try {
  //   const checkboxesLocator = page
  //     .frameLocator('iframe >> nth=0')
  //     .frameLocator('#principal')
  //     .frameLocator('td iframe')
  //     .frameLocator('#paginaPrincipal')
  //     .locator('input[type="checkbox"]');

  //     for (counter; ; counter += 1) {
  //       await checkboxesLocator.nth(counter).click();
  //     }
  // } catch (e) {}

  // try {
  //   let aux = page
  //     .frameLocator('iframe >> nth=0')
  //     .frameLocator('#principal')
  //     .frameLocator('td iframe')
  //     .frameLocator('#paginaPrincipal')
  //     .locator('select');

  //   for (let i = 0; i < counter; i++) {
  //     await aux.nth(i).selectOption('3');
  //   }
  // } catch (e) {}

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .locator('#ed_execucao_13460450')
  //   .fill('1');

  // await page
  //   .frameLocator('iframe >> nth=0')
  //   .frameLocator('#principal')
  //   .frameLocator('td iframe')
  //   .frameLocator('#paginaPrincipal')
  //   .locator('#ed_execucao_13460450')
  //   .press('Tab');
})();

// try {
//   const fileContent = await fs.readFile('guiasExecutar.txt', 'utf-8');
//   const lines = fileContent.trim().split('\n');

//   // Iterate through each code and perform actions
//   for (const line of lines) {
//     const [codigoGuia, nomePaciente] = line.trim().split(';');

//     if (codigoGuia.trim().length === 17) {
//       const logMessage = `Executando GUIA: ${codigoGuia} -  ${nomePaciente}`;
//       console.log(logMessage);

//       await bot(codigoGuia, nomePaciente);

//     } else {
//       console.warn(`Invalid code: ${codigoGuia}`);
//     }
//   }
// } catch (error) {
//   console.error('Error reading codes from file:', error);
// }

// 02222303000068000
