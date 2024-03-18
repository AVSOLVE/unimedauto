const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();

(async () => {
  console.clear();
  const browser = await puppeteer.launch({
    headless: 'new',
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
        console.log('LOGIN SUCCESSFUL!');

        // NAVIGATE TO PAGE
        await iframe.waitForNavigation();
        await iframe.goto(
          'https://portal.unimedpalmas.coop.br/pls_montarListaProtocolosDigitacao.action'
        );

        const firstAnchorElement = await iframe.$('a');
        await firstAnchorElement.evaluate((a) => a.click());
        await iframe.waitForTimeout(300);
        console.log('DELETING PHASE!');

        const anchorElements = await iframe.$$('a');
        const lengthInput = prompt(
          `How many do you wanna delete, 1 |----| ${anchorElements.length}? `
        );

        if (!lengthInput || isNaN(lengthInput)) {
          console.error('Invalid input. Please enter a valid number.');
          process.exit(1);
        }

        for (let i = 0; i < lengthInput; i++) {
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
