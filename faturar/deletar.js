const puppeteer = require('puppeteer');

function extractNrSeqProtocolo(url) {
  const match = url.match(/nrSeqProtocolo=(\d+)/);
  return match ? match[1] : null;
}

(async () => {
  console.clear();
  const startTime = new Date();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  page.on('dialog', async (dialog) => {
    const logMessage = `Dialog message: ${dialog.message()}\n`;
    console.log(logMessage);
    await dialog.accept();
  });

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
        await iframe.goto(
          'https://portal.unimedpalmas.coop.br/pls_montarListaProtocolosDigitacao.action'
        );

        const firstAnchorElement = await iframe.$('a');
        await firstAnchorElement.evaluate((a) => a.click());

        for (let i = 0; i < 4; i++) {          
          await iframe.waitForTimeout(300);
          const secondAnchorElement = await iframe.$('a');
          await secondAnchorElement.evaluate((a) => a.click());
          
          await iframe.waitForSelector('#btnExcluir');
          await iframe.$eval('#btnExcluir', (button) => button.click());
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
