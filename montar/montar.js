const fs = require('fs').promises;
const logColors = require('ansi-colors');
const { loginAuth } = require('../shared/loginAuth');

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
    await fs.appendFile('dataBase.csv', `${data}\n`);
    count++;
  }
  return data;
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

function findSpecificData(data) {
  for (let item of data) {
    if (item.length === 17 && /^\d+$/.test(item)) {
      return item;
    }
  }
  return null;
}

function isAtLeastOneMonthOld(dateString) {
  const dateParts = dateString.split(';')[2].split(' ')[0].split('/');
  const inputDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
  const today = new Date();
  const diffInMilliseconds = today - inputDate;
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  return diffInDays >= 30;
}


async function clearData(dataString) {
  return dataString
    .replace(/"/g, '')
    .split(',')
    .filter((item) => item.trim() !== '')
    .map((item) => item.trim());
}



(async () => {
  await fs.writeFile('base.csv', '');
  const { mainPage, mainBrowser } = await loginAuth();
  
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
    const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
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
