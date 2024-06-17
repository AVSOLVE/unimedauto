const fs = require('fs').promises;
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
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
    .frameLocator('iframe[name="filtroAutorizacoes"]')
    .getByRole('button', { name: 'Atualizar' })
    .click();

  console.log('Logged in!');

  return { page, browser };
}

async function extractAndSavePaginationLinks(pageContent) {
  await fs.writeFile('base.csv', '');
  await fs.writeFile('basePagination.csv', '');
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
  const matches = pageContent.matchAll(paginationRegex);
  let lastPaginationUrl = '';
  for (const match of matches) {
    const cleanUrlPart = match[1].replace(/amp;/g, '');
    lastPaginationUrl = `view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut${cleanUrlPart}`;
    await fs.appendFile('basePagination.csv', `${lastPaginationUrl}\n`);
  }
  console.log('Pagination Links extraction completed!');
}

async function extractAndSaveData(pageContent) {
  const regex = /<td class="line-content">\["(.*?)"],<\/td>/gs;
  let match = 0;
  let count = 0;
  while ((match = regex.exec(pageContent)) !== null && count < 30) {
    let aux = await concatenateDataAtPositions(match[1]);
    await fs.appendFile('base.csv', `${aux}\n`);
    count++;
  }

  console.log('Data extracted and saved!');
}
function findSpecificData(data, length = 17) {
  for (let item of data) {
      if (item.length === length && /^\d+$/.test(item)) {
          return item;
      }
  }
  return null;
}

async function concatenateDataAtPositions(dataString, length = 17) {
  const dataArray = await clearData(dataString);
  const positions = [1, 29, 2, 3, 17, 5, 16];
  const concatenatedData = positions
    .map((position) => {
      if (position === 29) {
        // let id = () => {
        //   if (dataArray[position - 5].length === length && /^\d+$/.test(dataArray[position - 5])) return position - 5;
        //   if (dataArray[position - 4].length === length && /^\d+$/.test(dataArray[position - 4])) return position - 4;
        //   if (dataArray[position - 3].length === length && /^\d+$/.test(dataArray[position - 3])) return position - 3;
        //   if (dataArray[position - 2].length === length && /^\d+$/.test(dataArray[position - 2])) return position - 2;
        //   if (dataArray[position - 1].length === length && /^\d+$/.test(dataArray[position - 1])) return position - 1;
        //   if (dataArray[position].length === length && /^\d+$/.test(dataArray[position])) return position;
        //   if (dataArray[position + 1].length === length && /^\d+$/.test(dataArray[position + 1])) return position + 1;
        //   if (dataArray[position + 2].length === length && /^\d+$/.test(dataArray[position + 2])) return position + 2;
        //   if (dataArray[position + 3].length === length && /^\d+$/.test(dataArray[position + 3])) return position + 3;
        //   if (dataArray[position + 4].length === length && /^\d+$/.test(dataArray[position + 4])) return position + 4;
        //   if (dataArray[position + 5].length === length && /^\d+$/.test(dataArray[position + 5])) return position + 5;
        // };
        // return dataArray[id()] || '';
        return findSpecificData(dataArray) || '';
      } else {
        return dataArray[position - 1] || '';
      }
    })
    .join(';');
  return concatenatedData;
}

async function clearData(dataString) {
  return dataString
    .replace(/"/g, '')
    .split(',')
    .filter((item) => item.trim() !== '')
    .map((item) => item.trim());
}

async function processPaginationCSV() {
  const fileContent = await fs.readFile('basePagination.csv', 'utf-8');

  const lines = fileContent.trim().split('\n');

  for (const [index, line] of lines.entries()) {
    if (index === 0) continue;

    const { page, browser } = await loginAuth();

    await page.goto(line, {
      waitUntil: 'load',
    });

    await extractAndSaveData(await page.content());
    await browser.close();
  }
}

(async () => {
  console.clear();
  const { page, browser } = await loginAuth();
  await page.goto(
    'view-source:https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
    {
      waitUntil: 'domcontentloaded',
    }
  );

  await extractAndSavePaginationLinks(await page.content());
  await extractAndSaveData(await page.content());
  browser.close();
  await processPaginationCSV();
})();
