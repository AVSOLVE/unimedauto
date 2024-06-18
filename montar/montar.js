const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { chromium } = require('playwright');
const { login, password } = { login: 'fisiocep', password: 'fisiocep2022' };

async function loginAuth() {
  let retries = 3;
  while (retries > 0) {
    try {
      const browser = await chromium.launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
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

      console.log(logColors.bgGreenBright(`LOGIN ACEITO! AGUARDE...`));

      return { mainPage: page, mainBrowser: browser };
    } catch (error) {
      retries--;
      if (page) await page.close();
      if (browser) await browser.close();

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

async function extractAndSaveData(pageContent) {
  const regex = /<td class="line-content">\["(.*?)"],<\/td>/gs;
  let match = 0;
  let count = 0;
  let data = null;
  while ((match = regex.exec(pageContent)) !== null && count < 30) {
    data = await concatenateDataAtPositions(match[1]);
    await fs.appendFile('base.csv', `${data}\n`);
    count++;
  }
  return data;
}

function findSpecificData(data) {
  for (let item of data) {
    if (item.length === 17 && /^\d+$/.test(item)) {
      return item;
    }
  }
  return null;
}

async function concatenateDataAtPositions(dataString) {
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

function isAtLeastOneMonthOld(dateString) {
  const dateParts = dateString.split(';')[2].split(' ')[0].split('/');
  const inputDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
  const today = new Date();
  const diffInMilliseconds = today - inputDate;
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  return diffInDays >= 30;
}

(async () => {
  console.clear();
  await fs.writeFile('base.csv', '');
  const { mainPage, mainBrowser } = await loginAuth();
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;

  try {
    let page = mainPage;
    let browser = mainBrowser;
    await page.goto(
      'view-source:https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
      {
        waitUntil: 'domcontentloaded',
      }
    );

    const pageContent = await page.content();
    const match = pageContent.match(paginationRegex);
    const { dtInicio, dtFim } = extractDates(match[0]);
    let paginationUrl = '';
    let index = 0;
    let counter = 1;
    let lastDataString = null;

    do {
      paginationUrl = `view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut.action?dtInicio=${dtInicio}&dtFim=${dtFim}&ieTipoProcesso=&ieTipoGuia=&ieTipoConsulta=&cdGuia=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&clickPaginacao=S&nrRegistroInicio=${index}`;

      await page.goto(paginationUrl, {
        waitUntil: 'load',
      });

      const pageContent = await page.content();
      lastDataString = await extractAndSaveData(pageContent);
      lastDataString &&
        console.log(
          logColors.bgCyanBright(
            `LOTE ${counter} EXTRAIDO COM SUCESSO! AGUARDE...`
          )
        );

      index += 30;
      counter++;
    } while (lastDataString && !isAtLeastOneMonthOld(lastDataString));

    await browser.close();
    console.log(
      logColors.bgGreen(
        `PROCESSO FINALIZADO! ARQUIVO base.csv GERADO COM SUCESSO!`
      )
    );
  } catch (error) {
    console.error(`ERRO FATAL DE EXECUÇÃO: ${error}!`);
  }
})();
