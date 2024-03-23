const fs = require('fs').promises;
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth() {
  const browser = await chromium.launch({ headless: true });
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
    .frameLocator('iframe[name="filtroAutorizacoes"]')
    .getByRole('button', { name: 'Atualizar' })
    .click();

  console.log('Logged in!');

  return page;
}

async function concatenateDataAtPositions(dataString) {
  const dataArray = await clearData(dataString);
  const positions = [1, 29, 2, 3, 16, 5, 17];
  const concatenatedData = positions
    .map((position) => {
      if (position === 29) {
        let id = () => {
          if (dataArray[position - 2].length === 17) return position - 2;
          if (dataArray[position - 1].length === 17) return position - 1;
          if (dataArray[position].length === 17) return position;
          if (dataArray[position + 1].length === 17) return position + 1;
          if (dataArray[position + 2].length === 17) return position + 2;
        };
        return dataArray[id()] || '';
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

async function extractAndSaveData(pageContent) {
  const regex = /<td class="line-content">\["(.*?)"],<\/td>/gs;
  let match;
  let count = 0;
  while ((match = regex.exec(pageContent)) !== null && count < 30) {
    let aux = await concatenateDataAtPositions(match[1]);
    console.log(aux);
    await fs.appendFile('base.csv', `${aux}\n`);
    count++;
  }
  console.log('Data extracted and saved!');
}

async function extractAndSavePaginationLinks(pageContent) {
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
  const matches = pageContent.matchAll(paginationRegex);
  await fs.writeFile('basePagination.csv', '');
  for (const match of matches) {
    let aux = match[1].replace(/amp;/g, '');
    await fs.appendFile(
      'basePagination.csv',
      `view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut${aux}\n`
    );
  }
  console.log('Pagination Links extraction completed!');
}

async function processPaginationCSV(page) {
  const fileContent = await fs.readFile('basePagination.csv', 'utf-8');
  const lines = fileContent.trim().split('\n');
  for (const [index, line] of lines.entries()) {
    if (index === 0) continue;
    const page = await loginAuth();
    await page
      .frameLocator('iframe >> nth=0')
      .frameLocator('#principal')
      .frameLocator('td iframe')
      .frameLocator('#paginaPrincipal')
      .frameLocator('iframe[name="frame_1"]')
      .getByRole('link', { name: `| ${index + 1}` })
      .click();

    await page.goto(line, {
      waitUntil: 'networkidle',
    });

    await extractAndSaveData(await page.content());
  }
}

async function mergeFiles(file1Path, file2Path, mergedFilePath) {
  try {
      const file1Data = await fsPromises.readFile(file1Path, 'utf-8');
      const file2Data = await fsPromises.readFile(file2Path, 'utf-8');

      const linesFile1 = file1Data.split('\n');
      const linesFile2 = file2Data.split('\n');

      const maxLength = Math.max(linesFile1.length, linesFile2.length);

      let mergedContent = '';
      for (let i = 0; i < maxLength; i++) {
          if (i < linesFile1.length) {
              mergedContent += linesFile1[i] + '\n';
          }
          if (i < linesFile2.length) {
              mergedContent += linesFile2[i] + '\n';
          }
      }

      await fsPromises.writeFile(mergedFilePath, mergedContent.trim());
      console.log("Files merged successfully!");
  } catch (error) {
      console.error("An error occurred:", error);
  }
}

(async () => {
  console.clear();
  const page = await loginAuth();
  await page.goto(
    'view-source:https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
    {
      waitUntil: 'networkidle',
    }
  );

  await extractAndSavePaginationLinks(await page.content());
  await extractAndSaveData(await page.content());
  await processPaginationCSV(page);
})();
