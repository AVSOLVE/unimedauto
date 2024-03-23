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

async function loginAuth(page) {
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
}

async function extractAndSaveData(pageContent) {
  const regex = /<td class="line-content">\["(.*?)"],<\/td>/gs;
  let match;
  let count = 0;

  while ((match = regex.exec(pageContent)) !== null && count < 30) {
    let aux = concatenateDataAtPositions(match[1]);
    console.log(aux);
    await fs.appendFile('base.csv', `${aux}\n`);
    count++;
  }
  console.log('Data extracted and saved!');
}

(async () => {
  console.clear();
  const browser = await chromium.launch({ headless: false });
  // const page = await browser.newPage();
  const context = await browser.newContext();
  const page = await context.newPage();
  const timeout = 5000;
  page.setDefaultTimeout(timeout);
  await page.setViewportSize({ width: 1280, height: 800 });

  await loginAuth(page);

  // await page.route('**/*', (route) => {
  //   route.continue({
  //     headers: {
  //       ...route.request().headers(),
  //       Accept: 'text/plain, */*',
  //     },
  //   });
  // });

  await page.goto(
    'view-source:https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp',
    {
      waitUntil: 'networkidle',
    }
  );

  const pageContent = await page.content();
  await extractAndSaveData(pageContent);

  await loginAuth(page);

  await page
    .frameLocator('iframe >> nth=0')
    .frameLocator('#principal')
    .frameLocator('td iframe')
    .frameLocator('#paginaPrincipal')
    .frameLocator('iframe[name="frame_1"]')
    .getByRole('link', { name: '| 2' })
    .click();

  await page.goto(
    'view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut.action?dtInicio=22/01/2024&dtFim=22/03/2024&ieTipoProcesso=&ieTipoGuia=&ieTipoConsulta=&cdGuia=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&clickPaginacao=S&nrRegistroInicio=30',
    {
      waitUntil: 'networkidle',
    }
  );

  const pageContent2 = await page.content();
  console.log(pageContent2);
  await extractAndSaveData(pageContent2);

  // let count2 = 0;
  // while ((match = regex.exec(pageContent)) !== null && count2 < 30) {
  //   let aux = concatenateDataAtPositions(match[1]);
  //   console.log(aux);
  //   await fs.appendFile('base.csv', `${aux}\n`);
  //   count2++;
  // }

  // await extractAndSavePaginationLinks(pageContent);

  // const fileContent = await fs.readFile('basePagination.csv', 'utf-8');
  // const lines = fileContent.trim().split('\n');
  // for (const line of lines) {
  //   console.log(line);
  //   await page.goto(line, {
  //     waitUntil: 'networkidle',
  //   });
  // const innerPageContent = await page.content();
  // const regex = /<td class="line-content">\["(.*?)"],<\/td>/gs;
  // let match;
  // let count = 0;
  // console.log(innerPageContent);
  // while ((match = regex.exec(innerPageContent)) !== null && count < 30) {
  //   let aux = concatenateDataAtPositions(match[1]);
  //   console.log(aux);
  //   await fs.appendFile('base.csv', `${aux}\n`);
  //   count++;
  // }
  // }

  // await browser.close();
  // process.exit(1);
})();

function concatenateDataAtPositions(dataString) {
  const dataArray = clearData(dataString);
  const positions = [1, 29, 2, 3, 16, 5, 17];
  const concatenatedData = positions
    .map((position) => {
      if (position === 29) {
        let id = () => {
          if (dataArray[position - 3].length === 17) return position - 3;
          if (dataArray[position - 2].length === 17) return position - 2;
          if (dataArray[position - 1].length === 17) return position - 1;
          if (dataArray[position].length === 17) return position;
          if (dataArray[position + 1].length === 17) return position + 1;
          if (dataArray[position + 2].length === 17) return position + 2;
          if (dataArray[position + 3].length === 17) return position + 3;
        };
        return dataArray[id()] || '';
      } else {
        return dataArray[position - 1] || '';
      }
    })
    .join(';');
  return concatenatedData;
}

function clearData(dataString) {
  return dataString
    .replace(/"/g, '')
    .split(',')
    .filter((item) => item.trim() !== '')
    .map((item) => item.trim());
}

async function prependToFile(filename, data) {
  try {
    // Read existing content of the file
    const existingContent = await fs.readFile(filename, 'utf8');

    // Combine new data with existing content
    const combinedContent = data + '\n' + existingContent;

    // Write combined content back to the file
    await fs.writeFile(filename, combinedContent);

    console.log('Data prepended successfully!');
  } catch (error) {
    console.error('Error occurred while prepending data:', error);
  }
}

async function extractAndSavePaginationLinks(pageContent) {
  const paginationRegex = /href="pls_montarConsultaAut(.*?)"/gs;
  const matches = pageContent.matchAll(paginationRegex);

  // for (const match of matches) {
  //   await fs.appendFile(
  //     'basePagination.csv',
  //     `view-source:https://portal.unimedpalmas.coop.br/pls_montarConsultaAut${match[1]}\n`
  //   );
  // }
  console.log('Pagination Links extraction completed!');
}

// test('test', async ({ page }) => {
//   await page.goto('about:blank');
//   await page.goto('chrome-error://chromewebdata/');
//   await page.getByRole('button', { name: 'Reload' }).click();
//   await page.goto('https://portal.unimedpalmas.coop.br/');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').locator('#tipoUsuario').selectOption('P');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').locator('#nmUsuario').click();
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').locator('#nmUsuario').fill('fisiocep');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').locator('#nmUsuario').press('Tab');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').locator('#dsSenha').fill('fisiocep2022');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').locator('#dsSenha').press('Tab');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').getByRole('button', { name: 'Entrar' }).press('Enter');
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('frame >> nth=0').getByText('Autorização', { exact: true }).click();
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('frame >> nth=0').getByText('» Consulta de autorizações').click();
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').frameLocator('iframe[name="frame_1"]').getByRole('link', { name: '| 1', exact: true }).click();
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').frameLocator('iframe[name="frame_1"]').getByRole('link', { name: '| 2' }).click();
//   await page.frameLocator('iframe >> nth=0').frameLocator('#principal').frameLocator('td iframe').frameLocator('#paginaPrincipal').frameLocator('iframe[name="frame_1"]').getByRole('link', { name: '| 3' }).click();
// });
