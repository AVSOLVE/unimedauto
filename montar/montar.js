const { log } = require('console');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

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

  // Log to console
  console.log(logMessage);

  // Log to file
  try {
    await fs.appendFile('log faturamento.txt', logMessage);
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}
(async () => {
  console.clear();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    await page.goto('https://portal.unimedpalmas.coop.br/');
    const iframes = page.frames();
    for (const iframe of iframes) {
      if (iframe.name() === 'principal') {
        // LOGIN PROCESS
        await iframe.waitForSelector('#tipoUsuario');
        await iframe.select('select#tipoUsuario', 'P');
        await iframe.type('#nmUsuario', 'fisiocep');
        await iframe.type('#dsSenha', 'fisiocep2022');
        await iframe.waitForSelector('#btn_entrar');
        await iframe.$eval('#btn_entrar', (button) => button.click());

        // NAVIGATE TO PAGE
        await iframe.waitForNavigation();
        // await iframe.goto('https://portal.unimedpalmas.coop.br/pls_montarFiltrosConsultaAutorizacao.action?dtInicio=05/12/2023&dtFim=03/02/2024&habilitaLocalizador=true&ieTipoProcesso=&ieTipoGuia=&cdGuia=&ieTipoConsulta=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&cdGuiaPrestador=')
        // https://portal.unimedpalmas.coop.br/pls_montarFiltrosConsultaAutorizacao.action?dtInicio=05/12/2023&dtFim=03/02/2024&habilitaLocalizador=true&ieTipoProcesso=&ieTipoGuia=&cdGuia=&ieTipoConsulta=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&cdGuiaPrestador=
        await iframe.goto(
          'https://portal.unimedpalmas.coop.br/pls_montarPastaConsultaAut.action'
        );
        page.on('request', (request) => {
          console.log(`Intercepted request: ${request.url()}`);
        });
      
        // page.on('response', (response) => {
        //   console.log(`Intercepted response: ${response.url()}`);
        // });
      
        // page.on('domcontentloaded', () => {
        //   console.log('DOM content loaded');
        // });
      
        // page.on('load', () => {
        //   console.log('Page loaded');
        // });
      
        page.on('framenavigated', (frame) => {
          console.log(`Navigated to: ${frame.url()}`);
        });
        // https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp
        // https://portal.unimedpalmas.coop.br/pls_montarFiltrosConsultaAutorizacao.action?dtInicio=04/12/2023&dtFim=02/02/2024&habilitaLocalizador=true&ieTipoProcesso=&ieTipoGuia=&cdGuia=&ieTipoConsulta=&cdBeneficiario=&cdMedico=&cdPrestador=&cdSenha=&ieStatus=&cdGuiaManual=&cdGuiaPrestador=
        // https://portal.unimedpalmas.coop.br/pls_montarPastaConsultaAut.action
        // await iframe.goto('https://portal.unimedpalmas.coop.br/wheb_gridDet.jsp')
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await browser.close();
  }
})();
// https://portal.unimedpalmas.coop.br/pls_verificarMenuEsquerdoJson.action?_=1706972996547
