const fs = require('fs').promises;
const { chromium } = require('playwright');
function formatDateTime(dateTime) {
  return dateTime.toLocaleString('pt-BR');
}
function extractNrSeqProtocolo(url) {
  const match = url.match(/nrSeqProtocolo=(\d+)/);
  return match ? match[1] : null;
}
async function logToFile(index, codigoGuia, crmSolicitante, startTime) {
  const timestamp = formatDateTime(new Date());
  const logMessage = `${timestamp} - Index: ${
    index + 1
  }, Cliente: ${codigoGuia}, Médico: ${crmSolicitante}\n`;
  console.log(logMessage);
  try {
    await fs.appendFile('log faturamento.txt', logMessage);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

(async () => {
  console.clear();
  const browser = await chromium.launch({ headless: false });
  // const page = await browser.newPage();
  const context = await browser.newContext();
  const page = await context.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('https://portal.unimedpalmas.coop.br/', {
    waitUntil: 'networkidle',
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
    .getByText('Autorização', { exact: true })
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0')
    .getByText('» Consulta de autorizações')
    .click();
  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .frameLocator('iframe[name="frame_1"]')
    .locator('#celula-0-0')
    .click();

  await browser.close();
  process.exit(1);
})();

// import { test, expect } from '@playwright/test';
// const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };
// test('test', async ({ page }) => {
//   await page.goto('https://portal.unimedpalmas.coop.br/');
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .locator('#tipoUsuario')
//     .selectOption('P');
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .locator('#nmUsuario')
//     .click();
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .locator('#nmUsuario')
//     .fill(login);
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .locator('#dsSenha')
//     .click();
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .locator('#dsSenha')
//     .fill(password);
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .getByRole('button', { name: 'Entrar' })
//     .click();
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .frameLocator('td iframe')
//     .frameLocator('frame >> nth=0')
//     .getByText('Autorização', { exact: true })
//     .click();
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .frameLocator('td iframe')
//     .frameLocator('frame >> nth=0')
//     .getByText('» Consulta de autorizações')
//     .click();
//   await page
//     .frameLocator('iframe >> nth=0')
//     .frameLocator('#principal')
//     .frameLocator('td iframe')
//     .frameLocator('#paginaPrincipal')
//     .frameLocator('iframe[name="frame_1"]')
//     .locator('#celula-0-0')
//     .click();
// });
