const fs = require('fs').promises;
const { loginAuth } = require('../shared/loginAuth');
const { logMessage, isAMonthOlder } = require('../shared/helper');
const { paths, dataPositions, urls } = require('../shared/config');

async function getPaginationUrls(pageContent) {
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
  return pageContent.match(paginationRegex) || [];
}

async function extractDates(pageContent) {
  const paginationMatch = await getPaginationUrls(pageContent);

  if (!paginationMatch) {
    throw new Error(
      'function extractDates: Pagination URLs not found in page content.'
    );
  }

  const dateRegex = /dtInicio=([\d\/]+)&amp;dtFim=([\d\/]+)/;
  const match = paginationMatch[0].match(dateRegex);

  if (!match) {
    throw new Error(
      'function extractDates: Dates not found in pagination URL.'
    );
  }
  return { dtInicio: match[1], dtFim: match[2] };
}

async function extractAndSaveData(pageContent) {
  const regex = /<td class="line-content">\["(.*?)"],<\/td>/gs;
  let match,
    count = 0,
    data = null;
  while ((match = regex.exec(pageContent)) !== null && count < 30) {
    data = await concatenateDataAtPositions(match[1]);
    await fs.appendFile(paths.outputFile, `${data}\n`);
    count++;
  }
  return data;
}

async function concatenateDataAtPositions(dataString) {
  const dataArray = await clearData(dataString);
  const positions = dataPositions;
  const concatenatedData = positions
    .map((position) =>
      position === 29
        ? findSpecificData(dataArray) || ''
        : dataArray[position - 1] || ''
    )
    .join(';');
  return concatenatedData;
}

function findSpecificData(data) {
  return data.find((item) => item.length === 17 && /^\d+$/.test(item)) || null;
}

async function clearData(dataString) {
  return dataString
    .replace(/"/g, '')
    .split(',')
    .filter((item) => item.trim() !== '')
    .map((item) => item.trim());
}

async function loginAndNavigate() {
  try {
    const { page, browser } = await loginAuth();
    const frame = await getFrame(page);
    await frame.getByText('Autorização', { exact: true }).click();
    await frame.getByText('» Consulta de autorizações').click();
    logMessage('green', 'REDIRECIONANDO! AGUARDE...');
    return { page, browser };
  } catch (error) {
    logMessage('yellow', `O REDIRECIONAMENTO FALHOU! ERRO: ${error.message}!`);
    throw error;
  }
}

async function getFrame(page) {
  return page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('frame >> nth=0');
}

async function constructPaginationUrl(dtInicio, dtFim, index) {
  return `view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut.action?dtInicio=${dtInicio}&dtFim=${dtFim}&ieTipoProcesso=&ieTipoGuia=&ieTipoConsulta=&cdGuia=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&clickPaginacao=S&nrRegistroInicio=${index}`;
}

async function getPaginationUrls(pageContent) {
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
  return pageContent.match(paginationRegex) || [];
}

(async () => {
  fs.writeFile(paths.outputFile, '');
  const { page, browser } = await loginAndNavigate();
  try {
    await page.waitForResponse(urls.targetPage);
    await page.goto(urls.targetPage, {
      waitUntil: 'domcontentloaded',
    });
    const pageContent = await page.content();
    const { dtInicio, dtFim } = await extractDates(pageContent);

    let index = 0;
    let counter = 1;
    let lastDataString = null;

    do {
      const paginationUrl = await constructPaginationUrl(
        dtInicio,
        dtFim,
        index
      );
      await page.goto(paginationUrl, { waitUntil: 'load' });
      const pageContent = await page.content();
      lastDataString = await extractAndSaveData(pageContent);
      lastDataString &&
        logMessage('white', `LOTE ${counter} EXTRAIDO COM SUCESSO! AGUARDE...`);
      index += 30;
      counter++;
    } while (lastDataString && !isAMonthOlder(lastDataString));
    await browser.close();
  } catch (error) {
    logMessage('red', `ERRO FATAL DE EXECUÇÃO: ${error}!`);
  }
})();
