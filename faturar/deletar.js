const puppeteer = require('puppeteer');
const prompt = require('prompt-sync')();

function elapsedTime(startTime) {
  const timeInSeconds = Math.floor((new Date() - startTime) / 1000);
  if (timeInSeconds < 60) {
    return timeInSeconds + ' segundo' + (timeInSeconds !== 1 ? 's' : '');
  } else {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = Math.floor(timeInSeconds % 60);

    if (remainingSeconds === 0) {
      return minutes + ' minuto' + (minutes !== 1 ? 's' : '');
    } else {
      return (
        minutes +
        ' minuto' +
        (minutes !== 1 ? 's' : '') +
        ' e ' +
        remainingSeconds +
        ' segundo' +
        (remainingSeconds !== 1 ? 's' : '')
      );
    }
  }
}

(async () => {
  console.clear();
  const startTime = new Date();
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: null,
  });

  const page = await browser.newPage();
  let lengthInput = '';
  let counter = 0;
  page.on('dialog', async (dialog) => {
    console.log(`Dialog: ${dialog.message()}\n`);
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
        lengthInput = prompt(
          `How many do you wanna delete, 1 |----| ${anchorElements.length}? `
        );

        if (!lengthInput || isNaN(lengthInput)) {
          console.error('Invalid input. Please enter a valid number.');
          process.exit(1);
        }

        for (let i = 0; i < lengthInput; i++) {
          await iframe.waitForTimeout(500);
          const secondAnchorElement = await iframe.$('a');
          await secondAnchorElement.evaluate((a) => a.click());

          await iframe.waitForSelector('#btnExcluir');
          await iframe.$eval('#btnExcluir', (button) => button.click());
          counter = i + 1;
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.error(
      `SUCCESSFULLY DELETED ${counter} ENTRIES IN ${elapsedTime(startTime)}!`
    );
    await browser.close();
  }
})();
