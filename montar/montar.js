const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth(retries) {
  let mainBrowser, mainPage;
  while (retries > 0) {
    try {
      mainBrowser = await chromium.launch({ headless: false });
      const mainContext = await mainBrowser.newContext();
      mainPage = await mainContext.newPage();
      mainPage.setDefaultTimeout(5000);
      await mainPage.setViewportSize({ width: 800, height: 600 });
      await mainPage.goto('https://portal.unimedpalmas.coop.br/', {
        waitUntil: 'domcontentloaded',
      });

      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#tipoUsuario')
        .selectOption('P');
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#nmUsuario')
        .click();
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#nmUsuario')
        .fill(login);
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#dsSenha')
        .click();
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .locator('#dsSenha')
        .fill(password);
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .getByRole('button', { name: 'Entrar' })
        .click();
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('frame >> nth=0')
        .getByText('Autorização', { exact: true })
        .click();
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('frame >> nth=0')
        .getByText('» Consulta de autorizações')
        .click();
      await mainPage
        .frameLocator('iframe >> nth=0')
        .frameLocator('#principal')
        .frameLocator('td iframe')
        .frameLocator('#paginaPrincipal')
        .frameLocator('iframe[name="filtroAutorizacoes"]')
        .getByRole('button', { name: 'Atualizar' })
        .click();

      console.log(logColors.bgGreenBright(`LOGIN ACEITO! AGUARDE...`));

      return { mainPage, mainBrowser };
    } catch (error) {
      retries--;
      if (mainPage) await mainPage.close();
      if (mainBrowser) await mainBrowser.close();

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

function extractDates(url) {
  const dateRegex = /dtInicio=([\d\/]+)&amp;dtFim=([\d\/]+)/;
  const match = url.match(dateRegex);

  if (match) {
    const dtInicio = match[1];
    const dtFim = match[2];
    return { dtInicio, dtFim };
  } else {
    return null;
  }
}

async function extractAndSavePaginationLinks(pageContent) {
  await fs.writeFile('base.csv', '');
  await fs.writeFile('basePagination.csv', '');
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
  const match = pageContent.match(paginationRegex);
  let lastPaginationUrl = '';
  let index = 0;
  for (let i = 0; i < 20; i++) {
    const { dtInicio, dtFim } = extractDates(match[0]);
    lastPaginationUrl = `view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut.action?dtInicio=${dtInicio}&dtFim=${dtFim}&ieTipoProcesso=&ieTipoGuia=&ieTipoConsulta=&cdGuia=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&clickPaginacao=S&nrRegistroInicio=${index}`;
    await fs.appendFile('basePagination.csv', `${lastPaginationUrl}\n`);
    index += 30;
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

async function processPaginationCSV(page, browser) {
  const fileContent = await fs.readFile('basePagination.csv', 'utf-8');

  const lines = fileContent.trim().split('\n');

  for (const [index, line] of lines.entries()) {
    if (index === 0) continue;

    // const { page, browser } = await loginAuth(3);
    await page.goto(line, {
      waitUntil: 'load',
    });

    await extractAndSaveData(await page.content());
    // await browser.close();
  }
}

(async () => {
  console.clear();
  const { mainPage, mainBrowser } = await loginAuth(3);
  let page = mainPage;
  await page.goto(
    'view-source:https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
    {
      waitUntil: 'domcontentloaded',
    }
  );

  await extractAndSavePaginationLinks(await page.content());
  await extractAndSaveData(await page.content());
  // browser.close();
  await processPaginationCSV(mainPage, mainBrowser);
})();
